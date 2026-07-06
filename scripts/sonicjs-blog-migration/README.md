# SonicJS blog migration (2026-07-05)

One-time migration of legacy blog posts into the SonicJS CMS (`my-sonicjs-app`
Cloudflare Worker, D1 database `norcal-sonic-content`).

## What was migrated

65 posts inserted into the `documents` table as `blog_post` documents
(tenant `default`, status `published`, original slugs and publish dates preserved):

- **61 posts** from the Squarespace → WordPress WXR export
  (`Squarespace-Wordpress-Export-05-18-2026.xml`, in Google Drive) —
  all `post_type=post`, `status=publish` items with non-empty bodies.
- **3 posts** from the current Cloudflare site (`site/blog/*.html`):
  `2026-carb-testing-deadlines`, `carb-clean-truck-check`,
  `how-mobile-carb-testing-works`.
- **1 post** (`i-thought-it-was-ending`) recovered from the June Squarespace
  HTML export zip (`EXPORT norcalcarbmobile-com.zip`).

Skipped (empty bodies in every available export — content not recoverable):

- `2025/10/8/fleet-c-arb-clean-truck-check-sacramento`
- `how-much-does-a-diesel-truck-obd-test-cost-…-california`
- `how-to-avoid-carb-fines` (duplicate title of `carb-violation`, which WAS migrated)
- `smoke-opacity-test-oakland-j1667-…-diesel-trucks`

WXR drafts and Squarespace placeholder drafts were intentionally not migrated.

## Files

- `migrate.py` — parser that produced the manifest (WXR + site HTML + zip HTML).
  Paths inside point at the session scratchpad; adjust if re-running.
- `manifest.json` — the 65 normalized posts (title, slug, content HTML, author,
  excerpt, tags, category, publishedAt, source).

## Document shape

Rows mirror the shape SonicJS's own seeder uses:
`id = 'blog-<slug>'`, `root_id = id`, `version_number = 1`, `type_id = 'blog_post'`,
`tenant_id/locale = 'default'`, `is_current_draft = 1`, `is_published = 1`,
`status = 'published'`, `created_at` = original publish epoch, `data` = JSON with
the blog_post collection fields.

Re-running inserts is safe to detect: duplicates fail on the `documents.id`
primary key (`UNIQUE constraint failed`).
