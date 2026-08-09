# NorCal CARB Mobile — Blog cadence & publish gate

**Live tree:** `norcal-squarespace-updates/site/blog/` (Worker deploy).  
**Do not** edit or deploy from `_ARCHIVED-norcalcarbmobile-*` folders.

- **Hub:** `/blog` (`site/blog.html` + `site/blog/index.html`)
- **Posts:** `site/blog/<slug>.html` → `https://norcalcarbmobile.com/blog/<slug>`
- **Cadence:** weekly when there is a real field story
- **Legacy:** `site/clean-truck-check-blog/` keeps old URLs — **not** re-gated; new writing goes in `site/blog/`

Same idea as MLB’s blog gate (`mlbmarketing-site/blog/CADENCE.md`): **min words + links must pass or deploy fails.** NorCal adds a required **post-context header**.

## Word count

- **Floor: 400 words** per post (shorter does not ship).
- **Sweet spot: 500–700 words.**
- Count is article body inside `<main>` (header aside is excluded from the count).

## Required post-context header (top of every post)

Every new/edited post in `site/blog/` must open the article body with:

```html
<aside class="post-context" data-post-context="true" data-has-mandate="true">
  <p><strong>Location:</strong> Sacramento / Bay Area / Central Valley (edit to the cities this post serves)</p>
  <p><strong>Industry:</strong> Diesel fleets / owner-operators / ag / construction (who it’s for)</p>
  <p><strong>Test:</strong> OBD · OVI · Clean Truck Check (what this post is about)</p>
  <p><strong>Official (CARB):</strong> <a href="https://cleantruckcheck.arb.ca.gov/">Clean Truck Check — ARB</a></p>
</aside>
```

| Field | Required | Notes |
|-------|----------|--------|
| **Location** | Yes | City/region you actually serve in this story |
| **Industry** | Yes | Fleet type / buyer |
| **Test** | Yes | OBD / OVI / Clean Truck Check / etc. |
| **Official (CARB)** | When correcting or explaining a **mandate** | Set `data-has-mandate="true"` and link a real working `*.arb.ca.gov` / `*.ca.gov` URL (gate fails if the link is wrong). If the post is not about a mandate, use `data-has-mandate="false"` and omit the Official line. |

Verified official entry point: `https://cleantruckcheck.arb.ca.gov/`

## Link + word gate (required before deploy)

```bash
# from repo root (norcal-squarespace-updates)
node scripts/check-blog-links.mjs
```

- Fails on: &lt;400 words, missing Location/Industry/Test header, broken/empty/placeholder `href`s, missing internal paths, dead external URLs, mandate posts without a working state/CARB link.
- Wired into **CI Test Only**, **Site Lock**, and **Deploy NorCal** — deploy job runs the gate **before** `wrangler deploy`.
- Optional local-only structure check: `node scripts/check-blog-links.mjs --skip-network`

Do **not** run bare `wrangler deploy` / Actions deploy without a clean gate exit.

## How to add a post

1. Copy an existing `site/blog/<slug>.html`
2. Fill the **post-context** aside (Location / Industry / Test / Official if mandate)
3. Write ≥400 words (aim 500–700)
4. Add card on `site/blog/index.html` + `site/blog.html` if needed
5. Add URL to `site/sitemap.xml`
6. Run `node scripts/check-blog-links.mjs` — must pass
7. Ship only with Bryan **GO** via Deploy NorCal workflow (or approved local deploy)

## MLB cross-ref

Agency observations stay on **mlbmarketingllc.com** `/blog/`. CARB/CTC editorial stays on **norcalcarbmobile.com**. See `mlbmarketing-site/blog/CADENCE.md`.
