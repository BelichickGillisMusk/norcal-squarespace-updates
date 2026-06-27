# CLAUDE.md — NorCal / Silverback working notes

## ⭐ Owner standing preference (Bryan) — READ FIRST
**ONE REPO PER URL.** Every URL / site we run is treated as its own company: its own
repository, its own code, its own Cloudflare Worker, its own deployment. **No shared or
combined deployments across sites** — separate code per URL so a change to one site can
never overwrite another.

> Bryan repeats this ~1–3×/week. It is a firm rule, not a suggestion.

**Why:** shared/combined deployments (e.g. the original "3-worker deploy" that pushed
Fairfield / Hayward / + a third city together, with Roseville added later) caused the city
sites to overwrite each other and **revert edits back to old content** every time something
redeployed.

## Deployment model (how sites go live)
- **Source of truth = the git repo.** Cloudflare Workers Builds auto-deploys on push.
- **Do NOT hand-edit workers in the Cloudflare dashboard** — the next push/build reverts them.
  To change a live site, change the repo and push.
- One repo → one Worker → one URL. Keep them independent.

## Business facts (sources of truth: `config/reviews.json`, this file)
- **NorCal CARB Mobile LLC** · ☎ (916) 890-4427 · sales@norcalcarbmobile.com
- Pricing: **OBD $75** · **OVI (smoke) $199** · per vehicle · switch offer: 50% off first test
- Service areas: Sacramento · Stockton · Fairfield · San Jose · Bay Area (+ city sites)
- Reviews: **5.0★ · 33 Google reviews** (verified 2026-06-26)
- Brand: green `#1a5f2a`; headings Montserrat, body Source Sans 3
- Full Care: CARB annual compliance fee + $40/yr managed service

## Sites
- **Main:** norcalcarbmobile.com → `site/` (home + contact), deploys to the `norcalcarbmobile`
  worker. Cloudflare Worker config: `wrangler.jsonc` + `worker/index.js` (static assets + /api/contact via Resend).
- **City landing sites:** Fairfield, Hayward, Lodi, Roseville (Cloudflare `cleantruckcheck-*`
  workers). Canonical "stock" layout in `cities/` — each city folder is **self-contained**
  (own HTML + CSS), ready to become its own repo/worker per the one-repo-per-URL rule.

## Notes for agents
- Egress is locked to an allowlist; the live sites and Cloudflare API are NOT reachable from
  the sandbox. Deploys happen via the git→Workers Builds pipeline, not from here.
- The Cloudflare connector is **read-only** for workers (can't deploy or read worker code).
