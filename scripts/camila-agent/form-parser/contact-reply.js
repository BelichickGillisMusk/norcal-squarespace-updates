#!/usr/bin/env node
/**
 * Squarespace contact-form auto-reply — runs as sales@ (or camila@)
 *
 * When a visitor fills out the contact form on norcalcarbmobile.com:
 *   1. Squarespace sends a notification to sales@ (or camila@)
 *   2. This script (triggered by Gmail watch or Apps Script) reads
 *      new unread messages in the inbox that look like form submissions
 *   3. Parses the lead: name, email, phone, message
 *   4. Appends a row to Google Sheet "Form Leads" tab
 *   5. Sends an auto-reply from sales@ within 15 minutes
 *   6. Flags fleet/complex inquiries for Bryan
 *
 * Usage:
 *   node contact-reply.js --dry-run          # parse inbox, do not send
 *   node contact-reply.js --test-email you@x.com  # send test reply to your address
 *   node contact-reply.js                     # live mode
 *
 * Required env:
 *   CAMILA_SERVICE_ACCOUNT_JSON
 *   CAMILA_SHEET_ID
 *   GOOGLE_CHAT_WEBHOOK_URL   (optional — escalation alerts)
 *
 * Optional:
 *   REPLY_FROM=sales@norcalcarbmobile.com  (default; falls back to camila@)
 *   ESCALATE_TO=bryan@norcalcarbmobile.com
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
const REPLY_FROM =
  process.env.REPLY_FROM || 'sales@norcalcarbmobile.com';
const ESCALATE_TO =
  process.env.ESCALATE_TO || 'bryan@norcalcarbmobile.com';

const MANIFEST_PATH = path.resolve(
  import.meta.dirname,
  '../../../config/cold-email-manifest.json'
);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const REVIEWS_URL =
  manifest.reviews.google_reviews_url_short || manifest.reviews.google_reviews_url;

// Keywords that trigger escalation to Bryan
const ESCALATION_TRIGGERS = [
  'fleet',
  '3 truck',
  '4 truck',
  '5 truck',
  '6 truck',
  'multiple truck',
  'many truck',
  'negotiat',
  'discount',
  'complaint',
  'attorney',
  'legal',
  'lawsuit',
  'quote for',
  'contract',
];

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function buildAuth() {
  if (!SERVICE_ACCOUNT_JSON) throw new Error('CAMILA_SERVICE_ACCOUNT_JSON not set');
  const key = JSON.parse(SERVICE_ACCOUNT_JSON);
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    subject: REPLY_FROM,
  });
}

// ---------------------------------------------------------------------------
// Email parsing
// ---------------------------------------------------------------------------

function base64Decode(s) {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function getMessageBody(payload) {
  if (!payload) return '';
  if (payload.body?.data) return base64Decode(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return base64Decode(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const nested = getMessageBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

function getHeader(headers, name) {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

/**
 * Attempt to extract structured fields from a Squarespace form notification email.
 * Squarespace sends HTML-heavy emails; we look for Name:, Email:, Phone:, Message: patterns.
 */
function parseFormEmail(subject, body) {
  const lead = {
    name: '',
    email: '',
    phone: '',
    message: '',
    raw_subject: subject,
  };

  // Squarespace notification typically includes:
  //   Name: Joe Smith
  //   Email: joe@fleet.com
  //   Phone: 916-555-1234
  //   Message: I have 4 trucks...
  const nameMatch = body.match(/Name[:\s]+([^\n\r]+)/i);
  const emailMatch = body.match(/(?:Email|Reply[- ]?to)[:\s]+([^\s@\n\r]+@[^\s\n\r]+)/i);
  const phoneMatch = body.match(/Phone[:\s]+([^\n\r]+)/i);
  const msgMatch = body.match(/Message[:\s]+([\s\S]+?)(?:\n\n|$)/i);

  lead.name = nameMatch?.[1]?.trim() || '';
  lead.email = emailMatch?.[1]?.trim().toLowerCase() || '';
  lead.phone = phoneMatch?.[1]?.trim() || '';
  lead.message = msgMatch?.[1]?.trim() || '';

  return lead;
}

function needsEscalation(lead) {
  const text = (lead.message + ' ' + lead.raw_subject).toLowerCase();
  return ESCALATION_TRIGGERS.some((t) => text.includes(t));
}

// ---------------------------------------------------------------------------
// Auto-reply template
// ---------------------------------------------------------------------------

function buildReplyBody(lead) {
  const firstName = lead.name.split(' ')[0] || 'there';
  return `Hi ${firstName},

Thanks for reaching out to NorCal CARB Mobile — I'm Camila, our scheduling coordinator.

Mobile Clean Truck Check at your yard:
• OBD $75 · OVI $199
• Motorhome OBD $99 · Motorhome OVI $229
• ★ 5 stars · 31 Google reviews: ${REVIEWS_URL}

Book: norcalcarbmobile.com/contact · 916-890-4427

Bryan handles fleet quotes 3+ trucks — I'll loop him in if needed.

Camila
NorCal CARB Mobile
sales@norcalcarbmobile.com`;
}

