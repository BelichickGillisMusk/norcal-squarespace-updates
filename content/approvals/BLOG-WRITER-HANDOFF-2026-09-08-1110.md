# Blog Writer handoff — 2026-09-08 11:10 PT

Technical. Harvest verified live. Three construction/owner drafts still gated. No live HTML shipped this turn.

## Live vs unpublished (verified this hour)

LIVE — do not republish
- `/blog/harvest-season-clean-truck-check-ag-haul` — 200. Title matches queue draft. Published Aug 29 2026. Repo draft still says 404; treat as live.
- `/blog/fleets-ovi-obd-porterville-mojave`
- `/blog/obd-vs-ovi-clean-truck-check-fleets`
- `/blog/how-mobile-carb-testing-works`
- `/blog/2026-carb-testing-deadlines` — STALE cadence (2x starting 2026; no Oct 2027 OBD 4x)
- `/blog/carb-clean-truck-check` — STALE (“at least once per year, some fleets twice”)
- Squarespace `/clean-truck-check-blog/*` archive
- `/stockton-clean-truck-check` prices now lock: OBD $75 · OVI $199 · MH $99/$229. Full Care still prints +$40/year.

404 — waiting owner phrase (do not flip `owner_approved`)

| # | File | Target | Phrase |
|---|------|--------|--------|
| 1 | `blog_drafts/queue/stockton-construction-concrete.md` | `/blog/stockton-construction-concrete-clean-truck-check` | `approve stockton-construction` |
| 2 | `blog_drafts/queue/construction-sacramento.md` | `/blog/construction-sacramento-yard-carb` | `approve construction-sacramento` |
| 3 | `blog_drafts/queue/owner-operators-one-truck.md` | `/blog/clean-truck-check-owner-operators-one-truck` | `approve owner-operator` |

HOLD
- `approve fleet-readiness` — `/blog/2026-2027-ctc-fleet-readiness`. Drive doc already corrected. Full Care $80 in that draft vs $40 on live landers. Owner picks one number first.
- `approve freight-stockton` 2026-09-15
- `approve bay-area-jobsite` 2026-09-22
- `approve wine-napa` 2026-09-29
- `approve ag-porterville` 2026-10-06

## Law lock (do not print +17w as the CARB rule)

Source: https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements

- Through Sep 2027: most HD >14k GVWR on CA roads = 2 tests/year. Qualifying ag and CA rec/emergency MH = 1/year.
- Beginning Oct 2027: OBD units → 4/year. Opacity-path stays 2x. Ag and those MH stay 1x.
- OOS plates on CA roads are in the program.
- 90-day submit window. NST = 30 calendar days.
- CTC-VIS is legal truth. +17w is the sales reminder only.

## Price lock vs leaks

Lock: OBD $75 · OVI $199 · MH $99 / $229 · 916-890-4427 · /contact

Safe to link: `/stockton-clean-truck-check`

Do not deep-link until prices patched:
- `/service-area-sacramento-carb-testing`
- `/service-area-san-joaquin-county-mobile-testing`
- `/east-bay-mobile-carb-testing`

Full Care $40 vs $70 vs $80 unresolved. Do not invent a fourth number.

## Internal links already in the three gated drafts

Stockton construction → Stockton lander, San Joaquin archive posts, Sacramento lander, OBD vs OVI, 2026 deadlines, Mitchell Concrete, Castillo, Plaster F550, All Good Pallets, Banwait.

Sacramento construction → Sacramento lander, foothills, Stockton sister (after approve), Plaster, Mitchell, Castillo, All Fence 9/5 7 OBD.

Owner-operator → services, pricing, areas, OBD vs OVI, Stockton lander, Hayward satellite, Plaster, Lodi corridor.

## Social — owner paste only after live URL exists

- `content/approvals/stockton-construction-pack.md`
- `content/approvals/construction-sacramento-pack.md`
- `content/approvals/owner-operator-pack.md`

GBP: https://share.google/CUg6TEK1p3eO34S9G
Facebook: https://www.facebook.com/carbcleantruckcheck/
X: last public post Nov 2025. Dead until owner pastes.

## Drive

`07_BLOG_PUSH` and `CONTENT-TO-SITE` empty. Real drafts live in this repo.

## Owner clicks that ship today

```
approve stockton-construction
approve construction-sacramento
approve owner-operator
```

Agents do not flip `owner_approved`.
