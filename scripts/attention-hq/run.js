#!/usr/bin/env node
/**
 * attention-hq — daily ops scorecard for Samantha
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 *
 * Emits a JSON document to stdout matching the published spec:
 *
 *   {
 *     "cron":         "attention-hq",
 *     "date":         "YYYY-MM-DD",
 *     "status":       "PASS|PARTIAL|FAIL",
 *     "rating":       "A+|A|B|C",
 *     "found":        { field_jobs, invoices_sent_today, invoice_gaps[] },
 *     "actions_needed": [ ... ],
 *     "generated_at": "ISO-timestamp"
 *   }
 *
 * Flags:
 *   --fixtures <path>   read jobs+invoices from a local JSON fixture
 *                        instead of Google Sheets (no GCP secrets needed)
 *   --date YYYY-MM-DD   override "today" for testing
 *   --pretty            pretty-print JSON output
 *   --out <path>        also write the JSON document to this path
 */

import fs from 'fs';
import path from 'path';
import { findInvoiceGaps, countInvoicesSentToday } from './lib/invoices.js';
import { countFieldJobsToday, completedJobsWithoutInvoice } from './lib/jobs.js';
import { computeStatus, computeRating, buildActions } from './lib/rating.js';

const CRON_NAME = 'attention-hq';

function parseArgs(argv) {
  const args = { fixtures: null, date: null, pretty: false, out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixtures') args.fixtures = argv[++i];
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--pretty') args.pretty = true;
    else if (a === '--out') args.out = argv[++i];
  }
  return args;
}

function todayPacific() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return fmt.format(new Date());
}

async function loadData({ fixtures }) {
  const steps = [];

  if (fixtures) {
    const raw = fs.readFileSync(path.resolve(fixtures), 'utf8');
    const fx = JSON.parse(raw);
    steps.push({ name: 'load_fixtures', result: 'ok', detail: fixtures });
    return {
      jobs: fx.jobs || [],
      invoices: fx.invoices || [],
      steps
    };
  }

  let sheetsMod;
  try {
    sheetsMod = await import('./lib/sheets.js');
  } catch (err) {
    steps.push({ name: 'import_sheets_lib', result: 'error', detail: String(err.message || err) });
    return { jobs: [], invoices: [], steps };
  }

  try {
    const { jobs, invoices } = await sheetsMod.readOpsSheets();
    if (jobs.degraded) {
      steps.push({ name: 'read_jobs_tab', result: 'degraded', detail: jobs.reason });
    } else {
      steps.push({ name: 'read_jobs_tab', result: 'ok', detail: `${jobs.rows.length} rows` });
    }
    if (invoices.degraded) {
      steps.push({ name: 'read_invoices_tab', result: 'degraded', detail: invoices.reason });
    } else {
      steps.push({ name: 'read_invoices_tab', result: 'ok', detail: `${invoices.rows.length} rows` });
    }
    return { jobs: jobs.rows, invoices: invoices.rows, steps };
  } catch (err) {
    steps.push({ name: 'read_sheets', result: 'error', detail: String(err.message || err) });
    return { jobs: [], invoices: [], steps };
  }
}

export async function runAttentionHq({ fixtures = null, date = null } = {}) {
  const today = date || todayPacific();
  const { jobs, invoices, steps } = await loadData({ fixtures });

  const fieldJobsToday = countFieldJobsToday(jobs, today);
  const invoicesSentToday = countInvoicesSentToday(invoices, today);
  const invoiceGaps = findInvoiceGaps(
    invoices.map((r) => r.invoice_number).filter(Boolean)
  );
  const unbilledJobs = completedJobsWithoutInvoice(jobs, today);

  const status = computeStatus(steps);
  const rating = computeRating({ status, invoiceGaps, unbilledJobs });
  const actions = buildActions({
    invoiceGaps,
    unbilledJobs,
    fieldJobsToday,
    invoicesSentToday
  });

  return {
    cron: CRON_NAME,
    date: today,
    status,
    rating,
    found: {
      field_jobs: fieldJobsToday,
      invoices_sent_today: invoicesSentToday,
      invoice_gaps: invoiceGaps
    },
    actions_needed: actions,
    generated_at: new Date().toISOString(),
    _steps: steps
  };
}

async function main() {
  const args = parseArgs(process.argv);

  let report;
  try {
    report = await runAttentionHq({ fixtures: args.fixtures, date: args.date });
  } catch (err) {
    report = {
      cron: CRON_NAME,
      date: args.date || todayPacific(),
      status: 'FAIL',
      rating: 'C',
      found: { field_jobs: 0, invoices_sent_today: 0, invoice_gaps: [] },
      actions_needed: [{
        kind: 'cron_failure',
        priority: 'high',
        message: `attention-hq run failed: ${String(err.message || err)}. Check workflow logs.`
      }],
      generated_at: new Date().toISOString(),
      _steps: [{ name: 'run', result: 'error', detail: String(err.message || err) }]
    };
  }

  const json = args.pretty ? JSON.stringify(report, null, 2) : JSON.stringify(report);
  process.stdout.write(json + '\n');

  if (args.out) {
    fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
    fs.writeFileSync(path.resolve(args.out), json + '\n');
  }

  if (report.status === 'FAIL') {
    process.exit(2);
  } else if (report.status === 'PARTIAL' || report.actions_needed.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}` ||
               process.argv[1]?.endsWith('run.js');
if (isMain) {
  main();
}
