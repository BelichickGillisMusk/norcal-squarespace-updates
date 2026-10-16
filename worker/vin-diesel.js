// @ts-nocheck
/**
 * Vin Diesel website chat.
 * POST /api/chat  — xAI, tools, D1, then email.
 * GET/POST /admin/leads — ADMIN_TOKEN.
 * The key never leaves the Worker.
 */
import { VIN_DIESEL_SYSTEM_PROMPT } from './vin-diesel-prompt.js';

export const VIN_DIESEL_LOADER = `
<script>
(function(){
  if (document.querySelector('[data-vin-diesel-root]')) return;
  var st=document.createElement('style');
  st.textContent='.vin-diesel-launcher{position:fixed;z-index:2147483000;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-inline-size:calc(100% - 24px);min-block-size:48px;margin:0;padding:.7rem .95rem;border:0;border-radius:999px;background:#012241;color:#fff;box-shadow:0 8px 24px rgba(1,34,65,.28);font:600 .95rem/1.2 system-ui,sans-serif;cursor:pointer}.vin-diesel-launcher:focus-visible{outline:3px solid #4ab94e;outline-offset:2px}';
  document.head.appendChild(st);
  var root=document.createElement('div');
  root.setAttribute('data-vin-diesel-root','');
  var b=document.createElement('button');
  b.type='button';
  b.className='vin-diesel-launcher';
  b.id='vin-diesel-launcher';
  b.textContent='Chat with Vin Diesel';
  b.setAttribute('aria-label','Chat with Vin Diesel');
  b.setAttribute('aria-expanded','false');
  b.setAttribute('aria-controls','vin-diesel-panel');
  b.addEventListener('click', function(){
    if (window.__vinDieselToggle) { window.__vinDieselToggle(); return; }
    if (b.dataset.loading === '1') return;
    b.dataset.loading='1';
    var s=document.createElement('script');
    s.src='/assets/vin-diesel.js';
    s.onload=function(){ b.dataset.loading='0'; if (window.__vinDieselToggle) window.__vinDieselToggle(); };
    s.onerror=function(){ b.dataset.loading='0'; };
    document.body.appendChild(s);
  });
  root.appendChild(b);
  document.body.appendChild(root);
})();
</script>
`;

const SHOP_PHONE = '(916) 890-4427';
const SHOP_DIGITS = '9168904427';
const LEAD_EMAIL = 'carb@norcalcarbmobile.com';
const MAX_MESSAGE = 1200;
const MAX_MESSAGES = 16;
const MAX_BODY = 32000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RATE_LIMIT = 20;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Save a REQUESTED visit slot. This does not book or confirm. The team confirms later by call or text.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          company: { type: 'string' },
          phone: { type: 'string', description: 'Callback number' },
          vehicles: { type: 'string', description: 'Count, type, and year' },
          location: { type: 'string', description: 'City, yard, or ZIP' },
          preferred_date: { type: 'string' },
          preferred_time: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['name', 'phone', 'vehicles', 'location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_call_summary',
      description: 'File the full chat with the team. Call this when you have a callback number, a fleet, a person request, or the visitor is done. Saves first, then emails carb@. Never say the visit is confirmed.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          company: { type: 'string' },
          phone: { type: 'string' },
          vehicles: { type: 'string' },
          location: { type: 'string' },
          reason: { type: 'string' },
          preferred_when: { type: 'string' },
          summary: { type: 'string', description: 'Short plain-language summary for the team' },
          urgent: { type: 'boolean', description: 'True for deadline today/tomorrow, registration hold, failed test, 5+ vehicles, or a complaint' },
        },
        required: ['summary'],
      },
    },
  },
];

