# Blog Writer handoff — 2026-09-06 09:03 PT

Technical. No live HTML. Owner gate unchanged. Calendar token still dead on this connector.

## Volume / files

- VOLUME_4_LIVE is the live hub: https://drive.google.com/drive/folders/1M6OC8jzgQIyibuX4sLbKyumwhOqx8y9t
- VOLUME_2 folder: not present. Nothing to trash by that name. Do not recreate it.
- Drive `07_BLOG_PUSH` and `CONTENT-TO-SITE/{00-DROP-HERE,01-READY,02-GO}` remain empty. GitHub `blog_drafts/` is the drop.
- REVIEW_2026 `06_CALENDAR_CONTACTS_SYNC` is empty (token blocker).

## CARB lock (re-checked 2026-09-06 vs ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements)

- Almost all vehicles: semi-annual.
- Qualifying ag + CA-registered rec/emergency motorhomes: annual.
- Beginning October 2027: OBD-equipped = 4 tests/year. Opacity path stays semi-annual. Ag + those MH stay annual.
- Passing tests may be submitted up to 90 days before the CTC-VIS deadline.
- Deadline source = CTC-VIS, not a blog calendar.
- Public card: OBD $75 · OVI $199 · MH $99/$229 · phone 916-890-4427 only.

## Unpublished inventory (`owner_approved: NO`)

| # | File | Approve phrase | Target URL | Publish date |
|---|------|----------------|------------|--------------|
| 1 | blog_drafts/queue/stockton-construction-concrete.md | `approve stockton-construction` | /blog/stockton-construction-concrete-clean-truck-check | 2026-09-08 |
| 2 | blog_drafts/queue/construction-sacramento.md | `approve construction-sacramento` | /blog/construction-sacramento-yard-carb | 2026-09-08 |
| 3 | blog_drafts/queue/owner-operators-one-truck.md | `approve owner-operator` | /blog/clean-truck-check-owner-operators-one-truck | 2026-09-08 |
| 4 | blog_drafts/2026-2027-ctc-fleet-readiness.md | `approve fleet-readiness` | /blog/2026-2027-ctc-fleet-readiness | 2026-09-12 |
| 5 | blog_drafts/queue/freight-stockton-tracy.md | `approve freight-stockton` | /blog/freight-stockton-tracy-mobile-carb | 2026-09-15 |
| 6 | blog_drafts/queue/bay-area-jobsite.md | `approve bay-area-jobsite` | /blog/bay-area-jobsite-mobile-carb | 2026-09-22 |
| 7 | blog_drafts/queue/wine-napa-sonoma.md | `approve wine-napa` | weekly after 9/29 |
| 8 | blog_drafts/queue/ag-central-valley-porterville.md | `approve ag-porterville` | weekly after 10/06 |

Mar 31 CRM stub “Blog #1 Concrete/Construction + Stockton satellite” = draft #1. That is the first push.
Harvest blog from journal 2026-08-29 is still not on the live site.

## Live pages that need a correction pass (do not delete slugs)

- `/blog/2026-carb-testing-deadlines` — still omits Oct 2027 OBD 4x; Full Care listed at $40.
- `/blog/carb-clean-truck-check` — still says “at least once per year, some twice.” Wrong for 2026. Most units = 2x through Sep 2027.
- `/clean-truck-check-blog/your-guide-to-carbs-deadlines-and-requirements-for-2025`
- `/clean-truck-check-blog/complete-guide-to-californias-carb-clean-truck-check-program`
- `/clean-truck-check-blog/clean-truck-check-info-blog` (title still 2025)
- After fleet-readiness ships: add a 2026 note + link to `/blog/2026-2027-ctc-fleet-readiness` and `/blog/2026-carb-testing-deadlines`.

## NAP / price status — live-checked 2026-09-06 09:03 PT

Cleared:
- `/stockton-clean-truck-check` now $75 / $199 / $99 / $229. Safe to internal-link. $79/$189 is gone.
- Hub /contact /services prices match the lock.
- llms.txt public prices and 4427 are correct.

Still flag (do not point new posts at these until fixed):
- Full Care $40 on Stockton lander AND `/blog/2026-carb-testing-deadlines` vs $80 on Drive corrected guide. Do not invent a third price. Owner picks one before fleet-readiness ships.
- llms.txt still lists https://cleantruckchecksacramento.com/ under Sister city landers. That domain is Clean Truck Compliance Solutions, 916-661-8288. Delete that line.
- carb-clean-truck-check.com still publishes 415-900-8563 and admin@mobilecarbsmoketest.com. Prices on that lander match the lock; phone and email do not.
- Stockton lander still says “Most thorough” on OBD. Strip that line.

## Social destinations (copy already in packs)

- GBP: https://share.google/CUg6TEK1p3eO34S9G
- Facebook: https://www.facebook.com/carbcleantruckcheck/
- X @carbcleantruck last post Nov 2025. Do not treat as live channel until owner pastes.
- Packs: `content/approvals/stockton-construction-pack.md`, `construction-sacramento-pack.md`, `owner-operator-pack.md`, `fleet-readiness-pack.md`
- Do not auto-post. Owner pastes after approve phrase.

## Incoming SMS → location pages (people layer only)

Do not stamp these as +17w retests. Dec 2025 first-seen +17w landed Apr 2026. Leads unless a VIN exists in The Book.

- Faithful Way Transport / Lathrop, Yaye Trucking / Wilton, Cal Roots / Modesto → Stockton + Valley posts + `/stockton-clean-truck-check`
- Oliver's Trucking / San Leandro, Orozco Landscapes / Sunnyvale, Peninsula Pro / Redwood City → bay-area-jobsite + Hayward/Peninsula pages
- Seven Sparks + TS&L Seed / CA-16 → ag + Woodland pages
- Esquibel Grading / Pacifica CA-1 → Peninsula
- West Coast Pipeline / N Beale Rd → Marysville / Yuba / Butte pages

## Calendar / contacts (out of blog write path)

Google Calendar token on this connector is dead. +17 week events cannot be created here. Incoming SMS list is people layer only. Completed-test grain stays The Book. People layer stays Holy Grail. Calendar is the only phone surface.

## What the owner types to ship

`approve stockton-construction`
then
`approve construction-sacramento`
`approve owner-operator`
`approve fleet-readiness`

Agents will not set `owner_approved: YES`.
