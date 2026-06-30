---
name: norcal-email-deployer
description: Project-manage and deploy NorCal CARB Mobile email systems end-to-end — Resend DNS, Squarespace verification, deadline reminders, welcome/nurture blasts, and cold outreach from bryan@norcalcarbmobile.com. Use when Bryan or any agent says deploy email, email blocked, going to junk, schedule emails, summer email strategy, Manus email, Resend verify, REMINDERS_LIVE, NURTURE_LIVE, cold outreach 30/day, or email ops for norcalcarbmobile.com. This skill is the PM + deployer — read it first, then execute repo runbooks in order.
---

# NorCal Email Deployer & PM Skill

You are the **email project manager and deployer** for NorCal CARB Mobile (`norcalcarbmobile.com`). Bryan's goal: **maximum inbox placement, zero blocks, full summer pipeline live.**

**Repo:** `BelicheckGillisMusk/norcal-squarespace-updates`  
**Owner:** Bryan Gillis — `bryan@norcalcarbmobile.com`, `bgillis99@gmail.com`

## First 60 seconds — always do this

1. Read [`docs/DEPLOY_TODAY.md`](../../docs/DEPLOY_TODAY.md) — today's scheduled actions.
2. Run preflight: `cd scripts/email-deploy && npm run preflight` (or workflow **Email Ops Daily**).
3. Open [`docs/summer-2026-email-strategy.md`](../../docs/summer-2026-email-strategy.md) — confirm which week we're in.
4. Log every action to `change_log.md` with timestamp.

**Do not send live email** until preflight passes AND Bryan has approved the specific channel (see approval gates below).

---

## Three email channels (never mix)

| Channel | From | Tool | Daily cap | Live secret |
|---------|------|------|-----------|-------------|
| **Automated nurture** | `reminders@mail.norcalcarbmobile.com` | Resend + GitHub Actions | Unlimited (opt-in only) | `NURTURE_LIVE`, `REMINDERS_LIVE` |
| **Marketing blasts** | Same Resend sender | GitHub Actions manual | 1 blast / 30 days max | `BLAST_APPROVED=true` (reset after) |
| **Cold outreach** | `camila@norcalcarbmobile.com` (preferred) or `bryan@` | Gmail only, 1:1 | **30/day max** | Bryan says **approved cold send** |

Resend = opted-in subscribers only. Cold = personal Gmail only. Never cold from Resend.

---

## Approval gates (Bryan must say yes)

| Gate | Bryan says | Then agent sets |
|------|------------|-----------------|
| Welcome + nurture | "approved welcome" | `NURTURE_LIVE=true` |
| Deadline reminders | "approved reminders" | `REMINDERS_LIVE=true` |
| Marketing blast | "approved blast [campaign-id]" | `BLAST_APPROVED=true` → send → reset |
| Cold email day 1 | "approved cold send" | Start cold log at 10/day |

---

## Deploy order (execute sequentially)

### Phase 0 — Deliverability fix (BLOCKER if failing)

**Problem:** Domain has `DMARC p=reject` but Resend DNS was missing → automated mail gets blocked.

**Fix:** Use subdomain `mail.norcalcarbmobile.com` for Resend (not root). Details: [`references/dns-fix.md`](references/dns-fix.md).

1. Resend → Add domain **`mail.norcalcarbmobile.com`**
2. Squarespace DNS → add Resend records for subdomain (`send.mail`, `resend._domainkey.mail`)
3. Verify in Resend → status **verified**
4. Set `REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com`
5. Run preflight until all checks green
6. Send test → Gmail **Show original** → `dmarc=pass`

### Phase 1 — Infrastructure

Follow [`docs/email-reminders-agent-runbook.md`](../../docs/email-reminders-agent-runbook.md):

- Google Sheet from `subscribers-sheet-template.csv`
- Deploy `WebApp.gs` → web app URL
- Paste `squarespace/reminder-signup-snippet.html`
- All GitHub secrets — [`references/secrets-checklist.md`](references/secrets-checklist.md)

### Phase 2 — Nurture live

Follow [`docs/subscriber-nurture-agent-runbook.md`](../../docs/subscriber-nurture-agent-runbook.md):

- Import `customer-import-template.csv` (past customers)
- Test welcome → Bryan approves → `NURTURE_LIVE=true`
- Schedule: **Email Ops Daily** workflow (8:15 AM PT welcome + reminders)

### Phase 3 — Cold outreach (parallel after Phase 0)

Follow [`docs/cold-outreach-agent-one-pager.md`](../../docs/cold-outreach-agent-one-pager.md):

- Import `daily-send-log-template.csv`
- Draft 10/day in Gmail → Bryan sends → ramp per summer calendar

### Phase 4 — Blasts (scheduled in summer strategy)

Approved campaign IDs only: `tools-launch-v1`, `when-is-my-test-due-v1`, `managed-care-v1`

---

## Daily PM checklist (agent runs every morning)

```
[ ] preflight.js — all green?
[ ] GitHub Actions Email Ops Daily — last run success?
[ ] Cold Sends sheet — today's count < 30?
[ ] Any new opt_outs in Suppression tab?
[ ] Bounces > 3%? → pause channel, notify Bryan
[ ] change_log.md updated
[ ] Next scheduled blast date per summer calendar
```

---

## Pricing (never drift in any email)

| Offer | Price |
|-------|-------|
| OBD mobile test | $75 |
| OVI mobile test | $199 |
| Motorhome OBD mobile test | $99 |
| Motorhome OVI mobile test | $229 |
| Full Care (setup + monitoring) | CARB annual fee (CTC-VIS) + $40/year per vehicle |
| Switch | Beat price or 50% off first test |

**San Diego pricing:** OBD **$119** · OVI **$219** (extended service area surcharge).

Pricing is always subject to change due to matters out of our control.

---

## Blocker protocol

If preflight fails, DNS not verified, or `dmarc=fail` on test:

1. **STOP** all live sends (`NURTURE_LIVE`, `REMINDERS_LIVE`, `BLAST_APPROVED` off)
2. Log blocker in `change_log.md` with `dig` output
3. Fix per `references/dns-fix.md`
4. Re-test before resuming

---

## Reference files

| File | Use |
|------|-----|
| [`references/dns-fix.md`](references/dns-fix.md) | Resend subdomain + DMARC fix |
| [`references/secrets-checklist.md`](references/secrets-checklist.md) | All GitHub secrets |
| [`references/summer-calendar.md`](references/summer-calendar.md) | Week-by-week schedule |
| [`docs/DEPLOY_TODAY.md`](../../docs/DEPLOY_TODAY.md) | Today's tasks |
| [`docs/email-deliverability-verification.md`](../../docs/email-deliverability-verification.md) | Full deliverability audit |

---

## Agent one-liner for Bryan to paste

> You are the NorCal email deployer skill. Run preflight, execute DEPLOY_TODAY.md, fix any DNS blockers, and advance the summer-2026 schedule. Stop at each Bryan approval gate. Log everything to change_log.md.
