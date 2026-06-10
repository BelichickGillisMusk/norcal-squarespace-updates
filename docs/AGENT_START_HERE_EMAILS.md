# Agent: start here for reminder emails

**One file to open:** [`email-reminders-agent-runbook.md`](./email-reminders-agent-runbook.md)

**One-line task for Manus / Cursor / other agents:**

> Deploy CTC deadline reminder emails per `docs/email-reminders-agent-runbook.md`. Use only approved scripts in this repo. Stop at Bryan's test-email approval before setting `REMINDERS_LIVE=true`.

## What Bryan must provide before you send anything

- Resend API key + DNS verified on `norcalcarbmobile.com`
- Google Sheet created from `scripts/google-apps-script/subscribers-sheet-template.csv`
- Apps Script web app deployed from `scripts/google-apps-script/WebApp.gs`
- GitHub secrets listed in the runbook
- Squarespace Code block pasted from `squarespace/reminder-signup-snippet.html`

## Approval gate

Send test to `bgillis99@gmail.com` via GitHub Actions → **CTC Reminder Emails** → `test_email: bgillis99@gmail.com` → Run.

Wait for Bryan: **"approved to send"** → set secret `REMINDERS_LIVE=true`.
