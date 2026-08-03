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
| GitHub deploy secrets | **Separate:** `NORCAL_PROD_CF_API_TOKEN` + `NORCAL_PROD_CF_ACCOUNT_ID` (never reuse Gillis token) |

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

Or create an API token on empty account: **Workers Scripts Edit** + **Account Settings Read** + zone DNS for norcalcarbmobile.com only. Save as `NORCAL_PROD_CF_API_TOKEN`.

### B. Add zone on empty account

1. Empty CF dashboard → Add site → `norcalcarbmobile.com`
2. At registrar, set nameservers to the empty account’s NS (or transfer zone)
3. Wait until Active

### C. Deploy fresh Worker (empty account only)

```bash
cd ~/norcal-squarespace-updates
# uses wrangler.prod-empty.toml
./scripts/deploy-norcal-empty-account.sh
# puts RESEND_API_KEY secret when prompted
```

### D. Detach .com from Gillis (so nothing on Gillis can serve money site)

On **Gillis** account only (after empty account is live 200):

1. Worker `norcal-squarespace-updates-gillis` → remove custom domains norcalcarbmobile.com / www  
2. Or delete that Worker after backup  
3. GitHub secret `CLOUDFLARE_API_TOKEN` may remain for **other** sites — must **not** be able to write the empty account

### E. GitHub

- Deploy NorCal workflow already **manual + GO only**
- Wire deploy job to `NORCAL_PROD_CF_*` secrets only (empty account)
- Do **not** put empty-account token in any Cursor/Claude/agent shared env for other brands

---

## “Impossible for anything to get to the new worker”

| Control | How |
|---------|-----|
| Separate CF account | Empty account = only Bryan login |
| Separate API token | Scope = this account only; never put in Gillis repo secrets used by other workflows |
| No push deploy | Deploy workflow is `workflow_dispatch` + `bryan_go=GO` |
| Fresh worker name | `norcalcarbmobile-prod` — agents searching for `*-gillis` miss it |
| Gillis keeps other sites | Shared agents can thrash Gillis; money site is elsewhere |

---

## Right now (before empty-account login)

- Live money site still on **Gillis** Worker `norcal-squarespace-updates-gillis` (so customers stay up)
- Other sites: **unchanged on Gillis**
- This Mac’s wrangler is logged in as **bgillis99@gmail.com** only — empty account not connected yet

**Blocked on you:** log into Cloudflare as `bryan@norcalcarbmobile.com` (or hand Grok a scoped API token for that empty account) so we can finish the move without touching Discreet / sisters.
