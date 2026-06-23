/**
 * Invoice gap detection.
 *
 * Invoice numbers from the field are messy — Jobber uses formats like
 * `TU1UWTES-0005`, while ad-hoc invoices in the QuickBooks side are simple
 * `INV3030`. We detect gaps within each numeric series (same prefix), not
 * across series. A "gap" is any integer missing between min and max for a
 * given prefix.
 *
 * Pure functions only — no IO. Tested in test.js.
 */

const INVOICE_RE = /^([A-Za-z0-9_-]*?)(\d+)$/;

export function parseInvoiceNumber(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toUpperCase();
  if (!s) return null;
  const m = s.match(INVOICE_RE);
  if (!m) return null;
  const prefix = m[1] || '';
  const numStr = m[2];
  return {
    raw: s,
    prefix,
    num: Number.parseInt(numStr, 10),
    width: numStr.length
  };
}

function pad(num, width) {
  const s = String(num);
  return s.length >= width ? s : '0'.repeat(width - s.length) + s;
}

/**
 * Given a list of invoice number strings, return the list of missing
 * invoice numbers (gaps) within each prefix series.
 *
 * Unparseable inputs are silently ignored — they should be surfaced by
 * the caller separately if needed.
 */
export function findInvoiceGaps(invoiceNumbers) {
  const bySeries = new Map();

  for (const raw of invoiceNumbers) {
    const parsed = parseInvoiceNumber(raw);
    if (!parsed) continue;
    const key = parsed.prefix;
    if (!bySeries.has(key)) {
      bySeries.set(key, { prefix: key, width: parsed.width, nums: new Set() });
    }
    const series = bySeries.get(key);
    series.nums.add(parsed.num);
    if (parsed.width > series.width) series.width = parsed.width;
  }

  const gaps = [];
  for (const series of bySeries.values()) {
    if (series.nums.size < 2) continue;
    const min = Math.min(...series.nums);
    const max = Math.max(...series.nums);
    for (let n = min; n <= max; n++) {
      if (!series.nums.has(n)) {
        gaps.push(`${series.prefix}${pad(n, series.width)}`);
      }
    }
  }
  return gaps;
}

/**
 * Count invoices created today.
 *
 * `issuedAt` is parsed as YYYY-MM-DD or any ISO timestamp; if the column
 * is empty, that row is skipped. `today` is a YYYY-MM-DD string in the
 * caller's timezone (we don't second-guess timezones here).
 */
export function countInvoicesSentToday(rows, today, issuedAtField = 'issued_at') {
  let n = 0;
  for (const r of rows) {
    const v = r[issuedAtField];
    if (!v) continue;
    const day = String(v).slice(0, 10);
    if (day === today) n++;
  }
  return n;
}
