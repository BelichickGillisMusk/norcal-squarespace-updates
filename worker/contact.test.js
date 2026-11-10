/**
 * Contact form handler — persist before email, 200 if KV stored even when send fails.
 * Plain node, no test framework.
 *
 * Run: node worker/contact.test.js
 */

import { handleContact, persistLead, FORM_TO, FORM_FROM, THANKS_MESSAGE } from './contact.js';

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
  location: 'RV, Petaluma KOA',
  terms_accepted: 'yes',
  message: 'Need a test Friday',
  service: 'OVI',
  trucks: '2',
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
  assert(kv.size === 1, 'happy path still persists to KV');
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
  const res = await jsonRes(await handleContact(jsonRequest({ name: 'A', phone: '1' }), {
    EMAIL: emailOk(),
  }));
  assert(res.status === 422, `missing terms should 422, got ${res.status}`);
}

{
  const kv = new Map();
  let sent = false;
  const res = await jsonRes(await handleContact(jsonRequest({ ...valid, company: 'bot' }), {
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

console.error = origError;

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
