#!/usr/bin/env node
/**
 * attention-hq unit tests.
 * Plain node, no test framework — keeps the dep tree tiny.
 *
 * Run:  node test.js
 */

import assert from 'node:assert/strict';
import { findInvoiceGaps, parseInvoiceNumber, countInvoicesSentToday } from './lib/invoices.js';
import { countFieldJobsToday, completedJobsWithoutInvoice } from './lib/jobs.js';
import { computeStatus, computeRating, buildActions } from './lib/rating.js';
import { runAttentionHq } from './run.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ ${name}\n   ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ ${name}\n   ${err.message}`);
    failed++;
  }
}

// ---------- parseInvoiceNumber ----------

test('parseInvoiceNumber: TU1UWTES-0005 prefix vs number', () => {
  const p = parseInvoiceNumber('TU1UWTES-0005');
  assert.equal(p.prefix, 'TU1UWTES-');
  assert.equal(p.num, 5);
  assert.equal(p.width, 4);
});

test('parseInvoiceNumber: INV3030 prefix vs number', () => {
  const p = parseInvoiceNumber('INV3030');
  assert.equal(p.prefix, 'INV');
  assert.equal(p.num, 3030);
  assert.equal(p.width, 4);
});

test('parseInvoiceNumber: pure numeric', () => {
  const p = parseInvoiceNumber('1042');
  assert.equal(p.prefix, '');
  assert.equal(p.num, 1042);
});

test('parseInvoiceNumber: rejects empty + null', () => {
  assert.equal(parseInvoiceNumber(''), null);
  assert.equal(parseInvoiceNumber(null), null);
  assert.equal(parseInvoiceNumber(undefined), null);
});

// ---------- findInvoiceGaps ----------

test('findInvoiceGaps: single series with one missing', () => {
  const gaps = findInvoiceGaps(['INV3029', 'INV3030', 'INV3032']);
  assert.deepEqual(gaps, ['INV3031']);
});

test('findInvoiceGaps: respects zero-padding width', () => {
  const gaps = findInvoiceGaps(['TU1UWTES-0001', 'TU1UWTES-0003']);
  assert.deepEqual(gaps, ['TU1UWTES-0002']);
});

test('findInvoiceGaps: mixed series — gaps reported per series', () => {
  const gaps = findInvoiceGaps([
    'TU1UWTES-0001', 'TU1UWTES-0002', 'TU1UWTES-0003',
    'TU1UWTES-0004', 'TU1UWTES-0006', 'TU1UWTES-0007',
    'INV3029', 'INV3032'
  ]);
  assert.deepEqual(gaps.sort(), ['INV3030', 'INV3031', 'TU1UWTES-0005'].sort());
});

test('findInvoiceGaps: ignores series of size 1 (no min/max range)', () => {
  const gaps = findInvoiceGaps(['INV5000', 'TU1UWTES-0001']);
  assert.deepEqual(gaps, []);
});

test('findInvoiceGaps: handles duplicates and unparseable', () => {
  const gaps = findInvoiceGaps(['INV1', 'INV1', 'INV3', 'GARBAGE', '', null]);
  assert.deepEqual(gaps, ['INV2']);
});

// ---------- countInvoicesSentToday ----------

test('countInvoicesSentToday: matches YYYY-MM-DD prefix only', () => {
  const rows = [
    { issued_at: '2026-06-20' },
    { issued_at: '2026-06-20T14:30:00Z' },
    { issued_at: '2026-06-19' },
    { issued_at: '' }
  ];
  assert.equal(countInvoicesSentToday(rows, '2026-06-20'), 2);
});

// ---------- countFieldJobsToday ----------

test('countFieldJobsToday: only counts scheduled_for == today', () => {
  const rows = [
    { scheduled_for: '2026-06-20' },
    { scheduled_for: '2026-06-20' },
    { scheduled_for: '2026-06-21' },
    {}
  ];
  assert.equal(countFieldJobsToday(rows, '2026-06-20'), 2);
});

// ---------- completedJobsWithoutInvoice ----------