const LEAD_INSERT = `INSERT INTO chat_leads (
  created_at, kind, urgent, name, company, phone, vehicles, location, reason,
  preferred_when, summary, transcript, email_status, email_error, page_url, conversation_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export function createMemoryChatDb() {
  const leads = [];
  const rates = new Map();
  let seq = 0;
  const norm = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();
  return {
    prepare(sql) {
      const n = norm(sql);
      return {
        bind(...args) {
          return {
            async run() {
              if (n.startsWith('create table') || n.startsWith('create index')) return { success: true, meta: {} };
              if (n.startsWith('insert into chat_rate')) {
                const key = `${args[0]}:${args[1]}`;
                rates.set(key, (rates.get(key) || 0) + 1);
                return { success: true, meta: {} };
              }
              if (n.startsWith('delete from chat_rate')) {
                const cutoff = args[0];
                for (const key of [...rates.keys()]) {
                  if (Number(key.split(':').pop()) < cutoff) rates.delete(key);
                }
                return { success: true, meta: {} };
              }
              if (n.startsWith('insert into chat_leads')) {
                seq += 1;
                leads.push({
                  id: seq,
                  created_at: args[0],
                  kind: args[1],
                  urgent: args[2],
                  name: args[3],
                  company: args[4],
                  phone: args[5],
                  vehicles: args[6],
                  location: args[7],
                  reason: args[8],
                  preferred_when: args[9],
                  summary: args[10],
                  transcript: args[11],
                  email_status: args[12],
                  email_error: args[13],
                  page_url: args[14],
                  conversation_id: args[15],
                });
                return { success: true, meta: { last_row_id: seq } };
              }
              if (n.startsWith('update chat_leads set urgent')) {
                const row = leads.find((item) => item.id === args[11]);
                if (row) {
                  row.urgent = args[0];
                  row.name = args[1];
                  row.company = args[2];
                  row.phone = args[3];
                  row.vehicles = args[4];
                  row.location = args[5];
                  row.reason = args[6];
                  row.preferred_when = args[7];
                  row.summary = args[8];
                  row.transcript = args[9];
                  row.page_url = args[10];
                }
                return { success: true, meta: {} };
              }
              if (n.startsWith('update chat_leads')) {
                const row = leads.find((item) => item.id === args[2]);
                if (row) {
                  row.email_status = args[0];
                  row.email_error = args[1];
                }
                return { success: true, meta: {} };
              }
              throw new Error(`memory db run: ${n}`);
            },
            async first() {
              if (n.startsWith('select hits')) {
                return { hits: rates.get(`${args[0]}:${args[1]}`) || 0 };
              }
              if (n.includes('from chat_leads where kind')) {
                const row = [...leads].reverse().find((item) => item.kind === 'summary' && item.conversation_id === args[0]);
                return row || null;
              }
              throw new Error(`memory db first: ${n}`);
            },
            async all() {
              if (n.includes('from chat_leads')) {
                return { results: [...leads].sort((a, b) => b.id - a.id).slice(0, 100) };
              }
              throw new Error(`memory db all: ${n}`);
            },
          };
        },
      };
    },
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

function clip(value, max) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max) : text;
}

function digits(value) {
  return String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10})/, '');
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

async function sha256(value) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

function originAllowed(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function scrubAssistant(text, transcript) {
  const known = new Set();
  const blob = String(transcript || '');
  for (const match of blob.matchAll(/\+?\d[\d\s().-]{6,}\d/g)) {
    const d = digits(match[0]);
    if (d.length >= 7) known.add(d);
  }
  let out = String(text || '').replace(/\+?\d[\d\s().-]{6,}\d/g, (match) => {
    const d = digits(match);
    if (d.length < 10) return match;
    if (d === SHOP_DIGITS || known.has(d)) return d === SHOP_DIGITS ? SHOP_PHONE : match;
    return SHOP_PHONE;
  });
  out = out.replace(/\bBryan\b/g, 'the team').replace(/\bMichael\b/g, 'the team');
  out = out.replace(/\bbooked\b/gi, 'requested').replace(/\bconfirmed\b/gi, 'requested');
  out = out.replace(/\bconfirmad[oa]s?\b/gi, 'solicitado').replace(/\breservad[oa]s?\b/gi, 'solicitado');
  return out.trim();
}

function urgentFromText(text) {
  return /\b(today|tomorrow|registration hold|failed test|complaint|asap|hoy|mañana|urgente)\b/i.test(text)
    || /\b([5-9]|[1-9]\d+)\s*(trucks|vehicles|camiones|unidades)\b/i.test(text);
}

async function ensureSchema(env) {
  if (!env.CHAT_DB) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS chat_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      kind TEXT NOT NULL,
      urgent INTEGER NOT NULL DEFAULT 0,
      name TEXT,
      company TEXT,
      phone TEXT,
      vehicles TEXT,
      location TEXT,
      reason TEXT,
      preferred_when TEXT,
      summary TEXT,
      transcript TEXT,
      email_status TEXT,
      email_error TEXT,
      page_url TEXT,
      conversation_id TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS chat_rate (
      ip_hash TEXT NOT NULL,
      bucket INTEGER NOT NULL,
      hits INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (ip_hash, bucket)
    )`,
  ];
  for (const sql of statements) {
    await env.CHAT_DB.prepare(sql).bind().run();
  }
}

