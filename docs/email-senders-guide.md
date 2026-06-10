# Who sends what — email addresses

**You do not need to email the AI agent.** It has no inbox. Deploy via GitHub secrets, Google Sheet, and Gmail drafts.

---

## Approved senders

| Address | Role | Channel | Notes |
|---------|------|---------|-------|
| `camila@norcalcarbmobile.com` | **Cold outreach rep** (preferred) | Gmail, 30/day | Warmer than owner cold email; same DKIM/SPF |
| `bryan@norcalcarbmobile.com` | Owner, replies, escalations | Gmail | Use when lead asks for owner or after Camila intro |
| `reminders@mail.norcalcarbmobile.com` | Automated nurture + reminders | Resend | Opt-in subscribers only |
| `bgillis99@gmail.com` | Notifications only | Inbound | Form alerts, tests — **never** bulk send |

---

## Setup Camila (15 min, Bryan)

1. **Google Workspace Admin** → Directory → Users → **Add user**
2. Email: `camila@norcalcarbmobile.com`
3. Name: Camila (or your preferred display name)
4. License: same as Bryan if required
5. **Optional:** Bryan adds delegate access so Bryan can send-as Camila from his Gmail (Settings → Accounts → Send mail as)

No extra DNS needed — `google._domainkey` and root SPF already cover all Workspace mailboxes.

---

## Should Bryan email the agent?

**No.** Instead:

| Need | Do this |
|------|---------|
| API keys | GitHub repo → Settings → Secrets |
| Approve sends | Reply in Cursor/chat: `approved cold send`, etc. |
| Test deliverability | GitHub Actions → run test workflow to `bryan@` or `camila@` |
| Lead list | CSV in repo or Google Sheet |

---

## Automated emails — warmer from name (optional)

GitHub secret:

```txt
REMINDER_FROM_NAME=Camila at NorCal CARB Mobile
REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com
```

Inbox shows: **Camila at NorCal CARB Mobile** `<reminders@mail.norcalcarbmobile.com>`

---

## Cold email social proof

- **Reviews:** 4.9★ · 47+ verified fleet reviews — link in every cold email
- **Config:** `config/cold-email-manifest.json` → Bryan pastes Google Maps review URL
- **Aggressive pricing:** OBD $75, OVI $199, 50% off switch, beat-quote offer — see cold-outreach one-pager

## Rules

- **One cold sender per day** — Camila OR Bryan, not both splitting 30 (pick Camila)
- Never cold from Resend or `reminders@`
- Replies to Camila → Camila (or Bryan) responds within 1 business day
