/**
 * Local preview of native HTML POSTs to /api/contact.
 * Mocks send_email (env.EMAIL). Does not deploy, does not call Cloudflare.
 *
 * Run: node worker/preview-native-contact.mjs
 *
 * Outcomes: success (primary), send failure, honeypot, plus fallback-only-on-failure.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact, FORM_TO_FALLBACK, NATIVE_REDIRECT } from './contact.js';

const valid = {
  name: 'Preview Driver',
  phone: '555-0100',
  email: 'preview@example.com',
  terms_accepted: 'yes',
  location: 'Oakland yard',
};

function formRequest(body) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(body)) fd.append(k, String(v));
  return new Request('http://127.0.0.1:8787/api/contact', {
    method: 'POST',
    headers: {
      referer: 'https://norcalcarbmobile.com/bay-area-mobile-carb',
      'user-agent': 'contact-preview/1.0',
    },
    body: fd,
  });
}

function captureLogs(fn) {
  const lines = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args) => {
    lines.push(args.map(String).join(' '));
  };
  console.error = (...args) => {
    lines.push(args.map(String).join(' '));
  };
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      console.log = origLog;
      console.error = origErr;
    })
    .then((res) => ({ res, lines }));
}

function intakeLine(lines) {
  return lines.find((l) => l.includes('"event":"contact_intake"')) || '(no contact_intake line)';
}

function emailPrimaryOk() {
  return {
    async send(message) {
      if (message.to[0] !== 'carb@norcalcarbmobile.com') {
        throw new Error('unexpected destination');
      }
    },
  };
}

function emailAlwaysFail() {
  return {
    async send() {
      const err = new Error('mocked send failure');
      err.code = 4500;
      throw err;
    },
  };
}

function emailPrimaryFailFallbackOk(tos) {
  return {
    async send(message) {
      tos.push(message.to[0]);
      if (message.to[0] === 'carb@norcalcarbmobile.com') {
        const err = new Error('primary rejected');
        err.code = 4500;
        throw err;
      }
    },
  };
}

const cases = [];

{
  const { res, lines } = await captureLogs(() => handleContact(formRequest(valid), { EMAIL: emailPrimaryOk() }));
  cases.push({
    outcome: 'success (primary)',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    expectedLocation: NATIVE_REDIRECT.success,
  });
}

{
  const { res, lines } = await captureLogs(() => handleContact(formRequest({ name: 'A', phone: '1' }), { EMAIL: emailPrimaryOk() }));
  cases.push({
    outcome: 'validation failure',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    expectedLocation: NATIVE_REDIRECT.error,
  });
}

{
  const { res, lines } = await captureLogs(() => handleContact(formRequest(valid), { EMAIL: emailAlwaysFail() }));
  cases.push({
    outcome: 'send failure',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    expectedLocation: NATIVE_REDIRECT.send_failed,
  });
}

{
  const { res, lines } = await captureLogs(() => handleContact(formRequest({ ...valid, website: 'http://spam.example' }), { EMAIL: emailPrimaryOk() }));
  cases.push({
    outcome: 'honeypot',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    expectedLocation: NATIVE_REDIRECT.honeypot,
  });
}

{
  const tos = [];
  const { res, lines } = await captureLogs(() => handleContact(formRequest(valid), { EMAIL: emailPrimaryFailFallbackOk(tos) }));
  cases.push({
    outcome: 'fallback after primary fail',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    destinations: tos,
    expectedLocation: NATIVE_REDIRECT.success,
  });
}

{
  const tos = [];
  const { res, lines } = await captureLogs(() => handleContact(formRequest(valid), {
    EMAIL: {
      async send(message) {
        tos.push(...message.to);
      },
    },
  }));
  cases.push({
    outcome: 'success does not dual-send',
    status: res.status,
    location: res.headers.get('Location'),
    log: intakeLine(lines),
    destinations: tos,
    expectedLocation: NATIVE_REDIRECT.success,
  });
}

const report = [
  'Contact intake local preview (send_email mocked; no Cloudflare deploy)',
  `Worker module: worker/contact.js via handleContact`,
  `Date: ${new Date().toISOString()}`,
  '',
];

for (const c of cases) {
  report.push(`=== ${c.outcome} ===`);
  report.push(`HTTP ${c.status}`);
  report.push(`Location: ${c.location}`);
  report.push(`log: ${c.log}`);
  if (c.destinations) report.push(`send destinations: ${JSON.stringify(c.destinations)}`);
  report.push('');
}

report.push('Notes:');
report.push(`- Honeypot Location ${NATIVE_REDIRECT.honeypot} still includes sent=1 so a bot sees success.`);
report.push(`- Fallback destination ${FORM_TO_FALLBACK} is used only when primary send throws.`);
report.push('- Logs are JSON contact_intake lines: outcome, referer path, send_path. No form fields.');

const text = report.join('\n') + '\n';
process.stdout.write(text);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoOut = join(root, 'artifacts', 'contact-intake-local-preview.txt');
mkdirSync(dirname(repoOut), { recursive: true });
writeFileSync(repoOut, text);

const optDir = '/opt/cursor/artifacts';
try {
  mkdirSync(optDir, { recursive: true });
  writeFileSync(join(optDir, 'contact-intake-local-preview.txt'), text);
} catch {
  // optional path may be missing outside Cursor cloud
}

const mismatched = cases.filter((c) => c.location !== c.expectedLocation || c.status !== 303);
if (mismatched.length) {
  console.error('preview mismatches:', mismatched.map((c) => c.outcome).join(', '));
  process.exit(1);
}
