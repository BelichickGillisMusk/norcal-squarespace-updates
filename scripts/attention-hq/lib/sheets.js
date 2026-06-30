/**
 * Google Sheets reader for attention-hq.
 *
 * Reads two tabs from the ops spreadsheet:
 *   - Jobs       (job_id, customer, scheduled_for, status, test_type, invoice_number)
 *   - Invoices   (invoice_number, customer, issued_at, amount, source)
 *
 * Tab names are configurable via env. Missing tabs return an empty array
 * and a `degraded: true` flag so the caller can mark the step PARTIAL
 * instead of crashing the whole run.
 */

import { google } from 'googleapis';

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getClient() {
  const creds = JSON.parse(requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  return google.sheets({ version: 'v4', auth });
}

function tabToObjects(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0].map((h) => String(h).trim());
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
}

async function readTab(sheets, spreadsheetId, tabName) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A:Z`
    });
    return { rows: tabToObjects(res.data.values), degraded: false };
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('Unable to parse range') || msg.includes('not found')) {
      return { rows: [], degraded: true, reason: `Tab "${tabName}" not found in spreadsheet` };
    }
    throw err;
  }
}

export async function readOpsSheets() {
  const sheets = await getClient();
  const spreadsheetId = requireEnv('ATTENTION_HQ_SPREADSHEET_ID');
  const jobsTab = process.env.ATTENTION_HQ_JOBS_TAB || 'Jobs';
  const invoicesTab = process.env.ATTENTION_HQ_INVOICES_TAB || 'Invoices';

  const [jobs, invoices] = await Promise.all([
    readTab(sheets, spreadsheetId, jobsTab),
    readTab(sheets, spreadsheetId, invoicesTab)
  ]);

  return { jobs, invoices };
}
