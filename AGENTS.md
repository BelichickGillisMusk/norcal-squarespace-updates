# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This is an **operations / automation repo** for the NorCal CARB Mobile business — not a web app. There is **no server, frontend, or build step**. It bundles agent instructions (`README.md`, `.cursor/skills/`), docs, static config/JSON, HTML email templates, and a small set of runnable Node.js CLI scripts. The public website itself is hosted externally on Squarespace and is not part of this repo.

### Runnable code (the actual "application")
- `scripts/reminder-engine/` — the core email engine (Resend + Google Sheets). Has a local `package.json`/lockfile (`googleapis`). Run `npm ci` here. Node 20+ (CI uses 20; Node 22 also works). ESM (`"type": "module"`).
- `scripts/attention-hq/` — daily ops scorecard CLI (fixtures or Google Sheets). Has its own `package.json`/lockfile (`googleapis`). Run `npm ci` in this directory before running tests/CLI.
- `scripts/email-deploy/` — `preflight.js`, a DNS/secret checker. **No dependencies**, nothing to install.
- `scripts/cold-outreach/verify-emails.js` — MX/email verifier. No deps. Requires the `dig` system binary (already present).
- `scripts/google-apps-script/WebApp.gs` — deployed as a Google Apps Script web app; **not runnable locally**.

### Lint / test / build
There is **no repo-wide lint config and no build step** in this repo. `scripts/attention-hq/` includes a self-contained Node test suite (`npm test`) and `.github/workflows/attention-hq.yml` runs it. `.github/workflows/blank.yml` remains a placeholder "hello world" workflow.

### How to run safely (no credentials needed)
Live sends are gated behind both secrets and explicit flags. **Always use `--dry-run` for testing and never set `REMINDERS_LIVE` / `NURTURE_LIVE` / `BLAST_APPROVED=true` without Bryan's approval.**

Content-URL env vars are required **even for `--dry-run`** of welcome/blast and for the reminder test path (templates call `requireEnv` while rendering):
```bash
export SITE_BASE_URL=https://norcalcarbmobile.com \
       BOOKING_URL=https://norcalcarbmobile.com/book \
       SWITCH_URL=https://norcalcarbmobile.com/switch \
       MANAGED_CARE_URL=https://norcalcarbmobile.com/managed-care \
       APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/EXAMPLE/exec
```
From `scripts/reminder-engine/`:
```bash
npm run send -- --dry-run                                        # reminders (needs Sheets creds even for dry-run)
npm run send -- --test-email you@x.com --force-template 30 --dry-run  # renders a template, no Sheets needed
npm run welcome -- --dry-run                                     # needs Sheets creds even for dry-run
npm run blast -- --campaign-id tools-launch-v1 --dry-run         # approved ids: tools-launch-v1, when-is-my-test-due-v1, managed-care-v1
```
Note: the full `send`/`welcome`/`blast` dry-runs still read the subscriber list from Google Sheets, so they need `GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_SPREADSHEET_ID`. Only the `--test-email --force-template` path renders a template without touching Sheets.

### preflight.js gotcha
`scripts/email-deploy/preflight.js` may **exit with code 1** when required DNS records (notably Resend DKIM/SPF for `mail.norcalcarbmobile.com`) are missing — this is a known production DNS blocker at the time of writing (see `change_log.md`), **not an environment problem**. The script itself is working correctly (it performs real `dig` lookups).

### Secrets used at runtime (set as env vars when going live)
`RESEND_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SPREADSHEET_ID`, `REMINDER_FROM_EMAIL` (should be `@mail.norcalcarbmobile.com`), `APPS_SCRIPT_WEBAPP_URL`, plus the content URLs above. The subscriber datastore is a Google Sheet named `Subscribers` (not a SQL/NoSQL DB).
