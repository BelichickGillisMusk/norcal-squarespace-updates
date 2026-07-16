# Camila Ops runbook — get 20 emails/day without waiting on enrichment

**Owner:** Bryan · **App:** `scripts/camila-ops` · **Config:** `config/camila-ops-rotation.json`

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

## Why this instead of “wait for perfect emails”

- Website + MX `info@` is good enough to start; notes say `enrich later`  
- Quotas prevent one metro from burning the whole day  
- Hourly spacing ≈ anti-blacklist (also ≥7 min between API sends within a chunk if you lower chunk size)  
- Log is the source of truth for “how many went out today”
