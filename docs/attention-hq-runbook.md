# attention-hq — daily ops scorecard runbook

**Owner:** Bryan · **Operator:** Samantha (office manager) · **Cron:** GitHub Actions, daily at 5:00 PM Pacific.

`attention-hq` is the daily "did we run a clean day?" scorecard. It pulls field jobs and invoices from the ops Google Sheet, finds invoice-number gaps (the most common revenue leak in mobile field work), and produces a single JSON document Samantha can act on.

The cron is **separate from the email crons** — it does not send anything. It only reads, rates, and reports.

---

## Output contract

Every run emits exactly this shape (matches the published spec):

```json
{
  "cron": "attention-hq",
  "date": "2026-06-20",
  "status": "PASS|PARTIAL|FAIL",
  "rating": "A+|A|B|C",
  "found": {
    "field_jobs": 2,
    "invoices_sent_today": 1,
    "invoice_gaps": ["TU1UWTES-0005", "INV3030", "INV3031"]
  },
  "actions_needed": [ /* tagged action items */ ],
  "generated_at": "2026-06-22T00:00:00.000Z"
}
```

`_steps` is included as a debugging breadcrumb — Samantha can ignore it; Bryan reads it when triaging a FAIL.

### `status`

| Value     | Meaning                                                                     |
| --------- | --------------------------------------------------------------------------- |
| `PASS`    | Every step completed cleanly.                                               |
| `PARTIAL` | All steps ran but at least one returned degraded data (e.g. missing tab).   |
| `FAIL`    | At least one required step threw — no decisions should be made on this run. |

### `rating`

| Grade | Trigger                                                          |
| ----- | ---------------------------------------------------------------- |
| `A+`  | `status=PASS` and zero invoice gaps and zero unbilled field jobs |
| `A`   | `status=PASS` and ≤1 gap and ≤1 unbilled job                     |
| `B`   | `status=PASS` and ≤3 gaps OR ≤3 unbilled jobs                    |
| `C`   | Anything worse, or `status` in {`FAIL`, `PARTIAL`} with issues   |

### `actions_needed[]`

Tagged action items, each with a `kind`, `priority`, and `message`. Current kinds:

- `fill_invoice_gap` — a numeric gap in an invoice series (e.g. `INV3030` missing between `INV3029` and `INV3032`). Samantha pulls the invoice from Jobber/QuickBooks and either logs the actual number or marks the gap as voided.
- `invoice_completed_job` — a job whose `status=completed` has no `invoice_number`. Samantha creates the invoice and writes the number back into the Jobs sheet.
- `no_invoices_today` — there were field jobs on the schedule today but zero invoices issued. Confirm Bryan is invoicing same-day per playbook.
- `cron_failure` — the cron itself crashed; treat as a Bryan-level escalation.

---

## Data sources

The cron reads two tabs from a Google Sheet whose ID is stored in the `ATTENTION_HQ_SPREADSHEET_ID` secret.

### `Jobs` tab

| Column           | Required | Notes                                                  |
| ---------------- | -------- | ------------------------------------------------------ |
| `job_id`         | yes      | Any stable identifier.                                 |
| `customer`       | yes      | For human-readable actions.                            |
| `scheduled_for`  | yes      | `YYYY-MM-DD` in Pacific.                               |
| `status`         | yes      | `scheduled` \| `completed` \| `cancelled` \| `done`.   |
| `test_type`      | no       | `OBD` or `OVI`.                                        |
| `invoice_number` | no       | Empty until the invoice is created.                    |

### `Invoices` tab

| Column           | Required | Notes                                                  |
| ---------------- | -------- | ------------------------------------------------------ |
| `invoice_number` | yes      | Any prefix + numeric tail, e.g. `INV3030`, `TU1UWTES-0005`. Gap detection groups by prefix and width. |
| `customer`       | no       | For human-readable actions.                            |
| `issued_at`      | yes      | `YYYY-MM-DD` or ISO timestamp. Used for `invoices_sent_today`. |
| `amount`         | no       | Not currently scored.                                  |
| `source`         | no       | e.g. `jobber`, `quickbooks`, `manual`.                 |

**Important:** gap detection runs **per prefix**. `INV3029` and `TU1UWTES-0001` are in different series and will never be reported as a gap relative to each other.

---

## Running it

### Locally, against bundled fixture (no secrets)

```bash
cd scripts/attention-hq
npm install
npm test
node run.js --fixtures fixtures/sample-day.json --date 2026-06-20 --pretty
```

Produces the spec's reference output: 2 field jobs, 1 invoice sent, gaps `["TU1UWTES-0005", "INV3030", "INV3031"]`, status `PASS`, rating `B`.

### Locally, against live Sheets

```bash
export GOOGLE_SERVICE_ACCOUNT_JSON='{ ...service account JSON... }'
export ATTENTION_HQ_SPREADSHEET_ID='1abc...'
export ATTENTION_HQ_JOBS_TAB='Jobs'           # optional, default "Jobs"
export ATTENTION_HQ_INVOICES_TAB='Invoices'   # optional, default "Invoices"
node run.js --pretty
```

The service account must have **read** access to the spreadsheet. The reminder-engine service account already has this scope and can be reused — share the sheet with its email and reuse the existing `GOOGLE_SERVICE_ACCOUNT_JSON` secret.

### In GitHub Actions

`.github/workflows/attention-hq.yml`:

- Schedule: `0 0 * * *` (00:00 UTC = 5:00 PM Pacific the previous day).
- Default mode: **fixture / dry run** — emits the sample report to `artifacts/attention-hq.json`.
- Live mode: requires `secrets.ATTENTION_HQ_LIVE == 'true'` AND the spreadsheet/service-account secrets.
- The JSON report is uploaded as a `attention-hq-report` workflow artifact (30-day retention).

Manual run with `workflow_dispatch` lets Bryan override `date` and `dry_run` for backfills.

### Secrets required for live mode

| Secret                        | Notes                                                  |
| ----------------------------- | ------------------------------------------------------ |
| `ATTENTION_HQ_LIVE`           | Literal `true` to enable live reads. Default off.      |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Same JSON used by reminder-engine; share the new sheet with the SA email. |
| `ATTENTION_HQ_SPREADSHEET_ID` | The ops sheet ID (NOT the subscriber sheet).           |
| `ATTENTION_HQ_JOBS_TAB`       | Optional override, default `Jobs`.                     |
| `ATTENTION_HQ_INVOICES_TAB`   | Optional override, default `Invoices`.                 |

---

## What Samantha does with the JSON

When the daily report drops, Samantha works the `actions_needed` list top-down:

1. **Every `fill_invoice_gap`** — open Jobber/QuickBooks, search for each missing number. If it's there but not in the sheet, paste it in. If it's truly missing, create it from the matching job. If voided, log `VOID` in the `invoice_number` column for that job so the gap stops re-appearing.
2. **Every `invoice_completed_job`** — same-day invoicing keeps the rating at A+. Create the invoice, write the number into the Jobs sheet.
3. **`no_invoices_today`** — confirm with Bryan that the day's jobs were closed out.
4. **`cron_failure`** — Slack/email Bryan; do not act on `found` values.

The grade trends Bryan's morning check: anything below A two days running is a "where are we leaking?" conversation.

---

## What this cron does NOT do

- Does not send emails, post to Slack, or update any sheet. Read-only.
- Does not modify Jobber, QuickBooks, or GBP.
- Does not score email deliverability or GSC — that lives in the Camila daily loop.
- Does not estimate revenue, just counts presence/absence.

Keep it small and read-only on purpose: the goal is a daily attention list, not another system that can break.
