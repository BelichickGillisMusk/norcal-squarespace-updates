# Platform & email audit — NorCal CARB Mobile (June 2026)

**Reviewer:** Agent audit for Bryan Gillis  
**Sites:** Squarespace (live) → Cloudflare Pages (planned Jul 2026)

---

## Executive summary

| Area | Status | Risk |
|------|--------|------|
| **Squarespace site** | Live at norcalcarbmobile.com | Forms/layout cleanup **not logged complete** in repo |
| **Cloudflare Pages** | **Not built in repo** — docs only | Migration is a plan, not a project yet |
| **Automated customer email (Resend)** | Code ready, **DNS blocked** | **Will bounce/fail DMARC** until `mail.` subdomain added |
| **Cold email (Gmail)** | Docs + templates ready | No queue/approval automation until Gmail Send Approver agent runs |
| **Camila (Vertex AI agent)** | Architecture + skill in repo | Create camila@ + GCP delegation — `camila-deploy-phases.md` |
| **Bounce prevention** | Partial | Add MX verify + suppression before every cold batch |

**#1 blocker today:** Resend DNS on `mail.norcalcarbmobile.com` not in Squarespace DNS → automated emails will fail with `DMARC p=reject`.

---

## Squarespace (current hosting)

### What’s live (external)

- Public site: `https://norcalcarbmobile.com`
- Editor: `https://aqua-alpaca-m37c.squarespace.com/config/`
- DNS managed in Squarespace (until Cloudflare cutover)

### What sends email from Squarespace

| Type | How | Auth |
|------|-----|------|
| Form notifications (book, contact, fleet) | Squarespace → your inbox | SPF `include:_squarespace-mail.com` ✅ |
| Email Campaigns (if used) | Squarespace Campaigns UI | Needs Campaigns DKIM in DNS |
| Commerce emails | Squarespace | Same SPF |

### Gaps in repo (Squarespace cleanup)

- [ ] Form submit tests logged in `change_log.md`
- [ ] Reminder signup snippet deployed (`squarespace/reminder-signup-snippet.html` still has placeholder URL)
- [ ] OVI price on site ($250) vs approved email price ($199) — **align before growth push**
- [ ] `/managed-care`, `/tools/*` pages may not exist yet on Squarespace

### Agent responsible

Squarespace cleanup: `README.md` tasks  
Email embed: `docs/email-reminders-agent-runbook.md` Phase 3

---

## Cloudflare (planned — not in repo)

### What exists today

**Nothing in this repository** — no `wrangler.toml`, no static files, no Pages project.

### Migration plan (README)

1. Finish Squarespace cleanup by **Jul 3–7, 2026**
2. Export / clone site to Cloudflare Pages
3. Point DNS from Squarespace/registrar to Cloudflare

### Email impact when you migrate

| Record | Stays where | Notes |
|--------|-------------|-------|
| Google Workspace (bryan@, camila@) | DNS root | MX → Google — **do not break** |
| Resend `mail.` subdomain | DNS | Move TXT/MX to Cloudflare DNS — copy exactly |
| Squarespace `_squarespace-mail.com` SPF | Can remove **after** leaving Squarespace |
| DMARC `_dmarc` | Keep `p=reject` once Resend passes tests |

Full checklist: `docs/cloudflare-migration-email-dns.md`

---

## Customer email map (everything that hits customers)

```
┌─────────────────────────────────────────────────────────────────┐
│ INBOUND TO YOU (not customer-facing)                             │
│  Squarespace forms → bgillis99@gmail.com / bryan@              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OPT-IN AUTOMATED (Resend) — subscribers only                     │
│  Welcome → welcome-new-lead.html                               │
│  90/60/30 reminders → reminder-*.html                          │
│  Blasts (approved) → blast-new-tool.html                       │
│  From: reminders@mail.norcalcarbmobile.com                      │
│  Status: BLOCKED until Resend DNS verified                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ COLD PROSPECTS (Gmail) — 30/day max                              │
│  Camila@ (preferred) or Bryan@                                   │
│  Templates A–D + pricing + Google reviews link                  │
│  Status: Manual — use Gmail Send Approver agent                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Two-user model (recommended — not tied to legacy)

You are **not** locked to current setup. Recommended split:

| User | Email | Role |
|------|-------|------|
| **Bryan** | `bryan@norcalcarbmobile.com` | Owner, approvals, escalations, form alerts |
| **Camila** | `camila@norcalcarbmobile.com` | Cold outreach, follow-ups, can own Send Queue |

Setup: `docs/two-user-workspace-setup.md`

Both use same Google Workspace — no extra DNS. Bryan approves batches; Camila (or agent) schedules sends.

---

## Bounce & blacklist prevention

| Rule | Implementation |
|------|----------------|
| Never cold from Resend | Gmail only for prospects |
| Verify MX before cold batch | `scripts/cold-outreach/verify-emails.js` |
| 30/day max, 7+ min apart | Gmail Send Approver skill |
| Suppression list | `suppression-template.csv` tab — never resend |
| Remove hard bounces immediately | Sheet `status=bounced` |
| Preflight daily | `email-preflight.yml` 7 AM PT |
| DMARC pass before Resend live | `preflight.js` must green |
| Bryan approves every batch | Sheet column `bryan_approved=YES` |

---

## Preflight snapshot (last run)

```
✅ Root SPF, Google DKIM, DMARC present
❌ Resend DKIM/SPF on mail.norcalcarbmobile.com — ADD IN SQUARESPACE DNS
```

---

## What to run this week (priority order)

1. **Bryan:** Resend DNS in Squarespace (`dns-fix.md`) — 15 min  
2. **Bryan:** Create `camila@` in Google Workspace — 10 min  
3. **Agent:** Gmail Send Approver — first cold batch with approval + schedule  
4. **Agent:** Deploy reminder snippet on Squarespace  
5. **Bryan:** Approve test Resend → `NURTURE_LIVE` + `REMINDERS_LIVE`  
6. **Plan:** Cloudflare repo work starts after Squarespace cleanup (Jul window)

---

## Special agent for your approval + Gmail schedule

**`.cursor/skills/gmail-send-approver/SKILL.md`**

Paste to Manus / Cursor:

> Load gmail-send-approver skill. Build today's cold queue, verify emails, wait for my YES in the sheet, then schedule Gmail sends 7 minutes apart. Max 30. Do not send without my approval.
