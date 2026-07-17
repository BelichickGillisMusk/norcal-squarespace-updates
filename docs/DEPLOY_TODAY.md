# Deploy today — July 15–21, 2026 (week of Jul 16)

**Skill:** `.cursor/skills/norcal-email-deployer/SKILL.md`  
**Calendar week:** Jul 15–21 — Fleet template B (batch yard visits)  
**Agent:** Execute in order. Stop at Bryan approval gates. Log to `change_log.md`.

---

## Status snapshot (2026-07-16 preflight)

| Check | Status |
|-------|--------|
| Root SPF / Google DKIM / DMARC | ✅ OK (cold Gmail OK) |
| Resend DKIM `resend._domainkey.mail` | ✅ present |
| Resend MX `send.mail` | ✅ present |
| Resend SPF `send.mail` TXT | ❌ **BLOCKER** — missing |
| DNS host | Cloudflare (`paislee` / `eric` NS) — not Squarespace |
| `NURTURE_LIVE` / `REMINDERS_LIVE` / `BLAST_APPROVED` | **KEEP OFF** until SPF fixed + test `dmarc=pass` |

---

## Bryan — unblock Resend (5–10 min)

DNS is on **Cloudflare**, not Squarespace.

| # | You do |
|---|--------|
| 1 | Resend.com → Domains → `mail.norcalcarbmobile.com` → copy the **SPF TXT** value for `send.mail` |
| 2 | Cloudflare → `norcalcarbmobile.com` → DNS → **Add record** |
| 3 | Type **TXT**, Name **`send.mail`**, Content = exact SPF string from Resend (usually `v=spf1 include:amazonses.com ~all`) |
| 4 | Resend → **Verify DNS** (wait 5–60 min) |
| 5 | Reply **"approved test send"** when you want a welcome/reminder test |

**Do not** set `NURTURE_LIVE` / `REMINDERS_LIVE` until agent re-runs preflight green + Gmail Show original shows `dmarc=pass`.

---

## Agent — this week

### Blocker protocol (active)

- [x] **1. Preflight** — FAIL (1 blocker: Resend SPF)
- [x] **2. STOP live Resend** — do not flip LIVE secrets
- [x] **3. Log dig evidence** — see `change_log.md` 2026-07-16 entry
- [ ] **4. Re-run preflight** after Bryan adds TXT
- [ ] **5. Test welcome** to `bryan@` → confirm `dmarc=pass`
- [ ] **6. After "approved welcome"** → `NURTURE_LIVE=true`
- [ ] **7. After "approved reminders"** → `REMINDERS_LIVE=true`

### Cold outreach (parallel — Gmail only, NOT blocked by Resend SPF)

Cold from `camila@` / `bryan@` uses Google DKIM ✅ — may continue with Bryan approval.

| # | Action |
|---|--------|
| 8 | Confirm Cold Sends / Send Queue sheet + Camila Ops tabs exist |
| 9 | Build / verify MX on queue (`verify-emails.js`) |
| 10 | Draft up to **30/day** — **Template B** (fleet-switch) this week |
| 11 | STOP until Bryan says **approved cold send** / **approved batch YYYY-MM-DD** |
| 12 | Stagger 7 min; log count in `change_log.md` |

### July calendar (this week)

| Date | Plan |
|------|------|
| Jul 15–21 | Cold Template B — fleet yard visits (Sacramento, Stockton, Fairfield, San Jose, Bay Area) |
| Jul 22–31 | Switch offer push — beat shop prices |
| Blast | Next blast only if ≥30 days since last + Bryan **"approved blast [id]"** |

---

## Scheduled automations

| Workflow | Schedule | Notes |
|----------|----------|-------|
| Email Preflight | 7 AM PT | Expect FAIL until SPF TXT lands |
| Email Ops Daily | 8:15 AM PT | Dry-run only while LIVE secrets off |
| Camila Cold Outreach | 9 AM PT Mon–Fri | Chat notify only until Bryan approves batch |

---

## Success by end of week

- [ ] Preflight green (Resend SPF present)
- [ ] Test Resend email: `spf=pass` `dkim=pass` `dmarc=pass`
- [ ] Welcome and/or reminders live only after Bryan phrases
- [ ] Cold Template B drafts/sends logged (≤30/day)
- [ ] `change_log.md` updated

---

## If still blocked

| Blocker | Fix |
|---------|-----|
| `send.mail` TXT empty | Cloudflare DNS → add Resend SPF TXT (see `dns-fix.md`) |
| Resend verify stuck | Wait 1h; Name field = `send.mail` not FQDN; no extra quotes |
| dmarc=fail on test | Do not set LIVE — re-check subdomain alignment |
| Want cold only | OK while Resend blocked — Google DKIM already passes |
