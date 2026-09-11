# Blog Writer handoff — 2026-09-10 13:20 PT

Technical. No live HTML this session. Owner gate unchanged. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social.

## Recheck vs 2026-09-09 17:16 handoff

| Item | 09-09 claim | 09-10 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** |
| Portal lists harvest as NEW | yes | **not in first 15 cards**. 63 listed. Do not treat as live. |
| `/stockton-clean-truck-check` | $75/$199 lock | **lock. Full Care +$40** |
| `/clean-truck-check-lodi` | $75/$199 lock | **lock. Full Care +$40** |
| `/sacramento-carb-testing` | lock | **lock. Full Care +$40** |
| `/service-area-sacramento-carb-testing` | leak watch | **301 → /sacramento-carb-testing** |
| `/service-area-san-joaquin-county-mobile-testing` | leak watch | **301 → /areas** |
| `/east-bay-mobile-carb-testing` | leak watch | **301 → /areas** |
| `/blog/carb-clean-truck-check` | "at least once per year" | **still wrong.** Official: most HD 2x now. Patch after fleet-readiness. |
| `/blog/2026-carb-testing-deadlines` | 2x/year | live 2x. Missing Oct 2027 4x OBD line. |
| Drive `07_BLOG_PUSH` | empty | empty |
| `CONTENT-TO-SITE` drop folders | empty | empty |
| VOLUME_2 | disposed | **0 Drive hits. Do not recreate.** |
| VOLUME_4_LIVE / CTC-EXPORTS | empty | **still empty** |
| carb@ calendar | write target | **readable this connector.** RETEST series already exist. Do not mint 254. |

## Mission lock (same board)

- WRITE calendar = carb@norcalcarbmobile.com
- People = Holy Grail https://docs.google.com/spreadsheets/d/1B42rvkaetZpciBCdMU15mj6GHKy7-fIO6ihZnicm51s
- Files = VOLUME_4_LIVE https://drive.google.com/drive/folders/1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t
- admin@mobilecarbsmoketest.com calendar = field twin, FREEBUSY until ACL flip
- sales@ = archive + ops cards
- Laura / fsu9913 = books ROLE, guest on +17w only
- Volume 2 already disposed. Do not hunt or recreate.
- Do not build CRM #6. The Book = Gumption VIN ledger.
- +17w is ops reminder. CTC-VIS is the legal deadline. Do not print +17w as the public legal interval.
- Dec 2025 incoming SMS 11 = PARK. Only VIN already on calendar: TS&L Seed 1HTMMAAM0CH435746, Woodland, 9/22 OVI.

## Live CMS

- Hub: https://norcalcarbmobile.com (Cloudflare Worker, repo `BelichickGillisMusk/norcal-squarespace-updates`)
- Blog portal: https://norcalcarbmobile.com/blog — 63 listed
- Production path: Markdown in `blog_drafts/` → owner phrase → HTML + sitemap. Not Squarespace live-publish.
- Drive drop folders empty: `07_BLOG_PUSH` `1CfhSBr5SD_MMcCSsmEq1GihWciAEkCwy`, `CONTENT-TO-SITE` `1xfVizYTYlNi4UPqS8k_fwK3THo8k7DzI`