async function allowRequest(env, request) {
  const limit = Number(env.CHAT_RATE_LIMIT || DEFAULT_RATE_LIMIT);
  const bucket = Math.floor(Date.now() / RATE_WINDOW_MS);
  const ipHash = (await sha256(`vd-rate:${clientIp(request)}`)).slice(0, 32);
  if (!env.CHAT_DB) {
    const mem = (allowRequest.mem ||= new Map());
    const key = `${ipHash}:${bucket}`;
    const hits = (mem.get(key) || 0) + 1;
    mem.set(key, hits);
    return hits <= limit;
  }
  await env.CHAT_DB.prepare(
    `INSERT INTO chat_rate (ip_hash, bucket, hits) VALUES (?, ?, 1)
     ON CONFLICT(ip_hash, bucket) DO UPDATE SET hits = hits + 1`,
  ).bind(ipHash, bucket).run();
  const row = await env.CHAT_DB.prepare(
    `SELECT hits FROM chat_rate WHERE ip_hash = ? AND bucket = ?`,
  ).bind(ipHash, bucket).first();
  await env.CHAT_DB.prepare(`DELETE FROM chat_rate WHERE bucket < ?`).bind(bucket - 6).run();
  return Number(row?.hits || 1) <= limit;
}

function leadId(result) {
  return result?.meta?.last_row_id ?? result?.meta?.last_rowid ?? null;
}

async function insertLead(env, row) {
  if (!env.CHAT_DB) return { ok: false, error: 'Lead store is not configured.' };
  const result = await env.CHAT_DB.prepare(LEAD_INSERT).bind(
    row.created_at,
    row.kind,
    row.urgent ? 1 : 0,
    row.name || '',
    row.company || '',
    row.phone || '',
    row.vehicles || '',
    row.location || '',
    row.reason || '',
    row.preferred_when || '',
    row.summary || '',
    row.transcript || '',
    row.email_status || '',
    row.email_error || '',
    row.page_url || '',
    row.conversation_id || '',
  ).run();
  return { ok: true, id: leadId(result) };
}

async function markEmail(env, id, status, error) {
  if (!env.CHAT_DB || !id) return;
  await env.CHAT_DB.prepare(
    `UPDATE chat_leads SET email_status = ?, email_error = ? WHERE id = ?`,
  ).bind(status, clip(error, 300), id).run();
}

function emailBody(row) {
  const lines = [
    row.urgent ? 'URGENT website chat' : 'Website chat',
    `When: ${row.created_at}`,
    `Name: ${row.name || '-'}`,
    `Company: ${row.company || '-'}`,
    `Phone: ${row.phone || '-'}`,
    `Vehicles: ${row.vehicles || '-'}`,
    `Location: ${row.location || '-'}`,
    `Reason: ${row.reason || '-'}`,
    `Preferred: ${row.preferred_when || '-'}`,
    `Page: ${row.page_url || '-'}`,
    '',
    'Summary:',
    row.summary || '-',
    '',
    'Transcript:',
    row.transcript || '-',
    '',
    'Slot status: REQUESTED. Not confirmed.',
  ];
  return lines.join('\n');
}

async function sendLeadEmail(env, row) {
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
    return { status: 'failed', error: 'EMAIL binding is not configured.' };
  }
  const from = env.CHAT_FROM || 'NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>';
  const subject = `${row.urgent ? 'URGENT — ' : ''}Website chat — ${row.name || row.phone || 'visitor'}`.replace(/[\r\n]/g, ' ');
  try {
    await env.EMAIL.send({
      to: LEAD_EMAIL,
      from,
      subject,
      text: emailBody(row),
    });
    return { status: 'sent', error: '' };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : 'email send failed' };
  }
}

