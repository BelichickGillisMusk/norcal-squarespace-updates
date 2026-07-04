# Change log — NorCal CARB Mobile agent runs

Agents append timestamped entries below.

---

## 2026-07-04 — Coverage map + mobile content band + 250th logo/reviews color

Site — `site/` (live Cloudflare Worker production site, all 11 static pages):

- **Header logo:** replaced the `NC` mark + text brand name with Bryan's uploaded "Happy 250th, America!" NCM graphic (`site/assets/img/norcal-carb-mobile-logo-250th.png`), across all 11 pages.
  - **Blocker/flag:** this graphic bakes in "HAPPY 250TH, AMERICA!" and "Now Serving San Diego County & the Central Valley" — both time-boxed claims, not the site's current areas (nav says Sacramento/Stockton/Fairfield/San Jose/Bay Area only). It's also a dense square social-post graphic, not a logotype — shrunk to a 56px header slot it's only legible as "a green/navy/red badge," not readable text. Recommended a cropped, evergreen version (mark + wordmark only) for the permanent header; left this exact file in place pending Bryan's call.
- **Google reviews badge:** sampled the logo's green programmatically (`rgb(75,180,75)` / `#4bb44b`, added as `--brand-green`) and applied it to `.reviews-pill` (the "★ 5.0 · 33 on Google" footer badge). Verified via Playwright screenshot — renders solid green, readable on the navy footer.
- **Coverage map (footer, sitewide + full-size on `/areas`):**
  - Added `.footer-coverage-map` (500px max-width, centered, above the copyright line) to all 11 pages, and `.coverage-map-full` on `areas.html` just below the H1/intro.
  - Both reference `/assets/img/norcal-coverage-map-evergreen.png` with `loading="lazy"` and the specified alt text.
  - **BLOCKER — asset does not exist.** The cropped, anniversary-free coverage map PNG described in the brief was never added to this repo (checked the whole tree, the Squarespace export zip, `site-export/`, `screenshots/` — nowhere). I did not fabricate a placeholder graphic. The markup/CSS is fully wired and will work the moment the real file is dropped at that path; until then it renders a broken-image icon (verified via screenshot). **Needs Bryan (or whoever has Bryan's anniversary-graphic source file) to supply the actual cropped PNG.**
- **Mobile content band (≤768px):** `main` background → `#f1f5f9` (slate-100) via a `--ink`/`--body`/`--muted` CSS-variable override scoped to `main`, re-asserted back to the original white/light-blue values inside `.hero`, `section.soft`, and `.cta-band` (which keep their own dark/red backgrounds) so those sections don't go dark-text-on-dark-background. Also fixed `.pricing-table` even-row striping, which would otherwise render invisible dark-on-dark text under the new light band.
  - Went beyond the literal "just swap the background" instruction: this site's entire palette (`--ink:#fff`, `--body:#c8d6e5`, `--muted:#8a9bb5`) is designed for a dark background *everywhere*, not just the hero — a naive background swap would have made most body text/headings unreadable (light-gray-on-light-gray) on every default-background section. Verified the fix with mobile screenshots: light/dark sections now alternate correctly and read clean at 390px.
  - **Per the brief's own flag: this is a real visible shift on mobile (dark→light→dark banding) and needs Bryan/Gus sign-off before it's considered final**, same as originally called out.
- Header/footer stay navy on mobile as specified — unchanged (already correct at `body`/footer level, no override needed there).

**Verified:** served `site/` locally + Playwright/Chromium screenshots at 390×844 (mobile) and 1280×900 (desktop) — logo, reviews badge, mobile banding, and the areas-page map slot all confirmed rendering as coded.

**Next:** Bryan to (1) supply `norcal-coverage-map-evergreen.png`, (2) confirm/reject the 250th-logo-as-permanent-header call, (3) confirm the mobile light-band visual before this is treated as done. Run Lighthouse/PageSpeed once the real map PNG is in — flagged as a follow-up per the brief, not yet run (no real asset to measure against).

## 2026-06-28 — Emergency live launch: Squarespace canceled, site expanded to 9 pages

**Context:** Squarespace canceled the site today. Cloudflare Worker site is now the live production site.

- **New pages (4 added, bringing total to 9):**
  - `/pricing` — dedicated pricing page with all 6 tiers, switch-and-save offer, Full Care, comparison table
  - `/blog` — blog index linking 3 published posts
  - `/blog/carb-clean-truck-check` — "What Is the CARB Clean Truck Check?" (~800 words, SEO: CARB Clean Truck Check Sacramento)
  - `/blog/how-mobile-carb-testing-works` — "How Mobile CARB Testing Works" (~750 words, SEO: mobile CARB testing near me)
  - `/blog/2026-carb-testing-deadlines` — "2026 CARB Testing Deadlines" (~850 words, SEO: CARB compliance deadline 2026)
- **Navigation updated** across all 9 pages: added Pricing + Blog links to header nav and footer nav
- **Worker redirects updated:** `/clean-truck-check-rates` → `/pricing`, `/clean-truck-check-blog` → `/blog`
- **wrangler.jsonc** updated with custom domain routes for `norcalcarbmobile.com` and `www.norcalcarbmobile.com`
- **Blog posts include:** Article JSON-LD schema, internal links to /contact and /services, proper meta descriptions
- **All pages:** 9 total — `/` (home), `/services`, `/pricing`, `/areas`, `/faq`, `/blog`, `/blog/*` (3 posts), `/contact`
- **Deployment required:** Bryan must:
  1. Add `norcalcarbmobile.com` as a zone in Cloudflare (if not already)
  2. Point domain nameservers to Cloudflare (at registrar)
  3. Set `CLOUDFLARE_API_TOKEN` and run `npx wrangler deploy` from repo root
  4. Set `RESEND_API_KEY` secret via `npx wrangler secret put RESEND_API_KEY`
  5. Verify all pages at `norcalcarbmobile.com`

## 2026-06-27 — Cloudflare site buildout (5 pages + 42 redirects)

- **New pages:** `/services` (4 service cards + pricing table), `/areas` (17 service area cards with anchor IDs), `/faq` (10 Q&A + FAQPage JSON-LD schema)
- **Updated pages:** `/` (homepage — motorhome pricing card, San Diego note, disclaimer, hasOfferCatalog schema, review count 31→33 in meta), `/contact` (motorhome form options, pricing footer)
- **Nav standardized:** all 5 pages now link Home · Services · Areas · FAQ · Contact in header and footer
- **42 old Squarespace URL redirects** added to `worker/index.js` — 301 permanent redirects to preserve SEO equity during migration
- **CSS:** added grid-4, service-card, area-card, faq-item, pricing-table styles
- **Ready to deploy:** `npx wrangler deploy` from repo root (needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`)
- **Blocker:** No Cloudflare credentials in CI environment — Bryan must deploy locally or add secrets
- **Next:** Bryan deploys, verify all pages + redirects + contact form at `norcalcarbmobile.silverbackai.workers.dev`

## 2026-06-27 — Pricing standardization across all files

- **Canonical pricing established** (source of truth: `config/pricing.json`):
  - Standard: OBD **$75** · OVI **$199**
  - Motorhome: OBD **$99** · OVI **$229** (was $250/$300 on live site)
  - San Diego: OBD **$119** · OVI **$219**
- Added disclaimer everywhere: *"Pricing is always subject to change due to matters out of our control."*
- **New files:**
  - `config/pricing.json` — single source of truth for all pricing
  - `squarespace/footer-pricing.html` — Squarespace footer code injection with all tiers
  - `squarespace/price-comparison-mobile.html` — mobile-only competitor comparison table
- **Updated schema:** `squarespace/schema-local-business.html` — added `hasOfferCatalog` with all 6 service tiers, priceRange updated to `$75–$229`
- **Updated 30+ files:** config manifests, email templates, docs, skills, scripts, squarespace snippets
- **Resolved:** OVI pricing discrepancy ($250 on site vs $199 in docs) — canonical is $199
- **Next:** Bryan to verify San Diego pricing and approve motorhome rates for live site

## 2026-06-26 — Cloudflare Pages site (home + contact) + blog pipeline scaffolding

## 2026-06-25 — Site export + CSS standardization files from Google Drive

- Added `site-export/` — full static HTML/CSS/JS export of norcalcarbmobile.com (Squarespace 7.1)
  - `index.html` (239 KB) — homepage with LocalBusiness schema, OfferCatalog, 32 areaServed locations
  - `css/custom.css` — **broken** on live site: `SyntaxError` at line 100 (unexpected `}` closing brace, references `--patriots-blue` CSS variable)
- Added `docs/css-standardization/` — 4 files downloaded from Google Drive:
  - `norcalcarbmobile-css-standardization.css` — comprehensive standardized CSS (15 sections, primary color #0066cc, typography: Helvetica Neue/Arial)
  - `css-implementation-guide.md` — step-by-step Squarespace Custom CSS implementation + page audit checklists
  - `css-quick-reference.md` — Bryan-facing one-pager with standardized elements, 15-minute action plan
  - `page-by-page-analysis.md` — 7-page audit with 47 issues identified, 42 fixable by CSS (89%), dated Oct 2025
- **Key findings:**
  - Live site custom CSS is syntactically broken (will not parse)
  - Font discrepancy: README says Montserrat/Source Sans Pro, CSS standardization uses Helvetica Neue/Arial, live site loads Manrope/Poppins
  - OVI pricing discrepancy: README says $199, site-export schema says $250
  - LocalBusiness schema already present in export (contradicts earlier audit assumption it was missing)
- **Next:** Resolve font/pricing discrepancies with Bryan, fix broken custom.css, apply CSS standardization for Cloudflare migration

## 2026-06-23 — Blog pipeline scaffolding (migrate old + schedule new)

Site — Squarespace → Cloudflare migration target (`site/`):
- Added static Cloudflare Pages build: `index.html` (home), `contact.html` (served at `/contact`), `assets/styles.css`, `_headers`, `README.md`
- Contact form → `site/functions/api/contact.js` (Resend → `bgillis99@gmail.com`); needs `RESEND_API_KEY` Pages env var to deliver (tap-to-call + mailto work regardless)
- Brand: OBD **$75** · OVI **$199**; areas Sacramento/Stockton/Fairfield/San Jose/Bay Area; LocalBusiness JSON-LD
- Reviews updated **31 → 33** (Bryan verified 2026-06-26) in `config/reviews.json` + site pages
- Footer social links (FB / X / YouTube) added — **awaiting real page URLs**; Google reviews link wired
- Added Cloudflare **Worker** deploy path: `wrangler.jsonc` + `worker/index.js` (serves `site/` static assets + `/api/contact`), `site/.assetsignore` — targets existing `norcalcarbmobile.silverbackai.workers.dev` worker
- **Pending:** GBP photos (egress-blocked — need upload or domain allowlist); connect Cloudflare Pages; propagate 33 → email templates + `squarespace/schema-local-business.html`

Blog pipeline:
- Added `blog_drafts/` drop-zone + tracked `blog_drafts/_import/` placeholder + `docs/blog-pipeline-runbook.md` (import slug-preserving → new layout → weekly schedule → go-live gate)
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
