/**
 * Build Attention HQ report: status, rating, found, actions_needed.
 */

function normalizeDate(value) {
  if (!value) return '';
  const s = value.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function isCompleted(job) {
  const status = (job.status || '').toLowerCase();
  return status === 'completed' || status === 'done' || status === 'complete';
}

function isInvoiced(job) {
  const flag = (job.invoiced || '').toUpperCase();
  if (flag === 'YES' || flag === 'TRUE' || flag === '1') return true;
  return Boolean((job.invoice_id || '').trim());
}

function isSentOnDate(invoice, runDate) {
  const sent = normalizeDate(invoice.sent_date);
  const status = (invoice.status || '').toLowerCase();
  return sent === runDate && (status === 'sent' || status === 'paid');
}

export function analyze({ runDate, fieldJobs, invoices, steps }) {
  const completedToday = fieldJobs.filter(
    (j) => normalizeDate(j.job_date) === runDate && isCompleted(j)
  );

  const invoicesSentToday = invoices.filter((inv) => isSentOnDate(inv, runDate));

  const invoiceGaps = [];
  const actionsNeeded = [];

  for (const job of completedToday) {
    if (!isInvoiced(job)) {
      invoiceGaps.push(job.job_id);
      actionsNeeded.push({
        priority: 'high',
        type: 'field_job_unbilled',
        id: job.job_id,
        summary: `Field job ${job.job_id} completed ${runDate} — no invoice linked`,
        suggested_action: `Create and send invoice for ${job.customer || 'customer'}`
      });
    }
  }

  for (const inv of invoices) {
    const status = (inv.status || '').toLowerCase();
    const sent = normalizeDate(inv.sent_date);
    if (status === 'draft' || (status !== 'sent' && status !== 'paid' && !sent)) {
      if (!invoiceGaps.includes(inv.invoice_id)) {
        invoiceGaps.push(inv.invoice_id);
      }
      const jobDate = fieldJobs.find((j) => j.job_id === inv.job_id)?.job_date;
      const ageDays = jobDate
        ? Math.round(
            (new Date(runDate) - new Date(normalizeDate(jobDate) + 'T12:00:00')) /
              (24 * 60 * 60 * 1000)
          )
        : null;
      actionsNeeded.push({
        priority: ageDays != null && ageDays >= 2 ? 'high' : 'medium',
        type: sent ? 'stale_invoice' : 'invoice_gap',
        id: inv.invoice_id,
        summary: `Invoice ${inv.invoice_id} (${inv.status || 'unknown'}) not sent`,
        suggested_action: `Send invoice ${inv.invoice_id} to customer and mark sent_date`
      });
    }
  }

  const allStepsOk = steps.every((s) => s.ok);
  const criticalFail = steps.some((s) => !s.ok && s.critical);

  let status;
  if (criticalFail) {
    status = 'FAIL';
  } else if (!allStepsOk || invoiceGaps.length > 0) {
    status = 'PARTIAL';
  } else {
    status = 'PASS';
  }

  let rating;
  if (status === 'FAIL' || invoiceGaps.length >= 4) {
    rating = 'C';
  } else if (status === 'PARTIAL' || invoiceGaps.length >= 2) {
    rating = 'B';
  } else if (invoiceGaps.length === 1) {
    rating = 'A';
  } else {
    rating = 'A+';
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  actionsNeeded.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    cron: 'attention-hq',
    date: runDate,
    status,
    rating,
    found: {
      field_jobs: completedToday.length,
      invoices_sent_today: invoicesSentToday.length,
      invoice_gaps: [...new Set(invoiceGaps)]
    },
    actions_needed: actionsNeeded,
    generated_at: new Date().toISOString(),
    steps
  };
}
