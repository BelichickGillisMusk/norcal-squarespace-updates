---
name: gmail-send-approver
description: NorCal CARB Mobile Gmail cold-send approver and scheduler — execution layer for Camila Vertex AI agent. Use when Bryan wants approval before cold emails go out, schedule sends via Gmail API to avoid blacklisting, prevent bounces, camila@ outreach at 30/day max. Pair with camila-vertex-agent skill. Never send without bryan_approved=YES in the Send Queue sheet.
---

# Gmail Send Approver — NorCal CARB Mobile

**Purpose:** Bryan approves every batch. Agent verifies addresses, drafts Gmail messages, **schedules sends** staggered across the day so you don't get blacklisted. Bryan's time minimized.

**Pair with:** `.cursor/skills/norcal-email-deployer/SKILL.md` (DNS, Resend, preflight)

**Send from:** `camila@norcalcarbmobile.com` (default) or `bryan@norcalcarbmobile.com`

---

## Hard rules

| Rule | Value |
|------|-------|
| Max sends per day | **30** |
| Min gap between scheduled sends | **7 minutes** |
| Send window | 8:00 AM – 4:00 PM Pacific, Tue–Thu preferred |
| Bryan approval required | `bryan_approved` = `YES` in sheet |
| Bounce risk | Run `verify-emails.js` — skip `mx_ok=FALSE` |
| Never | BCC blast, Resend for cold, send without approval |
| After send | Log `status=sent` + `scheduled_at` in sheet |

---

## Daily workflow (agent executes in order)

### Step 1 — Preflight (5 min)

```bash
cd scripts/email-deploy && node preflight.js
cd ../cold-outreach && node verify-emails.js --sheet-tab pending
```

If Resend DNS fails, **cold Gmail can still proceed** — but flag Bryan if automated nurture is also planned today.

### Step 2 — Build queue (agent)

1. Open Google Sheet **NorCal Gmail Send Queue** (or import `gmail-send-queue-template.csv`)
2. Add up to **30** rows: `status=pending`, today's date
3. Personalize: `email`, `company`, `first_name`, `city`, `template_id` (A/B/C/D)
4. Assign `scheduled_send_pt` — staggered times (see schedule table below)
5. Set `bryan_approved` = **empty** (waiting)

### Step 3 — Verify emails (agent)

```bash
cd scripts/cold-outreach
node verify-emails.js --input pending-rows.csv
```

- `mx_ok=TRUE` → keep
- `mx_ok=FALSE` → `status=invalid`, do not queue
- Role addresses (`info@`, `noreply@`) → `status=review` — Bryan decides

### Step 4 — Bryan approval (STOP until YES)

Message Bryan:

> **Cold batch ready:** {N} emails for {date}. Sheet tab `Queue`. MX verified: {ok}/{total}. Reply **`approved batch {date}`** to schedule Gmail sends.

**Do not proceed** without exact phrase or `bryan_approved=YES` on every row.

### Step 5 — Schedule in Gmail (agent or Camila)

For each approved row:

1. Open Gmail as **camila@** (or Bryan send-as Camila)
2. **Compose** — paste template from `docs/cold-outreach-agent-one-pager.md`
3. Replace `{reviews_url}` from `config/cold-email-manifest.json`
4. **Schedule send** → pick `scheduled_send_pt` from sheet
5. Mark row `status=scheduled`

**Gmail UI:** Compose → ⋮ → Schedule send → pick date/time

### Step 6 — End of day log

Append to `change_log.md`:

```markdown
## Gmail batch YYYY-MM-DD
- Approved by: Bryan
- Sent from: camila@
- Count: N scheduled (max 30)
- Invalid skipped: N
- Opt-outs honored: N
```

---

## Schedule table (30 sends, 7 min apart)

Start **8:05 AM PT** — ends ~11:28 AM

| # | Time PT | # | Time PT |
|---|---------|---|---------|
| 1 | 8:05 | 16 | 9:50 |
| 2 | 8:12 | 17 | 9:57 |
| 3 | 8:19 | 18 | 10:04 |
| ... | +7 min | 30 | 11:28 |

For **10/day warmup week:** use rows 1–10 only.

---

## Templates & pricing

Copy from `docs/cold-outreach-agent-one-pager.md` templates A–D.

Every email includes:
- OBD **$75** · OVI **$199**
- 50% off switch · beat quote
- **4.9★ reviews:** `config/cold-email-manifest.json` → `google_reviews_url`

---

## Bounce / blacklist prevention

1. **Suppression tab** — never email those addresses
2. **verify-emails.js** before queue
3. **7 min spacing** — mandatory
4. **No attachments** on cold #1
5. If Gmail warns "many bounced" → **pause 72h**, notify Bryan
6. Opt-out replies → suppression + `status=opted_out` within 24h

---

## Two-user setup

| Person | Action |
|--------|--------|
| Bryan | `bryan_approved=YES`, handles escalations |
| Camila | Schedules sends in Gmail after approval |
| Agent | Queue, verify, draft, log |

See `docs/two-user-workspace-setup.md`

---

## What this agent does NOT do

- Send Resend nurture (use email-deployer skill)
- Edit Squarespace (use README agent)
- Send without Bryan approval
- Exceed 30/day

---

## Bryan one-liner

> Load **gmail-send-approver** skill. Build today's queue, verify MX, show me the sheet, wait for **approved batch {date}**, then schedule 7 minutes apart in Camila's Gmail.

---

## Reference files

| File | Purpose |
|------|---------|
| `scripts/cold-outreach/gmail-send-queue-template.csv` | Queue schema |
| `scripts/cold-outreach/verify-emails.js` | MX check |
| `scripts/cold-outreach/suppression-template.csv` | Never-email list |
| `config/cold-email-manifest.json` | Reviews URL + pricing |
| `docs/PLATFORM_EMAIL_AUDIT.md` | Full platform review |
