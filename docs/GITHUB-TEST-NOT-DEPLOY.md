# GitHub tests code — it does not ship the money site

**Worker (only):** `norcal-squarespace-updates-gillis` → https://norcalcarbmobile.com  

## How you work on money without breaking the site

1. **Edit in a branch / PR** (or even on `main` for docs/scripts).
2. GitHub runs **CI Test Only (no deploy)** + **NorCal Site Lock**.
3. Green check = code is OK. **Live site is unchanged.**
4. When you actually want the site updated:  
   **Actions → Deploy NorCal CARB Mobile → Run workflow**  
   - `bryan_go` = `GO`  
   - `confirm_worker` = `norcal-squarespace-updates-gillis`

## What does NOT deploy

- Push to `main`
- Pull requests
- attention-hq (daily scorecard)
- Camila / email crons
- Node version bumps, site-lock hash refreshes alone

## Replace / rollback if something bad ships

```bash
cd ~/norcal-squarespace-updates
npx wrangler deployments list --name norcal-squarespace-updates-gillis
# pick prior version id, then:
npx wrangler rollback --name norcal-squarespace-updates-gillis
```

Or re-run Deploy workflow from a known-good commit (Bryan GO again).
