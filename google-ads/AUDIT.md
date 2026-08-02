# NorCal CARB Mobile — Google Ads Audit

## Price source of truth

- Standard OBD: **$75**
- Standard OVI smoke-opacity test: **$199**
- Motorhome OBD: **$99**
- Motorhome OVI: **$229**
- San Diego is intentionally excluded from this campaign package because its pricing and routing differ.

## Current-site findings

1. The live homepage, services page, pricing page, contact form, schema, and `config/pricing.json` agree on the four prices above.
2. Older Squarespace exports and historical content still contain prior $250–$300 references. They should never be used as paid-ad landing pages.
3. The contact page says higher-cost appointments require payment in full before confirmation, while `config/pricing.json` describes a 50% booking deposit. This package does not advertise a deposit amount; the policy should be standardized separately.
4. The Google Ads account must use **Search campaigns**, not Shopping or “gift card” listings.
5. Landing pages explicitly identify NorCal CARB Mobile LLC as a private testing provider, not a government agency.

## Campaign structure

| Campaign | Daily cap | Initial bid | Landing page |
|---|---:|---:|---|
| NCARB Search OBD 75 | $15 | Manual CPC, $4 max | `/carb-obd-test` |
| NCARB Search OVI 199 | $20 | Manual CPC, $5 max | `/carb-ovi-test` |
| NCARB Search Motorhome 99-229 | $15 | Manual CPC, $4 max | `/motorhome-carb-test` |

All campaigns import **paused**. Total possible daily spend after enabling all three: **$50/day**.

## Optimization rules

- Google Search only; Search Partners off at launch.
- Exact and phrase match only; no broad match initially.
- Location option: **Presence — people in or regularly in the targeted locations**.
- Primary conversions: calls from ads (60+ seconds), calls from website (60+ seconds), successful callback form.
- Run call assets only during hours calls can be answered.
- After 10–15 qualified conversions in 30 days, test Maximize Conversions.
- Do not optimize to clicks, page views, or directions as primary conversions.
- Review search terms twice weekly during the first month and add negatives immediately.