async function saveSummary(env, fields, transcript, pageUrl, conversationId) {
  const row = {
    created_at: new Date().toISOString(),
    kind: 'summary',
    urgent: fields.urgent ? 1 : 0,
    name: clip(fields.name, 80),
    company: clip(fields.company, 80),
    phone: clip(fields.phone, 40),
    vehicles: clip(fields.vehicles, 300),
    location: clip(fields.location, 160),
    reason: clip(fields.reason, 300),
    preferred_when: clip(fields.preferred_when, 80),
    summary: clip(fields.summary, 2000),
    transcript: clip(transcript, 12000),
    email_status: 'pending',
    email_error: '',
    page_url: clip(pageUrl, 200),
    conversation_id: clip(conversationId, 80),
  };
  if (conversationId && env.CHAT_DB) {
    const existing = await env.CHAT_DB.prepare(
      `SELECT id, urgent, name, company, phone, vehicles, location, reason, preferred_when, summary, transcript, page_url
       FROM chat_leads WHERE kind = 'summary' AND conversation_id = ? LIMIT 1`,
    ).bind(conversationId).first();
    if (existing?.id) {
      const longer = String(row.transcript || '').length >= String(existing.transcript || '').length;
      await env.CHAT_DB.prepare(
        `UPDATE chat_leads SET urgent = ?, name = ?, company = ?, phone = ?, vehicles = ?, location = ?, reason = ?, preferred_when = ?, summary = ?, transcript = ?, page_url = ? WHERE id = ?`,
      ).bind(
        existing.urgent || row.urgent ? 1 : 0,
        row.name || existing.name || '',
        row.company || existing.company || '',
        row.phone || existing.phone || '',
        row.vehicles || existing.vehicles || '',
        row.location || existing.location || '',
        row.reason || existing.reason || '',
        row.preferred_when || existing.preferred_when || '',
        row.summary || existing.summary || '',
        longer ? row.transcript : existing.transcript,
        row.page_url || existing.page_url || '',
        existing.id,
      ).run();
      return { ok: true, id: existing.id, email_status: 'already_saved', saved: true };
    }
  }
  const saved = await insertLead(env, row);
  if (!saved.ok) return saved;
  const mailed = await sendLeadEmail(env, row);
  await markEmail(env, saved.id, mailed.status, mailed.error);
  return { ok: true, id: saved.id, email_status: mailed.status, saved: true };
}

function transcriptOf(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'Visitor' : 'Vin'}: ${m.content}`)
    .join('\n');
}

function readArgs(call) {
  try {
    const raw = call?.function?.arguments;
    const parsed = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return null;
  }
}

async function runTool(env, name, args, ctx) {
  if (name === 'book_appointment') {
    const nameVal = clip(args.name, 80);
    const phone = clip(args.phone, 40);
    if (!nameVal || digits(phone).length < 7) {
      return { ok: false, error: 'Need a name and a callback number before requesting a slot.' };
    }
    const preferred = [args.preferred_date, args.preferred_time].filter(Boolean).join(' ');
    const saved = await insertLead(env, {
      created_at: new Date().toISOString(),
      kind: 'appointment',
      urgent: urgentFromText(`${args.vehicles || ''} ${args.reason || ''} ${preferred}`) ? 1 : 0,
      name: nameVal,
      company: clip(args.company, 80),
      phone,
      vehicles: clip(args.vehicles, 300),
      location: clip(args.location, 160),
      reason: clip(args.reason, 300),
      preferred_when: clip(preferred, 80),
      summary: 'Requested slot. Not confirmed.',
      transcript: clip(ctx.transcript, 12000),
      email_status: 'not_requested',
      email_error: '',
      page_url: clip(ctx.pageUrl, 200),
      conversation_id: clip(ctx.conversationId, 80),
    });
    if (!saved.ok) return saved;
    return {
      ok: true,
      status: 'requested',
      confirmed: false,
      id: saved.id,
      tell_visitor: "I've requested that slot for you. We'll confirm the time with you by call or text.",
    };
  }
  if (name === 'send_call_summary') {
    const urgent = Boolean(args.urgent) || urgentFromText(`${args.summary || ''} ${args.vehicles || ''} ${args.reason || ''} ${ctx.transcript}`);
    return saveSummary(env, { ...args, urgent }, ctx.transcript, ctx.pageUrl, ctx.conversationId);
  }
  return { ok: false, error: 'Unknown tool.' };
}

async function callModel(env, messages) {
  const model = env.XAI_MODEL || 'grok-4.3';
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.XAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 400,
      messages,
      tools: TOOLS,
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const err = new Error(`xAI ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data?.choices?.[0]?.message || null;
}

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return { error: 'Send a messages list.' };
  const out = [];
  for (const item of input.slice(-MAX_MESSAGES)) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant')) continue;
    const raw = String(item.content ?? '').trim();
    if (raw.length > MAX_MESSAGE) return { error: `Keep it under ${MAX_MESSAGE} characters.` };
    const content = clip(item.content, MAX_MESSAGE);
    if (!content) continue;
    out.push({ role: item.role, content });
  }
  if (!out.length || out[out.length - 1].role !== 'user') return { error: 'Type a message first.' };
  if (out[out.length - 1].content.length > MAX_MESSAGE) return { error: `Keep it under ${MAX_MESSAGE} characters.` };
  return { messages: out };
}

