const DEFAULT_TO = "bgillis99@gmail.com";
const DEFAULT_FROM = "MobileOVI Test <noreply@mobilleovitest.com>";

const HTML_ESC = { "<": "&lt;", ">": "&gt;", "&": "&amp;" };
function esc(s) {
  return String(s || "").replace(/[<>&]/g, (c) => HTML_ESC[c]);
}

function wantsJson(request) {
  return (request.headers.get("accept") || "").includes("application/json");
}

async function readBody(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return await request.json();
  const form = await request.formData();
  const obj = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === "string" ? v : "";
  return obj;
}

function respond(request, ok, message, status) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error: message }), {
      status: status || (ok ? 200 : 400),
      headers: { "content-type": "application/json" }
    });
  }
  const location = ok ? "/contact?sent=1" : "/contact?error=1";
  return new Response(null, { status: 303, headers: { Location: location } });
}

async function handleContact(request, env) {
  let data;
  try {
    data = await readBody(request);
  } catch {
    return respond(request, false, "Could not read your submission.", 400);
  }
  if (data.company) return respond(request, true);
  const name = (data.name || "").trim();
  const phone = (data.phone || "").trim();
  if (!name || !phone) return respond(request, false, "Please include your name and a phone number.", 422);
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return respond(request, false, "Form isn’t configured yet — please call us directly.", 503);
  const lead = {
    name,
    phone,
    email: (data.email || "").trim(),
    location: (data.location || "").trim(),
    service: (data.service || "").trim(),
    message: (data.message || "").trim()
  };
  const html = `
    <h2>New contact — mobilleovitest.com</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      <tr><td><strong>Name</strong></td><td>${esc(lead.name)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${esc(lead.phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${esc(lead.email)}</td></tr>
      <tr><td><strong>Location</strong></td><td>${esc(lead.location)}</td></tr>
      <tr><td><strong>Service</strong></td><td>${esc(lead.service)}</td></tr>
      <tr><td valign="top"><strong>Message</strong></td><td>${esc(lead.message).replace(/\n/g, "<br>")}</td></tr>
    </table>`;
  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [env.CONTACT_TO || DEFAULT_TO],
    subject: `New inquiry: ${lead.name}${lead.location ? " — " + lead.location : ""}`,
    html
  };
  const cleanEmail = lead.email.replace(/[\r\n]/g, "");
  if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) payload.reply_to = cleanEmail;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) return respond(request, false, "Couldn’t send — please try again or call us directly.", 502);
  } catch {
    return respond(request, false, "Network error — please try again.", 502);
  }
  return respond(request, true);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method === "POST") return handleContact(request, env);
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
    }
    return env.ASSETS.fetch(request);
  }
};