test('completedJobsWithoutInvoice: surfaces past completed jobs missing invoice_number', () => {
  const rows = [
    { job_id: 'A', scheduled_for: '2026-06-18', status: 'completed', invoice_number: 'INV1' },
    { job_id: 'B', scheduled_for: '2026-06-19', status: 'completed', invoice_number: '' },
    { job_id: 'C', scheduled_for: '2026-06-19', status: 'scheduled' },
    { job_id: 'D', scheduled_for: '2026-06-21', status: 'completed' }
  ];
  const out = completedJobsWithoutInvoice(rows, '2026-06-20');
  assert.equal(out.length, 1);
  assert.equal(out[0].job_id, 'B');
});

// ---------- computeStatus ----------

test('computeStatus: all ok → PASS', () => {
  assert.equal(computeStatus([{ result: 'ok' }, { result: 'ok' }]), 'PASS');
});
test('computeStatus: one degraded → PARTIAL', () => {
  assert.equal(computeStatus([{ result: 'ok' }, { result: 'degraded' }]), 'PARTIAL');
});
test('computeStatus: one error trumps degraded → FAIL', () => {
  assert.equal(computeStatus([{ result: 'degraded' }, { result: 'error' }]), 'FAIL');
});

// ---------- computeRating ----------

test('computeRating: clean PASS → A+', () => {
  assert.equal(computeRating({ status: 'PASS', invoiceGaps: [], unbilledJobs: [] }), 'A+');
});
test('computeRating: 1 gap + 1 unbilled on PASS → A', () => {
  assert.equal(computeRating({ status: 'PASS', invoiceGaps: ['X1'], unbilledJobs: [{}] }), 'A');
});
test('computeRating: 3 gaps + 0 unbilled on PASS → B', () => {
  assert.equal(computeRating({ status: 'PASS', invoiceGaps: ['1','2','3'], unbilledJobs: [] }), 'B');
});
test('computeRating: 4 gaps on PASS → C', () => {
  assert.equal(computeRating({ status: 'PASS', invoiceGaps: ['1','2','3','4'], unbilledJobs: [] }), 'C');
});
test('computeRating: FAIL → C regardless', () => {
  assert.equal(computeRating({ status: 'FAIL', invoiceGaps: [], unbilledJobs: [] }), 'C');
});

// ---------- buildActions ----------

test('buildActions: each problem produces a tagged action', () => {
  const actions = buildActions({
    invoiceGaps: ['INV3030', 'INV3031'],
    unbilledJobs: [{ job_id: 'X' }],
    fieldJobsToday: 2,
    invoicesSentToday: 0
  });
  const kinds = actions.map((a) => a.kind);
  assert.ok(kinds.includes('fill_invoice_gap'));
  assert.ok(kinds.includes('invoice_completed_job'));
  assert.ok(kinds.includes('no_invoices_today'));
});

test('buildActions: clean day produces no actions', () => {
  const actions = buildActions({
    invoiceGaps: [],
    unbilledJobs: [],
    fieldJobsToday: 2,
    invoicesSentToday: 2
  });
  assert.equal(actions.length, 0);
});

// ---------- End-to-end against fixture (must match the spec's example) ----------

await asyncTest('runAttentionHq end-to-end against sample-day fixture matches published spec', async () => {
  const report = await runAttentionHq({
    fixtures: new URL('./fixtures/sample-day.json', import.meta.url).pathname,
    date: '2026-06-20'
  });

  assert.equal(report.cron, 'attention-hq');
  assert.equal(report.date, '2026-06-20');
  assert.equal(report.status, 'PASS');
  assert.equal(report.found.field_jobs, 2);
  assert.equal(report.found.invoices_sent_today, 1);
  assert.deepEqual(
    report.found.invoice_gaps.slice().sort(),
    ['INV3030', 'INV3031', 'TU1UWTES-0005'].sort()
  );
  assert.equal(report.rating, 'B');
  assert.ok(Array.isArray(report.actions_needed));
  assert.ok(report.actions_needed.length > 0);
  assert.ok(typeof report.generated_at === 'string');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
