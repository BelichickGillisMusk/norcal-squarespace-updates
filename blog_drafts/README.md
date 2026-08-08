# blog_drafts/ — blog content drop-zone

This folder holds blog posts as Markdown files with YAML front-matter, for two flows:

1. **Migrated ("old") posts** — recovered from the Squarespace → WordPress (`.xml` / WXR) export.
   Each keeps its **original slug** so existing links and SEO are preserved.
2. **New posts** — already-written content to be published on a **weekly** schedule.

The tracked `blog_drafts/_import/` folder is reserved for raw Squarespace/WXR exports before
conversion.

The weekly scheduler (`scripts/blog-schedule/`, modeled on `scripts/gbp-post/`) reads these
files, picks the post due each week, and — only when `BLOG_PUBLISH_LIVE=true` — publishes it to
the Squarespace blog. Default is dry-run (report only, no live publish).

---

## File format

One post per file: `blog_drafts/<slug>.md`

```markdown
---
title: "What Is the CARB Clean Truck Check?"
slug: "carb-clean-truck-check"        # REQUIRED. Must equal the original URL slug for migrated posts.
original_url: "https://norcalcarbmobile.com/blog/carb-clean-truck-check"  # migrated posts only
source: migrated                      # migrated | new
date: 2025-09-14                      # original publish date (migrated) — preserves chronology
publish_date: 2026-07-08              # when the scheduler should publish (new/scheduled posts)
status: pending                       # published | scheduled | approved | pending | draft
owner_approved: "NO"                  # YES after the one approve phrase — gate before live publish
approve_phrase: "approve <pack>"      # owner replies with this exact phrase (e.g. approve mojave)
industry: "freight"                   # NEW posts: industry type
locations: ["Porterville, CA"]        # NEW posts: real map pins
testing_oddity: "…"                   # NEW posts: one real test-day quirk
cool_thing: "…"                       # NEW posts: meal stop OR next-visit pin
tags: ["CARB", "Clean Truck Check", "Fleet Compliance"]
meta_description: "≤155 chars — used for the SEO meta description."
featured_image: "https://images.squarespace-cdn.com/..."   # optional
---

# What Is the CARB Clean Truck Check?

Post body in Markdown. H2s for sections. Include at least one internal link
to /contact or /services (per README blog rules). Never use personal names —
brand voice is NorCal CARB Mobile only.

**New field / trip posts** must hit: industry + location + testing oddity +
cool human detail (where tester ate, or next visit on the list). Full rule:
`docs/blog-location-seo.md`. Skeleton: `blog_drafts/_template-field-trip.md`.
```

### Location + unique content (required for new field posts)

Name real map pins **and** add industry, a testing oddity, and one cool detail
so Google gets place signals and the post is not generic CARB copy.
Full checklist: `docs/blog-location-seo.md`.

## Future field-trip stack

Ready-to-fill drafts (industry + location + YOU FILL oddity/cool thing):  
`blog_drafts/queue/` — see that folder’s README.

**Do not revise the live Mojave/Porterville HTML** while waiting on go-live:  
`site/blog/fleets-ovi-obd-porterville-mojave.html`

### One-button approve

Packs that also need Google Business Profile / Facebook live in `content/approvals/`.
Reply with the pack’s **approve phrase** only (example: `approve mojave`). That is the
single gate before blog HTML ships and social/GBP copy is queued.

Owner GBP photo steps: `docs/gbp-owner-one-button.md`

### Field notes
- **`slug` is mandatory** and is the link-preservation contract. For migrated posts it MUST match
  the live URL exactly (e.g. `norcalcarbmobile.com/blog/<slug>`). Do not "clean up" old slugs.
- **`status`** mirrors the `gbp-post` lifecycle so the scheduler can reuse classification logic:
  `pending` → `approved` → `scheduled` → `published`.
- **`owner_approved: "YES"`** (set after the approve phrase) is required before a post can go live.
  No exceptions (live prod site, no staging — see repo README). Legacy drafts may still say
  `bryan_approved`; treat that the same as `owner_approved`.
- **`publish_date`** drives weekly scheduling; **`date`** is the historical/original date.

## What NOT to do
- Do not publish stubs or placeholder posts (repo README rule).
- Do not delete posts — set `status: draft` to hold one back.
- Do not backdate `publish_date` for new posts; use the real intended publish date.
