# gbp-post — Samantha GBP post queue status

Read-only weekly cron that inspects the **GBP Posts** Google Sheet tab and emits `SAMANTHA_STATUS_gbp-post_YYYY-MM-DD.json` for Samantha (and Camila on publish).

## Output artifact

Filename: `SAMANTHA_STATUS_gbp-post_YYYY-MM-DD.json`

```json
{
  "agent": "Samantha",
  "cron": "gbp-post",
  "date": "2026-06-20",
  "status": "PASS",
  "rating": "B",
  "found": {
    "posts_scheduled_this_week": 2,
    "posts_published_this_week": 1,
    "posts_pending_approval": 1,
    "posts_approved_unpublished": 0,
    "next_scheduled_date": "2026-06-27"
  },
  "actions_needed": [
    {
      "kind": "approve_gbp_post",
      "priority": "high",
      "message": "GBP post \"Tools hub — when is my test due?\" scheduled 2026-06-20 needs Bryan approval. Reply \"approved gbp post\" to publish.",
      "publish_date": "2026-06-20",
      "post_title": "Tools hub — when is my test due?"
    }
  ],
  "generated_at": "2026-06-22T..."
}
```

Schema: `config/gbp-post-output.schema.json`

## Sheet schema (GBP Posts tab)

| Column | Example | Notes |
|--------|---------|-------|
| `publish_date` | `2026-06-20` | Pacific business day |
| `status` | `draft` / `published` | Camila sets `published` after GBP API call |
| `post_title` | Tools hub teaser | Internal label |
| `post_body` | Mobile CARB… | GBP summary text |
| `cta_url` | `https://norcalcarbmobile.com/tools` | Optional |
| `bryan_approved` | `YES` | Required before Camila publishes |

## actions_needed kinds

| kind | When |
|------|------|
| `approve_gbp_post` | Draft scheduled this week, `bryan_approved` empty |
| `publish_gbp_post` | Approved but `status` ≠ `published` |
| `queue_gbp_post` | No rows scheduled for current week |
| `gbp_post_overdue` | Thu–Sat and zero published this week |
| `cron_failure` | Sheet read failed |

## Approval flow

1. Samantha surfaces `approve_gbp_post` in the JSON report.
2. Bryan replies **approved gbp post** (Chat or Sheet).
3. Camila publishes via GBP API (`camila-vertex-agent` skill).
4. Camila updates sheet row `status=published`.

## Local run

```bash
cd scripts/gbp-post
npm install
npm test
node run.js --fixtures fixtures/sample-week.json --date 2026-06-20 --pretty
```

Produces `SAMANTHA_STATUS_gbp-post_2026-06-20.json` in the working directory.

## GitHub Actions

Workflow: `.github/workflows/gbp-post.yml`

- Schedule: **Tuesday 10 AM Pacific** (`0 17 * * 2` UTC)
- Dry-run uses bundled fixture unless `GBP_POST_LIVE=true`
- Artifact name: `SAMANTHA_STATUS_gbp-post_<date>`

## Secrets (live mode)

| Secret | Purpose |
|--------|---------|
| `GBP_POST_LIVE` | Literal `true` to read live sheet |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Read-only SA (share GBP Posts sheet) |
| `GBP_POST_SPREADSHEET_ID` | Sheet ID (can reuse NorCal Camila Ops sheet) |
| `GBP_POST_TAB` | Optional — default `GBP Posts` |

## Note on GKE

This cron runs on GitHub Actions runners (same pattern as `email-ops-daily.yml`). GKE deploy (`google-github-actions/get-gke-credentials`) lives in `samantha-agents-google` for the conversational Samantha service — not required here.
