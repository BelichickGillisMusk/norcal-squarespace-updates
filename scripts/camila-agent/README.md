# Camila Vertex agent — code home (future)

**Status:** Architecture + skills in repo. GCP deployment per `docs/camila-deploy-phases.md`.

## Planned components

| Path | Purpose |
|------|---------|
| `gmail-scheduler/` | Gmail API send with 7-min spacing |
| `form-parser/` | Squarespace email → Sheet → auto-reply |
| `gbp-worker/` | Review fetch + reply drafts |
| `gsc-reporter/` | Weekly Search Console → Sheet |

## Until deployed

Use **Cursor skills** as the runtime:

1. `.cursor/skills/camila-vertex-agent/SKILL.md` — daily orchestration
2. `.cursor/skills/gmail-send-approver/SKILL.md` — cold batch execution
3. `scripts/cold-outreach/verify-emails.js` — MX checks

## Config

`config/camila-agent-manifest.json` — fill GCP project, sheet IDs, GBP location after Phase 1.
