/**
 * POST /api/contact — persist the lead, then email it.
 *
 * KV (env.LEADS) is optional: if the owner has not bound a namespace yet,
 * submissions still go out through env.EMAIL. If EMAIL.send throws but KV
 * stored the lead, we still return 200 so the customer is not told it failed.
 *
 * Binding: EMAIL (send_email) with allowed_destination_addresses = FORM_TO.
 * From: website@norcalcarbmobile.com (must be on the norcalcarbmobile.com zone).
 * To: bgillis99@gmail.com — must stay a VERIFIED Email Routing destination.
 */

export const FORM_TO = ['bgillis99@gmail.com'];
export const FORM_FROM = { email: 'website@norcalcarbmobile.com', name: 'NorCal CARB Mobile Website' };
export const CURRENT_TERMS_VERSION = '2026-07-22';
export const THANKS_MESSAGE = "Thanks — we'll call you shortly.";

const HTML_ESC = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };

function esc(s) {
  return String(s || '').replace(/[<>&]/g, (c) => HTML_ESC[c]);
}

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return await request.json();
  const form = await request.formData();
  const obj = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === 'string' ? v : '';
  return obj;
}

export function respond(request, ok, message, status) {
  if (wantsJson(request)) {
    const body = ok
      ? { ok: true, ...(message ? { message } : {}) }
      : { ok: false, error: message };
    return new Response(JSON.stringify(body), {
      status: status || (ok ? 200 : 400),
      headers: { 'content-type': 'application/json' },
    });
  }
  const location = ok ? '/contact?sent=1' : '/contact?error=1';
  return new Response(null, { status: 303, headers: { Location: location } });
}

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/.{1,76}/g, '$&\r\n');
}

/** Raw RFC 5322 message for the legacy EmailMessage API (one recipient). */
export function rawMime(message, to) {
  const boundary = 'ncm-' + crypto.randomUUID();
  const enc = (v) => '=?UTF-8?B?' + btoa(String.fromCharCode(...new TextEncoder().encode(v))) + '?=';
  const headers = [
    `From: ${enc(message.from.name)} <${message.from.email}>`,
    `To: <${to}>`,
    `Subject: ${enc(message.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@norcalcarbmobile.com>`,
    'MIME-Version: 1.0',
  ];
  if (message.replyTo) headers.push(`Reply-To: <${message.replyTo}>`);
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  return headers.join('\r\n') + '\r\n\r\n' +
    `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64utf8(message.text)}` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64utf8(message.html)}` +
    `--${boundary}--\r\n`;
}

/**
 * Send via the structured send() API. If this runtime only supports the legacy
 * EmailMessage form (no error code, e.g. a TypeError), fall back to raw MIME,
 * one message per verified recipient.
 */
export async function sendLead(env, message, EmailMessageCtor) {
  try {
    return await env.EMAIL.send(message);
  } catch (err) {
    if (err && err.code) throw err;
    if (typeof EmailMessageCtor !== 'function') throw err;
    for (const to of message.to) {
      await env.EMAIL.send(new EmailMessageCtor(message.from.email, to, rawMime(message, to)));
    }
  }
}

export async function persistLead(env, request, lead, fields) {
  if (!env.LEADS || typeof env.LEADS.put !== 'function') return false;
  const key = `${Date.now()}-${crypto.randomUUID()}`;
  const record = {
    ...lead,
    fields,
    ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '',
    userAgent: request.headers.get('user-agent') || '',
  };
  await env.LEADS.put(key, JSON.stringify(record));
  return true;
}

function buildMessage(lead) {
  const rows = [
    ['Name', lead.name],
    ['Company', lead.company],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['City / site', lead.city],
    ['Truck count', lead.trucks],
    ['Test type', lead.service],
    ['Preferred date', lead.preferredDate],
    ['Details', lead.message],
    ['Terms accepted', 'Yes — version ' + lead.termsVersion],
    ['Submitted', lead.submittedAt],
  ];
  const html = `
    <h2>New test request — norcalcarbmobile.com</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td valign="top"><strong>${k}</strong></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('\n      ')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#555">New lead from the website contact form. Call or text them to confirm schedule and payment.</p>`;
  const text = 'New test request — norcalcarbmobile.com\n\n' +
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    '\n\nNew lead from the website contact form. Call or text them to confirm schedule and payment.';

  const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');
  const message = {
    to: FORM_TO,
    from: FORM_FROM,
    subject: `New test request: ${oneLine(lead.name)}${lead.city ? ' — ' + oneLine(lead.city) : ''}`,
    html,
    text,
  };
  const cleanEmail = oneLine(lead.email);
  if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) message.replyTo = cleanEmail;
  return message;
}

export async function handleContact(request, env, EmailMessageCtor) {
  let data;
  try {
    data = await readBody(request);
  } catch {
    return respond(request, false, 'Please try again, or call us at (916) 890-4427.', 400);
  }

  // Honeypot — bots fill hidden "website"; humans never see it.
  // "company" is a real field now (fleet / business name).
  if (data.website) return respond(request, true, THANKS_MESSAGE);

  const name = String(data.name || '').trim().slice(0, 200);
  const phone = String(data.phone || '').trim().slice(0, 50);
  const email = String(data.email || '').trim().slice(0, 200);
  if (!name || (!phone && !email)) {
    return respond(request, false, 'Please include your name and a phone number or email.', 422);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(request, false, 'Please enter a valid email address.', 422);
  }

  const termsAccepted = String(data.terms_accepted || '').toLowerCase() === 'yes';
  if (!termsAccepted) {
    return respond(request, false, 'Please accept the Testing Terms & Customer Rights before sending your request.', 422);
  }

  const field = (k, max) => String(data[k] || '').trim().slice(0, max);
  const lead = {
    name,
    phone,
    email,
    company: field('company', 200),
    city: field('location', 200) || field('city', 200) || field('site_location', 200),
    trucks: field('trucks', 10),
    service: field('service', 100) || field('test_type', 100),
    preferredDate: field('preferred_date', 40) || field('date', 40),
    message: field('message', 5000),
    termsVersion: field('terms_version', 40) || CURRENT_TERMS_VERSION,
    submittedAt: new Date().toISOString(),
  };

  let stored = false;
  try {
    stored = await persistLead(env, request, lead, data);
  } catch (err) {
    console.error('contact persist failed', err && err.code, err && err.message);
  }

  const canEmail = env.EMAIL && typeof env.EMAIL.send === 'function';
  let emailed = false;
  if (canEmail) {
    try {
      await sendLead(env, buildMessage(lead), EmailMessageCtor);
      emailed = true;
    } catch (err) {
      console.error('contact send failed', err && err.code, err && err.message);
    }
  } else {
    console.error('contact send failed', undefined, 'EMAIL binding missing');
  }

  if (stored || emailed) {
    return respond(request, true, THANKS_MESSAGE);
  }
  if (!canEmail) {
    return respond(request, false, 'Please call us directly at (916) 890-4427 to book your test.', 503);
  }
  return respond(request, false, 'We couldn’t send that — please call (916) 890-4427.', 502);
}
