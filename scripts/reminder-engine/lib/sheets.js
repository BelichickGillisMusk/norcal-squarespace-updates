import { google } from 'googleapis';
import { requireEnv } from './email.js';

const HEADERS = [
  'id', 'email', 'first_name', 'audience_type', 'source', 'vehicle_label',
  'registration_type', 'next_deadline', 'test_type', 'subscribed_at',
  'reminders_enabled', 'marketing_opt_in', 'welcome_sent', 'cancel_token',
  'sent_90', 'sent_60', 'sent_30', 'last_blast_campaign'
];

export { HEADERS };

async function getAuth() {
  const creds = JSON.parse(requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

function sheetName() {
  return process.env.GOOGLE_SHEET_NAME || 'Subscribers';
}

export async function getRows() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
  const range = `${sheetName()}!A:R`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (rows.length < 2) return { headers: HEADERS, rows: [] };

  const headers = rows[0];
  const mapped = rows.slice(1).map((row, idx) => {
    const obj = { _rowIndex: idx + 2 };
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
  return { headers, rows: mapped };
}

export async function updateCell(rowIndex, columnName, value) {
  const colIndex = HEADERS.indexOf(columnName);
  if (colIndex < 0) throw new Error(`Unknown column: ${columnName}`);

  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
  const colLetter = String.fromCharCode(65 + colIndex);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName()}!${colLetter}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] }
  });
}
