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
bryan_approved: "NO"                  # YES once Bryan signs off — gate before any live publish
tags: ["CARB", "Clean Truck Check", "Fleet Compliance"]
meta_description: "≤155 chars — used for the SEO meta description."
featured_image: "https://images.squarespace-cdn.com/..."   # optional
---

# What Is the CARB Clean Truck Check?

Post body in Markdown. H2s for sections. Include at least one internal link
to /contact or /services (per README blog rules).
```

### Field notes
- **`slug` is mandatory** and is the link-preservation contract. For migrated posts it MUST match
  the live URL exactly (e.g. `norcalcarbmobile.com/blog/<slug>`). Do not "clean up" old slugs.
- **`status`** mirrors the `gbp-post` lifecycle so the scheduler can reuse classification logic:
  `pending` → `approved` (Bryan) → `scheduled` → `published`.
- **`bryan_approved: "YES"`** is required before a post can go live. No exceptions (live prod site,
  no staging — see repo README).
- **`publish_date`** drives weekly scheduling; **`date`** is the historical/original date.

## What NOT to do
- Do not publish stubs or placeholder posts (repo README rule).
- Do not delete posts — set `status: draft` to hold one back.
- Do not backdate `publish_date` for new posts; use the real intended publish date.
