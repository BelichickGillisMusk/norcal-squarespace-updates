# norcalcarbmobile.com — static site

Static, no-build copy of the NorCal CARB Mobile site. Plain HTML/CSS. The live
contact form is `POST /api/contact` on the Worker in `../worker/index.js`, which
sends through the Cloudflare Email binding to bgillis99@gmail.com.

```
site/
├── index.html              # Homepage
├── contact.html            # Contact + booking (served at /contact)
├── assets/styles.css       # All styles (navy #012241 · green #4ab94e)
├── _headers                # Cache + security headers
└── assets/img/             # Photos (add Google Business Profile pics here)
```

## Deploy

### Option A — Cloudflare Worker (matches the live `norcalcarbmobile` worker)

Config: `../wrangler.jsonc` (worker name `norcalcarbmobile`, serves this `site/` as static
assets + routes `/api/contact` to `../worker/index.js`).

Leads go to bgillis99@gmail.com, the address on the Email binding in
`../wrangler.jsonc`. `site/.assetsignore` keeps `functions/` and `README.md`
from being web-served.

### Option B — Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git** → this repo + branch.
2. Build: preset **None**, build command *(empty)*, output dir `site`.
3. Pages does not serve this form. The live handler is the Worker above.
4. Deploy → instant `*.pages.dev` preview URL.

> Custom domain `norcalcarbmobile.com` only gets pointed here at the planned July cutover
> (see `../docs/` migration notes), not before.

## Editing content
- Text/pricing/areas: edit `index.html` / `contact.html` directly.
- Review count / rating: keep in sync with `../config/reviews.json` (source of truth).
- Photos: drop files in `assets/img/` and reference them, e.g. `<img src="/assets/img/truck.jpg">`.

## Notes
- Contact form leads go to `bgillis99@gmail.com` through the Worker Email binding.
  Tap-to-call and the mailto link work with no backend.
- This is a fresh, clean rebuild (the live Squarespace HTML can't be scraped from CI). To mirror
  the exact current site instead, allowlist `norcalcarbmobile.com` in the env's egress settings.
