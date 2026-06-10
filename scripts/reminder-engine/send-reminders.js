#!/usr/bin/env node
/**
 * NorCal CARB Mobile — CTC reminder email sender
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 *
 * Usage:
 *   node send-reminders.js --dry-run
 *   node send-reminders.js --test-email you@example.com --force-template 30
 *   node send-reminders.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, '../../email/templates');

const REMINDER_DAYS = [90, 60, 30];

function parseArgs(argv) {
  const args = { dryRun: false, testEmail: null, forceTemplate: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    if (argv[i] === '--test-email') args.testEmail = argv[++i];
    if (argv[i] === '--force-template') args.forceTemplate = Number(argv[++i]);
  }
  return args;
}

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8');
}

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.round((db - da) / ms);
}

function render(html, vars) {
  return Object.entries(vars).reduce(
    (out, [key, val]) => out.replaceAll(`{{${key}}}`, String(val ?? '')),
    html
  );
}

function testTypeDisplay(testType) {
  const t = (testType || 'UNKNOWN').toUpperCase();
  if (t === 'OBD') return 'OBD — $75';
  if (t === 'OVI') return 'OVI — $199';
  return 'OBD $75 · OVI $199';
}

async function getSheetRows() {
  const creds = JSON.parse(requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
  const range = `${process.env.GOOGLE_SHEET_NAME || 'Subscribers'}!A:L`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row, idx) => {
    const obj = { _rowIndex: idx + 2 };
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
}

async function markSent(rowIndex, column) {
  const creds = JSON.parse(requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Subscribers';
  const colMap = { sent_90: 'J', sent_60: 'K', sent_30: 'L' };
  const today = new Date().toISOString().slice(0, 10);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${colMap[column]}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[today]] }
  });
}

async function sendEmail({ to, subject, html }) {
  const apiKey = requireEnv('RESEND_API_KEY');
  const fromEmail = requireEnv('REMINDER_FROM_EMAIL');
  const fromName = process.env.REMINDER_FROM_NAME || 'NorCal CARB Mobile';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}

function buildVars(row, daysBefore) {
  const webappUrl = requireEnv('APPS_SCRIPT_WEBAPP_URL');
  return {
    vehicle_label: row.vehicle_label || 'Your vehicle',
    next_deadline_display: formatDate(row.next_deadline),
    test_type_display: testTypeDisplay(row.test_type),
    days_before: daysBefore,
    booking_url: requireEnv('BOOKING_URL'),
    switch_url: requireEnv('SWITCH_URL'),
    site_base_url: requireEnv('SITE_BASE_URL'),
    cancel_url: `${webappUrl}?action=cancel&token=${encodeURIComponent(row.cancel_token)}`
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const today = new Date().toISOString().slice(0, 10);

  if (args.testEmail && args.forceTemplate) {
    const template = `reminder-${args.forceTemplate}.html`;
    const html = render(loadTemplate(template), buildVars({
      vehicle_label: 'Test Truck',
      next_deadline: '2026-09-15',
      test_type: 'OBD',
      cancel_token: 'test-token'
    }, args.forceTemplate));
    if (args.dryRun) {
      console.log('[dry-run] Would send test', template, 'to', args.testEmail);
      return;
    }
    await sendEmail({
      to: args.testEmail,
      subject: `[TEST] ${args.forceTemplate}-day CTC reminder`,
      html
    });
    console.log('Test email sent to', args.testEmail);
    return;
  }

  const rows = await getSheetRows();
  let sent = 0;

  for (const row of rows) {
    if (String(row.reminders_enabled).toUpperCase() !== 'TRUE') continue;
    if (!row.email || !row.next_deadline) continue;

    const daysUntil = daysBetween(today, row.next_deadline);

    for (const d of REMINDER_DAYS) {
      const col = `sent_${d}`;
      if (row[col]) continue;
      if (daysUntil !== d) continue;

      const template = `reminder-${d}.html`;
      const html = render(loadTemplate(template), buildVars(row, d));
      const subject = `${d} days until your Clean Truck Check deadline`;

      if (args.dryRun) {
        console.log(`[dry-run] ${row.email} → ${template} (deadline ${row.next_deadline})`);
        sent++;
        continue;
      }

      await sendEmail({ to: row.email, subject, html });
      await markSent(row._rowIndex, col);
      console.log('Sent', template, 'to', row.email);
      sent++;
    }
  }

  console.log(args.dryRun ? `Dry run complete: ${sent} would send` : `Done: ${sent} sent`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
