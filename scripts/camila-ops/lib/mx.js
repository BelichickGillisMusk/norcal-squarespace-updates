#!/usr/bin/env node
/** MX check + email guess from domain */

import { execSync } from 'child_process';

const ROLE_LOCALS = ['info', 'contact', 'office', 'admin', 'sales', 'dispatch'];

export function hasMx(domain) {
  if (!domain) return false;
  try {
    const out = execSync(`dig +short MX ${domain}`, {
      encoding: 'utf8',
      timeout: 8000,
    }).trim();
    return out.length > 0 && !out.includes('NXDOMAIN');
  } catch {
    return false;
  }
}

/**
 * Prefer info@domain when MX ok. Flags email_guessed=true.
 */
export function guessEmail(domain) {
  if (!domain || !hasMx(domain)) {
    return { email: null, mx_ok: false, local: null };
  }
  const local = ROLE_LOCALS[0];
  return {
    email: `${local}@${domain}`.toLowerCase(),
    mx_ok: true,
    local,
    email_guessed: true,
  };
}
