#!/usr/bin/env node
/** Gmail send via service account + domain-wide delegation */

import { google } from 'googleapis';

const SERVICE_ACCOUNT_JSON = process.env.CAMILA_SERVICE_ACCOUNT_JSON || '';
const SEND_FROM = process.env.SEND_FROM || 'camila@norcalcarbmobile.com';
const LIVE = process.env.COLD_OUTREACH_LIVE === 'true';

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

export function canSendLive() {
  return LIVE && Boolean(SERVICE_ACCOUNT_JSON);
}

export async function sendEmail({ to, subject, body, dryRun = true }) {
  if (dryRun || !LIVE) {
    return { ok: true, dryRun: true, id: `dry-${Date.now()}` };
  }
  if (!SERVICE_ACCOUNT_JSON) {
    throw new Error('CAMILA_SERVICE_ACCOUNT_JSON required for live send');
  }

  const key = JSON.parse(SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
    ],
    subject: SEND_FROM,
  });

  const gmail = google.gmail({ version: 'v1', auth });
  const raw = encodeMessage({ from: SEND_FROM, to, subject, body });
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
  return { ok: true, dryRun: false, id: res.data.id };
}
