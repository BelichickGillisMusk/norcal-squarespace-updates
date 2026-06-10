# Deploy today — June 9, 2026

**Skill:** `.cursor/skills/norcal-email-deployer/SKILL.md`  
**Agent:** Execute this list in order. Stop at Bryan approval gates. Log to `change_log.md`.

---

## Bryan — 15 minutes only (unblocks everything)

| # | You do | Time |
|---|--------|------|
| 1 | Resend.com → sign in → **Add domain** `mail.norcalcarbmobile.com` | 2 min |
| 2 | Copy DNS records → Squarespace → Domains → norcalcarbmobile.com → **DNS** → paste | 5 min |
| 3 | Resend → **Verify DNS** (may take 15–60 min) | 1 min |
| 4 | GitHub repo → Settings → Secrets → paste `RESEND_API_KEY` if not set | 2 min |
| 5 | Reply to agent: **"approved test send"** when test email arrives | 1 min |

---

## Agent — today (automated where possible)

### Morning block

- [ ] **1. Preflight** — `cd scripts/email-deploy && npm ci && npm run preflight`
- [ ] **2. Google Sheet** — import `subscribers-sheet-template.csv` → share with service account
- [ ] **3. Apps Script** — deploy `WebApp.gs` → copy web app URL → secret `APPS_SCRIPT_WEBAPP_URL`
- [ ] **4. Squarespace** — paste `reminder-signup-snippet.html` with web app URL
- [ ] **5. GitHub secrets** — all items in `references/secrets-checklist.md`
- [ ] **6. Set** `REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com`

### After Resend verifies (same day)

- [ ] **7. Test welcome** — Actions → **CTC Subscriber Nurture** → welcome → dry_run false (one row seeded for Bryan)
- [ ] **8. Test reminder** — Actions → **CTC Reminder Emails** → test_email `bryan@norcalcarbmobile.com`
- [ ] **9. Bryan checks Gmail** → Show original → `dmarc=pass` — if fail, STOP → `dns-fix.md`

### After Bryan says "approved welcome"

- [ ] **10.** `NURTURE_LIVE=true`
- [ ] **11.** Import `customer-import-template.csv` with real past customers
- [ ] **12.** Enable **Email Ops Daily** workflow (scheduled 8:15 AM PT)

### After Bryan says "approved reminders"

- [ ] **13.** `REMINDERS_LIVE=true`

### Cold (parallel)

- [ ] **14.** Import `daily-send-log-template.csv` → tab **Cold Sends**
- [ ] **15.** Draft **10** cold emails in Bryan Gmail (template A) — do not send until **approved cold send**

---

## Scheduled automations (turn on today)

| Workflow | Schedule | Needs |
|----------|----------|-------|
| **Email Ops Daily** | 15:15 UTC (8:15 AM PT) | `NURTURE_LIVE` + `REMINDERS_LIVE` when approved |
| **Email Preflight** | 14:00 UTC (7 AM PT) | DNS monitoring |
| CTC Reminder Emails | (legacy — ops workflow supersedes) | — |
| CTC Subscriber Nurture | (legacy — ops workflow supersedes) | — |

---

## Success by end of day

- [ ] Preflight green (Resend subdomain verified)
- [ ] Test emails in Bryan inbox, not spam
- [ ] Sheet + Apps Script + Squarespace snippet live
- [ ] Welcome test approved (or scheduled for tomorrow AM)
- [ ] Cold drafts ready for tomorrow
- [ ] `change_log.md` has full trail

---

## If blocked

| Blocker | Fix |
|---------|-----|
| Resend not verified | Wait 1h, re-check DNS host names (`send.mail`, `resend._domainkey.mail`) |
| dmarc=fail | Do not set LIVE secrets — fix subdomain per dns-fix.md |
| No Resend API key | Bryan adds secret |
| Squarespace Code block blocked | Log blocker; use native form + manual import |

**Tomorrow (Jun 10):** `NURTURE_LIVE` + customer import + first 10 cold sends after approvals.
