# norcalcarbmobile.com — Cloudflare Pages site

Static, no-build copy of the NorCal CARB Mobile site for the Squarespace → Cloudflare
migration. Plain HTML/CSS + one Pages Function for the contact form. Editable by hand.

```
site/
├── index.html              # Homepage
├── contact.html            # Contact + booking (served at /contact)
├── assets/styles.css       # All styles (navy #012241 · green #4ab94e)
├── functions/api/contact.js# POST /api/contact → emails lead via Resend
├── _headers                # Cache + security headers
└── assets/img/             # Photos (add Google Business Profile pics here)
```

## Deploy

### Option A — Cloudflare Worker (live `norcal-squarespace-updates-gillis`)

Config: `../wrangler.jsonc` and `../wrangler.toml`. The worker serves this `site/` as static
assets and handles `POST /api/contact` in `../worker/index.js`.

The live form returns **HTTP 503** until `RESEND_API_KEY` is set on that worker.
Do not commit the key. Do not invent one. Customer copy stays “call (916) 890-4427”.

```bash
# from repo root, against norcal-squarespace-updates-gillis — Bryan only, not from a CSS PR
npx wrangler secret put RESEND_API_KEY
```

`CONTACT_FROM` must be a verified Resend sender. Default is
`noreply@mail.norcalcarbmobile.com`. A missing mail-domain DNS record makes Resend
reject the send (HTTP 502) even after the key exists. That DNS change is separate
from this repo.

Optional plain vars (dashboard or `wrangler.jsonc` / `wrangler.toml` "vars"): `CONTACT_TO`
must be all three form inboxes
`sales@norcalcarbmobile.com,carb@norcalcarbmobile.com,fsu9913@gmail.com`
(Resend `to` is an array). Never set this to `bgillis99@gmail.com`, `mila@*`, or
`admin@mobilecarbsmoketest.com`. `CONTACT_FROM` defaults to
`noreply@mail.norcalcarbmobile.com` (must be a verified Resend sender).
`site/.assetsignore` keeps `functions/` and `README.md` from being web-served.

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
- Contact form routes notifications to `sales@norcalcarbmobile.com`,
  `carb@norcalcarbmobile.com`, and `fsu9913@gmail.com`. Tap-to-call and
  the mailto link work with no backend; the form needs `RESEND_API_KEY` set to deliver.
- This is a fresh, clean rebuild (the live Squarespace HTML can't be scraped from CI). To mirror
  the exact current site instead, allowlist `norcalcarbmobile.com` in the env's egress settings.
