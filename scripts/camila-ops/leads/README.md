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

## Reality check
Tow list is real — but it's **phones**. Path to 20 emails/day:
1. Places/Hermes enrich `tow-phones-for-enrichment.csv` → websites → `info@` MX
2. Meanwhile send from `tonight-sendable-emails.csv` (easy path)
