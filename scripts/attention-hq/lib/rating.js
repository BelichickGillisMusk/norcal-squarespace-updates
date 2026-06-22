/**
 * Status + quality rating for the attention-hq run.
 *
 * status:   PASS | PARTIAL | FAIL  — did every step complete?
 *   - FAIL    → one or more required steps threw an error
 *   - PARTIAL → all steps ran but one or more returned degraded data
 *               (e.g. sheet missing, optional source unreachable)
 *   - PASS    → every step completed cleanly
 *
 * rating:   A+ | A | B | C            — quality of the underlying ops
 *   - A+ → zero invoice gaps, zero unbilled completed jobs
 *   - A  → ≤1 invoice gap and ≤1 unbilled job
 *   - B  → ≤3 invoice gaps OR ≤3 unbilled jobs
 *   - C  → anything worse, or status FAIL/PARTIAL
 */

export function computeStatus(steps) {
  if (steps.some((s) => s.result === 'error')) return 'FAIL';
  if (steps.some((s) => s.result === 'degraded')) return 'PARTIAL';
  return 'PASS';
}

export function computeRating({ status, invoiceGaps, unbilledJobs }) {
  if (status === 'FAIL') return 'C';

  const gaps = invoiceGaps?.length ?? 0;
  const unbilled = unbilledJobs?.length ?? 0;

  if (status === 'PARTIAL') {
    return gaps === 0 && unbilled === 0 ? 'B' : 'C';
  }

  if (gaps === 0 && unbilled === 0) return 'A+';
  if (gaps <= 1 && unbilled <= 1) return 'A';
  if (gaps <= 3 && unbilled <= 3) return 'B';
  return 'C';
}

export function buildActions({ invoiceGaps, unbilledJobs, fieldJobsToday, invoicesSentToday }) {
  const actions = [];

  if (invoiceGaps.length) {
    actions.push({
      kind: 'fill_invoice_gap',
      priority: 'high',
      message: `Missing invoice numbers in sequence: ${invoiceGaps.join(', ')}. Pull from Jobber/QuickBooks and confirm whether voided, in-draft, or genuinely missing.`,
      invoice_numbers: invoiceGaps
    });
  }

  if (unbilledJobs.length) {
    actions.push({
      kind: 'invoice_completed_job',
      priority: 'high',
      message: `${unbilledJobs.length} completed field job(s) have no invoice attached. Create invoice and link the number to the Jobs sheet.`,
      jobs: unbilledJobs
    });
  }

  if (fieldJobsToday > 0 && invoicesSentToday === 0) {
    actions.push({
      kind: 'no_invoices_today',
      priority: 'medium',
      message: `${fieldJobsToday} field job(s) on the schedule today but 0 invoices sent. Confirm Bryan is invoicing same-day per playbook.`
    });
  }

  return actions;
}
