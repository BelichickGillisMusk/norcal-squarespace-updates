# Summer 2026 email strategy — NorCal CARB Mobile

**Goal:** Stay in front of every lead and customer through deadline season. Inbox placement first, volume second.

**PM skill:** `.cursor/skills/norcal-email-deployer/SKILL.md`

---

## Strategy pillars

### 1. Three channels, one list

```
                    ┌─────────────────────┐
  New tool signup ──►│ Google Sheet        │
  Past customer CSV ─│ (single source)     │
  Cold reply opt-in ─└─────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Resend welcome        90/60/30 reminders    Gmail cold 30/day
   + blasts              (opt-in only)         (prospects)
```

### 2. Product ladder (every touchpoint)

| Tier | Offer | Who |
|------|-------|-----|
| **Free** | Phone tools hub — deadlines, OBD/OVI, fleet math | Everyone |
| **Transactional** | Mobile test OBD $75 / OVI $199 | Ready to book |
| **Switch** | Beat price or 50% off first test | Has another tester |
| **Full Care** | CTC-VIS fee + $40/year — we handle CARB | Wants zero admin |

### 3. Deliverability first

- Resend on **`mail.norcalcarbmobile.com`** subdomain (DMARC-safe)
- Cold only from **`bryan@norcalcarbmobile.com`** (Google DKIM)
- Preflight daily — pause if DNS breaks
- See `email-deliverability-verification.md`

---

## June — Launch & ramp

**Theme:** *"Free tools on your phone + we come to your yard"*

| Week | Automated | Manual / cold | Blast |
|------|-----------|---------------|-------|
| Jun 9–15 | Deploy + test | 10/day drafts | — |
| Jun 16–22 | Welcome + reminders live | 20/day | `tools-launch-v1` Jun 16 |
| Jun 23–30 | Daily ops | 30/day | — |

**Content hooks:** Heat = trucks running hard, don't pull units for shop visits. Mobile at yard. Deadline calculator.

---

## July — Urgency & Full Care

**Theme:** *"Don't get flagged in CTC-VIS before your window closes"*

| Week | Focus |
|------|-------|
| Jul 1–7 | Blast `managed-care-v1` + cold template C (Full Care) |
| Jul 8–14 | 30/day cold template A (deadline hook) |
| Jul 15–21 | Fleet template B — batch yard visits |
| Jul 22–31 | Switch offer push — beat shop prices |

**Jul 4 window:** Squarespace cleanup complete (Cloudflare migration prep). No blast Jul 4.

---

## August — Fleet & 2028 prep

**Theme:** *"2028 = 4 tests per year — fix your process now"*

- Fleet cost calculator in every blast footer
- Target 3+ truck operations
- Blog: quarterly cadence starts Q4 2027 for Q1 2028 deadlines
- Aug blast: `when-is-my-test-due-v1` to re-engage cold non-openers (opt-in sheet only — **not** cold Gmail list)

---

## September — Harvest

- "Fall deadline" reminder to full opted-in list
- Scrub bounces and opt-outs
- Metrics review → adjust fall cadence

---

## KPIs (weekly in change_log.md)

| Metric | Target |
|--------|--------|
| Inbox placement (test headers) | dmarc=pass 100% |
| Opt-out rate | < 1% of sends |
| Bounce rate | < 3% |
| Cold replies / 30 sends | track trend |
| Bookings attributed to email | Bryan tags in CRM/sheet |
| Welcome sent within 24h of signup | 100% |

---

## Calendar reference

Detailed dates: `.cursor/skills/norcal-email-deployer/references/summer-calendar.md`  
Today’s tasks: `DEPLOY_TODAY.md`

---

## Agent weekly PM ritual (Mondays)

1. Run preflight
2. Compare calendar vs `change_log.md`
3. Propose this week's blast (if 30+ days since last)
4. Report cold send stats + opt-outs
5. Update DEPLOY_TODAY.md for the week ahead
