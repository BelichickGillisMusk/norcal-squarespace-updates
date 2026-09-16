# Blog Writer handoff — 2026-09-15 19:10 PT

Technical. Recheck vs 15:20 PT handoff. No live HTML this session. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social. Do not clone EGGERCT / Volume 4 calendar cards.

Sources this pass: live HTTP 19:00–19:10 PT, repo `blog_drafts/queue/`, open PR 91 (draft), norcal Drive folder `18zt88Kp16nU62NpDG_e2OfLEh5X9IFUP`, ARB testing-requirements page, sales@ + norcal calendar lists, STC inventory 19:06 PT.

## Do not merge PR 91

https://github.com/BelichickGillisMusk/norcal-squarespace-updates/pull/91

State: **open, draft, last touch 2026-09-13 19:00Z.** Body says “Do not merge.” It ships the **Sloane Drive drafts**, not the queue MD.

PR 91 slugs vs live 19:10 PT:

| PR 91 URL | Live |
|---|---|
| `/blog/busy-corridor-maple-syrup-clipboard-clean-truck-check` | **404** |
| `/clean-truck-check-blog/how-to-read-your-carb-clean-truck-check-pass-fail-report` | **301 → /blog** |
| `/clean-truck-check-blog/harvest-season-carb-compliance-central-valley-ag-fleets` | unpublished / 301-class |
| `/clean-truck-check-blog/missed-carb-testing-deadline-california` | unpublished |
| `/clean-truck-check-blog/clean-truck-check-owner-operators-california` | unpublished |
| `/clean-truck-check-blog/def-dpf-problems-fail-smoke-opacity-test` | unpublished |

PR 91 defects (why HOLD):
- DEF/DPF + harvest Drive drafts print **PSIP 40/55** opacity. Official HD I/M cutpoints are **13 CCR §2196.6: 5 / 20 / 30 / 40**. Queue pass/fail export already uses 5/20/30/40. Do not ship 40/55 as current law.
- Harvest Drive draft (`1x6RKDw-u1fxaQVcOXYHei3OkIwYY-YP5EBlCfCUYha4`) is the 40/55 version. Queue file `harvest-season-clean-truck-check-ag-haul.md` is the 2026 cadence split. Different slug. Different law.
- Missed-deadline + owner-operator Drive drafts were parked for San Diego service claims. PR 91 says SD stripped; still not owner-approved.
- 9/13 weekday schedule (Mon busy-corridor / Tue pass-fail) is **not** the 9/10 queue schedule. Queue wins.

## Volume 2 vs Volume 4

- VOLUME_2: 0 Drive title hits. Disposed. Do not recreate. Freeze `NorCal_CRM_Gpt Master` and `NorCal_Master_CRM_Complete`.
- VOLUME_4_LIVE `1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t` is the file hub. sales@ list_folder empty = TAP 3 share-gap (STC).
- EGGERCT = Volume 4 execution packet already on carb@. User “this goes into eggerct NOW” is ops lock, not `approve harvest-ag-haul`.
- Content source of truth remains GitHub `blog_drafts/`.
- Silverback folders `07 BLOGS-UNPUBLISHED` `16J9pzI3H3EmvuugDQU9l9kJThlN_yRV9` and `NORCAL-BLOG-SEO-PUSH-2026-09-14` `1Cv4hWKMklxjJYJjpY3QcDUlhytU6aeOc` list empty from this connector.
- Real unpublished docs live on **admin@mobilecarbsmoketest.com** Drive parent `18zt88Kp16nU62NpDG_e2OfLEh5X9IFUP`.

## Live HTTP 19:10 PT

