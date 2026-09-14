# Blog Writer handoff — 2026-09-14 10:20 PT

Technical. No live HTML this session. Owner gate unchanged. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social.

Recheck vs 2026-09-13 19:30 handoff. Sources: live HTTP + repo `blog_drafts/` + sales@ Drive root + CARB official testing-requirements page.

## Recheck 2026-09-14 10:20 PT

| Item | 09-13 19:30 claim | 09-14 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** |
| `/blog/stockton-construction-concrete-clean-truck-check` | 404 | **still 404** |
| `/blog/construction-sacramento-yard-carb` | unpublished | **404** |
| `/blog/clean-truck-check-owner-operators-one-truck` | not shipped | **404** |
| `/blog/freight-stockton-tracy-mobile-carb` | dated 09-15 | treat unpublished |
| `/stockton-clean-truck-check` lander | price lock | **live. OBD $75 / OVI $199 / MH $99/$229 / Full Care +$40. No construction section.** |
| `/agricultural-vehicles-clean-truck-check` | — | **live. Safe harvest sister.** |
| `/blog` portal | 63 articles. Harvest card gone. | **unchanged this morning.** |
| Drive unpublished blog docs | none titled blog | **still none. REVIEW Jan-Jul 2026 = folders 01–06 only. No 07 blog folder.** |
| `07_BLOG_PUSH` | empty / known ID | **exact_name miss from sales@ connector. Content SoT remains GitHub `blog_drafts/`.** |
| VOLUME_2 | disposed | **0 hits. Do not recreate.** |
| Law | matches ARB page | **unchanged. Queue bodies still match. No rewrite.** |

## Law (no rewrite needed)

https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Most HD diesel: **2× / year** now through September 2027.
- Qualifying agricultural vehicles: **1× / year**. Not exempt.
- CA-registered recreational / emergency motorhomes: **1× / year**.
- Beginning October 2027: OBD-equipped vehicles **4× / year**. Opacity path stays semi-annual. Ag + those motorhomes stay annual.
- Passing results may be submitted **up to 90 days before** the CTC-VIS deadline.
- CTC-VIS is the VIN deadline. **Do not print +17w on public pages.** +17w is ops only (inside the 90-day early window).

## Unpublished queue (bodies ready, `owner_approved: NO`)

| Pri | File | URL after approve | Phrase |
|---|---|---|---|
| P0 | `blog_drafts/queue/harvest-season-clean-truck-check-ag-haul.md` | `/blog/harvest-season-clean-truck-check-ag-haul` | `approve harvest-ag-haul` |
| P1 | `blog_drafts/queue/stockton-construction-concrete.md` | `/blog/stockton-construction-concrete-clean-truck-check` | `approve stockton-construction` |
| P1 | `blog_drafts/queue/construction-sacramento.md` | `/blog/construction-sacramento-yard-carb` | `approve construction-sacramento` |
| P1 | `blog_drafts/queue/owner-operators-one-truck.md` | `/blog/clean-truck-check-owner-operators-one-truck` | `approve owner-operator` |
| P2 | `blog_drafts/queue/freight-stockton-tracy.md` | `/blog/freight-stockton-tracy-mobile-carb` | `approve freight-stockton` |
| P2 | `blog_drafts/queue/bay-area-jobsite.md` | `/blog/bay-area-jobsite` | `approve bay-area-jobsite` |
| P3 | `blog_drafts/queue/wine-napa-sonoma.md` | `/blog/wine-napa-sonoma` | `approve wine-napa` |
| P3 | `blog_drafts/queue/ag-central-valley-porterville.md` | `/blog/ag-central-valley-porterville` | `approve ag-porterville` |
| HOLD | `blog_drafts/2026-2027-ctc-fleet-readiness.md` | `/blog/2026-2027-ctc-fleet-readiness` | `approve fleet-readiness` — Full Care $80 in draft vs landers +$40 |

Already live — do not republish:
- `/blog/craft-so-good-they-copy-us-hotdog-clipboard`
- `/blog/fleets-ovi-obd-porterville-mojave`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/how-mobile-carb-testing-works`
- `/blog/2026-carb-testing-deadlines`
- `/blog/carb-clean-truck-check` — frequency paragraph still stale (“at least once per year”). Hold.

## Price / NAP lock

**OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · sales@norcalcarbmobile.com · /contact**

Full Care landers: **+$40 / year**. Do not print $80 or $250.
Do not deep-link `/service-area-san-joaquin-county-mobile-testing` or `/east-bay-mobile-carb-testing` until $250 / 415 leaks are gone.
Stockton lander `/stockton-clean-truck-check` is the construction sister target. It has no construction section yet — that is why P1 exists.

## Internal links already in the Stockton construction draft

- `/stockton-clean-truck-check`
- `/clean-truck-check-lodi`
- `/areas`
- `/sacramento-carb-testing`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/2026-carb-testing-deadlines`
- `/clean-truck-check-blog/how-norcal-carb-mobile-keeps-mitchell-concrete-moving-strong-in-rancho-cordova`
- `/clean-truck-check-blog/keeping-pallets-moving-amp-trucks-carb-clean-a-partnership-with-all-good-pallets-stockton-ca`
- `/clean-truck-check-blog/when-every-minute-counts-how-norcal-carb-mobile-saved-banwait-truckings-deadline`
- `/clean-truck-check-blog/when-friday-deadline-pressure-hits-how-norcal-carb-mobile-kept-the-plaster-groups-f550-fleet-compliant`
- `/clean-truck-check-blog/keeping-castillo-fencings-fleet-rolling-before-sunrise`

Harvest draft sister links (live):
- `/agricultural-vehicles-clean-truck-check`
- `/clean-truck-check-blog/ca-ag-vehicles-clean-truck-testing-info`
- `/clean-truck-check-blog/woodland-agriculture-meets-carb-compliance`
- `/blog/fleets-ovi-obd-porterville-mojave`

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates.

Order:
1. `approve harvest-ag-haul`
2. `approve stockton-construction` — Blog Day 1 concrete / Stockton satellite
3. `approve construction-sacramento`
4. `approve owner-operator`

## Social handoff (owner paste only)

Channels: GBP https://share.google/CUg6TEK1p3eO34S9G · Facebook https://www.facebook.com/carbcleantruckcheck/ · X last public Nov 2025

Packs already in repo:
- `content/approvals/harvest-ag-haul-pack.md`
- `content/approvals/stockton-construction-pack.md`
- `content/approvals/construction-sacramento-pack.md`
- `content/approvals/owner-operator-pack.md`

Do not auto-post. After live HTML, append the public URL to the matching pack and paste.

### Paste now (after approve + live URL)

**Harvest GBP**

Harvest season Clean Truck Check: qualifying ag stays annual — not exempt. The haul truck that takes the crop to the first point of processing is usually still twice a year.

We test at the farm, packing shed, or staging lot in Woodland, Merced, Stockton, and Porterville.

OBD $75 · OVI $199 · we come to the yard.

Book: norcalcarbmobile.com/contact · (916) 890-4427

**Stockton construction GBP**

Construction and concrete fleets in Stockton, Lodi, Tracy, Lathrop, and Manteca — we test at the yard so the mixer does not sit in a station line.

Clean Truck Check is still twice a year in 2026 for most work trucks. OBD $75. OVI $199. We come to the staging lot.

Book: norcalcarbmobile.com/contact · (916) 890-4427

## What Blog Writer will not do

- Flip owner_approved
- Wrangler deploy
- Auto-post GBP / Facebook / X
- Mint 254 +17w from dirty Holy Grail
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
- Write 10 new city blogs
- Rewrite queue bodies this session (law unchanged)
