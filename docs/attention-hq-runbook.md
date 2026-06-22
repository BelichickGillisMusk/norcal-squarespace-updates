# Attention HQ — daily ops runbook

**Cron:** `attention-hq`  
**Consumer:** Samantha (ops agent) — acts on `actions_needed`  
**Schedule:** 6:00 PM Pacific (`0 1 * * *` UTC during PDT)

---

## Output contract

Every run emits JSON matching `config/attention-hq-output.schema.json`:

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
  "actions_needed": [ ... ],
  "generated_at": "ISO-timestamp"
}
```

| Field | Meaning |
|-------|---------|
| `status` | Did every pull/reconcile step complete? `PASS` = clean; `PARTIAL` = gaps or non-critical failure; `FAIL` = could not read ops data |
| `rating` | Quality of the business day — see `config/attention-hq-manifest.json` → `rating_rules` |
| `found` | Counts and IDs pulled from the ops sheet |
| `actions_needed` | Prioritized queue for Samantha |

---

## Data source (Google Sheet)

Ops spreadsheet tabs (configure via `GOOGLE_OPS_SPREADSHEET_ID` secret):

### Field Jobs

| Column | Example |
|--------|---------|
| `job_id` | `TU1UWTES-0005` |
| `job_date` | `2026-06-20` |
| `status` | `completed` |
| `customer` | Acme Fleet |
| `invoice_id` | `INV3032` (blank if not invoiced) |
| `invoiced` | `YES` / `NO` |

### Invoices

| Column | Example |
|--------|---------|
| `invoice_id` | `INV3030` |
| `job_id` | `JOB-2026-0618-01` |
| `sent_date` | `2026-06-20` (blank if draft) |
| `status` | `draft` / `sent` / `paid` |
| `amount` | `75` |

---

## Local / dry run

No credentials — fixture mode matches the sample in the schema:

```bash
cd scripts/attention-hq
npm install
node run.js --fixture
```

Live pull (needs service account with read access to ops sheet):

```bash
export GOOGLE_SERVICE_ACCOUNT_JSON='...'
export GOOGLE_OPS_SPREADSHEET_ID='...'
node run.js --date 2026-06-20 --out report.json
```

---

## GitHub Actions

Workflow: `.github/workflows/attention-hq-daily.yml`

- **Scheduled:** nightly artifact `attention-hq-report.json`
- **Manual:** `workflow_dispatch` with `fixture=true` (default) or `fixture=false` for live sheet

**Secrets:**

| Secret | Required for live |
|--------|-------------------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Yes |
| `GOOGLE_OPS_SPREADSHEET_ID` | Yes |

Until the ops sheet secret is set, scheduled runs use fixture data.

---

## Samantha handoff

1. Read latest `attention-hq-report` artifact (or stdout from `node run.js`)
2. Process `actions_needed` in priority order (`high` → `medium` → `low`)
3. For `field_job_unbilled`: draft invoice, link `invoice_id` on Field Jobs row
4. For `invoice_gap` / `stale_invoice`: send invoice, set `sent_date` and `status=sent`
5. Log completions back to the ops sheet; next day's run should show `rating` improving

---

## Rating rules (summary)

| Rating | When |
|--------|------|
| **A+** | PASS, zero gaps, same-day billing complete |
| **A** | PASS with at most one gap |
| **B** | PARTIAL or 2–3 gaps |
| **C** | FAIL or 4+ gaps |
