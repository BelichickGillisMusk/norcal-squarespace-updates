/**
 * Contact form handler — persist before email, 200 if KV stored even when send fails.
 * Plain node, no test framework.
 *
 * Run: node worker/contact.test.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact, persistLead, FORM_TO, FORM_TO_FALLBACK, FORM_FROM, THANKS_MESSAGE } from './contact.js';
import { VERIFIED_EMAIL_ROUTING_DESTINATIONS } from './verified-email-destinations.js';

let failed = 0;
let passed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error('FAIL:', msg);
}

function jsonRequest(body, extraHeaders = {}) {
  return new Request('https://norcalcarbmobile.com/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': 'contact-test/1.0',
      'cf-connecting-ip': '203.0.113.9',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

const valid = {
  name: 'Test Driver',
  phone: '916 835-5127',
  email: 'driver@example.com',
  company: 'Donger Fleet LLC',
  location: 'RV, Petaluma KOA',
  terms_accepted: 'yes',
  message: 'Need a test Friday',
  service: 'OVI',
  trucks: '2',
  preferred_date: '2026-11-20',
};

function mockKv(store) {
  return {
    async put(key, value) {
      store.set(key, value);
    },
  };
}

function emailOk() {
  return { async send() { return; } };
}

function emailThrow(code, message) {
  return {
    async send() {
      const err = new Error(message);
      err.code = code;
      throw err;
    },
  };
}

async function jsonRes(res) {
  return { status: res.status, body: await res.json() };
}

const logs = [];
const origError = console.error;
console.error = (...args) => { logs.push(args); };

{
  const kv = new Map();
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    LEADS: mockKv(kv),
    EMAIL: emailThrow(4500, 'internal error'),
  }));
  assert(res.status === 200, `KV success + email fail should be 200, got ${res.status}`);
  assert(res.body.ok === true, 'KV success + email fail should be ok:true');
  assert(res.body.message === THANKS_MESSAGE, 'success JSON should include thanks message');
  assert(kv.size === 1, `expected 1 KV write, got ${kv.size}`);
  const [key, raw] = [...kv.entries()][0];
  assert(/^\d+-[0-9a-f-]{36}$/i.test(key), `KV key should be timestamp-uuid, got ${key}`);
  const rec = JSON.parse(raw);
  assert(rec.name === valid.name, 'stored name');
  assert(rec.phone === valid.phone, 'stored phone');
  assert(rec.city === valid.location, 'stored city from location');
  assert(rec.ip === '203.0.113.9', `stored ip, got ${rec.ip}`);
  assert(rec.userAgent === 'contact-test/1.0', 'stored user-agent');
  assert(rec.fields && rec.fields.location === valid.location, 'stored original fields');
  assert(logs.some((a) => String(a[0]).includes('contact send failed') && a[1] === 4500), 'email error logged with code');
}

{
  logs.length = 0;
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    EMAIL: emailThrow(4500, 'internal error'),
  }));
  assert(res.status === 502, `both fail should be 502, got ${res.status}`);
  assert(res.body.ok === false, 'both fail should be ok:false');
  assert(/916\) 890-4427/.test(res.body.error), `502 should keep 916-890-4427, got ${res.body.error}`);
}

{
  const tos = [];
  let calls = 0;
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    EMAIL: {
      async send(message) {
        calls += 1;
        tos.push(message.to[0]);
        if (calls === 1) {
          const err = new Error('primary rejected');
          err.code = 4500;
          throw err;
        }
      },
    },
  }));
  assert(res.status === 200 && res.body.ok === true, 'fallback send after primary fail should 200');
  assert(tos[0] === 'carb@norcalcarbmobile.com', `first send is carb@, got ${tos[0]}`);
  assert(tos[1] === FORM_TO_FALLBACK, `second send is fallback, got ${tos[1]}`);
}

{
  const kv = new Map();
  let sent;
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    LEADS: mockKv(kv),
    EMAIL: {
      async send(message) {
        sent = message;
      },
    },
  }));
  assert(res.status === 200 && res.body.ok === true, 'happy path 200');
  assert(sent && sent.to[0] === FORM_TO[0], 'email To is FORM_TO');
  assert(sent.from.email === FORM_FROM.email, 'email From is website@norcalcarbmobile.com');
  assert(sent.replyTo === valid.email, 'replyTo from lead email');
  assert(sent.text.includes('Company: Donger Fleet LLC'), 'email body includes company');
  assert(sent.text.includes('Preferred date: 2026-11-20'), 'email body includes preferred date');
  assert(sent.text.includes('Test type: OVI'), 'email body includes test type');
  assert(sent.text.includes('City / site: RV, Petaluma KOA'), 'email body includes city/site');
  assert(sent.text.includes('Truck count: 2'), 'email body includes truck count');
  assert(kv.size === 1, 'happy path still persists to KV');
  const happy = JSON.parse([...kv.values()][0]);
  assert(happy.company === valid.company, 'KV stores company');
  assert(happy.preferredDate === valid.preferred_date, 'KV stores preferredDate');
}

{
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    EMAIL: emailOk(),
  }));
  assert(res.status === 200 && res.body.ok === true, 'email-only (no KV binding) still 200');
}

{
  const kv = new Map();
  const res = await jsonRes(await handleContact(jsonRequest(valid), {
    LEADS: mockKv(kv),
  }));
  assert(res.status === 200 && res.body.ok === true, 'KV-only (no EMAIL) should 200');
  assert(kv.size === 1, 'KV-only stored the lead');
}

{
  const res = await jsonRes(await handleContact(jsonRequest(valid), {}));
  assert(res.status === 503, `no KV and no EMAIL should 503, got ${res.status}`);
}

{
  const res = await jsonRes(await handleContact(jsonRequest({ phone: '916-890-4427', terms_accepted: 'yes' }), {
    EMAIL: emailOk(),
  }));
  assert(res.status === 422, `missing name should 422, got ${res.status}`);
}

{
  const res = await jsonRes(await handleContact(jsonRequest({
    name: 'Email Only',
    email: 'preview@example.com',
    terms_accepted: 'yes',
    location: 'Oakland yard',
  }), { EMAIL: emailOk() }));
  assert(res.status === 200 && res.body.ok === true, 'name + email without phone should 200');
}

{
  const res = await jsonRes(await handleContact(jsonRequest({
    name: 'No Reach',
    terms_accepted: 'yes',
  }), { EMAIL: emailOk() }));
  assert(res.status === 422, `name without phone or email should 422, got ${res.status}`);
  assert(/phone number or email/.test(res.body.error), `422 should mention phone or email, got ${res.body.error}`);
}

{
  const res = await jsonRes(await handleContact(jsonRequest({
    name: 'Bad Email',
    email: 'not-an-email',
    terms_accepted: 'yes',
  }), { EMAIL: emailOk() }));
  assert(res.status === 422, `invalid email without phone should 422, got ${res.status}`);
}

{
  let sent;
  await jsonRes(await handleContact(jsonRequest({
    ...valid,
    company: 'Visible Co',
    website: '',
  }), {
    EMAIL: { async send(message) { sent = message; } },
  }));
  assert(sent && sent.text.includes('Company: Visible Co'), 'real company field is not treated as honeypot');
}

{
  const res = await jsonRes(await handleContact(jsonRequest({ name: 'A', phone: '1' }), {
    EMAIL: emailOk(),
  }));
  assert(res.status === 422, `missing terms should 422, got ${res.status}`);
}

{
  const kv = new Map();
  let sent = false;
  const res = await jsonRes(await handleContact(jsonRequest({ ...valid, website: 'bot' }), {
    LEADS: mockKv(kv),
    EMAIL: { async send() { sent = true; } },
  }));
  assert(res.status === 200 && res.body.ok === true, 'honeypot still 200');
  assert(kv.size === 0 && sent === false, 'honeypot must not persist or email');
}

{
  const kv = new Map();
  await persistLead(
    { LEADS: mockKv(kv) },
    jsonRequest(valid),
    { name: 'X', submittedAt: '2026-11-04T00:00:00.000Z' },
    valid,
  );
  assert(kv.size === 1, 'persistLead writes when LEADS.put exists');
  const stored = JSON.parse([...kv.values()][0]);
  assert(stored.fields.name === valid.name, 'persistLead keeps all fields');
}

{
  const ok = await persistLead({}, jsonRequest(valid), { name: 'X' }, valid);
  assert(ok === false, 'persistLead no-ops when LEADS is unbound');
}

{
  const allow = VERIFIED_EMAIL_ROUTING_DESTINATIONS;
  assert(Array.isArray(allow) && allow.length > 0, 'verified destination allowlist must be non-empty');
  assert(
    allow.includes('carb@norcalcarbmobile.com') && allow.includes('fsu9913@gmail.com'),
    `allowlist must include carb@ and fsu9913, got ${JSON.stringify(allow)}`,
  );
  assert(!allow.includes('bgillis99@gmail.com'), 'allowlist must not include bgillis99@gmail.com');
  assert(!allow.includes('sales@norcalcarbmobile.com'), 'allowlist must not include sales@');

  assert(FORM_TO.length === 1 && FORM_TO[0] === 'carb@norcalcarbmobile.com', `FORM_TO must be carb@, got ${JSON.stringify(FORM_TO)}`);
  assert(FORM_TO_FALLBACK === 'fsu9913@gmail.com', `FORM_TO_FALLBACK must be fsu9913@gmail.com, got ${FORM_TO_FALLBACK}`);
  for (const addr of [...FORM_TO, FORM_TO_FALLBACK]) {
    assert(allow.includes(addr), `FORM_TO/fallback not in verified Email Routing allowlist: ${addr}`);
  }

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const configs = [
    { path: 'wrangler.toml', text: readFileSync(join(root, 'wrangler.toml'), 'utf8') },
    { path: 'wrangler.jsonc', text: readFileSync(join(root, 'wrangler.jsonc'), 'utf8') },
    { path: 'wrangler.prod-empty.toml', text: readFileSync(join(root, 'wrangler.prod-empty.toml'), 'utf8') },
  ];

  function configuredDestinations(text, path) {
    const bind = [];
    const formTo = [];
    const fallback = [];
    const jsonc = path.endsWith('.jsonc') || path.endsWith('.json');
    if (jsonc) {
      const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      const parsed = JSON.parse(stripped);
      bind.push(...(parsed.send_email?.flatMap((b) => b.allowed_destination_addresses || b.destination_address || []) || []));
      if (parsed.vars?.FORM_TO) formTo.push(...String(parsed.vars.FORM_TO).split(',').map((s) => s.trim()).filter(Boolean));
      if (parsed.vars?.FORM_TO_FALLBACK) fallback.push(...String(parsed.vars.FORM_TO_FALLBACK).split(',').map((s) => s.trim()).filter(Boolean));
    } else {
      const bindMatch = [...text.matchAll(/allowed_destination_addresses\s*=\s*\[([^\]]*)\]/g)];
      for (const m of bindMatch) bind.push(...[...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
      bind.push(...[...text.matchAll(/destination_address\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
      const formToVar = text.match(/^\s*FORM_TO\s*=\s*"([^"]+)"/m);
      if (formToVar) formTo.push(...formToVar[1].split(',').map((s) => s.trim()).filter(Boolean));
      const fallbackVar = text.match(/^\s*FORM_TO_FALLBACK\s*=\s*"([^"]+)"/m);
      if (fallbackVar) fallback.push(...fallbackVar[1].split(',').map((s) => s.trim()).filter(Boolean));
    }
    return { bind, formTo, fallback };
  }

  for (const cfg of configs) {
    const { bind, formTo, fallback } = configuredDestinations(cfg.text, cfg.path);
    const all = [...bind, ...formTo, ...fallback];
    assert(all.length > 0, `${cfg.path} must set a send_email destination or FORM_TO`);
    for (const addr of all) {
      assert(allow.includes(addr), `${cfg.path} destination not in verified allowlist: ${addr}`);
      assert(addr !== 'bgillis99@gmail.com' && addr !== 'sales@norcalcarbmobile.com', `${cfg.path} has unverified destination: ${addr}`);
    }
    assert(formTo.length === 1 && formTo[0] === 'carb@norcalcarbmobile.com', `${cfg.path} FORM_TO must be carb@, got ${JSON.stringify(formTo)}`);
    if (fallback.length) {
      assert(fallback[0] === 'fsu9913@gmail.com', `${cfg.path} FORM_TO_FALLBACK must be fsu9913@gmail.com`);
    }
    if (bind.length) {
      assert(bind.includes('carb@norcalcarbmobile.com') && bind.includes('fsu9913@gmail.com'), `${cfg.path} send_email binding must allow carb@ and fsu9913`);
    }
  }
}

console.error = origError;

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
