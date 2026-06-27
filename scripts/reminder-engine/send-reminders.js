#!/usr/bin/env node
/**
 * NorCal CARB Mobile — CTC reminder email sender
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 */

import { loadTemplate, render, sendEmail, requireEnv } from './lib/email.js';
import { getRows, updateCell } from './lib/sheets.js';

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

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / ms);
}

function testTypeDisplay(testType) {
  const t = (testType || 'UNKNOWN').toUpperCase();
  if (t === 'OBD') return 'OBD — $75';
  if (t === 'OVI') return 'OVI — $199';
  if (t === 'MOTORHOME_OBD') return 'Motorhome OBD — $99';
  if (t === 'MOTORHOME_OVI') return 'Motorhome OVI — $229';
  return 'OBD $75 · OVI $199 · Motorhome $99/$229';
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

  const { rows } = await getRows();
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
      await updateCell(row._rowIndex, col, today);
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
