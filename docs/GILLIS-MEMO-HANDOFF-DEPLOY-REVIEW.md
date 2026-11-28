# Gillis memo — creator → Cursor → review → Git (money sites)

**To:** Everyone working with Bryan on any Gillis / Silverback / NorCal company seat  
**From:** Cursor (ops seat) · for Bryan GO only  
**Date:** 2026-11-21 (America/Los_Angeles)  
**Status:** DRAFT for formal review — **not** a live deploy instruction  
**Related:** `docs/GITHUB-TEST-NOT-DEPLOY.md`, `docs/CLOUDFLARE-ACCOUNT-SPLIT.md`, `docs/LOGIN-BRYAN-NORCAL-CF.md`, `.cursor/rules/edits-norcal.mdc`, Agent SDK GitHub channel (`/agent-sdk-github`)

---

## One sentence

Creator work becomes a PR; Cursor (or Copilot) may edit and test; a human or formal review must pass; **GitHub merge is not the live ship**; only Bryan typing `GO` on **Deploy NorCal CARB Mobile** (empty-account worker) ships `norcalcarbmobile.com` — never straight-to-live, never Gillis thrash tokens on the money site.

---

## Why this memo exists

Bryan paid **Cloudflare (Team)** to help deploy `norcalcarbmobile.com`. The ask is a clean pass-off:

**creator → Cursor → review → Git**  
(or Git then Bryan ship — **not** agent → apex)

…without bringing back old issues (dropped landers, wrong phone, wrong account, auto-ship on merge).

This memo is the company law for agents, Copilot, and humans. It is accurate to the repo as of this draft. It must survive Bugbot or Security review before anyone wires Agent SDK / Copilot deploy automation.

---

## The only approved handoff (money site)

| Step | Who | What | Evidence / gate |
|------|-----|------|-----------------|
| 1. Create | Human or named writer | Content or code on a **feature branch** | No `wrangler deploy`, no `deploy-content.mjs --go` |
| 2. Cursor | Ultra seat / cloud agent | Edit, validate, open **PR** | Site-lock + CI Test Only green; **do not merge `main` from the agent** |
| 3. Review | Bugbot **or** Security Review (pick one per change) | Accuracy + deploy-path check | Review must cite this memo + `GITHUB-TEST-NOT-DEPLOY` |
| 4. Git | Owner `bgillis99` (or Bryan) | Merge PR when review + Bryan chat GO for *merge* | Merge updates GitHub only |
| 5. Ship | Bryan in Actions UI | **Deploy NorCal CARB Mobile** · `bryan_go=GO` · `confirm_worker=norcalcarbmobile-prod` | Secrets: `CF_GROK_KEY_NCM` + `NORCAL_PROD_CF_ACCOUNT_ID` (never Gillis `bafa242…`) |

**Forbidden shortcuts**

- Agent `wrangler deploy` / local ship to apex  
- “Straight to norcal” from Cursor, Copilot, Grok, or Claude  
- Using Gillis `CLOUDFLARE_API_TOKEN` to write the empty Bryan account  
- Pointing production at `*.grok-sandbox.com`  
- Changing live phones `916-890-4427` / `628-999-3912` without Bryan GO  
- Unlocking boardroom Access without Bryan **GO**

If the change is an EDITS-style site ask and Bryan has not said GO: write the five-line card (Site / Change / Stays / Phone / Ship) and stop. Do not merge.

---

## Main barrier (Cloudflare) — dual ship path

### What the repo says (two stories)

1. **Intended law** (`docs/GITHUB-TEST-NOT-DEPLOY.md`, `.github/workflows/deploy-norcal.yml`):  
   Push and PR **do not** ship. Live ship = manual workflow + `bryan_go=GO` + site-lock.

2. **Still-present second path** (`worker/index.js` header + many `change_log.md` entries):  
   “Workers Builds deploys from main” after owner merge.

### Why that is the slowdown / regression engine

Documented pattern (2026-10-06, Jennifer SEO): Harvest/Construction **Workers Builds** dropped six landing pages that had been live 2026-10-04 — incomplete tree vs live Worker injection. Same class of failure as “we just put the share control on the blog portal and the next ship wiped or hid it.”

**Ask Cloudflare Team (priority):**

1. Confirm whether **Workers Builds** is still attached to `main` / production worker for `norcalcarbmobile.com` (Gillis worker `norcal-squarespace-updates-gillis` and/or empty `norcalcarbmobile-prod`).
2. **Disable or freeze auto-deploy on merge** until the only production trigger is GitHub **Deploy NorCal CARB Mobile** with Bryan `GO`.
3. Confirm empty-account cutover secrets (`CF_GROK_KEY_NCM`, `NORCAL_PROD_CF_ACCOUNT_ID`) and that Gillis tokens cannot write money DNS/Worker.
4. Check bot / WAF challenge on `/blog` — agent curl from CI/cloud returned **HTTP 403** (Cloudflare interstitial). That blocks post-deploy verification of share UI and looks like “the share button disappeared” when the challenge page is what loaded.

