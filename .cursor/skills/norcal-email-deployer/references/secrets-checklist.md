# GitHub secrets checklist

Set in repo **Settings → Secrets and variables → Actions**.

## Required (all channels)

| Secret | Example |
|--------|---------|
| `RESEND_API_KEY` | `re_...` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON key |
| `GOOGLE_SPREADSHEET_ID` | From Sheet URL |
| `GOOGLE_SHEET_NAME` | `Subscribers` |
| `REMINDER_FROM_EMAIL` | `reminders@mail.norcalcarbmobile.com` |
| `REMINDER_FROM_NAME` | `NorCal CARB Mobile` |
| `SITE_BASE_URL` | `https://norcalcarbmobile.com` |
| `BOOKING_URL` | `https://norcalcarbmobile.com/contact` |
| `SWITCH_URL` | `https://norcalcarbmobile.com/switch-and-save` |
| `MANAGED_CARE_URL` | `https://norcalcarbmobile.com/managed-care` |
| `APPS_SCRIPT_WEBAPP_URL` | Apps Script web app deploy URL |

## Live toggles (default OFF)

| Secret | Set to `true` when |
|--------|-------------------|
| `NURTURE_LIVE` | Bryan: "approved welcome" |
| `REMINDERS_LIVE` | Bryan: "approved reminders" |
| `BLAST_APPROVED` | Only during approved blast, then reset |
| `EMAIL_PREFLIGHT_STRICT` | `true` — block ops workflow if DNS fails |

## Squarespace (existing)

| Secret | Use |
|--------|-----|
| `SQUARESPACE_API_KEY_UPDATES` | Site updates |
| `SQUARESPACE_EMAIL` | Editor login |
| `SQUARESPACE_PASSWORD` | Editor login |

## Camila cold outreach + form auto-reply (new)

| Secret | Example | Required for |
|--------|---------|-------------|
| `CAMILA_SERVICE_ACCOUNT_JSON` | Full JSON key | Gmail API (camila@ + sales@), Sheets |
| `CAMILA_SHEET_ID` | From Sheet URL | Send Queue, Form Leads, logs |
| `GOOGLE_CHAT_WEBHOOK_URL` | From Chat space → Manage webhooks | Bryan batch-ready alerts, first-draft sent |
| `FMCSA_API_KEY` | QCMobile WebKey from mobile.fmcsa.dot.gov (My WebKeys) | SAFER / safer_query.py + lead builder |
| `GOOGLE_PLACES_API_KEY` | From **Hermes** GCP Places API | Camila Ops nightly discover |
| `COLD_OUTREACH_LIVE` | `true` | Unlock hourly Gmail sends (cranes/concrete) |
| `SEND_FROM` | `camila@norcalcarbmobile.com` | Cold outreach sender |
| `REPLY_FROM` | `sales@norcalcarbmobile.com` | Contact form auto-reply sender |
| `ESCALATE_TO` | `bryan@norcalcarbmobile.com` | Fleet/complex lead escalation |

## Not in GitHub (Bryan only)

- Gmail login for manual cold outreach (browser session)
- Resend dashboard access
