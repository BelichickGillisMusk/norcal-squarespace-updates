# How to blog (NorCal CARB Mobile)

Two paths. Prefer **Path A** unless you want to use the CMS admin yourself.

## Path A — one-button approve (recommended)

1. Agent (or you) drops a draft in `blog_drafts/<slug>.md` and a pack in `content/approvals/`.
2. Pack lists Google Business Profile + Facebook + blog copy together when needed.
3. Reply with the pack’s **one approve phrase** (example: `approve mojave`).
4. Agent ships the live HTML under `site/blog/`, updates the blog index + sitemap, and queues GBP/Facebook text.

**Customer-facing rule:** never use personal names. Author/brand is always **NorCal CARB Mobile**.

**Location rule (Google proof):** every new post must name real places — see `docs/blog-location-seo.md`. Slug, title, H2s, and body should hit cities/corridors so search engines can connect the business to the map.

Public blog today: https://norcalcarbmobile.com/blog

Owner GBP photo + post guide: `docs/gbp-owner-one-button.md`

---

## Path B — SonicJS CMS admin (optional)

Admin panel: <https://my-sonicjs-app.cleantruckcheck-fairfieldsilverbackaiworkersdev.workers.dev/admin>

### One-time: create the admin account

The database starts with **zero users**. The **first** account registered becomes admin.

1. Open `/auth/register` on the worker URL (or “Create one here” on login).
2. Sign up with a business email + strong password (8+ chars).
3. Afterward: Admin → Settings → disable public registration.

### Writing a post in SonicJS

1. Log in → **Admin** → **Content** → **Blog Posts**.
2. **New** → fill Title, URL Slug, Content, Author (`NorCal CARB Mobile`), Excerpt, Tags, Published Date.
3. Save as **draft**, then **Publish** when ready.

**Important:** SonicJS is still separate from the live `norcalcarbmobile.com` worker. Visitors still see static `site/blog/*.html` until Path A (or a future API wire-up) ships the page. Prefer Path A for anything that must appear on the public site today.

### API (for later wire-up)

- `GET /api/collections/blog-posts/content` — list posts (JSON)

### What NOT to do

- Don’t edit slugs of migrated posts.
- Don’t run production `wrangler deploy` / DNS changes from agents without an explicit approve.
- Don’t put personal names in public blog, GBP, or Facebook copy.
