# Blog Writer handoff — 2026-09-07 18:19 PT

Technical recon. No live HTML. No Calendar writes. Owner gate unchanged.

## Mission lock

admin / carb / sales / laura = same board, four views. Subscribe to carb@.
VOLUME_2 already gone. VOLUME_4_LIVE is the hub.
Every completed test with a real date + VIN/company gets a +17w / 4-month retest event.
Do not build CRM #6. Do not invent fleets. If data disagrees, The Book VIN wins and we all learn.

## Blockers (still true at 18:19)

- Google Calendar token: **dead**. Cannot list or write admin / carb / sales / laura.
- Google Contacts API: **not on this connector**. Android work phone remains field truth.
- CTC-EXPORTS inside VOLUME_4_LIVE: **empty** this connector. `8.15 Export TESTS` zip sits in Drive root, not ingested.
- `owner_approved` on every unpublished draft: **NO**. Agents do not flip it.

Owner clicks that unblock everything else:

1. Reconnect Calendar on this Grok connector. Reply `CALENDAR LIVE`.
2. Confirm carb@ shared Make-changes with admin@ / sales@ / laura. One write surface.
3. Drop latest CTC XLSX into VOLUME_4_LIVE/CTC-EXPORTS. Reply `INGEST`.
4. Type the approve phrases below to ship the 9/8 four-pack.

## Volume

- VOLUME_4_LIVE: https://drive.google.com/drive/folders/1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t
- VOLUME_2 folder: **not on Drive**. Dispose already complete. Do not recreate.
- Freeze (do not write): `NorCal_Master_CRM_Complete_HISTORICAL_2025`, old GPT master sheets.
- Drive `07_BLOG_PUSH` (`1CfhSBr5SD_MMcCSsmEq1GihWciAEkCwy`): empty.
- Content drop: GitHub `blog_drafts/` + `content/approvals/`.

## Unpublished blogs — rewritten, still unpublished

Mar 31 CRM task “Blog DAY 1 — Stockton satellite + Blog #1 Concrete/Construction” is file #1.

| # | File | Slug after approve | Phrase | Date |
|---|------|--------------------|--------|------|
| 1 | `blog_drafts/queue/stockton-construction-concrete.md` | `/blog/stockton-construction-concrete-clean-truck-check` | `approve stockton-construction` | 2026-09-08 |
| 2 | `blog_drafts/queue/construction-sacramento.md` | `/blog/construction-sacramento-yard-carb` | `approve construction-sacramento` | 2026-09-08 |
| 3 | `blog_drafts/queue/owner-operators-one-truck.md` | `/blog/clean-truck-check-owner-operators-one-truck` | `approve owner-operator` | 2026-09-08 |
| 4 | `blog_drafts/queue/harvest-season-clean-truck-check-ag-haul.md` | `/blog/harvest-season-clean-truck-check-ag-haul` | `approve harvest-ag-haul` | 2026-09-08 |
| 5 | `blog_drafts/queue/freight-stockton-tracy.md` | `/blog/freight-stockton-tracy-mobile-carb` | `approve freight-stockton` | 2026-09-15 |
| 6 | `blog_drafts/queue/bay-area-jobsite.md` | `/blog/bay-area-jobsite` | `approve bay-area-jobsite` | 2026-09-22 |
| 7 | `blog_drafts/queue/wine-napa-sonoma.md` | `/blog/wine-napa-sonoma` | `approve wine-napa` | 2026-09-29 |
| 8 | `blog_drafts/queue/ag-central-valley-porterville.md` | `/blog/ag-central-valley-porterville` | `approve ag-porterville` | 2026-10-06 |
| — | `blog_drafts/2026-2027-ctc-fleet-readiness.md` | after owner review | `approve fleet-readiness` | hold |

Already live (do not rewrite): Mojave/Porterville, OBD vs OVI, 2026 deadlines, 62-article portal.

Rate card locked in drafts: **OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427**.

### Price pages still wrong (fix before or with first publish)

Verified 18:19: `/stockton-clean-truck-check` now prints $75 / $199 / $99 / $229. Safe.

Still inconsistent elsewhere:

- `/service-area-sacramento-carb-testing` — title $85, body OVI $250 / MH $300
- `/service-area-san-joaquin-county-mobile-testing` — OVI $250 / MH $300
- `/east-bay-mobile-carb-testing` — OVI $250 / MH $300
- Full Care: Stockton lander $70/yr · 2026-deadlines blog $40 · fleet-readiness draft $80. Owner picks one number before that draft ships.

### Internal links already wired in Stockton #1

- `/stockton-clean-truck-check`
- `/service-area-san-joaquin-county-mobile-testing`
- `/sacramento-carb-testing`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/2026-carb-testing-deadlines`
- Mitchell Concrete, Castillo Fencing, Plaster Group F550, All Good Pallets, Banwait

## Social handoff (owner paste only — no auto-post)

Packs: `content/approvals/stockton-construction-pack.md` and sibling `*-pack.md`.

- GBP: https://share.google/CUg6TEK1p3eO34S9G
- Facebook: https://www.facebook.com/carbcleantruckcheck/
- X: last public post Nov 2025. Dead until owner pastes.

Retest SMS body (Night Watch / calendar description):

```
Hi — Bryan, NorCal CARB Mobile. Ready for next Clean Truck Check? OBD $75 · OVI $199 · we come to your yard. Reply or call 916-890-4427
```

## +17w calendar rule (for Grok when token lives)

- Write on **carb@ / NorCal Schedule and Tracking** only. admin / sales / laura subscribe.
- Formula: `retest_date = last_uploaded_test + 119 days` (17 weeks ≈ 4 months). Ops reminder, not the legal 180-day CTC-VIS deadline.
- Source: Gumption `carb_tests` with real `testId` + date. Not Holy Grail `Tests_Completed_First` (QB invoices mixed as tests). Not Dec 2025 incoming SMS.
- Title: `RETEST: {company} ({type}) +17w from {test_date}`
- Dedup VIN + due date. Annual-only (qualifying ag / CA rec MH) stay off this list.
- 482 Pass trucks past +17w (journal 8/17) is the money list after clean filter.
- RETEST-TRUE-NONCOMPLIANT 34 rows are Unassigned / no contact — match phone before planting mute events.

## Contacts (people layer)

11 incoming SMS already in CONTACTS-MASTER. West Coast Pipeline Solutions has **no phone**. Do not invent.
Holy Grail: `1B42rvkaetZpciBCdMU15mj6GHKy7-fIO6ihZnicm51s`.
Add `book_vin | book_fleet | book_match` if missing. Match order: VIN exact → phone last-10 → known fleet name.
A Plus CTC Danny $250 — do not nag.

## Accuracy

Book VIN beats Contacts name beats Calendar title. Fix the other two. Do not mint a fourth system.