export async function handleChat(request, env) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405, { Allow: 'POST' });
  }
  if (!originAllowed(request)) return json({ ok: false, error: 'Blocked.' }, 403);
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BODY) return json({ ok: false, error: 'That message is too long.' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Send JSON.' }, 400);
  }
  const parsed = sanitizeMessages(body?.messages);
  if (parsed.error) return json({ ok: false, error: parsed.error }, 400);
  if (!env.XAI_API_KEY) {
    return json({ ok: false, error: `Chat is offline. Text us at ${SHOP_PHONE}.` }, 503);
  }

  try {
    await ensureSchema(env);
    if (!(await allowRequest(env, request))) {
      return json({ ok: false, error: `Too many messages. Text us at ${SHOP_PHONE}.` }, 429);
    }
  } catch {
    return json({ ok: false, error: `Chat is busy. Text us at ${SHOP_PHONE}.` }, 503);
  }

  const conversationId = clip(body.conversation_id, 80);
  const pageUrl = clip(body.page, 200);
  const thread = [
    { role: 'system', content: VIN_DIESEL_SYSTEM_PROMPT },
    ...parsed.messages,
  ];
  const toolsUsed = [];

  try {
    for (let round = 0; round < 4; round += 1) {
      const message = await callModel(env, thread);
      if (!message) break;
      const calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
      if (!calls.length) {
        const userBlob = parsed.messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n');
        const reply = scrubAssistant(message.content, userBlob) || `Text us at ${SHOP_PHONE} and the team will help.`;
        await maybeAutosave(env, parsed.messages, reply, pageUrl, conversationId);
        return json({ ok: true, reply, tools: toolsUsed });
      }
      thread.push({
        role: 'assistant',
        content: message.content || '',
        tool_calls: calls,
      });
      for (const call of calls) {
        const name = call?.function?.name;
        const args = readArgs(call);
        const ctx = {
          transcript: transcriptOf(parsed.messages),
          pageUrl,
          conversationId,
        };
        const result = args
          ? await runTool(env, name, args, ctx)
          : { ok: false, error: 'Bad tool arguments.' };
        toolsUsed.push(name);
        thread.push({
          role: 'tool',
          tool_call_id: call.id || `call_${round}`,
          content: JSON.stringify(result),
        });
      }
    }
  } catch {
    return json({ ok: false, error: `Chat is busy right now. Text us at ${SHOP_PHONE}.` }, 502);
  }
  return json({ ok: false, error: `Text us at ${SHOP_PHONE} and the team will call you back.` }, 502);
}

async function maybeAutosave(env, messages, reply, pageUrl, conversationId) {
  const transcript = transcriptOf([...messages, { role: 'assistant', content: reply }]);
  const hasPhone = [...transcript.matchAll(/\+?\d[\d\s().-]{6,}\d/g)].some((m) => digits(m[0]).length >= 10 && digits(m[0]) !== SHOP_DIGITS);
  if (!hasPhone || !conversationId || !env.CHAT_DB) return;
  await saveSummary(env, {
    summary: clip(reply, 500) || 'Auto-saved transcript.',
    urgent: urgentFromText(transcript),
  }, transcript, pageUrl, conversationId);
}

function cookieToken(request) {
  const raw = request.headers.get('cookie') || '';
  const hit = raw.split(';').map((p) => p.trim()).find((p) => p.startsWith('vd_admin='));
  return hit ? decodeURIComponent(hit.slice('vd_admin='.length)) : '';
}

async function adminAuthed(request, env, posted) {
  const secret = env.ADMIN_TOKEN;
  if (!secret) return false;
  const expected = await sha256(secret);
  const header = request.headers.get('authorization') || '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (posted && safeEqual(await sha256(posted), expected)) return true;
  if (bearer && safeEqual(await sha256(bearer), expected)) return true;
  const cookie = cookieToken(request);
  return Boolean(cookie) && safeEqual(cookie, expected);
}

