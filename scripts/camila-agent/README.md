# Camila agent — runtime scripts

**Status:** Cold ops app live in repo (`scripts/camila-ops`). GCP Vertex phase still pending.

## Prefer this for daily sends

| Path | Purpose |
|------|---------|
| **`scripts/camila-ops/`** | **Internal app** — Places discover (Hermes) → hourly send → send-log. Cranes then concrete. 5×4 metros. |
| `docs/camila-ops-runbook.md` | Is she ready? + Bryan 10-min go-live |

## Legacy / related

| Path | Purpose |
|------|---------|
| `gmail-scheduler/send-batch.js` | Sheet-based Gmail batch (bryan_approved column) |
| `form-parser/contact-reply.js` | `sales@` contact form auto-reply |
| `scripts/cold-outreach/build-lead-queue.js` | FMCSA SAFER lead builder |
| `scripts/cold-outreach/notify-chat.js` | Google Chat cards |
| `scripts/cold-outreach/verify-emails.js` | MX check |
| `config/camila-ops-rotation.json` | 18 Places URLs + quotas + standing approval |

## Quick start

```bash
cd scripts/camila-ops && npm ci
npm run seed-demo && npm run hourly:dry && npm run status
```

Live needs Hermes `GOOGLE_PLACES_API_KEY` + `CAMILA_SERVICE_ACCOUNT_JSON` + `COLD_OUTREACH_LIVE=true`.
