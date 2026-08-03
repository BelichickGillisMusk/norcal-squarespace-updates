# Cloudflare account split (2026-08-03)

## Rule (Bryan)

| Account | Login | What lives here |
|---------|--------|-----------------|
| **Gillis Institute of AI** (current) | `bgillis99@gmail.com` · account `bafa242dd95d3fdce72540d20accd0a2` | **Everything else** — Discreet, flybynight, sister CARB domains, Pages projects, Silverback, Rent Ruby, etc. **Leave alone.** |
| **Empty / fresh** (money site only) | `bryan@norcalcarbmobile.com` | **Only** `norcalcarbmobile.com` + www · fresh Worker · no other brands |

Agents, Cursor, and shared Gillis tokens must **not** ship the money site once it lives on the empty account.

---

## Stays on Gillis (do not move)

Examples currently on Gillis Institute of AI:

- **Zones:** flybynightca.com, mobileovitest.com, mlbmarketingllc.com, silverbackai.agency, rent-ruby.com, undefeatedsolar.com, all cleantruckcheck* sisters, etc.
- **Workers / Pages:** discreet-flybynight, mobileovi-site, peptide-institute, rent-ruby, undefeated-solar, …

---

## Moves to empty Bryan account (money only)

| Item | Name |
|------|------|
| Zone | `norcalcarbmobile.com` (+ www) |
| Worker | `norcalcarbmobile-prod` (fresh name — not `*-gillis`) |
| Secrets | `RESEND_API_KEY`, contact to/from — set only on empty account |
| GitHub deploy secrets | **`CF_GROK_KEY_NCM`** (empty-account API token, org or repo) + **`NORCAL_PROD_CF_ACCOUNT_ID`** (never Gillis `bafa242…`) |

Legacy Worker on Gillis: `norcal-squarespace-updates-gillis` — keep until cutover, then **remove custom domain routes** so nothing else can attach to .com.

---

## Cutover checklist (Bryan + Grok)

### A. One-time: log this Mac into empty account

```bash
# Log OUT of Gillis OAuth (only when ready to switch session)
npx wrangler logout

# Log IN as bryan@norcalcarbmobile.com (browser)
npx wrangler login
npx wrangler whoami
# Copy Account ID → paste into wrangler.prod-empty.toml as account_id
```

Or create an API token on empty account: **Workers Scripts Edit** + **Account Settings Read** + zone DNS for norcalcarbmobile.com only.  
Store as GitHub org/repo secret **`CF_GROK_KEY_NCM`** (BelichickGillisMusk → `norcal-squarespace-updates`).

### B. Add zone on empty account

1. Empty CF dashboard → Add site → `norcalcarbmobile.com`
2. At registrar, set nameservers to the empty account’s NS (or transfer zone)
3. Wait until Active

**Do not** point DNS or Workers at `*.grok-sandbox.com` (Grok Code preview — auth wall, temporary, not your origin).

### C. Deploy fresh Worker (empty account only)

**Preferred — GitHub Actions (uses `CF_GROK_KEY_NCM`):**

1. Secrets on repo (or org granted to this repo):
   - `CF_GROK_KEY_NCM` = empty-account API token  
   - `NORCAL_PROD_CF_ACCOUNT_ID` = empty account id (32 hex)
2. Actions → **Deploy NorCal CARB Mobile** → Run workflow  
   - `bryan_go` = `GO`  
   - `confirm_worker` = `norcalcarbmobile-prod`

**Local fallback:**

```bash
export CLOUDFLARE_API_TOKEN='(value of CF_GROK_KEY_NCM — env only, never chat)'
export CLOUDFLARE_ACCOUNT_ID='(empty account id)'
# account_id also in wrangler.prod-empty.toml
cd ~/norcal-squarespace-updates
./scripts/deploy-norcal-empty-account.sh
```

### D. Detach .com from Gillis (so nothing on Gillis can serve money site)

On **Gillis** account only (after empty account is live 200):

1. Worker `norcal-squarespace-updates-gillis` → remove custom domains norcalcarbmobile.com / www  
2. Or delete that Worker after backup  
3. GitHub secret `CLOUDFLARE_API_TOKEN` may remain for **other** sites — must **not** be able to write the empty account

### E. GitHub

- Deploy NorCal workflow already **manual + GO only**
- Empty path: **`CF_GROK_KEY_NCM`** + **`NORCAL_PROD_CF_ACCOUNT_ID`** only
- Legacy Gillis path still available until cutover via `confirm_worker=norcal-squarespace-updates-gillis`
- Do **not** put empty-account token in any Cursor/Claude/agent shared env for other brands

---

## “Impossible for anything to get to the new worker”

| Control | How |
|---------|-----|
| Separate CF account | Empty account = only Bryan login |
| Separate API token | `CF_GROK_KEY_NCM` scoped to empty account only; never reuse Gillis `CLOUDFLARE_API_TOKEN` for money |
| No push deploy | Deploy workflow is `workflow_dispatch` + `bryan_go=GO` |
| Fresh worker name | `norcalcarbmobile-prod` — agents searching for `*-gillis` miss it |
| Gillis keeps other sites | Shared agents can thrash Gillis; money site is elsewhere |

---

## Right now

- Live money site still on **Gillis** Worker `norcal-squarespace-updates-gillis` (so customers stay up)
- Other sites: **unchanged on Gillis**
- Deploy workflow wired for **`CF_GROK_KEY_NCM`** + **`NORCAL_PROD_CF_ACCOUNT_ID`** → `norcalcarbmobile-prod`
- This Mac’s wrangler OAuth is still **bgillis99@gmail.com** (Gillis) — money deploy uses the org secret, not that OAuth

**Blocked on you if secrets missing:**

1. Grant org secret **`CF_GROK_KEY_NCM`** to repo `norcal-squarespace-updates` (or set same-named repo secret)
2. Set **`NORCAL_PROD_CF_ACCOUNT_ID`** to the empty Bryan CF account id  
3. Confirm zone Active on empty account (e.g. zone id `6d62b817297d00f783346f977bd0748b` if that is yours)

Then: Actions → Deploy NorCal → `GO` + `norcalcarbmobile-prod`.
