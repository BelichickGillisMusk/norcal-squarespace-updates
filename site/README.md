# norcalcarbmobile.com — Cloudflare Pages site

Static, no-build copy of the NorCal CARB Mobile site for the Squarespace → Cloudflare
migration. Plain HTML/CSS + one Pages Function for the contact form. Editable by hand.

```
site/
├── index.html              # Homepage
├── contact.html            # Contact + booking (served at /contact)
├── assets/styles.css       # All styles (brand green #1a5f2a, Montserrat/Source Sans)
├── functions/api/contact.js# POST /api/contact → emails lead via Resend
├── _headers                # Cache + security headers
└── assets/img/             # Photos (add Google Business Profile pics here)
```

## Deploy

### Option A — Cloudflare Worker (matches the live `norcalcarbmobile` worker)

Config: `../wrangler.jsonc` (worker name `norcalcarbmobile`, serves this `site/` as static
assets + routes `/api/contact` to `../worker/index.js`).

```bash
# from repo root
npx wrangler secret put RESEND_API_KEY      # so the contact form can send
npx wrangler deploy                          # → norcalcarbmobile.silverbackai.workers.dev
```

Optional plain vars (dashboard or `wrangler.jsonc` "vars"): `CONTACT_TO`
(default `bgillis99@gmail.com`), `CONTACT_FROM` (default `noreply@mail.norcalcarbmobile.com`,
must be a verified Resend sender). `site/.assetsignore` keeps `functions/` and `README.md`
from being web-served.

### Option B — Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git** → this repo + branch.
2. Build: preset **None**, build command *(empty)*, output dir `site`.
3. **Settings → Environment variables** → add `RESEND_API_KEY` (+ optional `CONTACT_TO`/`CONTACT_FROM`).
   The Pages form handler is `functions/api/contact.js`.
4. Deploy → instant `*.pages.dev` preview URL.

> Custom domain `norcalcarbmobile.com` only gets pointed here at the planned July cutover
> (see `../docs/` migration notes), not before.

## Editing content
- Text/pricing/areas: edit `index.html` / `contact.html` directly.
- Review count / rating: keep in sync with `../config/reviews.json` (source of truth).
- Photos: drop files in `assets/img/` and reference them, e.g. `<img src="/assets/img/truck.jpg">`.

## Notes
- Contact form routes notifications to `bgillis99@gmail.com` (per repo README). Tap-to-call and
  the mailto link work with no backend; the form needs `RESEND_API_KEY` set to deliver.
- This is a fresh, clean rebuild (the live Squarespace HTML can't be scraped from CI). To mirror
  the exact current site instead, allowlist `norcalcarbmobile.com` in the env's egress settings.
