# Blog Writer handoff — 2026-09-12 16:20 PT

Technical. No live HTML this session. Owner gate unchanged. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social.

Recheck vs 2026-09-12 09:20 handoff. Sources: live HTTP + repo tree + CARB official testing-requirements page + carb@ RETEST query.

## Recheck 2026-09-12 16:20 PT

| Item | 09:20 claim | 16:20 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** |
| `/blog/stockton-construction-concrete-clean-truck-check` | 404 | **still 404** |
| `/blog/construction-sacramento-yard-carb` | 404 | **still 404** |
| `/blog/clean-truck-check-owner-operators-one-truck` | unpublished | **404 / not shipped** |
| `/blog/how-to-read-your-carb-clean-truck-check-pass-fail-report` | calendar 09-15 editorial | **404 — no draft in blog_drafts/** |
| `/blog` portal | Harvest card NEW | **card still live, article still 404 — broken internal** |
| `site/blog/*.html` queue posts | 6 live HTML files | **same 6** |
| Drive unpublished blog docs | none titled blog | **still none on this connector** |
| VOLUME_2 | disposed | **0 title hits. Do not recreate.** |
| VOLUME_4_LIVE | live | folder ID 404 from sales@ Drive. Do not clone Volume 4 cards. |
| carb@ today | Heritage 17:30 | **confirmed** 986 Kaiser Rd Napa OVI. Series qbg12mo60tpnje66imgb71gpqk planted. Do not mint a second +17w. |

## Law recheck (no rewrite needed)

Official page still matches the harvest draft:
https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Most vehicles: semi-annual (2×) in 2026 through September 2027.
- Qualifying agricultural vehicles: annual. Not exempt.
- CA-registered recreational / emergency motorhomes: annual.
- Beginning October 2027: OBD-equipped vehicles 4× per year. Opacity path stays semi-annual. Ag + those motorhomes stay annual.
- CTC-VIS is the VIN deadline. Do not print +17w on public pages. +17w is ops only.

## Mission lock

- WRITE calendar = carb@norcalcarbmobile.com
- People = Holy Grail (sales@ Drive returns 404 on that sheet ID)
- Files = VOLUME_4_LIVE (sales@ Drive returns 404 on that folder ID)
- admin@ = field twin, FREEBUSY until ACL flip
- sales@ = archive + ops cards
- Laura / fsu9913 = books ROLE, guest on +17w only
- Volume 2 disposed
- No CRM #6. The Book = Gumption VIN ledger.
- Dec 2025 incoming 11 SMS = PARK

## Unpublished queue (bodies already SEO + 2026 law + lock prices)

No rewrite required this session.

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
| NO FILE | pass/fail report editorial | `/blog/how-to-read-your-carb-clean-truck-check-pass-fail-report` | do not invent a body this session |

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
Do not add `/service-area-san-joaquin-county-mobile-testing` to new posts until the $250 leak is gone (301 to /areas already planned).

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates. Do not deploy until AutoRepair + San Diego County are cut from schema.

Order:
1. `approve harvest-ag-haul` — kills the broken NEW card 404
2. `approve stockton-construction` — Blog Day 1 concrete / Stockton satellite
3. `approve construction-sacramento`
4. `approve owner-operator`

## Social handoff (owner paste only)

Channels: GBP https://share.google/CUg6TEK1p3eO34S9G · Facebook https://www.facebook.com/carbcleantruckcheck/ · X last public Nov 2025

Packs on disk:
- `content/approvals/harvest-ag-haul-pack.md`
- `content/approvals/stockton-construction-pack.md`
- `content/approvals/construction-sacramento-pack.md`
- `content/approvals/owner-operator-pack.md`

Do not auto-post. After live HTML, append the public URL to the matching pack and paste.

## Calendar / contacts note for this task (not a Volume 4 clone)

+17w is live on known jobs. Coverage is NOT 254/254. Do not fire Tests_Completed_First. Ag + CA rec/emergency MH = annual / +300d, not +17w.

Planted near-term (do not mint seconds): Heritage series tonight 17:30 · CandA 9/16 · RDO 9/17 · Peri 9/18 · UC510 9/19 · JG Tree / Morrow 9/22 · TS&L Seed Woodland 9/22 (OVI $199, VIN 1HTMMAAM0CH435746) · JMB 9/23 · Concretum / Aron 9/26 · S&L 11/30.

TS&L is both a Dec 2025 incoming SMS lead AND a planted retest. That is a people-layer match, not a new fleet_clients row.

## What Blog Writer will not do

- Flip owner_approved
- Wrangler deploy
- Auto-post GBP / Facebook / X
- Mint 254 +17w from dirty Holy Grail
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
- Write 10 new city blogs
- Invent a pass/fail-report draft for the 09-15 calendar title
