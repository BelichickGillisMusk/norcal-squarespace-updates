# Blog Writer handoff — 2026-09-15 12:15 PT

Technical. No live HTML this session. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social. Do not clone a Volume 4 / EGGERCT calendar card from this file.

Recheck vs 2026-09-15 06:30 PT handoff. Sources: live HTTP 12:10–12:15 PT, repo `blog_drafts/queue/`, ARB testing-requirements page, sales@ + carb@ calendars.

## Volume 2 vs Volume 4

- VOLUME_2: 0 Drive title hits. Already disposed. Do not recreate. Freeze `NorCal_CRM_Gpt Master` and `NorCal_Master_CRM_Complete`.
- VOLUME_4_LIVE `1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t` is the file hub. List from sales@ is empty = TAP 3 share-gap.
- EGGERCT packet already on sales@ (Sep 8–9 stack). Grok owns the single 09-15 lock card. This file does not mint another.
- Content source of truth remains GitHub `blog_drafts/`.

## Live HTTP 12:15 PT

| Item | 06:30 claim | 12:15 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** |
| `/blog` portal | 64 + Harvest NEW card | **63 articles live. No Harvest card. No NEW flag. No harvest/stockton-construction/freight href.** |
| `/blog/stockton-construction-concrete-clean-truck-check` | 404 | **still 404** |
| `/blog/freight-stockton-tracy-mobile-carb` | queue date today | **404. `publish_date: 2026-09-15`. `owner_approved: NO`.** |
| `/blog/construction-sacramento-yard-carb` | unpublished | unpublished |
| `/blog/clean-truck-check-owner-operators-one-truck` | unpublished | unpublished |
| Law vs ARB page | match | **match. No full rewrite.** |

## Law (do not print +17w on public pages)

https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Most HD diesel: semi-annual (2× / year) now through September 2027.
- Qualifying agricultural vehicles: 1× / year. Not exempt.
- CA-registered recreational / emergency motorhomes: 1× / year.
- Beginning October 2027: OBD-equipped vehicles 4× / year. Opacity path stays semi-annual. Ag + those motorhomes stay annual.
- Passing results may be submitted up to 90 days before the CTC-VIS deadline.
- CTC-VIS is the VIN deadline. +17w / 119d is ops only.

## Mandate-gap line (blog + shop-mail spine)

CARB wrote Clean Truck Check and the CTC-VIS portal. They did not staff last-mile testers in the yard. That is the product sentence.

## Unpublished queue (bodies ready, `owner_approved: NO`)

| Pri | File | URL after approve | Phrase |
|---|---|---|---|
| P0 | `blog_drafts/queue/harvest-season-clean-truck-check-ag-haul.md` | `/blog/harvest-season-clean-truck-check-ag-haul` | `approve harvest-ag-haul` |
| P1 | `blog_drafts/queue/stockton-construction-concrete.md` | `/blog/stockton-construction-concrete-clean-truck-check` | `approve stockton-construction` |
| P1 | `blog_drafts/queue/freight-stockton-tracy.md` | `/blog/freight-stockton-tracy-mobile-carb` | `approve freight-stockton` |
| P1 | `blog_drafts/queue/construction-sacramento.md` | `/blog/construction-sacramento-yard-carb` | `approve construction-sacramento` |
| P1 | `blog_drafts/queue/owner-operators-one-truck.md` | `/blog/clean-truck-check-owner-operators-one-truck` | `approve owner-operator` |
| P2 | `blog_drafts/queue/bay-area-jobsite.md` | `/blog/bay-area-jobsite` | `approve bay-area-jobsite` |
| P3 | `blog_drafts/queue/wine-napa-sonoma.md` | `/blog/wine-napa-sonoma` | `approve wine-napa` |
| P3 | `blog_drafts/queue/ag-central-valley-porterville.md` | `/blog/ag-central-valley-porterville` | `approve ag-porterville` |
| HOLD | `blog_drafts/2026-2027-ctc-fleet-readiness.md` | `/blog/2026-2027-ctc-fleet-readiness` | `approve fleet-readiness` |

