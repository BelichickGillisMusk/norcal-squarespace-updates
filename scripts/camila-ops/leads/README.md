# Camila Ops — uploaded lead packs (2026-07-16)

Bryan dropped these from Drive/CRM. Copied here for the nightly funnel.

| File | What |
|------|------|
| `01-CLEAN-USABLE-CONTACTS.csv` | 188 rows — mostly **phone_only**; 65 tow companies; only ~4 unique good emails |
| `02-FAKE-OR-BAD-CONTACTS.csv` | Suppression |
| `03-NO-USABLE-CONTACT.csv` | Needs enrichment |
| `BG-send-tonight-top-500.csv` | 500 priority SAFER names — **no emails** |
| `hot-leads-100.csv` | 100 hot — **no emails** |
| `ENRICHED-Darryl-Hot-Leads-REAL.csv` | Some emails (verify fit before send) |
| `sent-email-suppress.csv` | Already emailed — never re-send |
| `tow-phones-for-enrichment.csv` | **25 NorCal tow cos with phones** — Places/website → email |
| `tonight-sendable-emails.csv` | MX-candidate emails ready for `import-csv` |
| `Mecca-May-certificates.csv` | ~2180 TRUCRS May cert rows — almost empty contacts (~1 email) |
| `600-emails-priority-names.csv` | ~500 priority names — **no emails** (same shape as BG top 500) |
| `NorCal-CARB-MultiHub-Location-Feed.csv` | GBP multi-hub location feed (our sites) |
| `Federal_darabase_rows-BROKEN-socrata-error.csv` | Grok/data.gov miss — non-tabular endpoint |
| `federal-150mi-sac-oak.csv` | Output of `npm run federal-skim` (FMCSA census ≤150mi) |

## SAFER enrichment (USDOT → safety / phone / fleet)

```bash
export FMCSA_API_KEY=your_webkey   # https://mobile.fmcsa.dot.gov/ → My WebKeys
python3 ../safer_query.py batch --in federal-tonight-candidates.csv --out safer-enriched.csv
```

## Federal skim (Sac + Oakland 150 mi)

`Federal_darabase_rows` failed because it hit a **non-tabular** Socrata dataset. Correct source is FMCSA **Company Census** `az4n-8mr2` on data.transportation.gov.

```bash
cd scripts/camila-ops
npm run federal-skim:dry
node federal-skim.js --with-email --limit 500
node federal-skim.js --with-email --min-power-units 3   # full skim → leads/federal-150mi-sac-oak.csv
node run.js import-csv --file leads/federal-150mi-sac-oak.csv --industry cranes
```

## Reality check
Tow list is real — but it's **phones**. Path to 20 emails/day:
1. Places/Hermes enrich `tow-phones-for-enrichment.csv` → websites → `info@` MX
2. Federal skim → real emails from census within 150mi of Sac/Oakland
3. Meanwhile send from `tonight-sendable-emails.csv` (easy path)
