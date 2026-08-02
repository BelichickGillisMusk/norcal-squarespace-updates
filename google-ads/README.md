# Google Ads launch package — OBD, OVI and Motorhome

This folder contains a paused, low-risk Google Ads Editor build for NorCal CARB Mobile.

## Files

- `google-ads-editor-import.csv` — campaigns, ad groups, keywords and responsive search ads.
- `campaign-locations.csv` — core NorCal county targets; San Diego excluded.
- `campaign-negative-keywords.csv` — shared waste-prevention negatives.
- `assets-blueprint.csv` — sitelinks, callouts, structured snippet and call asset blueprint.
- `AUDIT.md` — pricing and optimization audit.
- Three HTML landing pages, intended for the website's `site/` directory.

## Import order

1. Open Google Ads Editor and download the correct NorCal CARB Mobile account.
2. Import `google-ads-editor-import.csv`; review and keep proposed changes.
3. Import `campaign-locations.csv`.
4. Import `campaign-negative-keywords.csv`.
5. Add the assets from `assets-blueprint.csv`. Asset import mapping can vary by Editor version, so verify each mapped column before keeping changes.
6. Post the changes while campaigns remain paused.

## Required account settings before enabling

1. Confirm billing and advertiser verification belong to **NorCal CARB Mobile LLC**.
2. Set campaign location option to **Presence**, not the default Presence or Interest.
3. Set ad schedule to 7:00 AM–7:00 PM local time, or the actual hours calls are answered.
4. Create primary conversion actions:
   - Calls from ads, minimum call length 60 seconds.
   - Calls to the website forwarding number, minimum call length 60 seconds.
   - Callback form success.
5. Link the correct Google Business Profile and enable location assets.
6. Confirm the number is `(916) 890-4427`.
7. Preview all landing pages on mobile.
8. Enable one campaign at a time. Start with OVI, then OBD, then Motorhome after call tracking is verified.

## First 14-day operating rule

- Do not raise budget during the first 7 days.
- Add irrelevant search terms as negatives at least twice per week.
- Judge performance by qualified calls and booked tests, not clicks.
- Pause any keyword after 20 clicks with no qualified lead.
- Do not switch to broad match until conversion tracking is reliable and enough qualified conversion data exists.
