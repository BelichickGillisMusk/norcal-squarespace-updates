# Camila agent — runtime scripts

**Status:** Cold outreach + contact-form auto-reply deployed. GCP Vertex agent phase pending.

## Files

| Path | Purpose |
|------|---------|
| `gmail-scheduler/send-batch.js` | Gmail API batch scheduler — reads approved rows from Send Queue sheet, creates drafts 7 min apart, notifies Bryan via Chat when first draft is created |
| `form-parser/contact-reply.js` | Contact form auto-reply from `sales@` — parses Squarespace notifications, logs to Form Leads sheet, auto-replies within 15 min, escalates fleet/complex inquiries to Bryan |

## Related files

| Path | Purpose |
|------|---------|
| `scripts/cold-outreach/build-lead-queue.js` | SAFER lead builder — queries FMCSA API for NorCal CA fleet operators, MX-verifies emails, outputs Send Queue CSV |
| `scripts/cold-outreach/notify-chat.js` | Google Chat webhook module — batch ready, first draft sent, bounce alerts |
| `scripts/cold-outreach/verify-emails.js` | MX check for single email or CSV file |
| `scripts/google-apps-script/cold-outreach-log-setup.gs` | One-time sheet setup + 9 AM PT daily trigger |
| `.github/workflows/camila-cold-outreach.yml` | Daily cron: verify MX → build leads → notify Bryan → (manual) send batch → form replies |

## Quick start (after secrets are set)

```bash
# 0. Preflight — DNS + Gmail API (fix all ❌ before live sends)
cd scripts/camila-agent && npm ci && npm run preflight

# 1. Dry-run — validate config, no sends, no Chat posts
cd scripts/cold-outreach
node notify-chat.js --dry-run --event draft_ready --date 2026-07-01

# 2. Build a lead queue from SAFER (needs FMCSA_API_KEY)
node build-lead-queue.js --state CA --cities "Sacramento,Stockton" --limit 10 --dry-run

# 3. Verify MX on a CSV
node verify-emails.js --file gmail-send-queue-template.csv

# 4. Schedule approved Gmail drafts (needs CAMILA_SERVICE_ACCOUNT_JSON + CAMILA_SHEET_ID)
cd ../camila-agent/gmail-scheduler
node send-batch.js --dry-run

# 5. Process contact-form inbox (sales@)
cd ../form-parser
node contact-reply.js --dry-run
```

## Config

All IDs, scopes, satellite cities, and API references: **`config/camila-agent-manifest.json`**

## Deployment order

See **`docs/camila-deploy-phases.md`** (Phase 1 Workspace identity → Phase 2 Gmail+Sheets → Phase 3 GBP+GSC → Phase 4 Vertex agent).
