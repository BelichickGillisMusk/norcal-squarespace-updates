# Blog Writer handoff — 2026-09-15 08:15 PT

Technical. No live HTML this session. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social. Do not clone a Volume 4 / EGGERCT calendar card.

Delta vs 06:30 PT handoff in this repo.

## Volume 2 vs Volume 4 — dispose is already done

- VOLUME_2: 0 Drive title hits. Already disposed. Do not recreate. Freeze historical CRM sheets (`NorCal_CRM_Gpt Master`, `NorCal_Master_CRM_Complete`).
- VOLUME_4_LIVE `1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t` is the file hub. List from sales@ is empty = share-gap.
- CTC-EXPORTS `1V54E1Qkptj7RNBMzqcaGxEj5WC93CHAs` still empty. Mass +17w GATED.
- EGGERCT = Volume 4 execution packet already on carb@. Stop minting more cards.
- Content source of truth = GitHub `blog_drafts/`.
- Drive label added 08:15: `07 BLOGS-UNPUBLISHED` under REVIEW Jan-Jul 2026 → https://drive.google.com/drive/folders/16J9pzI3H3EmvuugDQU9l9kJThlN_yRV9
- Drive drop `NORCAL-BLOG-SEO-PUSH-2026-09-14` `1Cv4hWKMklxjJYJjpY3QcDUlhytU6aeOc` still empty. Unpublished bodies live in this repo, not Drive docs titled blog.

## Live HTTP 08:15 PT

| URL | Status |
|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | **404** |
| `/blog/stockton-construction-concrete-clean-truck-check` | **404** |
| `/blog/freight-stockton-tracy-mobile-carb` | **404** (queue date is today) |
| `/blog` portal | **63 articles.** Harvest NEW card not on current portal scrape. Do not re-add a card until HTML ships. |
| `/stockton-clean-truck-check` | live. Price lock $75 / $199 / $99 / $229. Full Care +$40. No $250 / $79. |
| `/agricultural-vehicles-clean-truck-check` | treat as sister; confirm host path before linking as harvest sister. |
| `/blog/carb-clean-truck-check` | still stale frequency (“at least once per year”). HOLD rewrite. |
| `/blog/2026-carb-testing-deadlines` | 2× correct. Missing Oct 2027 4× OBD line. HOLD. |

## Law (do not print +17w on public pages)

https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Most HD diesel: **semi-annual (2× / year)** now through September 2027.
- Qualifying agricultural vehicles: **1× / year**. Not exempt.
- CA-registered recreational / emergency motorhomes: **1× / year**.
- Beginning October 2027: OBD-equipped vehicles **4× / year**. Opacity path stays semi-annual. Ag + those motorhomes stay annual.
- Passing results may be submitted **up to 90 days before** the CTC-VIS deadline.
- CTC-VIS is the VIN deadline. +17w / 119d is ops only.

## Queue — bodies ready, `owner_approved: NO`

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

This session edit: freight draft no longer deep-links `/service-area-san-joaquin-county-mobile-testing`. Uses `/stockton-clean-truck-check` + `/areas` + `/clean-truck-check-lodi`.

Editorial calendar card today (“How to Read Your CARB Clean Truck Check Pass/Fail Report”) is a new topic. Do not write it this session. Queue P0–P1 first.

## Price / NAP lock

**OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · sales@norcalcarbmobile.com · /contact**

Full Care landers: **+$40 / year**. Do not print $80 or $250.

## Mandate-gap line

CARB wrote Clean Truck Check and the CTC-VIS portal. They did not staff last-mile testers in the yard.

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy`. Wrangler is Bryan GO only.

Order: harvest-ag-haul → stockton-construction → freight-stockton → construction-sacramento → owner-operator.

## Social handoff (owner paste only)

Packs:
- `content/approvals/harvest-ag-haul-pack.md`
- `content/approvals/stockton-construction-pack.md`
- `content/approvals/freight-stockton-pack.md` (added this session)
- `content/approvals/construction-sacramento-pack.md`
- `content/approvals/owner-operator-pack.md`

GBP https://share.google/CUg6TEK1p3eO34S9G · Facebook https://www.facebook.com/carbcleantruckcheck/ · X HOLD.

## Calendar / contacts (ops, not public copy)

- WRITE = carb@norcalcarbmobile.com
- admin@mobilecarbsmoketest.com “NorCal Schedule and Tracking” = FREEBUSY from sales@. TAP ACL.
- sales@ = this connector primary. Share carb@ in. Do not clone events.
- Laura / fsu9913 = books ROLE. Not a fourth twin calendar.
- Contacts API = none. People = Holy Grail / CONTACTS-MASTER.json. The Book = Gumption VIN/test/Stripe. Do not build CRM #6.
- +17w is a sales reminder. CTC-VIS is the legal deadline. Mass mint GATED until CTC-VIS IF530523 lands in CTC-EXPORTS and owner replies INGEST.
- Dec 2025 incoming 11 SMS = PARK. Do not stamp retest from first_seen.
- Today field: La Grande 2 OBD $150 — plant +17w only after PASS spoken (2027-01-11). Tuffgrass Penn Valley 11:45.

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
