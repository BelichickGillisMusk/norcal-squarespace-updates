---
name: attention-hq
description: Daily ops scorecard cron for NorCal CARB Mobile — counts field jobs, invoices sent today, and detects invoice-number gaps from the ops Google Sheet, then produces a JSON document with PASS/PARTIAL/FAIL status, A+/A/B/C quality rating, and a tagged actions_needed list for Samantha (office manager) to work. Use when user says attention-hq, ops scorecard, invoice gaps, invoice gap detection, field jobs report, daily ops cron, Samantha actions list, end-of-day report, or wants a structured JSON summary of jobs vs invoices. Read-only — does not send emails, post to Slack, or write to any sheet. Pair with norcal-email-deployer skill if email notifications of the JSON are added later.
---

# attention-hq — daily ops scorecard

Read-only cron that produces the daily "did we run a clean day?" JSON for **Samantha** to work.

**Code home:** `scripts/attention-hq/`
**Workflow:** `.github/workflows/attention-hq.yml`
**Runbook:** `docs/attention-hq-runbook.md` — read this first for the full output contract and Sheet schema.

---

## When to use this skill

- User asks about `attention-hq`, daily ops scorecard, end-of-day report, or Samantha's action list.
- User asks how invoice gaps are detected (`TU1UWTES-0005` between `TU1UWTES-0004` and `TU1UWTES-0006`, etc.).
- User wants to add a new `actions_needed.kind`, change the rating thresholds, or read from a new sheet column.
- User wants to wire the JSON into Slack, email, or a dashboard.

Do NOT use for: email sending (use `norcal-email-deployer`), Gmail outreach (use `gmail-send-approver`), GBP/GSC ops (use `camila-vertex-agent`).

---

## Output contract (do not change without Bryan's approval)

```json
{
  "cron": "attention-hq",
  "date": "YYYY-MM-DD",
  "status": "PASS|PARTIAL|FAIL",
  "rating": "A+|A|B|C",
  "found": {
    "field_jobs": <int>,
    "invoices_sent_today": <int>,
    "invoice_gaps": [<string>, ...]
  },
  "actions_needed": [
    { "kind": "...", "priority": "high|medium|low", "message": "...", ... }
  ],
  "generated_at": "ISO-timestamp"
}
```

`_steps[]` is included as a debug breadcrumb (load_fixtures, read_jobs_tab, read_invoices_tab, etc.) — keep it; downstream consumers may filter it out but the cron always emits it.

---

## Rating bands

| Grade | Trigger                                                          |
| ----- | ---------------------------------------------------------------- |
| `A+`  | `status=PASS` and zero gaps and zero unbilled jobs               |
| `A`   | `status=PASS` and ≤1 gap and ≤1 unbilled                         |
| `B`   | `status=PASS` and ≤3 gaps OR ≤3 unbilled                         |
| `C`   | Anything worse, or any FAIL/PARTIAL with issues                  |

Logic lives in `scripts/attention-hq/lib/rating.js` and is fully unit-tested in `test.js` — change tests alongside any rating change.

---

## How to run

### Dry-run with bundled fixture (no secrets)

```bash
cd scripts/attention-hq
npm install
npm test
node run.js --fixtures fixtures/sample-day.json --date 2026-06-20 --pretty
```

Produces the exact spec example: `field_jobs=2`, `invoices_sent_today=1`, gaps `["TU1UWTES-0005","INV3030","INV3031"]`, status `PASS`, rating `B`.

### Live (requires GitHub secrets)

| Secret                        | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `ATTENTION_HQ_LIVE=true`      | Gate. Default off — workflow runs in fixture/dry mode.  |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Reuse the reminder-engine SA; share the ops sheet with it. |
| `ATTENTION_HQ_SPREADSHEET_ID` | The ops sheet ID.                                        |
| `ATTENTION_HQ_JOBS_TAB`       | Optional, defaults to `Jobs`.                            |
| `ATTENTION_HQ_INVOICES_TAB`   | Optional, defaults to `Invoices`.                        |

GitHub Actions schedule: `0 0 * * *` UTC = 5:00 PM Pacific.

---

## Invoice-gap detection rules

Lives in `scripts/attention-hq/lib/invoices.js`.

1. Each invoice number is parsed into `(prefix, num, width)`. Examples:
   - `TU1UWTES-0005` → prefix `TU1UWTES-`, num `5`, width `4`
   - `INV3030` → prefix `INV`, num `3030`, width `4`
2. Numbers are grouped **per prefix**. Cross-prefix gaps are never reported.
3. Within a prefix, gaps are every integer missing between `min(num)` and `max(num)`.
4. Gap output preserves the zero-padding width of the series.
5. Series of size 1 emit no gaps (no range to interpolate).

If you add a new invoice format (e.g. `QB-2026-0001`), the regex `^([A-Za-z0-9_-]*?)(\d+)$` will handle it automatically — but add a parser test so future changes don't regress it.

---

## Things to never change without Bryan's approval

- The top-level JSON keys (`cron`, `date`, `status`, `rating`, `found`, `actions_needed`, `generated_at`) — downstream consumers will lock onto these.
- The rating bands (A+/A/B/C definitions).
- The `kind` values in `actions_needed[]` once consumers start matching on them. Add new ones freely; do not rename existing ones.

---

## Future hooks (not built yet)

- Post the JSON's `actions_needed` to Slack or to Samantha via email — the JSON contract is designed to drop into either with no parsing change.
- Append daily history to a `attention_hq_history` tab for rating trend lines.

When adding either, gate behind a new `ATTENTION_HQ_NOTIFY_LIVE` secret following the same pattern as `REMINDERS_LIVE` / `NURTURE_LIVE`.
