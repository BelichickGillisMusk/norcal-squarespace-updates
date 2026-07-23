/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Receives the contact/booking form and emails the lead to the shop through Resend.
 * Form notifications route to bgillis99@gmail.com by default.
 *
 * Required Pages env var:
 *   RESEND_API_KEY
 * Optional:
 *   CONTACT_TO
 *   CONTACT_FROM
 */

const DEFAULT_TO = 'bgillis99@gmail.com';
const DEFAULT_FROM = 'NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>';
const CURRENT_TERMS_VERSION = '2026-07-22';

function esc(s) {
  return String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return await request.json();
  const form = await request.formData();
  const obj = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === 'string' ? v : '';
  return obj;
}

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}

function respond(request, ok, message, status) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error: message }), {
      status: status || (ok ? 200 : 400),
      headers: { 'content-type': 'application/json' },
    });
  }
  const to = ok ? '/contact?sent=1' : '/contact?error=1';
  return new Response(null, { status: 303, headers: { Location: to } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let data;
  try {
    data = await readBody(request);
  } catch {
    return respond(request, false, 'Could not read your submission.', 400);
  }

  // Honeypot — bots fill "company"; humans never see it. Pretend success, drop it.
  if (data.company) return respond(request, true);

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  if (!name || !phone) {
    return respond(request, false, 'Please include your name and a phone number.', 422);
  }

  const termsAccepted = String(data.terms_accepted || '').toLowerCase() === 'yes';
  if (!termsAccepted) {
    return respond(request, false, 'Please accept the Testing Terms & Customer Rights before sending your request.', 422);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return respond(request, false, 'Form email isn’t configured yet — please call (916) 890-4427.', 503);
  }

  const lead = {
    name,
    phone,
    email: (data.email || '').trim(),
    location: (data.location || '').trim(),
    service: (data.service || '').trim(),
    message: (data.message || '').trim(),
    termsAccepted: true,
    termsVersion: (data.terms_version || CURRENT_TERMS_VERSION).trim(),
    submittedAt: new Date().toISOString(),
  };

  const html = `
    <h2>New test request — norcalcarbmobile.com</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      <tr><td><strong>Name</strong></td><td>${esc(lead.name)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${esc(lead.phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${esc(lead.email)}</td></tr>
      <tr><td><strong>Location</strong></td><td>${esc(lead.location)}</td></tr>
      <tr><td><strong>Service</strong></td><td>${esc(lead.service)}</td></tr>
      <tr><td valign="top"><strong>Details</strong></td><td>${esc(lead.message).replace(/\n/g, '<br>')}</td></tr>
      <tr><td><strong>Terms accepted</strong></td><td>Yes — version ${esc(lead.termsVersion)}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${esc(lead.submittedAt)}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#555">Policy: OVI/smoke tests, motorhome OVI tests, and appointments totaling more than $150 require payment in full before confirmation.</p>`;

  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [env.CONTACT_TO || DEFAULT_TO],
    subject: `New test request: ${lead.name}${lead.location ? ' — ' + lead.location : ''}`,
    html,
  };
  if (lead.email) payload.reply_to = lead.email;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      return respond(request, false, 'We couldn’t send that — please call (916) 890-4427.', 502);
    }
  } catch {
    return respond(request, false, 'Network error — please call (916) 890-4427.', 502);
  }

  return respond(request, true);
}
