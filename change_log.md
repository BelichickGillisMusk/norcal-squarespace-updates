# Change log — NorCal CARB Mobile agent runs

Agents append timestamped entries below.

---

## 2026-06-22 — Samantha GBP post status cron

- Added `scripts/gbp-post/` — weekly GBP post queue report for Samantha
- Output artifact: `SAMANTHA_STATUS_gbp-post_YYYY-MM-DD.json`
- Schema: `config/gbp-post-output.schema.json` + `config/gbp-post-manifest.json`
- Workflow: `.github/workflows/gbp-post.yml` (Tuesday 10 AM Pacific)
- Runbook: `docs/gbp-post-runbook.md`
- **Next:** Add `GBP Posts` tab to NorCal Camila Ops sheet; set `GBP_POST_LIVE=true` when ready

## 2026-06-22 — attention-hq daily ops scorecard cron

- New cron `attention-hq`: reads ops Google Sheet (`Jobs` + `Invoices` tabs), counts today's field jobs and invoices sent today, detects invoice-number gaps per prefix series, and emits a JSON document with PASS/PARTIAL/FAIL status, A+/A/B/C rating, and tagged `actions_needed[]` for Samantha.
- Code: `scripts/attention-hq/` (run.js + lib/{invoices,jobs,rating,sheets}.js + 23-test suite + bundled fixture).
- Workflow: `.github/workflows/attention-hq.yml` — daily at 0:00 UTC (5:00 PM PT), dry-run by default, live behind `ATTENTION_HQ_LIVE=true` secret.
- Skill: `.cursor/skills/attention-hq/SKILL.md`. Runbook: `docs/attention-hq-runbook.md`.
- Read-only; does not send emails or write to any sheet. Output contract is locked.
- **Next:** Bryan creates ops Google Sheet, shares with reminder-engine SA, sets `ATTENTION_HQ_SPREADSHEET_ID` + `ATTENTION_HQ_LIVE=true` secrets, then Samantha works the daily JSON.

## 2026-06-09 — Email deployer skill + summer strategy

- Added `.cursor/skills/norcal-email-deployer/` — PM + deployer skill for all email channels
- Added `docs/DEPLOY_TODAY.md`, `docs/summer-2026-email-strategy.md`
- Added `scripts/email-deploy/preflight.js` — DNS blocker detection
- Added workflows: `email-preflight.yml` (7 AM PT), `email-ops-daily.yml` (8:15 AM PT)
- **Blocker:** Resend DKIM on `mail.norcalcarbmobile.com` not yet in DNS — awaiting Bryan Squarespace DNS paste
- **Next:** Bryan adds Resend subdomain records → preflight pass → test sends → approval gates

## 2026-06-09 — Google reviews: 5 stars · 31 (exact)

- Bryan verified: **5 stars on 31 Google reviews** — use exact numbers only (was incorrectly 4.9 / 47+ in some docs)
- Added `config/reviews.json` — single source of truth for rating, count, headlines, schema.org JSON-LD
- Added `squarespace/schema-local-business.html` — paste in Squarespace header (AggregateRating 5 / 31)
- Updated cold templates, manifests, Camila/Gmail skills to match

## 2026-06-09 — Cold email pricing + reviews

- Updated cold templates with aggressive pricing ($75/$199, 50% switch, beat-quote, shop comparison)
- Added Template D `pricing-reviews` for price-shopping leads
- Google reviews link: direct `#lrd=` URL (opens review panel) + share.google short link as backup

## 2026-06-09 — Platform audit + Gmail Send Approver agent

- `docs/PLATFORM_EMAIL_AUDIT.md` — Squarespace live, Cloudflare not in repo, Resend DNS still blocked
- `.cursor/skills/gmail-send-approver/` — Bryan approval + Gmail schedule send, 7 min spacing, MX verify
- `docs/two-user-workspace-setup.md` — Bryan + Camila (not tied to legacy single-user)
- `scripts/cold-outreach/verify-emails.js` — bounce prevention before cold batch

## 2026-06-09 — Camila reframed as Vertex AI agent

- Camila = Vertex AI on Workspace APIs (not human hire)
- Scope: camila@ email, Squarespace forms, GBP, GSC
- `config/camila-agent-manifest.json` + deploy phases + camila-vertex-agent skill