Already live — do not rewrite / do not republish:
- `/blog/craft-so-good-they-copy-us-hotdog-clipboard`
- `/blog/fleets-ovi-obd-porterville-mojave`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/how-mobile-carb-testing-works`
- `/blog/2026-carb-testing-deadlines` (2x language OK; add Oct 2027 only with fleet-readiness)
- `/blog/carb-clean-truck-check` — **frequency paragraph stale.** Hold rewrite until owner phrase.

## Unpublished queue (rewritten, SEO-linked, owner_approved: NO)

| Priority | File | Intended URL | Phrase | Notes |
|---|---|---|---|---|
| P0 | `blog_drafts/queue/harvest-season-clean-truck-check-ag-haul.md` | `/blog/harvest-season-clean-truck-check-ag-haul` | `approve harvest-ag-haul` | URL 404. Body ready. Law matches CARB page. |
| P1 | `blog_drafts/queue/stockton-construction-concrete.md` | `/blog/stockton-construction-concrete-clean-truck-check` | `approve stockton-construction` | Blog Day 1 / concrete. Hits GSC zero-click query `clean truck check tracy ca` (174 impr). |
| P1 | `blog_drafts/queue/construction-sacramento.md` | `/blog/construction-sacramento-yard-carb` | `approve construction-sacramento` | Sac / Granite Bay / Mitchell pin. |
| P1 | `blog_drafts/queue/owner-operators-one-truck.md` | `/blog/clean-truck-check-owner-operators-one-truck` | `approve owner-operator` | Hits GSC `clean truck check near me` (179 impr, 0 click). |
| P2 | `blog_drafts/queue/freight-stockton-tracy.md` | `/blog/freight-stockton-tracy-mobile-carb` | `approve freight-stockton` | dated 2026-09-15 |
| P2 | `blog_drafts/queue/bay-area-jobsite.md` | `/blog/bay-area-jobsite` | `approve bay-area-jobsite` | dated 2026-09-22. Pins: Oliver's San Leandro, Orozco Sunnyvale, Peninsula Pro / All Fence RWC. |
| P3 | `blog_drafts/queue/wine-napa-sonoma.md` | `/blog/wine-napa-sonoma` | `approve wine-napa` | dated 2026-09-29 |
| P3 | `blog_drafts/queue/ag-central-valley-porterville.md` | `/blog/ag-central-valley-porterville` | `approve ag-porterville` | dated 2026-10-06 |
| HOLD | `blog_drafts/2026-2027-ctc-fleet-readiness.md` | `/blog/2026-2027-ctc-fleet-readiness` | `approve fleet-readiness` | Full Care $80 in draft vs landers +$40. Do not invent a third number. |

Queue README price-leak list was stale. Corrected 2026-09-10: Stockton / Lodi / Sac landers now match lock. Old service-area URLs 301 to /areas or Sac lander.

## Law lock (rechecked CARB 2026-09-10)

Source: https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

| Rule | Now through Sep 2027 | Beginning Oct 2027 |
|---|---|---|
| Most HD >14k GVWR on CA roads | 2 tests / year | OBD → 4 / year. Opacity-path stays 2x |
| Qualifying ag | 1 / year | stays 1 / year |
| Qualifying CA rec / emergency MH | 1 / year | stays 1 / year |
| 90-day window | submit passing test up to 90 days before CTC-VIS deadline | same |

Do not print +17 weeks on public pages. That is the ops reminder only.

## Price / NAP lock

Lock: **OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · /contact**

Landers matching lock this morning: `/stockton-clean-truck-check`, `/clean-truck-check-lodi`, `/sacramento-carb-testing`, `/pricing`, `/services`.

Full Care: landers print **+$40 / year**. Fleet-readiness draft still **$80**. Do not print a third number. Do not ship fleet-readiness until owner locks $40 or $80.

Hyphen domain carb-clean-truck-check.com + 415-900-8563: expire clock was Wed Sep 9. Confirm dead before next session.

## Incoming SMS 11 — location pins only, PARK as leads

Already in CONTACTS-MASTER. None match CLIENTS-YTD paid rows except TS&L Seed (calendar VIN). Do not invent fleets.

| Lead | Pin | Future link |
|---|---|---|
| Cal Roots LLC | 4641 Gomes Rd, Modesto 95357 | stockton-construction |
| Faithful Way Transport | 3395 Grady Dr, Lathrop | freight-stockton-tracy |
| Oliver's Trucking | 1750 Adams Ave, San Leandro · 8–9 OBD | bay-area-jobsite |
| Orozco Landscapes | 565 S Eden Ave, Sunnyvale | bay-area-jobsite |
| Peninsula Pro Landscape | 229 Santa Clara Ave, Redwood City | bay-area-jobsite (All Fence same city, 1900 Spring St, done 9/5) |
| Esquibel Grading | 4275 CA-1, Pacifica | bay-area-jobsite |
| Seven Sparks / TS&L Seed | CA-16 / Woodland | harvest / ag-haul. VIN 1HTMMAAM0CH435746 on carb@ 9/22 |
| West Coast Pipeline | 2725 N Beale Rd | phone missing — do not text |
| Yaye Trucking | 11050 Wilton Rd | harvest / valley |
| Western Water Features | 2057 Sweet Valley Rd | sacramento construction |

## GSC lever (Donger 2026-09-08, range 8/27–9/02)

6 clicks / 908 impressions / CTR 0.7% / pos 36.3.
Zero-click opportunities the queue already targets:
- `clean truck check near me` — 179 impr / 0 click → owner-operator + contact
- `clean truck check tracy ca` — 174 impr / 0 click → stockton-construction + freight-stockton

Do not ship ten city blogs to chase this. Reviews 33→40 via CID is still the traffic lever. CID: https://maps.google.com/?cid=16019693078134296096

## Social handoff (owner paste only)

Channels:
- GBP: https://share.google/CUg6TEK1p3eO34S9G
- Facebook: https://www.facebook.com/carbcleantruckcheck/
- X: last public post Nov 2025. Dead until owner pastes.

Packs on disk:
- `content/approvals/harvest-ag-haul-pack.md`
- `content/approvals/stockton-construction-pack.md`
- `content/approvals/construction-sacramento-pack.md`
- `content/approvals/owner-operator-pack.md`
- `content/approvals/fleet-readiness-pack.md`

### Harvest — paste after `approve harvest-ag-haul`

GBP:
```
Harvest season Clean Truck Check: qualifying ag stays annual — not exempt. The haul truck that takes the crop to the first point of processing is usually still twice a year.

