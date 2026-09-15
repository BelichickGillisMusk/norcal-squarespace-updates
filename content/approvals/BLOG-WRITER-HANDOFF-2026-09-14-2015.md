# Blog Writer handoff — 2026-09-14 20:15 PT

Technical. No live HTML this session. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social. Do not clone a Volume 4 calendar card.

Recheck vs 2026-09-14 10:20 PT handoff. Sources: live HTTP + repo `blog_drafts/` + sales@ Drive + ARB testing-requirements page + AGENT_DASHBOARD_2026-09-14.

## Volume 2 vs Volume 4

- VOLUME_2: 0 Drive title hits. Already disposed. Do not recreate.
- VOLUME_4_LIVE `1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t` is the file hub. List from sales@ is empty = share-gap, not a missing system.
- EGGERCT = Volume 4 execution packet already on carb@. Stop minting more cards.
- Content source of truth remains GitHub `blog_drafts/`.

## Recheck 2026-09-14 20:15 PT

| Item | 10:20 claim | 20:15 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** (apex confirmed) |
| www `/blog` portal card | Harvest card gone (apex 10:20) | **www lists Harvest as NEW — card points at 404 article. Broken internal.** |
| `/blog/stockton-construction-concrete-clean-truck-check` | 404 | **still 404** |
| `/blog/construction-sacramento-yard-carb` | 404 | treat unpublished |
| `/blog/clean-truck-check-owner-operators-one-truck` | 404 | treat unpublished |
| `/stockton-clean-truck-check` | price lock | **live. OBD $75 / OVI $199 / MH $99/$229 / Full Care +$40.** |
| `/agricultural-vehicles-clean-truck-check` | live | **live. Harvest sister.** |
| `/blog` article count | 63 | **63** |
| Drive unpublished blog docs | none titled blog | **still none. Only `[DRAFT] AI Visibility Analysis` (Feb 2026 strategy, not a post).** |
| VOLUME_2 | disposed | **0 hits. Do not recreate.** |
| Law | matches ARB | **unchanged. Queue bodies still match. No rewrite.** |

## Law (do not print +17w on public pages)

https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Most HD diesel: **semi-annual (2× / year)** now through September 2027.
- Qualifying agricultural vehicles: **1× / year**. Not exempt.
- CA-registered recreational / emergency motorhomes: **1× / year**.
- Beginning October 2027: OBD-equipped vehicles **4× / year**. Opacity path stays semi-annual. Ag + those motorhomes stay annual.
- Passing results may be submitted **up to 90 days before** the CTC-VIS deadline.
- CTC-VIS is the VIN deadline. +17w / 119d is ops only (inside the 90-day early window).

## Live pages that are stale (HOLD rewrite until owner phrase)

| URL | Defect |
|---|---|
| `/blog/carb-clean-truck-check` | Frequency paragraph still says “at least once per year.” Official: most HD is semi-annual. |
| `/blog/2026-carb-testing-deadlines` | 2× line is correct. Missing October 2027 4× OBD line. |
| `/clean-truck-check-blog/napa-carb-clean-truck` | Prints OVI $250 / MH $300. Lock is $199 / $99/$229. |
| Homepage review count | Site still prints 33. GBP panel is 34. `/reviews` is not a page. |
| `/pricing` | Still labels OBD “Most thorough.” Banned on homepage. |
| `/contact` corridor | Hides Sacramento and Stockton. |

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
- `/blog/carb-clean-truck-check` — stale frequency. Hold.

## Price / NAP lock

**OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · sales@norcalcarbmobile.com · /contact**

Full Care landers: **+$40 / year**. Do not print $80 or $250.
Do not deep-link `/service-area-san-joaquin-county-mobile-testing` or `/east-bay-mobile-carb-testing` until $250 / 415 leaks are confirmed gone on every host.
Stockton lander `/stockton-clean-truck-check` is the construction sister target.

## Mandate-gap line (blog + shop-mail spine)

CARB wrote Clean Truck Check and the CTC-VIS portal. They did not staff last-mile testers in the yard. That is the product sentence. Do not dress it up.

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates. Wrangler is Bryan GO only.

Order:
1. `approve harvest-ag-haul` — also drop the www portal card or ship the HTML the same hour. Card-without-article is a 404 internal.
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

### Paste after approve + live URL

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
- Clone EGGERCT / Volume 4 calendar cards
