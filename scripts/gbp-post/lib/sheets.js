import { google } from 'googleapis';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  const creds = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
}

function rowObjects(headers, values) {
  return values.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? '';
    });
    return obj;
  });
}

export async function readGbpPostsTab() {
  const spreadsheetId = process.env.GBP_POST_SPREADSHEET_ID;
  const tab = process.env.GBP_POST_TAB || 'GBP Posts';
  if (!spreadsheetId) {
    return { posts: [], degraded: true, detail: 'GBP_POST_SPREADSHEET_ID not set' };
  }

  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab}'!A:Z`
  });

  const rows = res.data.values || [];
  if (rows.length < 2) {
    return { posts: [], degraded: false, detail: 'empty sheet' };
  }

  const headers = rows[0].map((h) =>
    String(h)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
  );
  const posts = rowObjects(headers, rows.slice(1));
  return { posts, degraded: false, detail: `${posts.length} rows` };
}
