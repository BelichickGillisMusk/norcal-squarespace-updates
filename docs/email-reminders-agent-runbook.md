# Agent Runbook — CTC Reminder Emails (Squarespace → Send)

**Audience:** Manus, Cursor Cloud Agent, or any LLM agent Bryan approves to deploy.  
**Goal:** Turn on 90 / 60 / 30-day reminder emails for the “When Is My Test Due?” tool on Squarespace, using **pre-approved scripts in this repo only**.

**Do not invent new email copy or new scripts.** Use files listed in [Approved files](#approved-files) verbatim unless Bryan explicitly requests edits.

**Also read:** [`subscriber-nurture-agent-runbook.md`](./subscriber-nurture-agent-runbook.md) for welcome emails, customer import, tool blasts, and NorCal Family Full Care ($40/year) positioning.

**Sheet schema note:** If you deployed an older sheet with 12 columns, replace headers from `scripts/google-apps-script/subscribers-sheet-template.csv` or redeploy `WebApp.gs` on a fresh import tab.

---

## Architecture (what you are wiring up)

```
Squarespace calculator page
  └─ embed: squarespace/reminder-signup-snippet.html
       └─ POST → Google Apps Script web app (subscribe)
            └─ appends row to Google Sheet

GitHub Actions (daily 8:00 AM Pacific)
  └─ scripts/send-reminders.js
       └─ reads Google Sheet
       └─ sends via Resend API
       └─ marks sent_90 / sent_60 / sent_30 columns

User clicks "I already tested" in email
  └─ GET → Google Apps Script web app (cancel)
       └─ sets reminders_enabled = FALSE for that row
```

Squarespace handles the **signup UI**. Google Sheet is the **database**. GitHub Actions + Resend handle **scheduled sends**. Google Apps Script handles **write + cancel** without a paid Zapier account.

---

## Before you start

| Item | Owner | Where |
|------|-------|-------|
| Squarespace editor access | Bryan | `SQUARESPACE_EMAIL` / `SQUARESPACE_PASSWORD` secrets |
| Google account for Sheet + Apps Script | Bryan | Same Gmail workspace OK |
| Resend account + API key | Bryan | [resend.com](https://resend.com) — free tier OK for launch |
| DNS for sending domain | Bryan | Add Resend DKIM records on `norcalcarbmobile.com` |
| GitHub repo secrets | Agent sets after Bryan approves | This repo → Settings → Secrets |

**Blocker rule:** If any secret is missing, log it in `change_log.md` and stop. Do not skip email verification.

---

## Phase 1 — Google Sheet (15 min)

1. Open [Google Sheets](https://sheets.google.com) logged in as Bryan (or delegated account).
2. **File → Import** → upload `scripts/google-apps-script/subscribers-sheet-template.csv` from this repo.
3. Rename the spreadsheet: **`NorCal CTC Reminder Subscribers`**.
4. Copy the **Spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`
5. Share the sheet with the Google service account email (created in Phase 4) as **Editor**.

**Sheet columns (do not rename):** full list in `subscribers-sheet-template.csv`. Key columns:

| Column | Purpose |
|--------|---------|
| `email` | Recipient |
| `first_name` | Optional personalization |
| `audience_type` | `NEW_LEAD`, `EXISTING_CUSTOMER`, or `SUBSCRIBER` |
| `marketing_opt_in` | `TRUE` = welcome + blasts |
| `welcome_sent` | Date welcome delivered (empty = pending) |
| `next_deadline` | `YYYY-MM-DD` (optional if no reminders) |
| `reminders_enabled` | `TRUE` / `FALSE` |
| `cancel_token` | Unsubscribe + "I already tested" |
| `sent_90` / `sent_60` / `sent_30` | Reminder dates sent |
| `last_blast_campaign` | Prevents duplicate blasts |

---

## Phase 2 — Google Apps Script webhooks (20 min)

1. In the spreadsheet: **Extensions → Apps Script**.
2. Delete default `Code.gs` content.
3. Paste **entire contents** of `scripts/google-apps-script/WebApp.gs` from this repo.
4. **Project Settings** → note the script is bound to the sheet.
5. Set script properties (**Project Settings → Script properties**):

   | Property | Value |
   |----------|-------|
   | `SPREADSHEET_ID` | From Phase 1 |
   | `SHEET_NAME` | `Subscribers` |

6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the **Web app URL** → this is `APPS_SCRIPT_WEBAPP_URL`.
8. Test subscribe (agent must run and verify):

```bash
curl -s -X POST "$APPS_SCRIPT_WEBAPP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@norcalcarbtest.dev",
    "vehicle_label": "Test Truck",
    "registration_type": "CA",
    "next_deadline": "2026-09-15",
    "test_type": "OBD"
  }'
```

Expected: `{"ok":true,"id":"..."}` and new row in sheet.

9. Test cancel — copy `cancel_token` from the new row:

```bash
curl -s "$APPS_SCRIPT_WEBAPP_URL?action=cancel&token=CANCEL_TOKEN_HERE"
```

Expected: `{"ok":true,"cancelled":true}` and `reminders_enabled` = `FALSE`.

---

## Phase 3 — Squarespace embed (30 min)

1. Log into Squarespace config: `https://aqua-alpaca-m37c.squarespace.com/config/`
2. Create or open the page for the deadline tool (e.g. `/when-is-my-test-due` or a new page under **Pages**).
3. Add a **Code** block at the bottom of the calculator results section.
4. Paste contents of `squarespace/reminder-signup-snippet.html`.
5. Find and replace **one placeholder** in the snippet:

   ```javascript
   const WEBAPP_URL = 'PASTE_APPS_SCRIPT_WEBAPP_URL_HERE';
   ```

6. Save and publish.
7. On the live site, submit a test signup with `test@norcalcarbtest.dev`.
8. Confirm row appears in Google Sheet within 30 seconds.

**Squarespace form fallback (if Code block is blocked by plan):**

- Create a native Squarespace form with fields: Email, Vehicle label, Next deadline, Test type.
- Route notifications to `bgillis99@gmail.com`.
- Log blocker: *manual CSV import required until Code block or Cloudflare migration* — daily cron will not see these rows automatically.

---

## Phase 4 — Resend + Google service account (20 min)

### Resend

1. Add domain `norcalcarbmobile.com` in Resend → DNS records → verify.
2. Create API key → store as GitHub secret `RESEND_API_KEY`.
3. Set `FROM_EMAIL` = `reminders@norcalcarbmobile.com` (or verified sender).

### Google Sheets API (for GitHub Actions reader)

1. [Google Cloud Console](https://console.cloud.google.com) → new project `norcal-ctc-reminders`.
2. Enable **Google Sheets API**.
3. **IAM → Service accounts** → Create → download JSON key.
4. Paste entire JSON as GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON` (single line or multiline OK).
5. Share the spreadsheet with the service account email (`...@....iam.gserviceaccount.com`) as Editor.

---

## Phase 5 — GitHub secrets + workflow (10 min)

Add these repository secrets:

| Secret | Example / notes |
|--------|-----------------|
| `RESEND_API_KEY` | `re_...` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON key file |
| `GOOGLE_SPREADSHEET_ID` | From Phase 1 |
| `GOOGLE_SHEET_NAME` | `Subscribers` |
| `REMINDER_FROM_EMAIL` | `reminders@norcalcarbmobile.com` |
| `REMINDER_FROM_NAME` | `NorCal CARB Mobile` |
| `SITE_BASE_URL` | `https://norcalcarbmobile.com` |
| `BOOKING_URL` | `https://norcalcarbmobile.com/contact` (or booking page) |
| `SWITCH_URL` | `https://norcalcarbmobile.com/switch-and-save` |
| `APPS_SCRIPT_WEBAPP_URL` | For cancel links in emails |
| `REMINDERS_LIVE` | Set to `true` only after Bryan approves test email — enables daily cron sends |

Enable workflow: `.github/workflows/ctc-reminder-emails.yml`  
Until `REMINDERS_LIVE=true`, daily cron **dry-runs only**. Use **workflow_dispatch** to send test emails.

---

## Phase 6 — Dry run and live test (required)

Agent runs locally or via workflow dispatch:

```bash
cd scripts/reminder-engine
npm ci
npm run send -- --dry-run
```

Then send one real test to Bryan:

```bash
npm run send -- --test-email bgillis99@gmail.com --force-template 30
```

**Bryan approval checkpoint:** Do not enable daily cron until Bryan replies **“approved to send”** on the test email.

After approval:

```bash
# Via GitHub Actions → "CTC Reminder Emails" → Run workflow → dry_run: false
```

Or merge PR and let cron run at `0 15 * * *` UTC (8:00 AM Pacific during PDT).

---

## Phase 7 — Verification checklist

- [ ] Subscribe from live Squarespace page → row in sheet
- [ ] Test email received at `bgillis99@gmail.com` with correct pricing (OBD $75 / OVI $199 / Motorhome OBD $99 / Motorhome OVI $229)
- [ ] "I already tested" link sets `reminders_enabled` to FALSE
- [ ] `--dry-run` shows correct 90/60/30 matches for a seeded test row
- [ ] Unsubscribe / cancel stops future sends for that row
- [ ] `change_log.md` updated with deployment timestamps and URLs (redact secrets)

---

## Approved files

| File | Purpose | Modify? |
|------|---------|---------|
| `email/templates/confirm-subscription.html` | Sent immediately on signup | Only with Bryan approval |
| `email/templates/reminder-90.html` | 90-day reminder | Only with Bryan approval |
| `email/templates/reminder-60.html` | 60-day reminder | Only with Bryan approval |
| `email/templates/reminder-30.html` | 30-day reminder | Only with Bryan approval |
| `scripts/google-apps-script/WebApp.gs` | Subscribe + cancel webhook | Only with Bryan approval |
| `scripts/reminder-engine/send-reminders.js` | Daily sender | Only with Bryan approval |
| `squarespace/reminder-signup-snippet.html` | Squarespace embed | Only with Bryan approval |
| `.github/workflows/ctc-reminder-emails.yml` | Cron runner | Only with Bryan approval |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Apps Script returns 401/403 | Redeploy web app as "Anyone"; re-copy URL |
| Rows not appearing | Check `SPREADSHEET_ID` script property; run curl test |
| Resend bounce | Domain DKIM not verified |
| GitHub Action can't read sheet | Service account not shared on spreadsheet |
| Duplicate emails | Check `sent_90` columns — script skips if already set |
| Wrong template | Verify `next_deadline` is `YYYY-MM-DD` |

---

## After Cloudflare migration (July 2026)

Replace Squarespace Code block with the same snippet on the static tool page. Keep Google Sheet + GitHub Actions unchanged, or migrate subscribers to Cloudflare D1 — out of scope until migration PR is opened.
