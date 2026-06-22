#!/usr/bin/env node
/**
 * Attention HQ — daily field jobs vs invoicing report for Samantha.
 *
 * Usage:
 *   node run.js --fixture              # sample data, no credentials
 *   node run.js --date 2026-06-20      # override run date (Pacific business day)
 *   node run.js --out report.json      # write JSON artifact (default: stdout)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTabRows, fixtureData } from './lib/sheets.js';
import { analyze } from './lib/report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(__dirname, '../../config/attention-hq-manifest.json'), 'utf8')
);

function parseArgs(argv) {
  const args = { fixture: false, date: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--fixture') args.fixture = true;
    if (argv[i] === '--date') args.date = argv[++i];
    if (argv[i] === '--out') args.out = argv[++i];
  }
  return args;
}

function pacificDateString(d = new Date()) {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

async function pullLiveData(runDate) {
  const steps = [];
  let fieldJobs = [];
  let invoices = [];

  try {
    fieldJobs = await getTabRows(manifest.data_sources.tabs.field_jobs);
    steps.push({
      name: 'pull_field_jobs',
      ok: true,
      critical: true,
      detail: `${fieldJobs.length} rows`
    });
  } catch (err) {
    steps.push({
      name: 'pull_field_jobs',
      ok: false,
      critical: true,
      detail: err.message
    });
  }

  try {
    invoices = await getTabRows(manifest.data_sources.tabs.invoices);
    steps.push({
      name: 'pull_invoices',
      ok: true,
      critical: true,
      detail: `${invoices.length} rows`
    });
  } catch (err) {
    steps.push({
      name: 'pull_invoices',
      ok: false,
      critical: true,
      detail: err.message
    });
  }

  steps.push({
    name: 'reconcile',
    ok: steps.every((s) => s.ok),
    critical: false,
    detail: `run_date=${runDate}`
  });

  return { fieldJobs, invoices, steps };
}

async function main() {
  const args = parseArgs(process.argv);
  const runDate = args.date || pacificDateString();

  let fieldJobs;
  let invoices;
  let steps;

  if (args.fixture) {
    const fixture = fixtureData(runDate);
    fieldJobs = fixture.fieldJobs;
    invoices = fixture.invoices;
    steps = [
      { name: 'pull_field_jobs', ok: true, critical: true, detail: 'fixture' },
      { name: 'pull_invoices', ok: true, critical: true, detail: 'fixture' },
      { name: 'reconcile', ok: true, critical: false, detail: `run_date=${runDate}` }
    ];
  } else {
    ({ fieldJobs, invoices, steps } = await pullLiveData(runDate));
  }

  const report = analyze({ runDate, fieldJobs, invoices, steps });
  const json = JSON.stringify(report, null, 2);

  if (args.out) {
    writeFileSync(args.out, json + '\n');
    console.error(`Wrote ${args.out}`);
  } else {
    console.log(json);
  }

  if (report.status === 'FAIL') process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
