/**
 * Field-job counting + action generation.
 *
 * "Field jobs" are rows on the Jobs sheet whose `scheduled_for` date
 * matches today. We also produce action items for Samantha when jobs
 * complete but have no invoice attached, since those are the most
 * common cause of invoice gaps.
 */

export function countFieldJobsToday(rows, today, dateField = 'scheduled_for') {
  let n = 0;
  for (const r of rows) {
    const v = r[dateField];
    if (!v) continue;
    if (String(v).slice(0, 10) === today) n++;
  }
  return n;
}

export function completedJobsWithoutInvoice(rows, today) {
  const out = [];
  for (const r of rows) {
    const scheduled = String(r.scheduled_for || '').slice(0, 10);
    if (!scheduled || scheduled > today) continue;
    const status = String(r.status || '').toLowerCase();
    if (status !== 'completed' && status !== 'done') continue;
    if (r.invoice_number) continue;
    out.push({
      job_id: r.job_id || r.id || '(no id)',
      customer: r.customer || '',
      scheduled_for: scheduled,
      test_type: r.test_type || ''
    });
  }
  return out;
}
