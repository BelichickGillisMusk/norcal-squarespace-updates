# Implementation manual — calendar / contacts / +17w / blog
**2026-09-07 12:06 PT** · NorCal CARB Mobile · technical

Do not build CRM #6. Do not invent VINs. Do not auto-send SMS. Do not publish HTML until an approve phrase.

## Grain (same everywhere)

| Layer | Key | Lives in | Who opens it |
|---|---|---|---|
| The Book | VIN + testId | Gumption `carb_tests` / `fleet_clients` / `carb_invoices` | Bryan after upload |
| People | phone_e164 | Holy Grail `Master_CRM_Live` + Google Contacts | Laura / Hermes |
| Schedule | event on carb@ | Google Calendar `NorCal Schedule and Tracking` | Bryan on the phone |
| Money | Stripe / cash log | `carb_invoices` + Stripe | AR board |
| Public copy | slug | GitHub `blog_drafts/` → Worker after approve | Site / GBP |

admin@ / carb@ / sales@ / laura@ are four *views* of that board. Subscribe. Do not copy four job lists.

## Volume 2 vs Volume 4

- VOLUME_4_LIVE is live: https://drive.google.com/drive/folders/1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t
  Contains CTC-EXPORTS (empty this connector), REVIEW_2026 (folder tree only), site-health notes.
- VOLUME_2 folder: **not on Drive**. Dispose is already complete. Do not recreate.
- Volume 2 pile to freeze (do not write): `NorCal_Master_CRM_Complete_HISTORICAL_2025`, `NorCal_Master_CRM_Complete.xlsx`, old GPT master sheets.
- REVIEW_2026 `07_BLOG_PUSH` and `06_CALENDAR_CONTACTS_SYNC` exist and are empty. GitHub is the content drop.

## Blocker — Calendar token

Google Calendar connector on this session: **no token**. Cannot list admin / carb / sales / laura IDs. Cannot create +17w events from here.

Owner click: reconnect Google Calendar on the connector, then reply `calendar token live`. Until that lands, +17w is a paper process only.

Expected calendars (names from prior ops, IDs unverified this session):

| Role | Expected calendar | Writes |
|---|---|---|
| carb | NorCal Schedule and Tracking / carb@ | jobs, retests, Night Watch 20:00 |
| admin | admin@norcalcarbmobile.com | Workspace / vendor only |
| sales | sales@norcalcarbmobile.com | public inbox, not a second job board |
| laura | Laura contacts view | people enrichment, no VIN invent |

Rule: one event, many subscribers. Title format for a retest:
`RETEST: {company} ({n} {OBD|OVI|MH} ${price}) — {city}`
Location = yard address. Description = last test date + testId if known + phone_e164 + “+17w from last uploaded test”.

## +17 week / 4 month machine

Cadence law (CARB page, still current):
- Most HD diesel >14k GVWR through Sep 2027 = **2x / year** = ~180 days = **+17 weeks** from last *uploaded* test.
- Qualifying ag + qualifying CA rec / emergency MH = **1x / year**. Do not put those on +17w.
- Oct 2027+ OBD-equipped = 4x. Do not start 4x events in 2026.

Source of dates: Gumption `carb_tests.testDateTime` where result is a completed test and `testId` exists.
Holy Grail `Tests_Completed_First` = 742 rows / 254 VINs as of Aug 19, **many UNKNOWN dates**. Those rows are not calendar events.

Process:

1. Export completed tests from The Book (Gumption) or a fresh CTC-VIS dump into VOLUME_4 `CTC-EXPORTS`.
2. Keep only rows with real test_date + VIN or company + test type. Drop UNKNOWN.
3. Split annual-only (ag / CA rec MH) off the +17w list.
4. Compute `retest_date = test_date + 119 days` (17 weeks). If that date is already past, title prefix `OVERDUE RETEST` and put on the next open morning, do not backdate.
5. Dedupe against existing Calendar titles for that company + week. Do not double-book.
6. Write **one** event on carb@ / NorCal Schedule. admin / sales / laura subscribe.
7. Stamp Holy Grail `book_vin` / `book_fleet` / `book_match` on the people row if phone or fleet name matches. Do not create a Gumption fleet from a cell contact.
8. Night Watch 20:00 lists due + unmatched. No second briefing sheet.

Do not mint +17w from Dec 2025 incoming SMS. If those yards tested in December 2025, the April window is already gone. Call.

Known Book VIN already overdue if not retested: Orozco Landscapes, Test 2083280, 2026-04-21 → +17w was 2026-08-18. People row exists. Calendar write waits on token + confirmation the unit was not already retested.

## Contacts enrichment (people layer only)

Incoming SMS file = 11 rows. All 11 already sit in CONTACTS-MASTER (ids 5–11+). No new people.