We test at the farm, packing shed, or staging lot in Woodland, Merced, Stockton, and Porterville.

OBD $75 · OVI $199 · we come to the yard.

Book: norcalcarbmobile.com/contact · (916) 890-4427
```

Facebook:
```
Harvest does not pause for a station line. It also does not create a blanket exemption.

Qualifying agricultural vehicles stay on an annual Clean Truck Check cycle. The diesel that hauls the crop on public roads is usually still semi-annual — two tests in 2026.

Mobile OBD $75 · OVI $199 at the farm or shed in Woodland, Merced, Stockton, Porterville.

Book: norcalcarbmobile.com/contact · (916) 890-4427
```
After live: append `norcalcarbmobile.com/blog/harvest-season-clean-truck-check-ag-haul`

X:
```
Harvest CTC: ag can stay annual. Haul trucks cannot. Mobile OBD $75 · OVI $199 at the yard. Woodland / Merced / Stockton. 916-890-4427 norcalcarbmobile.com/contact
```

### Stockton construction — paste after `approve stockton-construction`

GBP:
```
Construction and concrete fleets in Stockton, Lodi, Tracy, Lathrop, and Manteca — we test at the yard so the mixer does not sit in a station line.

Clean Truck Check is still twice a year in 2026 for most work trucks. OBD $75. OVI $199. We come to the staging lot.

Book: norcalcarbmobile.com/contact · (916) 890-4427
```

Facebook:
```
Stockton construction and concrete fleets — Clean Truck Check at the yard.

A mixer in a station line is a missed pour. Most construction units over 14,000 lb still test twice in 2026. We bring OBD and OVI to Stockton, Lodi, Tracy, Lathrop, and Manteca.

OBD $75 · OVI $199 · we come to your yard.

Book: norcalcarbmobile.com/contact · (916) 890-4427
```
After live: append `norcalcarbmobile.com/blog/stockton-construction-concrete-clean-truck-check`

X:
```
Stockton / Lodi / Tracy construction fleets: Clean Truck Check is still 2x in 2026. Mobile OBD $75 · OVI $199 at the yard. 916-890-4427 norcalcarbmobile.com/contact
```

## Owner phrases that ship content

```
approve harvest-ag-haul
approve stockton-construction
approve construction-sacramento
approve owner-operator
```

Do not ship all four in one deploy.

## What Blog Writer will not do this session

- Flip owner_approved
- Wrangler deploy
- Auto-post GBP / Facebook / X
- Mint 254 +17w events from dirty Holy Grail
- Text the Dec 2025 incoming 11
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
