# Blog Writer handoff — 2026-09-12 09:20 PT

Technical. No live HTML this session. Owner gate unchanged. Agents do not flip `owner_approved`. Agents do not wrangler-deploy. Agents do not auto-post social.

Recheck vs 2026-09-11 06:50 handoff. Sources: live HTTP + repo tree + CARB official page + sales@/carb@ calendars.

## Recheck 2026-09-12

| Item | 09-11 claim | 09-12 live |
|---|---|---|
| `/blog/harvest-season-clean-truck-check-ag-haul` | 404 | **still 404** |
| `/blog/stockton-construction-concrete-clean-truck-check` | 404 | **still 404** |
| `/blog/construction-sacramento-yard-carb` | unpublished | **404** |
| `/blog/clean-truck-check-owner-operators-one-truck` | unpublished | not shipped |
| `/blog` portal | lists Harvest as NEW | **card live, article 404 — broken internal** |
| `site/blog/*.html` queue posts | 6 live HTML files | **same 6** |
| Drive unpublished blog docs | none titled blog | **only [DRAFT] AI Visibility Feb 2026** |
| VOLUME_2 | 0 hits | **disposed. Do not recreate.** |
| VOLUME_4_LIVE | live | live. Do not clone 09-08…09-12 Volume 4 cards. |
| carb@ today | Heritage 17:30 | **confirmed** 986 Kaiser Rd Napa OVI. Series already planted. |

## Mission lock

- WRITE calendar = carb@norcalcarbmobile.com
- People = Holy Grail https://docs.google.com/spreadsheets/d/1B42rvkaetZpciBCdMU15mj6GHKy7-fIO6ihZnicm51s
- Files = VOLUME_4_LIVE https://drive.google.com/drive/folders/1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t
- admin@ = field twin, FREEBUSY until ACL flip
- sales@ = archive + ops cards
- Laura / fsu9913 = books ROLE, guest on +17w only
- Volume 2 disposed
- No CRM #6. The Book = Gumption VIN ledger.
- +17w is ops reminder. CTC-VIS is the legal deadline. Do not print +17w on public pages.
- Dec 2025 incoming 11 SMS = PARK

## Unpublished queue (bodies already SEO + 2026 law + lock prices)

No rewrite required. Law matches https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

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
Stockton lander `/stockton-clean-truck-check` is live at lock prices. Phone missing on that lander scrape — add 916-890-4427 on next Worker pass.

## Ship path after one owner phrase

One post per deploy. Convert MD → `site/blog/<slug>.html`, add card on `site/blog/index.html`, sitemap, then `npx wrangler deploy` from norcal-squarespace-updates. Do not deploy until AutoRepair + San Diego County are cut from schema.

Order:
1. `approve harvest-ag-haul` — also kills the broken NEW card 404
2. `approve stockton-construction` — Blog Day 1 concrete/Stockton satellite
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

## What Blog Writer will not do

- Flip owner_approved
- Wrangler deploy
- Auto-post GBP / Facebook / X
- Mint 254 +17w from dirty Holy Grail
- Recreate Volume 2
- Build CRM #6
- Print +17w as the public legal interval
- Write 10 new city blogs
