import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

export function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

export function loadTemplate(name) {
  return fs.readFileSync(path.join(ROOT, 'email/templates', name), 'utf8');
}

export function loadToolsManifest() {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, 'config/tools-manifest.json'), 'utf8')
  );
}

export function render(html, vars) {
  return Object.entries(vars).reduce(
    (out, [key, val]) => out.replaceAll(`{{${key}}}`, String(val ?? '')),
    html
  );
}

export function firstNameGreeting(firstName) {
  return firstName ? ` ${firstName}` : '';
}

export function toolsListHtml(manifest, baseUrl) {
  const hub = baseUrl.replace(/\/$/, '') + manifest.tools_hub_url;
  return manifest.tools
    .map(
      (t) => `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <a href="${baseUrl.replace(/\/$/, '')}${t.url}" style="color: #1a5f2a; font-weight: bold;">${t.name}</a><br>
        <span style="color: #555; font-size: 13px;">${t.description}</span>
      </td>
    </tr>`
    )
    .join('\n');
}

export function baseEmailVars(row) {
  const base = requireEnv('SITE_BASE_URL').replace(/\/$/, '');
  const webapp = requireEnv('APPS_SCRIPT_WEBAPP_URL');
  return {
    first_name_greeting: firstNameGreeting(row.first_name),
    site_base_url: base,
    booking_url: requireEnv('BOOKING_URL'),
    switch_url: requireEnv('SWITCH_URL'),
    managed_care_url: requireEnv('MANAGED_CARE_URL') || `${base}/managed-care`,
    tools_hub_url: `${base}${loadToolsManifest().tools_hub_url}`,
    unsubscribe_url: `${webapp}?action=unsubscribe&token=${encodeURIComponent(row.cancel_token || '')}`,
    tools_list_html: toolsListHtml(loadToolsManifest(), base)
  };
}

export async function sendEmail({ to, subject, html }) {
  const apiKey = requireEnv('RESEND_API_KEY');
  const fromEmail = requireEnv('REMINDER_FROM_EMAIL');
  const fromName = process.env.REMINDER_FROM_NAME || 'NorCal CARB Mobile';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
