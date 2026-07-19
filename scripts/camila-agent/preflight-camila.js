#!/usr/bin/env node
/**
 * Camila mailbox preflight — DNS + Gmail API + config sync
 * Run before first cold send or after Workspace/DNS changes.
 *
 *   node scripts/camila-agent/preflight-camila.js
 *
 * Exit 0 = safe for camila@ / sales@ Gmail sends (when secrets set).
 * Exit 1 = fix blockers before live cold outreach.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { loadReviews } from './lib/load-reviews.js';

const DOMAIN = 'norcalcarbmobile.com';
const CAMILA = 'camila@norcalcarbmobile.com';
const SALES = 'sales@norcalcarbmobile.com';

const manifestPath = path.resolve(
  import.meta.dirname,
  '../../config/camila-agent-manifest.json'
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const coldManifestPath = path.resolve(
  import.meta.dirname,
  '../../config/cold-email-manifest.json'
);
const coldManifest = JSON.parse(fs.readFileSync(coldManifestPath, 'utf8'));

const checks = [];

function dig(type, host) {
  try {
    return execSync(`dig +short ${type} ${host}`, { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`✅ ${name}: ${detail}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`❌ ${name}: ${detail}`);
}

function warn(name, detail) {
  checks.push({ name, ok: true, warn: true, detail });
  console.warn(`⚠️  ${name}: ${detail}`);
}

console.log('Camila mailbox preflight — norcalcarbmobile.com\n');

// --- Reviews copy sync (marketing accuracy) ---
const reviews = loadReviews();
if (coldManifest.reviews?.count !== reviews.count) {
  fail(
    'Reviews manifest sync',
    `cold-email-manifest count=${coldManifest.reviews?.count} but reviews.json count=${reviews.count}`
  );
} else {
  pass('Reviews manifest sync', `${reviews.count} Google reviews in config/reviews.json`);
}

if (manifest.reviews?.count !== reviews.count) {
  fail(
    'Camila manifest sync',
    `camila-agent-manifest count=${manifest.reviews?.count} but reviews.json count=${reviews.count}`
  );
} else {
  pass('Camila manifest sync', manifest.reviews?.headline || reviews.headline);
}

// --- Google Workspace DNS (required for camila@ not to bounce / land spam) ---
const mx = dig('MX', DOMAIN);
if (mx && /google|gmail|aspmx/i.test(mx)) {
  pass('Google MX', mx.split('\n')[0]);
} else {
  fail('Google MX', `MX must point to Google Workspace — got: ${mx || '(none)'}`);
}

const rootTxt = dig('TXT', DOMAIN) || '';
if (rootTxt.includes('spf1') && rootTxt.includes('_spf.google.com')) {
  pass('Root SPF', 'includes _spf.google.com (Gmail send auth)');
} else {
  fail(
    'Root SPF',
    'root TXT must include v=spf1 ... include:_spf.google.com — cold mail will fail DMARC'
  );
}

const googleDkim = dig('TXT', `google._domainkey.${DOMAIN}`);
if (googleDkim && googleDkim.includes('DKIM1')) {
  pass('Google DKIM', 'google._domainkey present');
} else {
  fail('Google DKIM', 'missing — enable in Admin → Apps → Google Workspace → Gmail → Authenticate email');
}

const dmarc = dig('TXT', `_dmarc.${DOMAIN}`);
if (dmarc && dmarc.includes('DMARC1')) {
  pass('DMARC', dmarc.slice(0, 72) + '...');
  if (dmarc.includes('p=reject')) {
    warn(
      'DMARC strict',
      'p=reject — only send cold from real Workspace users (camila@/sales@) with Google DKIM; never Resend on root domain'
    );
  }
} else {
  fail('DMARC', 'missing _dmarc record');
}

// --- Identity config ---
if (manifest.identity_email !== CAMILA) {
  fail('identity_email', `expected ${CAMILA}, got ${manifest.identity_email}`);
} else {
  pass('identity_email', CAMILA);
}

if (manifest.gcp?.project_id?.includes('PASTE')) {
  warn('GCP project', 'camila-agent-manifest still has PASTE_GCP_PROJECT_ID — set real project before Vertex deploy');
}

// --- Gmail API + domain-wide delegation ---
const saJson = process.env.CAMILA_SERVICE_ACCOUNT_JSON || '';
const requiredSecrets = [
  'CAMILA_SERVICE_ACCOUNT_JSON',
  'CAMILA_SHEET_ID',
  'GOOGLE_CHAT_WEBHOOK_URL',
];

for (const key of requiredSecrets) {
  if (process.env[key]) pass(`Secret ${key}`, 'set');
  else warn(`Secret ${key}`, 'not set — required before automated cold send in GitHub Actions');
}

if (!saJson) {
  warn('Gmail API test', 'skip — CAMILA_SERVICE_ACCOUNT_JSON not set locally');
} else {
  for (const mailbox of [CAMILA, SALES]) {
    try {
      const key = JSON.parse(saJson);
      const auth = new google.auth.JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        subject: mailbox,
      });
      const gmail = google.gmail({ version: 'v1', auth });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      const addr = profile.data.emailAddress;
      if (addr?.toLowerCase() === mailbox) {
        pass(`Gmail API ${mailbox}`, 'domain-wide delegation OK');
      } else {
        fail(`Gmail API ${mailbox}`, `profile email ${addr} !== ${mailbox}`);
      }
    } catch (e) {
      fail(
        `Gmail API ${mailbox}`,
        `${e.message} — create Workspace user, enable delegation + scopes in Admin Console`
      );
    }
  }
}

// --- Send safety gates ---
const sendFrom = process.env.SEND_FROM || CAMILA;
if (!sendFrom.endsWith(`@${DOMAIN}`)) {
  fail('SEND_FROM', `must be @${DOMAIN}, got ${sendFrom}`);
} else {
  pass('SEND_FROM', sendFrom);
}

if (process.env.COLD_OUTREACH_LIVE === 'true') {
  warn('COLD_OUTREACH_LIVE', 'true — live sends unlocked; ensure bryan_approved=YES on every row');
} else {
  pass('COLD_OUTREACH_LIVE', 'not true (safe default — set secret only after Bryan approves)');
}

console.log('\nBlacklist prevention (enforced in send-batch.js):');
console.log('  • Max 30 cold emails/day from camila@');
console.log('  • Min 7 minutes between sends');
console.log('  • MX verify before queue; suppression list honored');
console.log('  • One recipient per message — no BCC blasts');
console.log('  • Bryan approval column required before schedule');

const failed = checks.filter((c) => !c.ok);
console.log('\n---');
if (failed.length === 0) {
  console.log('CAMILA PREFLIGHT PASS — DNS OK for Workspace Gmail');
  process.exit(0);
}
console.log(`CAMILA PREFLIGHT FAIL — ${failed.length} blocker(s). Fix before live cold sends.`);
process.exit(1);