| URL | Status |
|---|---|
| `/blog` portal | 200. 63 articles. No harvest / stockton-construction / freight-tracy card that resolves. |
| `/blog/harvest-season-clean-truck-check-ag-haul` | **404** |
| `/blog/stockton-construction-concrete-clean-truck-check` | **404** |
| `/blog/freight-stockton-tracy-mobile-carb` | **404** |
| `/blog/busy-corridor-maple-syrup-clipboard-clean-truck-check` | **404** |
| `/blog/2026-carb-testing-deadlines` | live |
| `/blog/obd-vs-ovi-clean-truck-check-fleets` | live |
| `/blog/how-mobile-carb-testing-works` | live |
| `/blog/fleets-ovi-obd-porterville-mojave` | live — do not edit |
| `/stockton-clean-truck-check` | **200**. Price lock $75 / $199 / $99 / $229 / Full Care +$40. No blog links on page. |
| `/clean-truck-check-lodi` | **200**. Same lock. |
| `/areas` | **200**. Sac / Valley / Butte / Bay / Napa-Sonoma / Stockton / Central Valley. |
| `/agricultural-vehicles-clean-truck-check` | resolved to `/services#agricultural` this pass — do not assume a dedicated lander until rechecked after deploy |
| `/service-area-san-joaquin-county-mobile-testing` | **do not link** — $250 / MH $300 leak host |
| `/east-bay-mobile-carb-testing` | **do not link** — 301 + price leak risk |

Correction: harvest did not ship. Freight queue date was today. Still 404. Do not tell the owner either is live.

## Law (do not print +17w on public pages)

https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Almost all vehicles: **semi-annual**. Qualifying agricultural vehicles: **annual**. CA-registered recreational / emergency motorhomes: **annual**.
- Beginning **October 2027**: OBD-equipped vehicles **4× / year**. Does not apply to Non-Commercial Motorhomes or Agricultural vehicles; those stay annual. Opacity path stays semi-annual.
- Passing results may be submitted **up to 90 days before** the CTC-VIS deadline.
- CTC-VIS is the VIN deadline. +17w / 119d is **ops only** (inside the 90-day early window).
- Opacity for public copy: current HD I/M **5 / 20 / 30 / 40** (§2196.6), not PSIP 40/55 (§2193).

Mandate-gap line: CARB wrote Clean Truck Check and CTC-VIS. They did not staff last-mile testers in the yard.

## Unpublished queue — ship these, not PR 91

Bodies ready. `owner_approved: NO`.

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

Internal links already in queue bodies (keep these; do not add leak URLs):
- `/stockton-clean-truck-check`
- `/clean-truck-check-lodi`
- `/areas`
- `/sacramento-carb-testing`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/2026-carb-testing-deadlines`
- `/blog/fleets-ovi-obd-porterville-mojave`
- `/clean-truck-check-blog/ca-ag-vehicles-clean-truck-testing-info`
- `/clean-truck-check-blog/how-norcal-carb-mobile-keeps-mitchell-concrete-moving-strong-in-rancho-cordova`
- `/clean-truck-check-blog/when-every-minute-counts-how-norcal-carb-mobile-saved-banwait-truckings-deadline`

## Stale live pages (HOLD rewrite until owner phrase)

| URL | Defect |
|---|---|
| `/blog/carb-clean-truck-check` | Frequency still “at least once per year.” Official: most HD is semi-annual. |
| `/blog/2026-carb-testing-deadlines` | 2× line correct. Missing October 2027 4× OBD line. |
| `/clean-truck-check-blog/napa-carb-clean-truck` | Prints OVI $250 / MH $300. Lock is $199 / $99/$229. |
| Homepage review count | Site 33. GBP panel 34. Href `https://www.google.com/maps?cid=16019693078134296096`. |
| `/pricing` | Still labels OBD “Most thorough.” |
| `/contact` corridor | Hides Sacramento and Stockton. |

## Drive drafts — archive, do not ship

Norcal admin folder `18zt88Kp16nU62NpDG_e2OfLEh5X9IFUP`:

- `[DRAFT] How to Read Pass/Fail` ×2 + `SEO-READY-2026-09-15-pass-fail-report.md` — keep as research; ship only after opacity table is 5/20/30/40 and owner phrase exists.
- `[DRAFT] Harvest-Season CARB Compliance` 2026-09-01 — **40/55 opacity. Do not ship.**
- `[DRAFT] Missed Deadline` Aug 15 — parked SD + invented address.
- `[DRAFT] Owner-Operators` Aug 1 — parked SD.
- `[DRAFT] DEF & DPF` Jul 15 ×2 — 40/55 vs 5/20/30 conflict.
- `[REWRITE] Legacy ×3` Jul 4 — not reviewed this turn.
- `[DRAFT] 2026 Deadlines` Jul 1 — already live. Do not republish.
- `NORCAL-BLOG-SCHEDULE-2026-09-13` + `BLOG-BACKLOG-BOARD-2026-09-13` — superseded by queue README 2026-09-10 + this handoff.