function encodeMessage({ from, to, replyTo, subject, body, threadId }) {
  const headers = [
    `From: Camila at NorCal CARB Mobile <${from}>`,
    `To: ${to}`,
    `Subject: Re: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
  ];
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  const raw = [...headers, '', body].join('\r\n');
  return Buffer.from(raw).toString('base64url');
}

// ---------------------------------------------------------------------------
// Sheets helpers
// ---------------------------------------------------------------------------

async function appendFormLead(sheets, lead, escalated) {
  const now = new Date().toISOString();
  const values = [[
    lead.email,
    lead.name,
    lead.phone,
    lead.message.slice(0, 500),
    'new',
    escalated ? 'TRUE' : 'FALSE',
    now,
    lead.raw_subject,
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Form Leads!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      'test-email': { type: 'string' },
      'max': { type: 'string', default: '20' },
    },
    strict: false,
  });

  const dryRun = values['dry-run'];
  const testEmail = values['test-email'];
  const maxProcess = parseInt(values.max, 10);

  console.log(`\n📬 Camila Form Parser — Contact Reply`);
  console.log(`   Reply from: ${REPLY_FROM} | Dry-run: ${dryRun}\n`);

  if (dryRun && !testEmail) {
    console.log('[dry-run] Would connect to Gmail, scan unread form notifications, auto-reply from ' + REPLY_FROM);
    console.log('Set CAMILA_SERVICE_ACCOUNT_JSON + CAMILA_SHEET_ID to run live.');
    return;
  }

  // Test mode: send a canned reply to validate setup
  if (testEmail) {
    const testLead = {
      name: 'Test User',
      email: testEmail,
      phone: '916-555-0000',
      message: 'Test form submission from contact-reply.js',
      raw_subject: 'New Contact Form: Test',
    };
    console.log(`[test] Would reply to: ${testEmail}`);
    console.log('--- REPLY BODY ---');
    console.log(buildReplyBody(testLead));
    if (!dryRun) {
      const auth = buildAuth();
      const gmail = google.gmail({ version: 'v1', auth });
      const raw = encodeMessage({
        from: REPLY_FROM,
        to: testEmail,
        subject: 'New Contact Form: Test',
        body: buildReplyBody(testLead),
      });
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
      console.log(`✅ Test reply sent to ${testEmail}`);
    }
    return;
  }

  const auth = buildAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  const sheets = SHEET_ID ? google.sheets({ version: 'v4', auth }) : null;

  // Fetch unread messages that look like Squarespace form submissions
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread subject:"New Form Submission" OR subject:"New Contact" OR subject:"New Booking" OR from:no-reply@squarespace.com',
    maxResults: maxProcess,
  });

  const messages = listRes.data.messages || [];
  if (!messages.length) {
    console.log('No new form submissions found.');
    return;
  }

  console.log(`Found ${messages.length} unread form notifications.\n`);

  let processed = 0;
  let escalated = 0;

  for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = full.data.payload?.headers || [];
    const subject = getHeader(headers, 'subject');
    const body = getMessageBody(full.data.payload);
    const lead = parseFormEmail(subject, body);

    if (!lead.email) {
      console.log(`⏭ Skipped (no email found): ${subject}`);
      continue;
    }

    const shouldEscalate = needsEscalation(lead);
    console.log(
      `→ ${lead.email} (${lead.name || 'unknown'}) | escalate: ${shouldEscalate}`
    );

    if (!dryRun) {
      // Log to Sheet
      if (sheets) {
        await appendFormLead(sheets, lead, shouldEscalate);
      }

      // Send auto-reply
      const replyBody = buildReplyBody(lead);
      const raw = encodeMessage({
        from: REPLY_FROM,
        to: lead.email,
        subject,
        body: replyBody,
      });
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });

      // Mark original as read
      await gmail.users.messages.modify({
        userId: 'me',
        id: msg.id,
        requestBody: { removeLabelIds: ['UNREAD'] },
      });

      // Escalate to Bryan
      if (shouldEscalate) {
        const escalateRaw = encodeMessage({
          from: REPLY_FROM,
          to: ESCALATE_TO,
          subject: `[Escalation] ${subject}`,
          body: `Bryan — form lead needs your attention.\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nMessage: ${lead.message}\n\nCamila auto-replied with pricing. Follow up needed.`,
        });
        await gmail.users.messages.send({ userId: 'me', requestBody: { raw: escalateRaw } });

        if (process.env.GOOGLE_CHAT_WEBHOOK_URL) {
          await postToChat({
            event: 'info',
            notes: `🔔 Fleet/complex lead escalated to Bryan: ${lead.name} (${lead.email}) — "${lead.message.slice(0, 80)}"`,
          });
        }
        escalated++;
      }

      processed++;
    } else {
      console.log(`  [dry-run] Would reply to ${lead.email} and log to sheet`);
      if (shouldEscalate) console.log(`  [dry-run] Would escalate to ${ESCALATE_TO}`);
    }
  }

  console.log(`\n✅ Processed: ${processed} | Escalated: ${escalated}`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
