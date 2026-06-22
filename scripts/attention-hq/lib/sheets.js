import { google } from 'googleapis';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function getAuth() {
  const creds = JSON.parse(requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
}

function rowsToObjects(headers, dataRows) {
  return dataRows.map((row, idx) => {
    const obj = { _rowIndex: idx + 2 };
    headers.forEach((h, i) => {
      obj[h] = (row[i] ?? '').toString().trim();
    });
    return obj;
  });
}

export async function getTabRows(tabName) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = requireEnv('GOOGLE_OPS_SPREADSHEET_ID');
  const range = `'${tabName}'!A:Z`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toString().trim().toLowerCase());
  return rowsToObjects(headers, rows.slice(1));
}

export function fixtureData(runDate) {
  return {
    fieldJobs: [
      {
        job_id: 'TU1UWTES-0005',
        job_date: runDate,
        status: 'completed',
        customer: 'Acme Fleet',
        invoice_id: '',
        invoiced: 'NO'
      },
      {
        job_id: 'JOB-2026-0620-02',
        job_date: runDate,
        status: 'completed',
        customer: 'Valley Hauling',
        invoice_id: 'INV3032',
        invoiced: 'YES'
      }
    ],
    invoices: [
      {
        invoice_id: 'INV3032',
        job_id: 'JOB-2026-0620-02',
        sent_date: runDate,
        status: 'sent',
        amount: '75'
      },
      {
        invoice_id: 'INV3030',
        job_id: 'JOB-2026-0618-01',
        sent_date: '',
        status: 'draft',
        amount: '199'
      },
      {
        invoice_id: 'INV3031',
        job_id: 'JOB-2026-0619-03',
        sent_date: '',
        status: 'draft',
        amount: '75'
      }
    ]
  };
}