## Price / NAP lock

**OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · sales@norcalcarbmobile.com · /contact**

Full Care landers: **+$40 / year**. Do not print $80 or $250.

## Ship path after one owner phrase

One post per deploy. Convert queue MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates. Wrangler is Bryan GO only. Close or rewrite PR 91 before any of those six Sloane slugs go live.

Order:
1. `approve harvest-ag-haul`
2. `approve stockton-construction` — Blog Day 1 concrete / Stockton satellite
3. `approve freight-stockton` — queue date was 2026-09-15
4. `approve construction-sacramento`
5. `approve owner-operator`

## Social handoff (owner paste only)

Channels: GBP https://share.google/CUg6TEK1p3eO34S9G · Facebook https://www.facebook.com/carbcleantruckcheck/ · X last public Nov 2025

Do not auto-post. After live HTML, append the public URL to the matching pack and paste.

Packs: `harvest-ag-haul-pack.md` · `stockton-construction-pack.md` · `freight-stockton-pack.md` · `construction-sacramento-pack.md` · `owner-operator-pack.md`

### Harvest GBP

Harvest season Clean Truck Check: qualifying ag stays annual — not exempt. The haul truck that takes the crop to the first point of processing is usually still twice a year.

We test at the farm, packing shed, or staging lot in Woodland, Merced, Stockton, and Porterville.

OBD $75 · OVI $199 · we come to the yard.

Book: norcalcarbmobile.com/contact · (916) 890-4427

### Stockton construction GBP

Construction and concrete fleets in Stockton, Lodi, Tracy, Lathrop, and Manteca — we test at the yard so the mixer does not sit in a station line.

Clean Truck Check is still twice a year in 2026 for most work trucks. OBD $75. OVI $199. We come to the staging lot.

Book: norcalcarbmobile.com/contact · (916) 890-4427

### Freight / Tracy GBP

Clean Truck Check Tracy CA and Stockton freight yards. Mobile OBD $75 · OVI $199 at the yard on the 99 / I-5 loop — Tracy, Stockton, Lathrop, Lodi.

Most highway units stay twice a year in 2026. CTC-VIS is the deadline.

Book: norcalcarbmobile.com/contact · (916) 890-4427

## Calendar / contacts lock (ops, not public copy)

STC 19:06 PT — calendars are **not** the same. Share three objects. Do not clone events onto four calendars.

- WRITE calendar = carb@norcalcarbmobile.com (create-from-sales@ = 403 until ACL)
- People = Holy Grail (404 from sales@ = TAP 3)
- Files = VOLUME_4_LIVE (list empty from sales@ = TAP 3)
- admin@ “NorCal Schedule and Tracking” = FREEBUSY. TAP 1 open.
- Laura / fsu9913 = books ROLE. Guest on +17w only. Not a 4th twin.
- Contacts API = none. People = Holy Grail + CONTACTS-MASTER.json (182 / 131 phones).
- The Book = Gumption VIN/test/Stripe. Do not build CRM #6.
- Dec 2025 incoming 11 SMS = PARK until a test exists. Only VIN: TS&L Seed `1HTMMAAM0CH435746` already on carb@ 9/22.
- Every completed test with a real date + VIN/company gets +17w / 4-month RETEST on carb@. Ag + CA rec/emergency MH = annual / +300d, not +17w.
- Do not mint 254 from dirty Holy Grail. Do not stamp retest from first_seen.
- Do not print +17w as the public legal interval.

## What Blog Writer will not do

- Flip owner_approved
- Merge or wrangler-deploy PR 91
- Auto-post GBP / Facebook / X
- Mint 254 +17w from dirty Holy Grail
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
- Ship 40/55 opacity as current HD I/M law
- Write 10 new city blogs
- Clone EGGERCT / Volume 4 calendar cards
