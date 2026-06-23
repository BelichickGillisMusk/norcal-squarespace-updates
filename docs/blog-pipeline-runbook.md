# Blog Pipeline Runbook — migrate old posts + schedule new ones

**Owner:** Bryan | **Site:** norcalcarbmobile.com (Squarespace, pre-Cloudflare-migration)
**Goal:** Re-publish existing ("old") blog posts on a new blog layout **without losing their
URLs**, and put already-written new posts on a **weekly** auto-publish schedule.

This runbook is the plan of record. Phases 1–3 are built to run dry (no live publishing) until
Bryan approves and `BLOG_PUBLISH_LIVE=true` is set.

---

## Inputs required (current blockers)

| Input | Needed for | Status |
|-------|-----------|--------|
| Squarespace blog export (`.xml` / WordPress WXR) | Migrating old posts + slugs | ⛔ **Need from Bryan** — not in repo, not in Drive, and the live site can't be scraped from CI (host not in egress allowlist). Drop it in Google Drive or commit it to `blog_drafts/_import/`. |
| `Blog Page Options.html` (Claude Design) | New blog layout | ⏳ Pending `/design-login` + import (Bryan: "design done tonight") |
| New written posts | Weekly schedule queue | ⛔ **Need from Bryan** — not found in Drive |
| `SQUARESPACE_API_KEY_UPDATES` (GH secret) | Live publish (blog write) | ✅ Exists per repo README (verify blog-write scope at go-live) |

> If API blog-write turns out to be unavailable, fall back to browser automation
> (Claude in Chrome on `aqua-alpaca-m37c.squarespace.com`), per repo README.

---

## Phase 1 — Import old posts (slug-preserving)

1. Receive the `.xml` (WXR) export → place at `blog_drafts/_import/export.xml`.
2. Parse each `<item>` of type `post`: title, **slug** (from `<wp:post_name>` / link), publish
   date, categories/tags, and HTML body.
3. Convert each to `blog_drafts/<slug>.md` with front-matter (`source: migrated`,
   `original_url`, `date`, `status: published`). **Slug must match the live URL exactly.**
4. Emit a slug map (`old URL → new file`) so we can verify zero broken links before go-live.

> Importer (`scripts/blog-import/`) is written **after** we have a real export sample, so it
> matches the actual file shape rather than a guessed schema.

## Phase 2 — New blog layout

1. Import `Blog Page Options.html` via the `claude_design` MCP connector.
2. Adapt it into the Squarespace blog (template/code-injection) honoring the repo's visual
   standards (Montserrat headings, Source Sans body, consistent CTA buttons — see README §2).
3. Re-render migrated posts in the new layout; spot-check at 1280px and 390px.

## Phase 3 — Weekly scheduler (`scripts/blog-schedule/`)

- Modeled on `scripts/gbp-post/`: weekly GitHub Actions cron, **dry-run by default**, live only
  when `BLOG_PUBLISH_LIVE=true`.
- Reads `blog_drafts/*.md`, picks the post whose `publish_date` falls in the current week, checks
  `bryan_approved: YES`, and (live mode) publishes via the Squarespace Blog API.
- Emits a status artifact each run (same pattern as `SAMANTHA_STATUS_gbp-post_*.json`).

## Phase 4 — Go-live gate (do not skip)

Before flipping `BLOG_PUBLISH_LIVE=true`:
- [ ] All migrated posts present with **original slugs** (slug map verified, zero link changes)
- [ ] Spell/grammar pass on every post (repo README rule)
- [ ] New layout verified desktop + mobile
- [ ] Bryan approves (`bryan_approved: YES`)
- [ ] `change_log.md` updated

**Live publishing happens only after the boxes above are checked.** The site is live production
with no staging — nothing is flipped on content we haven't seen and Bryan hasn't approved.
