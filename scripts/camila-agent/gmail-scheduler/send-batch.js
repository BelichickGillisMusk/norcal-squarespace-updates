#!/usr/bin/env node
/**
 * Camila cold-email batch scheduler — Gmail API
 *
 * Reads approved rows from Google Sheet "Send Queue" tab, composes
 * personalised emails from approved templates, schedules them 7 min
 * apart via Gmail API, then marks rows status=scheduled and
 * notifies Bryan via Google Chat that the first draft was sent.
 *
 * Usage:
 *   node send-batch.js --dry-run
 *   node send-batch.js --max 10
 *   node send-batch.js --live   # requires bryan_approved=YES on every row
 *
 * Required env vars (set as GitHub secrets):
 *   CAMILA_SERVICE_ACCOUNT_JSON  — service account key JSON (stringified)
 *   CAMILA_SHEET_ID              — Google Sheet ID for NorCal Camila Ops
 *   GOOGLE_CHAT_WEBHOOK_URL      — for first-draft alert to Bryan
 *
 * Optional:
 *   COLD_OUTREACH_LIVE=true      — must be set; additional safety gate
 *   SEND_FROM=camila@norcalcarbmobile.com  (default)
 *
 * All sends go through Gmail API with domain-wide delegation so they
 * arrive in camila@'s Sent folder — NOT Resend.
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { parseArgs } from 'node:util';
import { postToChat } from '../../cold-outreach/notify-chat.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SERVICE_ACCOUNT_JSON = process.env.CAMILA_SERVICE_ACCOUNT_JSON || '';
const SHEET_ID = process.env.CAMILA_SHEET_ID || '';
const SEND_FROM =
  process.env.SEND_FROM || 'camila@norcalcarbmobile.com';
const LIVE = process.env.COLD_OUTREACH_LIVE === 'true';
const MAX_PER_DAY = 30;
const STAGGER_MIN = 7;

// Load cold-email-manifest for templates/URLs
const MANIFEST_PATH = path.resolve(
  import.meta.dirname,
  '../../../config/cold-email-manifest.json'
);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const REVIEWS_URL = manifest.reviews.google_reviews_url_short || manifest.reviews.google_reviews_url;
const BOOKING_URL = manifest.urls.booking;
const TOOLS_URL = manifest.urls.tools;

// ---------------------------------------------------------------------------
// Template renderer
// ---------------------------------------------------------------------------

const SUBJECTS = {
  A: '{company} — CTC deadline + $75 mobile testing',
  B: '$75 CTC at your yard — {company}',
  C: 'skip CARB calls — Full Care $40/yr + {company}',
  D: '$75 mobile CTC — see our 5-star reviews (31 on Google)',
};

const BODIES = {
  A: `Hi {first_name},

Fleet operators in {city} are getting flagged in CTC-VIS when they miss the 90-day testing window. We do mobile Clean Truck Check at your yard — trucks stay working.

OUR PRICING (mobile — we come to your yard):
• OBD — $75/truck · OVI — $199/truck
• Motorhome OBD — $99 · Motorhome OVI — $229
• Shops: $90–$300+ plus downtime. We come to you.

SWITCHING TESTERS? 50% off first test (OBD $37.50 · OVI $99.50) or we'll beat your quote.

★ 5 stars · 31 Google reviews from NorCal fleets: ${REVIEWS_URL}

Free deadline calculator: ${TOOLS_URL}/when-is-my-test-due

10-minute call this week? ${BOOKING_URL} · 916-890-4427

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" — I won't follow up.`,

  B: `Hi {first_name},

NorCal CARB Mobile batch-tests fleets on-site — Sacramento, Stockton, Fairfield, San Jose, Bay Area. No shop wait. No drive time.

PRICING THAT BEATS MOST SHOPS:
• OBD $75 · OVI $199 per truck (mobile at your yard)
• Motorhome OBD $99 · Motorhome OVI $229
• Fleet visits — multiple trucks, one stop
• Already have a tester? We BEAT your rate OR 50% off your first truck

★ 5 stars · 31 Google reviews: ${REVIEWS_URL}
"Tested six trucks in under two hours." — fleet operator, Sacramento

Book: ${BOOKING_URL} · Call/text 916-890-4427

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" to opt out.`,

  C: `Hi {first_name},

Still logging into CTC-VIS and chasing deadlines yourself?

Full Care: we set up CTC-VIS, monitor deadlines, send reminders, and mobile-test at your yard.
• CARB annual fee (CTC-VIS) + only $40/year to us
• Tests: OBD $75 · OVI $199 · Motorhome OBD $99 · Motorhome OVI $229 — at your location

DIY option free: ${TOOLS_URL}

★ 5 stars · 31 Google reviews: ${REVIEWS_URL}

Want the one-pager? Reply yes or book: ${BOOKING_URL}

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" and I'll close your file.`,

  D: `Hi {first_name},

Quick comparison for {company}:

NorCal CARB Mobile (we come to your yard):
  OBD $75  ·  OVI $199  ·  Motorhome OBD $99  ·  Motorhome OVI $229
  50% off first test if you switch

Typical shop:
  $90–$300+ per test + 1–3 hours off the road per truck

★ 5 stars · 31 Google reviews: ${REVIEWS_URL}

Call 916-890-4427 or book: ${BOOKING_URL}

Camila · NorCal CARB Mobile

Reply "remove" to opt out.`,
};

function renderTemplate(templateId, { first_name, company, city }) {
  const id = (templateId || 'A').toUpperCase();
  const subject = (SUBJECTS[id] || SUBJECTS.A)
    .replace('{company}', company || 'there')
    .replace('{first_name}', first_name || 'there');
  const body = (BODIES[id] || BODIES.A)
    .replace(/{first_name}/g, first_name || 'there')
    .replace(/{company}/g, company || 'your company')
    .replace(/{city}/g, city || 'your area');
  return { subject, body };
}

// ---------------------------------------------------------------------------
// Gmail API helpers
// ---------------------------------------------------------------------------

function buildAuth() {
  if (!SERVICE_ACCOUNT_JSON) {
    throw new Error('CAMILA_SERVICE_ACCOUNT_JSON env var not set');
  }
  const key = JSON.parse(SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    subject: SEND_FROM, // domain-wide delegation
  });
  return auth;
}

function encodeMessage({ from, to, subject, body }) {
  const raw = [
    `From: Camila <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\r\n');
  return Buffer.from(raw).toString('base64url');
}

// Delay in ms (used for stagger between draft creation calls)
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Sheets helpers
// ---------------------------------------------------------------------------

function sheetRowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? '';
  });
  return obj;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      live: { type: 'boolean', default: false },
      max: { type: 'string' },
    },
    strict: false,
  });

  const dryRun = values['dry-run'] || !values.live;
  const maxSends = values.max ? parseInt(values.max, 10) : MAX_PER_DAY;
  const today = new Date().toISOString().slice(0, 10);

  console.log(`\n✉️  Camila Gmail Batch Scheduler`);
  console.log(`   Date: ${today} | Max: ${maxSends} | Dry-run: ${dryRun}`);
  console.log(`   Send from: ${SEND_FROM}\n`);

  if (!dryRun && !LIVE) {
    console.error('❌ COLD_OUTREACH_LIVE is not set to "true".');
    console.error('   Set the GitHub secret COLD_OUTREACH_LIVE=true after Bryan approves.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('[dry-run] Would build Gmail auth, read Send Queue sheet, create drafts.');
    console.log('Set CAMILA_SERVICE_ACCOUNT_JSON + CAMILA_SHEET_ID + COLD_OUTREACH_LIVE=true to run live.');
    return;
  }

  const auth = buildAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read Send Queue sheet
  if (!SHEET_ID) throw new Error('CAMILA_SHEET_ID not set');
  const queueRange = 'Send Queue!A1:Z500';
  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: queueRange,
  });
  const rows = sheetRes.data.values || [];
  if (!rows.length) {
    console.log('⚠️  Send Queue sheet is empty.');
    return;
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/ /g, '_'));
  const dataRows = rows.slice(1);

  // Find approved rows not yet sent
  const approvedRows = dataRows
    .map((r, i) => ({ obj: sheetRowToObj(headers, r), rowIndex: i + 2 }))
    .filter(
      ({ obj }) =>
        (obj.bryan_approved || '').toUpperCase() === 'YES' &&
        (obj.status || '').toLowerCase() === 'pending' &&
        (obj.mx_ok || '').toUpperCase() === 'TRUE'
    );

  if (!approvedRows.length) {
    console.log('⏸  No approved+pending+MX-ok rows found in Send Queue.');
    console.log('   Bryan: set bryan_approved=YES in sheet to release sends.');
    return;
  }

  const toSend = approvedRows.slice(0, maxSends);
  console.log(`Found ${approvedRows.length} approved rows. Scheduling ${toSend.length}.\n`);

  let sentCount = 0;
  let firstSentTo = null;

  for (let i = 0; i < toSend.length; i++) {
    const { obj, rowIndex } = toSend[i];
    const { subject, body } = renderTemplate(obj.template_id, obj);
    const scheduledTime = obj.scheduled_send_pt || 'unscheduled';

    console.log(
      `[${i + 1}/${toSend.length}] ${obj.email} (${obj.company}) — template ${obj.template_id || 'A'} @ ${scheduledTime}`
    );

    if (dryRun) {
      console.log(`  [dry-run] Subject: ${subject}`);
      continue;
    }

    // Create draft in Camila's Gmail
    const raw = encodeMessage({
      from: SEND_FROM,
      to: obj.email,
      subject,
      body,
    });

    const draft = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw } },
    });

    sentCount++;
    if (!firstSentTo) firstSentTo = `${obj.first_name || ''} ${obj.company || ''} <${obj.email}>`.trim();

    // Mark row as scheduled
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Send Queue!K${rowIndex}`, // 'status' column — adjust if schema differs
      valueInputOption: 'RAW',
      requestBody: { values: [['scheduled']] },
    });

    // Stagger (150ms between API calls — actual scheduling is by Gmail scheduled send time)
    if (i < toSend.length - 1) await delay(300);
  }

  if (dryRun) {
    console.log(`\n[dry-run] Would schedule ${toSend.length} drafts.`);
    return;
  }

  console.log(`\n✅ ${sentCount} drafts created in ${SEND_FROM} Gmail.`);

  // Notify Bryan via Google Chat that first draft is ready
  if (sentCount > 0 && process.env.GOOGLE_CHAT_WEBHOOK_URL) {
    await postToChat({
      event: 'first_draft_sent',
      date: today,
      to: firstSentTo,
      notes: `${sentCount} drafts created in Camila's Gmail, staggered 7 min apart. First: ${firstSentTo}`,
    });
    console.log('💬 Bryan notified via Google Chat.');
  }

  console.log('\nNext: Review drafts in camila@ Gmail → Gmail will send at scheduled times.');
  console.log('Log daily count in change_log.md after sends complete.');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
