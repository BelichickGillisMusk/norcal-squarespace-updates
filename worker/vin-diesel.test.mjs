import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAdmin, handleChat, createMemoryChatDb, VIN_DIESEL_LOADER } from './vin-diesel.js';
import { VIN_DIESEL_SYSTEM_PROMPT } from './vin-diesel-prompt.js';

function sqliteDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('./d1/0001_chat_leads.sql', import.meta.url), 'utf8'));
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async run() {
              const info = db.prepare(sql).run(...params);
              return { success: true, meta: { last_row_id: Number(info.lastInsertRowid || 0) } };
            },
            async first() {
              return db.prepare(sql).get(...params) || null;
            },
            async all() {
              return { results: db.prepare(sql).all(...params) };
            },
          };
        },
      };
    },
    dump() {
      return db.prepare('SELECT * FROM chat_leads ORDER BY id DESC').all();
    },
  };
}

function postChat(body, headers = {}) {
  return new Request('https://norcalcarbmobile.com/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://norcalcarbmobile.com', ...headers },
    body: JSON.stringify(body),
  });
}

test('system prompt is the chat script and only the shop phone', () => {
  assert.match(VIN_DIESEL_SYSTEM_PROMPT, /Hey, I'm Vin Diesel with NorCal CARB Mobile/);
  assert.match(VIN_DIESEL_SYSTEM_PROMPT, /\(916\) 890-4427/);
  assert.doesNotMatch(VIN_DIESEL_SYSTEM_PROMPT, /209-818-1371|678-1090|628-999-3912|415-900-8563/);
  const widget = readFileSync(new URL('../site/assets/vin-diesel.js', import.meta.url), 'utf8');
  assert.match(widget, /\(916\) 890-4427/);
  assert.doesNotMatch(widget, /209-818-1371|678-1090|628-999-3912|415-900-8563|Bryan/);
  assert.match(widget, /box-sizing:border-box/);
  assert.match(VIN_DIESEL_LOADER, /vin-diesel\.js/);
  assert.match(VIN_DIESEL_LOADER, /onload/);
  assert.doesNotMatch(VIN_DIESEL_LOADER, /<script src=/);
});

test('schema sql loads and a lead can be stored', () => {
  const db = sqliteDb();
  assert.equal(db.dump().length, 0);
});

test('booking is requested, never confirmed, and a failed email still keeps the summary', async () => {
  const db = sqliteDb();
  const sent = [];
  const env = {
    XAI_API_KEY: 'test',
    CHAT_DB: db,
    ADMIN_TOKEN: 'desk-token',
    CHAT_RATE_LIMIT: 20,
    EMAIL: {
      async send(msg) {
        sent.push(msg);
        if (msg.subject.startsWith('URGENT')) throw new Error('smtp down');
      },
    },
  };
  let step = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    step += 1;
    if (step === 1) {
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: '',
            tool_calls: [
              {
                id: 'a',
                type: 'function',
                function: {
                  name: 'book_appointment',
                  arguments: JSON.stringify({
                    name: 'Mike Chen',
                    company: 'Chen Hauling',
                    phone: '916-555-0148',
                    vehicles: '1 2018 Freightliner',
                    location: 'West Sacramento 95691',
                    preferred_date: 'Tuesday',
                    preferred_time: '9am',
                  }),
                },
              },
              {
                id: 'b',
                type: 'function',
                function: {
                  name: 'send_call_summary',
                  arguments: JSON.stringify({
                    name: 'Mike Chen',
                    phone: '916-555-0148',
                    vehicles: '8 trucks',
                    summary: 'Fleet ask',
                    urgent: true,
                  }),
                },
              },
            ],
          },
        }],
      }));
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: "I've requested that slot for you. We'll confirm the time with you by call or text. Call Bryan at 209-818-1371. You are booked and confirmed." } }],
    }));
  };
  try {
    const res = await handleChat(postChat({
      conversation_id: '11111111-1111-4111-8111-111111111111',
      messages: [{ role: 'user', content: 'Tuesday at 9 works.' }],
    }), env);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.ok, true);
    assert.match(data.reply, /requested/i);
    assert.doesNotMatch(data.reply, /\bconfirmed\b|\bbooked\b|Bryan|209/);
    assert.match(data.reply, /\(916\) 890-4427/);
    const rows = db.dump();
    assert.equal(rows.length, 2);
    assert.equal(rows.some((row) => row.kind === 'appointment' && row.summary.includes('Not confirmed')), true);
    const summary = rows.find((row) => row.kind === 'summary');
    assert.equal(summary.urgent, 1);
    assert.equal(summary.email_status, 'failed');
    assert.match(summary.email_error, /smtp down/);
    assert.equal(sent.length, 1);
    assert.match(sent[0].subject, /^URGENT/);
    assert.equal(sent[0].to, 'carb@norcalcarbmobile.com');

    const denied = await handleAdmin(new Request('https://norcalcarbmobile.com/admin/leads', { method: 'GET' }), env);
    assert.match(await denied.text(), /Token/);
    const bad = await handleAdmin(new Request('https://norcalcarbmobile.com/admin/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'token=nope',
    }), env);
    assert.equal(bad.status, 401);
    const ok = await handleAdmin(new Request('https://norcalcarbmobile.com/admin/leads', {
      headers: { authorization: 'Bearer desk-token' },
    }), env);
    const html = await ok.text();
    assert.match(html, /Mike Chen/);
    assert.match(html, /URGENT/);
    assert.doesNotMatch(html, /desk-token/);
  } finally {
    globalThis.fetch = original;
  }
});

test('rate limit and message length', async () => {
  const env = {
    XAI_API_KEY: 'test',
    CHAT_DB: createMemoryChatDb(),
    CHAT_RATE_LIMIT: 2,
    EMAIL: { async send() {} },
  };
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ message: { content: 'What city is the truck in?' } }],
  }));
  try {
    const body = { messages: [{ role: 'user', content: 'Need a test.' }] };
    assert.equal((await handleChat(postChat(body), env)).status, 200);
    assert.equal((await handleChat(postChat(body), env)).status, 200);
    assert.equal((await handleChat(postChat(body), env)).status, 429);
    const huge = await handleChat(postChat({ messages: [{ role: 'user', content: 'x'.repeat(1201) }] }), env);
    assert.equal(huge.status, 400);
    const foreign = await handleChat(new Request('https://norcalcarbmobile.com/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify(body),
    }), env);
    assert.equal(foreign.status, 403);
  } finally {
    globalThis.fetch = original;
  }
});

test('worker inject stays locked and adds the deferred widget', () => {
  const worker = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  assert.match(worker, /telephone: '\+1-916-890-4427'/);
  assert.match(worker, /231f8b2f40e24c50b92870168dbb3f06/);
  assert.match(worker, /handleVinDiesel/);
  assert.match(worker, /VIN_DIESEL_LOADER/);
  assert.doesNotMatch(worker, /628-999-3912/);
});
