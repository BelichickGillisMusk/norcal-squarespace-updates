# Camila Ops — internal cold-send app

**Purpose:** Stop waiting weeks for perfect enrichment. Discover easy leads from Google Places (Hermes API key), send **20/night** (5 Bay · 5 Sacramento · 5 San Jose · 5 Stockton), log every send, rotate **cranes → concrete**.

## Is Camila ready?

| Piece | Status |
|-------|--------|
| Ops app (`scripts/camila-ops`) | ✅ This package |
| 18 Places search URLs | ✅ `config/camila-ops-rotation.json` |
| Hourly + nightly GitHub Actions | ✅ workflows below |
| Hermes `GOOGLE_PLACES_API_KEY` | ❌ Bryan pastes from Hermes GCP |
| `CAMILA_SERVICE_ACCOUNT_JSON` + domain-wide delegation for `camila@` | ❌ Phase 1 |
| `COLD_OUTREACH_LIVE=true` | ❌ Flip after first dry week OK |

**Verdict:** App is ready. Live send is **one secrets step** away. Until then every run is `--dry-run` and still writes the send log.

## Commands

```bash
cd scripts/camila-ops
npm ci
npm run status
npm run discover:dry          # lists 18 Places queries (no key needed)
npm run seed-demo && npm run hourly:dry   # end-to-end without APIs
```

With Hermes key:
```bash
export GOOGLE_PLACES_API_KEY=...   # from Hermes GCP Places API
npm run discover -- --industry cranes
npm run hourly:dry
```

Live (after Bryan sets secrets):
```bash
# GitHub secrets: GOOGLE_PLACES_API_KEY, CAMILA_SERVICE_ACCOUNT_JSON, COLD_OUTREACH_LIVE=true
npm run hourly
```

## Nightly / hourly

| Job | When (PT) | What |
|-----|-----------|------|
| `camila-ops-nightly.yml` | 7:00 PM | Discover cranes (or concrete) → queue JSON artifact |
| `camila-ops-hourly.yml` | every hour 8 AM–4 PM | Send **3** from queue; respect metro quotas; append log |

Day shape: ~3 × 7 hours ≈ **21 sends**, capped at 25, metro quotas 5 each.

## Logs

| File | Contents |
|------|----------|
| `data/queue-YYYY-MM-DD.json` | Today's pending/sent leads |
| `data/send-log.jsonl` | Append-only every attempt |
| `data/sent-YYYY-MM-DD.csv` | Daily summary for Bryan |

## Bryan standing approval (2026-07-16)

> Send what is easy while we enrich. Cranes from satellite metros each night — 5 Bay, 5 Sacramento, 5 San Jose, 5 Stockton. Then concrete. Log 20–25/day.

Encoded in `config/camila-ops-rotation.json` → `standing_bryan_approval`. Live still requires `COLD_OUTREACH_LIVE=true`.

## Hermes Places key

1. Open **Hermes** GCP project
2. Enable **Places API**
3. Credentials → API key → restrict to Places
4. GitHub repo secret `GOOGLE_PLACES_API_KEY`