function adminShell(inner) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Chat leads</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.45 system-ui, sans-serif; color: #012241; background: #f4f7f5; }
  main { margin-inline: auto; max-inline-size: 72rem; padding: 1.25rem; }
  h1 { font-size: 1.4rem; margin: 0 0 0.75rem; }
  form { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  input { min-block-size: 44px; flex: 1 1 12rem; padding: 0.5rem 0.7rem; border: 1px solid #c5d0dc; border-radius: 8px; }
  button { min-block-size: 44px; border: 0; border-radius: 8px; background: #012241; color: #fff; padding: 0.5rem 0.9rem; cursor: pointer; }
  .urgent { color: #8a1f1f; font-weight: 700; }
  .ok { color: #146c2e; }
  .bad { color: #8a1f1f; }
  table { width: 100%; border-collapse: collapse; background: #fff; }
  th, td { text-align: start; vertical-align: top; padding: 0.55rem; border-bottom: 1px solid #e1e7ee; }
  .wrap { overflow-x: auto; }
  pre { white-space: pre-wrap; margin: 0; font: inherit; }
</style>
</head>
<body><main>${inner}</main></body></html>`;
}

export async function handleAdmin(request, env) {
  if (!env.ADMIN_TOKEN) {
    return new Response(adminShell('<h1>Chat leads</h1><p>Leads desk is not configured.</p>'), {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  }
  let posted = '';
  if (request.method === 'POST') {
    const type = request.headers.get('content-type') || '';
    if (type.includes('application/json')) {
      const data = await request.json().catch(() => ({}));
      posted = String(data.token || '');
    } else {
      const form = await request.formData();
      posted = String(form.get('token') || '');
    }
  } else if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const ok = await adminAuthed(request, env, posted);
  if (!ok) {
    const status = request.method === 'POST' ? 401 : 200;
    return new Response(adminShell(`<h1>Chat leads</h1>
      <form method="post" action="/admin/leads">
        <label for="token">Token</label>
        <input id="token" name="token" type="password" autocomplete="current-password" required>
        <button type="submit">Open leads</button>
      </form>
      ${request.method === 'POST' ? '<p class="bad">Wrong token.</p>' : ''}`), {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  }

  await ensureSchema(env);
  const listed = env.CHAT_DB
    ? await env.CHAT_DB.prepare(`SELECT id, created_at, kind, urgent, name, company, phone, vehicles, location, reason,
        preferred_when, summary, transcript, email_status, email_error, page_url, conversation_id
        FROM chat_leads ORDER BY id DESC LIMIT 100`).bind().all()
    : { results: [] };
  const rows = listed?.results || [];
  const body = rows.map((row) => `<tr>
    <td>${esc(row.id)}<br>${row.urgent ? '<span class="urgent">URGENT</span>' : ''}</td>
    <td>${esc(row.created_at)}<br>${esc(row.kind)}</td>
    <td>${esc(row.name)}<br>${esc(row.company)}<br>${esc(row.phone)}</td>
    <td>${esc(row.vehicles)}<br>${esc(row.location)}<br>${esc(row.preferred_when)}</td>
    <td><pre>${esc(row.summary)}</pre><br><span class="${row.email_status === 'sent' ? 'ok' : 'bad'}">${esc(row.email_status)}</span> ${esc(row.email_error)}</td>
  </tr>`).join('');
  const cookie = `vd_admin=${encodeURIComponent(await sha256(env.ADMIN_TOKEN))}; HttpOnly; Secure; SameSite=Lax; Path=/admin; Max-Age=43200`;
  return new Response(adminShell(`<h1>Chat leads</h1><p>${rows.length} newest.</p>
    <div class="wrap"><table>
      <thead><tr><th>Id</th><th>When</th><th>Who</th><th>Job</th><th>Summary</th></tr></thead>
      <tbody>${body || '<tr><td colspan="5">No leads yet.</td></tr>'}</tbody>
    </table></div>`), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
      ...(posted ? { 'set-cookie': cookie } : {}),
    },
  });
}

export async function handleVinDiesel(request, env) {
  const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  if (path === '/api/chat') return handleChat(request, env);
  if (path === '/admin/leads') return handleAdmin(request, env);
  return null;
}
