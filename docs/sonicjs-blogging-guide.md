# How to blog with SonicJS (my-sonicjs-app)

Plain-English guide for writing and managing blog posts in the new CMS.
Admin panel: <https://my-sonicjs-app.cleantruckcheck-fairfieldsilverbackaiworkersdev.workers.dev/admin>

## One-time: create your admin account

The database currently has **zero users**, and SonicJS makes the **first account
registered the admin automatically**. So:

1. Open `/auth/register` on the worker URL (or click "Create one here" on the
   login page you saw).
2. Sign up with your email + a strong password (8+ chars). That account becomes
   **admin**. Every account registered after that is a low-privilege "viewer"
   until an admin promotes it.
3. **Do this soon.** Until the first account exists, anyone who stumbles on the
   URL could register and become admin. (Also worth doing afterwards: Admin →
   Settings → disable public registration.)

## Writing a new post

1. Log in → **Admin** → **Content** → **Blog Posts** ("Blog Post" content type).
2. Click **New**. Fields:
   - **Title** — the headline.
   - **URL Slug** — becomes the post's URL. Lowercase-with-dashes
     (e.g. `carb-deadlines-q3-2026`). Never change a slug after publishing —
     that breaks links and SEO.
   - **Content** — the post body (rich-text editor).
   - **Author** — required; use "NorCal CARB Mobile" or the writer's name.
   - **Excerpt** — 1–2 sentence summary; used for list pages and SEO.
   - **Category / Tags** — optional, comma-separated tags.
   - **Published Date** — set it for the publish date shown to readers.
3. Save as **draft** first; hit **Publish** when ready.

## Editing the migrated ("old") posts

All 65 legacy posts (Squarespace/WordPress era + the 3 written for the
Cloudflare site) are already in the CMS as **published** blog_post documents
with their original slugs and dates. Find them in Admin → Content → Blog Posts;
edit and re-publish like any other post. Versioning is on (up to 50 versions
per post), so edits don't destroy the original.

## Reading posts from the API (for wiring the public site later)

Public read is enabled for blog posts, so the live site (or any page) can fetch:

- `GET /api/collections/blog-posts/content` — list posts (JSON)
- Content is the raw HTML stored per post; render inside the blog template.

Note: the CMS worker is separate from the live `norcalcarbmobile.com` worker.
The static `site/blog/*.html` pages are still what visitors see today — a later
step is to point the blog pages at the CMS API (or a build step) so new posts
show up on the live site without hand-editing HTML.

## What NOT to do

- Don't edit slugs of migrated posts (link/SEO contract — see
  `blog_drafts/README.md`).
- Don't run `npx wrangler deploy -e production` or touch DNS from agents.
- Repo rule still applies: Bryan approves anything that goes on the live
  public site.
