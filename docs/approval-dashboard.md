# NorCal Ops Approval Dashboard

One web page where **you and your team** review pending work, **Approve** or **Remove** items, without editing spreadsheet rows by hand.

| Queue | Sheet tab | What it controls |
|-------|-----------|------------------|
| **Cold email** | Send Queue | Outbound camila@ cold mail (max 30/day after approval) |
| **GBP posts** | GBP Posts | Local Google Business Profile posts (optional tab) |

Camila and GitHub Actions still **only send** rows with `bryan_approved = YES`. The dashboard sets that column for you.

---

## Bryan — one-time setup (~15 min)

1. Open the **NorCal Camila Ops** Google Sheet (create via `setupCamilaOpsSheet()` if needed).
2. **Extensions → Apps Script** — in the same project, add:
   - `cold-outreach-log-setup.gs` (if not already)
   - `CamilaApprovalDashboard.gs`
   - `CamilaApprovalDashboard.html` (File → New → HTML, name must match)
3. Run **`setupCamilaOpsSheet()`** once (creates tabs + **Approvers** list).
4. Run **`setupApprovalDashboard()`** once (adds `approved_by` / `approved_at` columns).
5. **Deploy → New deployment → Web app**
   - **Execute as:** Me (`bryan@norcalcarbmobile.com`)
   - **Who has access:** Anyone with a Google account  
     (only emails on the **Approvers** tab can actually use it)
6. Copy the **Web app URL**.
7. Apps Script → **Project Settings → Script properties**:
   - `APPROVAL_DASHBOARD_URL` = paste URL
   - `CAMILA_SHEET_ID` = spreadsheet ID (set automatically by setup, or paste from sheet URL)
   - `GOOGLE_CHAT_WEBHOOK_URL` = optional — Chat messages will link to the dashboard

Bookmark the URL on your phone. Pin it in Google Chat when Camila says “batch ready.”

---

## Add other approvers

Open the sheet → **Approvers** tab:

| email | name | role | active |
|-------|------|------|--------|
| `bryan@norcalcarbmobile.com` | Bryan Gillis | owner | YES |
| `teammate@company.com` | Name | approver | YES |

They sign in with that Google account at the dashboard URL. They do **not** need access to the raw sheet unless you want them to have it.

---

## Daily use

1. Camila (or the lead builder) fills **Send Queue** with `status=pending`, `mx_ok=TRUE`.
2. You open the **Ops dashboard** → **Cold email queue**.
3. For each row: **Approve** (ready to send) or **Remove** (skip — sets `status=removed`).
4. Or **Approve all on this tab** after you skim the list.
5. When ready for Gmail to schedule: GitHub Action **Camila Cold Outreach** with `send_approved_batch=true` (or Camila’s scheduler), **or** say **`approved batch YYYY-MM-DD`** in Chat.

**Remove** does not delete history — it marks the row `removed` so it never sends.

---

## GBP posts (optional)

Add a sheet tab **GBP Posts** with columns:

`publish_date`, `post_title`, `post_body`, `cta_url`, `status`, `bryan_approved`, `notes`

Use `status=draft` until approved in the dashboard. Same approval column as cold mail.

---

## Security notes

- Web app runs **as Bryan** (script owner) so approvers don’t need Editor on the sheet.
- Access is gated by the **Approvers** tab + Google sign-in.
- Every approve/remove is logged on **Chat Log** with the user’s email.

---

## Config reference

`config/approval-dashboard.json` — queue definitions and default approvers.

**Related:** `.cursor/skills/gmail-send-approver/SKILL.md`, `docs/camila-mailbox-setup-checklist.md`
