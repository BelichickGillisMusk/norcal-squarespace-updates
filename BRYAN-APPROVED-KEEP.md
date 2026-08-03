# BRYAN APPROVED — KEEP THIS STACK

**Date:** 2026-08-02 (lock rules updated 2026-08-03)

## Production forever (until Bryan says otherwise)

| | |
|--|--|
| **Site** | https://norcalcarbmobile.com |
| **Worker (legacy / live today)** | `norcal-squarespace-updates-gillis` on **Gillis Institute** |
| **Worker (fresh start)** | `norcalcarbmobile-prod` on **empty bryan@norcalcarbmobile.com** CF account |
| **Deploy token** | GitHub secret **`CF_GROK_KEY_NCM`** + **`NORCAL_PROD_CF_ACCOUNT_ID`** |
| **Repo** | `BelichickGillisMusk/norcal-squarespace-updates` |
| **Prices** | OBD $75 · OVI $199 · MH $99/$229 |

**Other brands stay on Gillis.** Only the money site moves to the empty account.  
**Do not** attach production to `*.grok-sandbox.com` (Grok preview only).  
See `docs/CLOUDFLARE-ACCOUNT-SPLIT.md`.

## GitHub = test. Production = Bryan GO only

| Action | What happens |
|--------|----------------|
| Push / PR | **CI Test Only** + **Site Lock** — validates, **never deploys** |
| attention-hq | Scorecard only — **not the website** |
| Deploy NorCal workflow | Manual only — Bryan types **`GO`** |
| Local `wrangler deploy` | Agents need Bryan **GO deploy** |

See `docs/GITHUB-TEST-NOT-DEPLOY.md`.

**Phone:** 916-890-4427
