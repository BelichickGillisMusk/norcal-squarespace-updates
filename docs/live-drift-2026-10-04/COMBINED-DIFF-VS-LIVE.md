# cursor/live-sync-combined: what changes vs live (2026-10-04)

Base: `cursor/gsc-indexing-fixes-v2` @ 7585dcb (the code already live), plus
`cursor/live-drift-backfill` @ c66f942 (the hand-pasted live-only corridor code,
turned into static files), plus the fixes below. Merging this = live + these
fixes, nothing else.

Proof: local `wrangler deploy --dry-run` bundle diffed against the live bundle,
and a live-vs-local route check of 223 requests (all 91 sitemap URLs, every
legacy redirect key, legacy blog fallbacks, slash/.html variants, HEAD on the
corridor pages). Status, Location and normalized body were compared.
Cloudflare edge-only rewrites (Cloudflare Fonts, the challenge-platform script,
email obfuscation) were normalized out.

## Every difference vs live (all intended)
| # | Request | Live | This branch | Why |
|---|---|---|---|---|
| 1 | GET /clean-truck-check-hayward | 200 | 200, body differs | Removed "San Diego County is call-for-pricing" (section intro + footer); Full Care card set to /pricing wording ($40/year to us + CARB fee, was $70/year); added supporting-guide link to the Hayward post |
| 2 | GET /clean-truck-check-blog/clean-truck-check-hayward-union-city-fremont-newark | 200 | 200, body differs | Keyword link "mobile CARB test in Hayward" to /clean-truck-check-hayward; compliance-center button to /clean-truck-check-hayward (was /areas#hayward) |
| 3 | GET /motorhome-carb-test | 200 | 200, body differs | Supporting-guide link to the motorhome guide |
| 4 | GET /clean-truck-check-blog/motorhome-carb-testing-in-california-your-complete-guide | 200 | 200, body differs | Keyword link "motorhome CARB test" to /motorhome-carb-test |
| 5 | GET /clean-truck-check-hayward/ | 200 (duplicate) | 301 to https://norcalcarbmobile.com/clean-truck-check-hayward | One-hop canonical 301, no 307 |
| 6 | GET /carb-test-bay-area/ | 200 (duplicate) | 301 to https://norcalcarbmobile.com/carb-test-bay-area | Same |
| 7 | GET /carb-mobile-test-near-me/ | 200 (duplicate) | 301 to https://norcalcarbmobile.com/carb-mobile-test-near-me | Same |
| 8 | POST /api/contact (lead email HTML) | escape table is a no-op (`<` maps to `<`) | `<` `>` `&` `"` become entities | worker/html-escape.js + worker/html-escape.test.mjs |

Not visible as a behavior change: the 3 corridor pages, /areas and /sitemap.xml
are now static assets instead of strings or rewrites inside the Worker, so they
get the normal asset headers (ETag, _headers rules). The bytes are identical to live.
