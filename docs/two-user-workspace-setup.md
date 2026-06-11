# Two-user Google Workspace — Bryan + Camila

You are **not tied** to a single sender. This is the recommended setup for growth with less of Bryan's time.

---

## Users

| Display name | Email | License | Purpose |
|--------------|-------|---------|---------|
| Bryan Gillis | `bryan@norcalcarbmobile.com` | Admin | Owner, approvals, customer escalations, form notifications |
| Camila | `camila@norcalcarbmobile.com` | User | Cold outreach, follow-ups, scheduled Gmail sends |

**Optional display name:** Use any first name for the outreach rep — update `config/cold-email-manifest.json` and templates if not "Camila".

---

## Setup steps (Bryan — ~20 min)

### 1. Create Camila

Google Admin → [admin.google.com](https://admin.google.com) → Directory → Users → **Add new user**

- Primary email: `camila@norcalcarbmobile.com`
- Reset password → share securely with Camila (or Bryan holds login for agent draft-only mode)

### 2. Bryan keeps admin

- Do not remove Bryan as super admin
- Form notifications can stay on `bgillis99@gmail.com` + `bryan@`

### 3. Shared Send Queue (Google Sheet)

Create sheet: **NorCal Gmail Send Queue**

Import tabs:
- `scripts/cold-outreach/gmail-send-queue-template.csv`
- `scripts/cold-outreach/suppression-template.csv`
- `scripts/cold-outreach/daily-send-log-template.csv`

Share with:
- Bryan — Editor
- Camila — Editor (can schedule sends)
- Service account (if agent reads via API) — Editor

### 4. Optional: Bryan sends as Camila

Gmail → Settings → Accounts → **Send mail as** → Add `camila@norcalcarbmobile.com`

Use when Camila is not logging in but Bryan approves drafts.

### 5. Resend display name (automated opt-in mail)

GitHub secret (optional warmer automated sends):

```txt
REMINDER_FROM_NAME=Camila at NorCal CARB Mobile
REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com
```

Automated mail still from `reminders@mail...` — not Camila's Gmail.

---

## Who does what

| Task | Bryan | Camila | Agent |
|------|-------|--------|-------|
| Approve cold batch | ✅ YES in sheet | — | Builds queue |
| Schedule Gmail sends | Optional | ✅ Preferred | Drafts + times |
| Resend LIVE toggles | ✅ GitHub secrets | — | Proposes |
| Reply to interested leads | Escalations | ✅ First line | — |
| Form broken on Squarespace | ✅ | — | Fixes |

---

## Approval phrase

Bryan replies in chat or sheet note:

**`approved batch YYYY-MM-DD`**

Agent may then schedule Gmail sends for that batch only.
