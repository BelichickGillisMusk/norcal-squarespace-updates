#!/usr/bin/env node
/**
 * Email preflight — DNS + config checks before any live send
 * APPROVED FOR DEPLOYMENT
 */

import { execSync } from 'child_process';

const DOMAIN = 'norcalcarbmobile.com';
const RESEND_SUBDOMAIN = 'mail.norcalcarbmobile.com';

const checks = [];

function dig(type, host) {
  try {
    const out = execSync(`dig +short ${type} ${host}`, { encoding: 'utf8' }).trim();
    return out || null;
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

// Root SPF
const rootSpf = dig('TXT', DOMAIN);
if (rootSpf && rootSpf.includes('spf1')) {
  pass('Root SPF', 'present');
  if (!rootSpf.includes('_squarespace-mail.com')) {
    warn('Root SPF', 'missing _squarespace-mail.com include');
  }
} else {
  fail('Root SPF', 'missing on root domain');
}

// Google DKIM
const googleDkim = dig('TXT', `google._domainkey.${DOMAIN}`);
if (googleDkim && googleDkim.includes('DKIM1')) {
  pass('Google DKIM', 'google._domainkey present (cold email OK)');
} else {
  warn('Google DKIM', 'not found — cold from bryan@ may suffer');
}

// DMARC
const dmarc = dig('TXT', `_dmarc.${DOMAIN}`);
if (dmarc && dmarc.includes('DMARC1')) {
  pass('DMARC', dmarc.slice(0, 60) + '...');
  if (dmarc.includes('p=reject')) {
    warn('DMARC strict', 'p=reject — Resend MUST use mail subdomain with aligned DKIM');
  }
} else {
  fail('DMARC', 'missing _dmarc record');
}

// Resend subdomain DKIM
const resendDkim = dig('TXT', `resend._domainkey.${RESEND_SUBDOMAIN}`);
if (resendDkim && resendDkim.includes('p=')) {
  pass('Resend DKIM', `resend._domainkey.${RESEND_SUBDOMAIN} present`);
} else {
  fail('Resend DKIM', `add resend._domainkey.mail in Cloudflare DNS — see dns-fix.md`);
}

// Resend SPF (send.mail)
const resendSpf = dig('TXT', `send.${RESEND_SUBDOMAIN}`);
if (resendSpf && resendSpf.includes('spf1')) {
  pass('Resend SPF', `send.${RESEND_SUBDOMAIN} present`);
} else {
  fail('Resend SPF', `add send.mail TXT in Cloudflare DNS — see dns-fix.md`);
}

// Resend MX
const resendMx = dig('MX', `send.${RESEND_SUBDOMAIN}`);
if (resendMx) {
  pass('Resend MX', resendMx.split('\n')[0]);
} else {
  warn('Resend MX', 'send.mail MX not found yet');
}

// Env secrets (when run in CI)
const requiredSecrets = [
  'RESEND_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'GOOGLE_SPREADSHEET_ID',
  'REMINDER_FROM_EMAIL',
  'APPS_SCRIPT_WEBAPP_URL',
  'SITE_BASE_URL'
];

const liveMode = process.env.NURTURE_LIVE === 'true' || process.env.REMINDERS_LIVE === 'true';

for (const key of requiredSecrets) {
  if (process.env[key]) {
    pass(`Secret ${key}`, 'set');
  } else if (liveMode && (process.env.CI || process.env.GITHUB_ACTIONS)) {
    fail(`Secret ${key}`, 'missing — required when NURTURE_LIVE or REMINDERS_LIVE');
  } else if (process.env.CI || process.env.GITHUB_ACTIONS) {
    warn(`Secret ${key}`, 'not set (OK until go-live)');
  } else {
    warn(`Secret ${key}`, 'not set locally (OK for DNS-only check)');
  }
}

const fromEmail = process.env.REMINDER_FROM_EMAIL || '';
if (fromEmail && !fromEmail.endsWith(`@${RESEND_SUBDOMAIN}`)) {
  warn('REMINDER_FROM_EMAIL', `should be @${RESEND_SUBDOMAIN}, got ${fromEmail || '(empty)'}`);
} else if (fromEmail) {
  pass('REMINDER_FROM_EMAIL', fromEmail);
}

const failed = checks.filter((c) => !c.ok);
console.log('\n---');
if (failed.length === 0) {
  console.log('PREFLIGHT PASS — safe to send test emails');
  process.exit(0);
} else {
  console.log(`PREFLIGHT FAIL — ${failed.length} blocker(s). Fix before live sends.`);
  process.exit(1);
}
