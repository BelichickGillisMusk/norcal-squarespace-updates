#!/usr/bin/env node
/**
 * Verify email domains have MX records before cold send — reduces bounces
 * APPROVED FOR DEPLOYMENT
 *
 * Usage:
 *   node verify-emails.js --email test@company.com
 *   node verify-emails.js --file leads.csv
 *   cat leads.csv | node verify-emails.js --file -
 */

import fs from 'fs';
import { execSync } from 'child_process';

const ROLE_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster'];

function parseArgs(argv) {
  const args = { email: null, file: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--email') args.email = argv[++i];
    if (argv[i] === '--file') args.file = argv[++i];
  }
  return args;
}

function hasMx(domain) {
  try {
    const out = execSync(`dig +short MX ${domain}`, { encoding: 'utf8' }).trim();
    return out.length > 0 && !out.includes('NXDOMAIN');
  } catch {
    return false;
  }
}

function verifyEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { email: normalized, mx_ok: false, reason: 'invalid_format' };
  }
  const [local, domain] = normalized.split('@');
  if (ROLE_PREFIXES.some((p) => local.startsWith(p))) {
    return { email: normalized, mx_ok: true, reason: 'role_address_review' };
  }
  const mx = hasMx(domain);
  return { email: normalized, mx_ok: mx, reason: mx ? 'ok' : 'no_mx' };
}

function parseCsvLine(line) {
  const parts = line.split(',');
  return parts[0]?.trim();
}

function main() {
  const args = parseArgs(process.argv);
  const results = [];

  if (args.email) {
    results.push(verifyEmail(args.email));
  } else if (args.file) {
    const content = args.file === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(args.file, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const start = lines[0]?.includes('@') && lines[0].includes('email') ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const email = parseCsvLine(lines[i]);
      if (email && email.includes('@')) results.push(verifyEmail(email));
    }
  } else {
    console.error('Usage: --email addr OR --file leads.csv');
    process.exit(1);
  }

  let bad = 0;
  for (const r of results) {
    const icon = r.mx_ok ? '✅' : '❌';
    console.log(`${icon} ${r.email} — ${r.reason}`);
    if (!r.mx_ok) bad++;
  }
  console.log(`\n${results.length - bad}/${results.length} OK`);
  process.exit(bad > 0 ? 1 : 0);
}

main();