| Company | Phone | Pin | People status |
|---|---|---|---|
| Cal Roots LLC | (209) 485-3200 | 4641 Gomes Rd, Modesto 95357 | incoming |
| Esquibel Grading | (510) 334-2146 | 4275 CA-1, Pacifica | incoming |
| Faithful Way Transport | (209) 814-7978 | 3395 Grady Dr, Lathrop 95330 | incoming |
| Oliver's Trucking | (626) 255-6487 | 1750 Adams Ave, San Leandro 94577 | incoming · 8–9 OBD noted |
| Orozco Landscapes Inc | (408) 569-4718 | 565 S Eden Ave, Sunnyvale 94085 | incoming + Book VIN |
| Peninsula Pro Landscape | (650) 704-2779 | 229 Santa Clara Ave, Redwood City 94061 | incoming |
| Seven Sparks Transportation | (916) 718-0737 | 37899 CA-16 | incoming |
| TS&L Seed Co | (530) 666-1239 | 37331 State Hwy 16 | incoming |
| Western Water Features | (916) 899-0100 | 2057 Sweet Valley Rd | incoming |
| Yaye Trucking | (916) 216-8356 | 11050 Wilton Rd | incoming |
| West Coast Pipeline Solutions | (none) | 2725 N Beale Rd | incoming · no phone |

YTD AR parked: A Plus CTC Danny $250 — DO NOT NAG.

Enrichment order: VIN exact → phone last-10 → company exact against known fleets (JMB, B&M Builds, Castillo, Martins Asphalt, A Plus CTC, B&M). Else `book_match=none`.

## Process / time / cost

| Step | Who / tool | Hours to build | Run time | Cost | Notes |
|---|---|---|---|---|---|
| 0. Reconnect Calendar token | Owner | 0.1 | once | $0 | Blocker. No writes until live. |
| 1. Confirm VOLUME_4, freeze Volume 2 sheets | Drive | 0.2 | done | $0 | Do not recreate Volume 2. |
| 2. Add Holy Grail columns book_vin / book_fleet / book_match | Sheets | 0.3 | once | $0 | Freeze row 1. |
| 3. CTC-VIS export → CTC-EXPORTS → ingest dated tests only | carb@ + Sheets | 0.5 | each dump | $0 | Empty folder today. |
| 4. +17w event writer (Make scenario, carb@ only) | Make already paid | 2.0 | nightly | $0 | Cap: only rows with testId + date. |
| 5. Subscribe admin / sales / laura to carb@ calendar | Calendar sharing | 0.2 | once | $0 | One write surface. |
| 6. Night Watch 20:00 | Make → Calendar | already built | 0 | $0 | Due + unmatched + tomorrow jobs. |
| 7. FRONT DOOR SMS → Master_CRM_Live + LEAD event | Make Scenario 1 | already built | 0 | $0 | Do not invent fleets. |
| 8. Price-leak page lock ($75 / $199 / $99 / $229 + 4427) | Worker / site | 1.0 | one pass | $0 | Required before Stockton post ships. |
| 9. Blog HTML after approve phrase | Worker + GitHub | 0.5 / post | weekly | $0 | See blog section. |
| 10. GBP / Facebook paste | Owner | 0.2 / post | after approve | $0 | Packs in content/approvals/. No auto-post. |
| X. New CRM / Twilio / 5 Android apps | — | 80+ | forever | do not spend | Forbidden. |

**Build total (steps 0–7):** ~3.3 hours after token. **Then it runs.**
**Blog ship after approve (steps 8–10):** ~1.5 hours for the 9/8 four-pack.

## Blog — Phase 2, owner-gated

Unpublished inventory is already rewritten in `blog_drafts/`. Drive 07_BLOG_PUSH is empty. Harvest URL 404s; portal already cards the title.

Tomorrow 2026-09-08 four-pack (all `owner_approved: NO`):

1. `approve stockton-construction` → /blog/stockton-construction-concrete-clean-truck-check
2. `approve harvest-ag-haul` → /blog/harvest-season-clean-truck-check-ag-haul
3. `approve construction-sacramento` → /blog/construction-sacramento-yard-carb
4. `approve owner-operator` → /blog/clean-truck-check-owner-operators-one-truck

Later: fleet-readiness (Full Care $40 vs $80 still unlocked — do not ship until owner picks one number) · freight-stockton 9/15 · bay-area-jobsite 9/22 · wine-napa 9/29 · ag-porterville 10/06.

Patch before Stockton HTML: that draft still hrefs `/service-area-san-joaquin-county-mobile-testing` and `/service-area-sacramento-carb-testing`. Prefer `/stockton-clean-truck-check`, `/areas`, `/sacramento-carb-testing`.

Social after phrase only:
- GBP https://share.google/CUg6TEK1p3eO34S9G
- Facebook https://www.facebook.com/carbcleantruckcheck/
- X @carbcleantruck last post Nov 2025 — dead until owner pastes

## Accuracy rule

If Book VIN, Contacts name, and Calendar title disagree: Book VIN wins. We all learn. Fix the people row and the event. Do not mint a fourth system.
