# Camila Ops runbook — get 20 emails/day without waiting on enrichment

**Owner:** Bryan · **App:** `scripts/camila-ops` · **Config:** `config/camila-ops-rotation.json`

---

## Funnel (Bryan: 20 out of 1000)

Places / CSV can pull **hundreds–thousands** of tow/crane/concrete businesses. We do **not** email all of them.

```
Places/CSV pool  →  website found  →  MX ok (info@domain)  →  queue 20/day (5×4 metros)
     ~1000              ~300                 ~20–80                  send these
```

Full pool stays in `data/pool-{industry}.jsonl` for enrichment later. Only MX-ok rows enter the send queue.

### Tow trucks

Priority industry #1. Drop any list you have:

```bash
# template: scripts/camila-ops/tow-truck-list-template.csv
node run.js import-csv --file /path/to/tow-list.csv --industry tow_trucks
# or Places:
npm run discover:tow
```

---

## Answer: Is she ready?

| | |
|--|--|
| **Internal app that discovers, sends hourly, logs** | ✅ Shipped |
| **18 Places URLs (cranes + concrete × metros)** | ✅ |
| **Hermes Google Maps/Places API key in GitHub** | ❌ Paste `GOOGLE_PLACES_API_KEY` |
| **`camila@` Gmail API (service account + DWD)** | ❌ `CAMILA_SERVICE_ACCOUNT_JSON` |
| **Live switch** | ❌ `COLD_OUTREACH_LIVE=true` |

Until the three secrets land, hourly runs **dry-run + still log**. No more “weeks to send one email” once Hermes key + SA are in — first live night is mechanical.

---

## Cadence (Bryan 2026-07-16)

1. **Tonight / each night:** Places discover **cranes** across satellite metros  
2. **Next day 8 AM–4 PM PT:** send **3/hour** → **5 Bay · 5 Sac · 5 San Jose · 5 Stockton** (~20)  
3. **While cranes work:** switch discover to **concrete** (`--industry concrete`)  
4. **Always:** append `send-log.jsonl` + `sent-YYYY-MM-DD.csv`

Standing approval is in config. Live still needs `COLD_OUTREACH_LIVE=true`.

---

## Bryan — 10 minutes to go live

1. **Hermes GCP** → Places API → copy key → GitHub secret `GOOGLE_PLACES_API_KEY`  
2. Confirm `camila@norcalcarbmobile.com` exists + service account JSON → `CAMILA_SERVICE_ACCOUNT_JSON`  
3. Domain-wide delegation scopes: `gmail.send`, `gmail.compose`  
4. Set `COLD_OUTREACH_LIVE=true`  
5. Actions → **Camila Ops Nightly Discover** → Run (industry=`cranes`)  
6. Actions → **Camila Ops Hourly Send** → dry_run=`false` once queue exists  

---

## Local test (no secrets)

```bash
cd scripts/camila-ops && npm ci
npm run seed-demo
npm run hourly:dry
npm run status
cat data/send-log.jsonl
```

---

## SAFER / QCMobile enrichment (USDOT → phone, safety, fleet size)

Official free JSON API (WebKey once):

1. https://mobile.fmcsa.dot.gov/ → Login.gov → **My WebKeys** → new key (app: `NorCalCARBMobileEnricher`)
2. `export FMCSA_API_KEY=your_webkey` (same secret name as `build-lead-queue.js`)

```bash
cd scripts/camila-ops
npm run safer:dry
python3 safer_query.py snapshot 785221
python3 safer_query.py batch --in leads/federal-tonight-candidates.csv --out leads/safer-enriched.csv --delay 1
```

Adds `safer_*` columns (phone, safety rating, power units, OOS rates, `prospect_score`). Stdlib only — no `pip install`.

---

## Federal skim — 150 mi Sac + Oakland (FMCSA census)

The Grok “federal database” pull saved as `Federal_darabase_rows` is an **API error** (`Non-tabular datasets do not support rows requests`). Use the public FMCSA Company Census instead:

```bash
cd scripts/camila-ops
npm run federal-skim:dry
node federal-skim.js --with-email --limit 500          # sample
node federal-skim.js --with-email --min-power-units 2  # full → leads/federal-150mi-sac-oak.csv
node run.js import-csv --file leads/federal-150mi-sac-oak.csv --industry cranes
```

- Hubs: Sacramento `(38.5816, -121.4944)` + Oakland `(37.8044, -122.2712)`
- Keep if `min(mi_sac, mi_oak) ≤ 150`
- ZIP centroids: `lib/ca-zips-150mi-sac-oak.csv` (~780 ZIPs)
- No API key (public SODA). Census emails are often real ops contacts — still MX-check via `import-csv`.

---

## Why this instead of “wait for perfect emails”

- Website + MX `info@` is good enough to start; notes say `enrich later`  
- Quotas prevent one metro from burning the whole day  
- Hourly spacing ≈ anti-blacklist (also ≥7 min between API sends within a chunk if you lower chunk size)  
- Log is the source of truth for “how many went out today”