Until (2) is done, every merge can silently revive old issues even when the PR looked correct.

---

## Blog portal “share button” — current evidence (no live invent)

| Source | Finding |
|--------|---------|
| Repo `site/blog.html` | Sidebar still has **Share with fleet** → `/for-clients` and **Google Business Profile** → `share.google/…` |
| Repo `site/for-clients.html` | Dedicated share-with-fleet page (prices + share URL copy) |
| Git history | No `navigator.share` / `btn-share` commit trail found in this checkout |
| Live probe (2026-11-21) | Unauthenticated curl to `/blog` → **403** CF challenge HTML — **not** trustworthy proof that share UI is gone or present |
| Closest proven regression class | Workers Builds shipping an incomplete `./site` tree (landers 404) |

**Next verify (Bryan / Cloudflare Team, not agents inventing):**

1. Open `/blog` in a normal browser (not bot UA) after a known-good deploy.  
2. Confirm **Share with fleet** and GBP links render.  
3. If missing only behind challenge / mobile share sheet, fix WAF/Bot Fight or restore the control in a **PR** — do not hot-patch live.  
4. If missing in HTML after Workers Builds, treat as incomplete deploy and roll back via prior Worker version or re-run Deploy with Bryan GO from a known-good commit.

---

## Agent SDK GitHub / Copilot — only open main-site repos

Skill / channel: **`/agent-sdk-github`** (`githubChannel` + `cursorAccount` + `serve --cursor-events`). Prefer Cursor-signed events over public webhooks.

### Open for money / main sites (automation may attach **read** or **pr-write** only)

| Repo / surface | Role | Agent SDK / Copilot may |
|----------------|------|-------------------------|
| `BelichickGillisMusk/norcal-squarespace-updates` | NorCal money site ops + Worker source | Open PRs, comment, run fixtures/replay; **no contents-write merge-box ship**; **no** deploy secrets in agent env |
| Explicit Bryan-named sister main sites when he marks them open | e.g. locked sisters only after he lists them | Same gates as NorCal |

### Closed to Agent SDK deploy wiring (do not put in `cursorAccount.repos` for ship bots)

- Gillis thrash brands (Discreet, flybynight, Rent Ruby, Silverback marketing, etc.) unless Bryan opens that repo by name  
- Locked money domains without GO: `norcalcarbmobile.com`, `mobileovitest.com`, `mobilecarbsmoketest.com` **live deploy**  
- Empty-account API token `CF_GROK_KEY_NCM` in Cursor / Copilot / shared agent secrets  
- Any channel with `permissions: "contents-write"` aimed at production Worker

### Copilot handoff after this memo is reviewed

1. Land this memo on a PR → chosen review (Bugbot or Security).  
2. Owner merges memo only (docs — still no site ship).  
3. Then wire Copilot / Agent SDK **PR bots** on open repos with `permissions: "pr-write"` (or `"read"`).  
4. Deploy remains Actions + Bryan `GO`. Copilot must not call `wrangler deploy`.

---

## Cloudflare Team ticket language (paste)

> We need a single production ship path for norcalcarbmobile.com: GitHub workflow_dispatch Deploy NorCal CARB Mobile with bryan_go=GO to worker norcalcarbmobile-prod on the empty Bryan account (token CF_GROK_KEY_NCM). Please disable Workers Builds (or any push-to-main deploy) on both the legacy Gillis worker and the empty-account worker so merges cannot overwrite live assets. Separately, diagnose WAF/Bot challenges on /blog that return 403 to automation and may hide or drop share UI verification. Do not point production at grok-sandbox hostnames.

---

## EDITS five-line card (this change)

- **Site:** norcalcarbmobile.com (ops docs only — no HTML ship)  
- **Change:** Gillis memo locking creator → Cursor → review → Git → Bryan GO deploy; Agent SDK scoped to open main-site repos; Cloudflare dual-path barrier named  
- **Stays:** Phones, prices, Worker bindings, live HTML untouched in this PR  
- **Phone:** (916) 890-4427 public lock unchanged  
- **Ship:** Docs PR only — **no** wrangler, **no** Deploy workflow, **no** main merge from agent  

---

## Review checklist (for Bugbot or Security)

- [ ] Handoff never allows agent → apex  
- [ ] Deploy secrets named, not inlined; empty account ≠ Gillis  
- [ ] Workers Builds called out as the dual-path barrier  
- [ ] Share-button claim is evidence-bound (repo present; live 403; no invented VIN/money)  
- [ ] Agent SDK repos list is allowlist-only  
- [ ] No instruction to merge `norcal-squarespace-updates` main from Cursor  

---

*End of memo. Bryan edits win.*