Queue bodies already carry internal links to sister location pages (`/stockton-clean-truck-check`, `/agricultural-vehicles-clean-truck-check`, `/areas`, `/clean-truck-check-lodi`, Porterville/Mojave, OBD vs OVI, 2026 deadlines). Do not add `/service-area-san-joaquin-county-mobile-testing` or `/east-bay-mobile-carb-testing` until $250 / 415 leaks are confirmed gone.

Already live — do not republish:
- `/blog/craft-so-good-they-copy-us-hotdog-clipboard`
- `/blog/fleets-ovi-obd-porterville-mojave`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/how-mobile-carb-testing-works`
- `/blog/2026-carb-testing-deadlines`
- `/blog/carb-clean-truck-check` — stale frequency. Hold.

## Stale live pages (HOLD rewrite until owner phrase)

| URL | Defect |
|---|---|
| `/blog/carb-clean-truck-check` | Frequency still “at least once per year.” Official: most HD is semi-annual. |
| `/blog/2026-carb-testing-deadlines` | 2× line correct. Missing October 2027 4× OBD line. |
| Homepage review count | Site 33. GBP panel 34. Point href at `https://www.google.com/maps?cid=16019693078134296096`. |
| `/pricing` | Still labels OBD “Most thorough.” |
| `/contact` corridor | Hides Sacramento and Stockton. |

## Price / NAP lock

**OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · sales@norcalcarbmobile.com · /contact**

Full Care landers: **+$40 / year**. Do not print $80 or $250.

carb@ event bodies for CandA (9/16) and Overhead Door Stockton (9/18) still print OVI $250. Ops copy should match the public lock.

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates. Wrangler is Bryan GO only.

Order:
1. `approve harvest-ag-haul`
2. `approve stockton-construction`
3. `approve freight-stockton` — queue date is today
4. `approve construction-sacramento`
5. `approve owner-operator`

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

**Freight / Tracy GBP (queue date today)**

Clean Truck Check Tracy CA and Stockton freight yards. Mobile OBD $75 · OVI $199 at the yard on the 99 / I-5 loop — Tracy, Stockton, Lathrop, Lodi.

Most highway units stay twice a year in 2026. CTC-VIS is the deadline.

Book: norcalcarbmobile.com/contact · (916) 890-4427

## Calendar / contacts lock (ops, not public copy)

- WRITE calendars: sales@ (Reg Leads) · Smoke Testing Appointments · Transferred from mike@ · carb@ (field +17w target).
- admin@mobilecarbsmoketest.com “NorCal Schedule and Tracking” = FREEBUSY. TAP 1 still open.
- Laura / fsu9913 = books ROLE. Guest on +17w only. Named Laura calendar not connected.
- Contacts API = none. People = Holy Grail + CONTACTS-MASTER.json (182 / 131 phones).
- The Book = Gumption VIN/test/Stripe. Do not build CRM #6.
- Dec 2025 incoming 11 SMS = PARK until a test exists. Only VIN on that list: TS&L Seed `1HTMMAAM0CH435746`.
- +17w already on carb@ next 14 days — do not mint seconds: CandA 9/16 · RDO 9/17 · Peri + Overhead Door 9/18 · UC510 9/19 · JG Tree + Morrow + TS&L 9/22 · JMB 98A + Napa Isuzu 9/23 (already doubled).
- Imperial Mattress paid this morning. +17w 2027-01-11 unplanted until PASS spoken.
- Tuffgrass in window now. No +17w until PASS.
- Olmar $150 paid — need test date. Do not guess.

## What Blog Writer will not do

- Flip owner_approved
- Wrangler deploy
- Auto-post GBP / Facebook / X
- Mint 254 +17w from dirty Holy Grail
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
- Write 10 new city blogs
- Clone EGGERCT / Volume 4 calendar cards
