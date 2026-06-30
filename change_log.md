# Change log — NorCal CARB Mobile agent runs

Agents append timestamped entries below.

---

## 2026-06-27 — City sites (stock layout) + owner prefs + Stripe/schema audit

- Added `CLAUDE.md` — owner standing rule: **one repo per URL**; deploy model (repo = source of truth, never hand-edit workers in dashboard); business facts
- Added `cities/` — self-contained stock-layout landing pages for **Fairfield, Hayward, Lodi, Roseville** (each own index.html + styles.css); generator `cities/_generate.mjs`
- Contact page: added LocalBusiness + ContactPoint JSON-LD (`site/contact.html`)
- Fixed stale `squarespace/schema-local-business.html` review count 31 → 33
- **Stripe audit (read-only):** account onboarding INCOMPLETE — `charges_enabled:false`, no bank/TOS/ID verification → cannot accept payments; products mispriced (existing "OBD" default $50, no clean $75/$199 retail SKUs); zero payment links/checkout. Needs Bryan to finish onboarding.
- Checkout/Service JSON-LD drafted (ready for a future `/checkout` page)
- **Next (Bryan):** finish Stripe onboarding; tell me the city workers' repo+branch so the stock pages deploy there; 'Send to Claude Code Web' for LocalService-V1 + Blog Page Options.html; set `RESEND_API_KEY`

## 2026-06-26 — Cloudflare Pages site (home + contact) + blog pipeline scaffolding

Site — Squarespace → Cloudflare migration target (`site/`):
- Added static Cloudflare Pages build: `index.html` (home), `contact.html` (served at `/contact`), `assets/styles.css`, `_headers`, `README.md`
- Contact form → `site/functions/api/contact.js` (Resend → `bgillis99@gmail.com`); needs `RESEND_API_KEY` Pages env var to deliver (tap-to-call + mailto work regardless)
- Brand: OBD **$75** · OVI **$199**; areas Sacramento/Stockton/Fairfield/San Jose/Bay Area; LocalBusiness JSON-LD
- Reviews updated **31 → 33** (Bryan verified 2026-06-26) in `config/reviews.json` + site pages
- Footer social links (FB / X / YouTube) added — **awaiting real page URLs**; Google reviews link wired
- Added Cloudflare **Worker** deploy path: `wrangler.jsonc` + `worker/index.js` (serves `site/` static assets + `/api/contact`), `site/.assetsignore` — targets existing `norcalcarbmobile.silverbackai.workers.dev` worker
- **Pending:** GBP photos (egress-blocked — need upload or domain allowlist); connect Cloudflare Pages; propagate 33 → email templates + `squarespace/schema-local-business.html`

Blog pipeline:
- Added `blog_drafts/` drop-zone + `docs/blog-pipeline-runbook.md` (import slug-preserving → new layout → weekly schedule → go-live gate)
- **Blockers (need Bryan):** `.xml`/WXR blog export (not in repo/Drive; live site unscrapable); `Blog Page Options.html` pending `/design-login`

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
