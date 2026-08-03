# Login: empty money-site account

## Two logins (do not mix)

| Who | Email | Cloudflare account | Use for |
|-----|--------|--------------------|---------|
| **Current (keep)** | **bgillis99@gmail.com** | Gillis Institute of AI | Discreet, sisters, Pages, everything else |
| **Need to login** | **bryan@norcalcarbmobile.com** | Empty / fresh | **Only** norcalcarbmobile.com |

*(You said “BGILLIS90” — on this Mac wrangler shows **bgillis99@gmail.com**. Same person, current Gillis account.)*

---

## How to login as bryan@norcal (this Mac)

### Option A — Browser OAuth (simplest)

**Only do this when you’re ready** — it switches the default wrangler session away from Gillis:

```bash
# 1) Leave Gillis session
npx wrangler logout

# 2) Browser opens — sign in as bryan@norcalcarbmobile.com (NOT bgillis99)
npx wrangler login

# 3) Confirm
npx wrangler whoami
# Expect: email bryan@norcalcarbmobile.com + empty account name/id
```

Then paste the **Account ID** into:

`~/norcal-squarespace-updates/wrangler.prod-empty.toml`  
→ `account_id = "…"`

### Option B — Keep Gillis logged in + API token for money site (better day-to-day)

Stay on **bgillis99** for other work. On empty account dashboard:

1. Cloudflare → **My Profile** → **API Tokens** → Create  
2. Permissions: Account → Workers Scripts → Edit; Zone → Zone → Read (or DNS Edit for norcal zone)  
3. Account resources: **only** the bryan@ empty account  
4. Save as GitHub secret **`CF_GROK_KEY_NCM`** (org BelichickGillisMusk, granted to `norcal-squarespace-updates`)  
5. Save empty **Account ID** as **`NORCAL_PROD_CF_ACCOUNT_ID`**

**Preferred ship path (no local token paste):**

Actions → **Deploy NorCal CARB Mobile** → `bryan_go=GO` · `confirm_worker=norcalcarbmobile-prod`

Local fallback only:

```bash
export CLOUDFLARE_API_TOKEN='(CF_GROK_KEY_NCM value — env only, never chat)'
export CLOUDFLARE_ACCOUNT_ID='(empty account id)'
cd ~/norcal-squarespace-updates
# after account_id is in wrangler.prod-empty.toml:
./scripts/deploy-norcal-empty-account.sh
```

Gillis OAuth stays for Discreet etc.; money token only hits empty account.

**Not a deploy origin:** `*.grok-sandbox.com` Grok Code preview URLs (login wall). Do not CNAME production to them.

---

## After bryan@ is connected

1. Add site **norcalcarbmobile.com** on empty account  
2. Point nameservers (or transfer zone from Gillis)  
3. Deploy `norcalcarbmobile-prod`  
4. Set `RESEND_API_KEY` secret  
5. Detach .com custom domain from Gillis Worker `norcal-squarespace-updates-gillis`

Full split map: `docs/CLOUDFLARE-ACCOUNT-SPLIT.md`

---

## Tell Grok when ready

- “Logged in as bryan@norcal” + paste **Account ID**, or  
- “Token ready” (paste token in a secure channel / set env yourself)

Then cutover continues. Until then, live money site stays on **Gillis / bgillis99** so nothing else breaks.
