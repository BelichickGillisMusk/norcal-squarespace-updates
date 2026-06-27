# Agent Runbook — Subscriber Welcome, Blasts & NorCal Family

**Audience:** Manus, Cursor Cloud Agent, or any agent Bryan approves.  
**Prerequisite:** Complete `docs/email-reminders-agent-runbook.md` first (Sheet, Apps Script, Resend, GitHub secrets).

**Goal:** Every new lead and imported customer gets a **welcome email** with free phone tools + **Full Care ($40/year)** upsell. Bryan can approve **blasts** to the full list when new tools launch.

---

## Audience types

| `audience_type` | Who | Welcome template |
|-----------------|-----|------------------|
| `NEW_LEAD` | Signed up via tool or site form | `welcome-new-lead.html` — "Come aboard the NorCal family" |
| `EXISTING_CUSTOMER` | Past test customers (CSV import) | `welcome-existing-customer.html` — "Welcome back" |
| `SUBSCRIBER` | General list opt-in, no test yet | `welcome-new-lead.html` |

All welcomes include:
- **Free DIY path** — tools hub, add to home screen on phone
- **Full Care path** — CARB annual compliance fee (CTC-VIS) + **$40/year** for setup, monitoring, reminders, and testing

---

## Two product paths (copy in every welcome)

### Path A — Free tools on your phone
- Open `{{site_base_url}}/tools`
- Add to Home Screen (works like an app)
- Deadline calculator, OBD vs OVI, fleet math, CTC-VIS checklist, etc.
- **Positioning:** Handle compliance without calling CARB

### Path B — NorCal Family Full Care
- **Price:** CARB's annual compliance fee per vehicle (paid through CTC-VIS) + **$40/year** to NorCal CARB Mobile
- **Includes:** CTC-VIS setup, vehicle registration, deadline monitoring, 90/60/30 reminders, scheduled mobile tests
- **Per-test fees still apply:** OBD **$75** · OVI **$199** · Motorhome OBD **$99** · Motorhome OVI **$229** per visit
- **CTA:** `MANAGED_CARE_URL` → `/managed-care` on Squarespace

---

## Phase 1 — Import old customers (one-time)

1. Export past customer emails from Squarespace / booking records.
2. Fill `scripts/google-apps-script/customer-import-template.csv`:
   - `audience_type` = `EXISTING_CUSTOMER`
   - `source` = `customer_import`
   - `marketing_opt_in` = `TRUE`
   - `reminders_enabled` = `FALSE` (unless you have their deadline)
   - Leave `welcome_sent` empty — welcome job will send
3. In Google Sheet **Subscribers** tab: **File → Import** → append rows (do not replace header).
4. Log count in `change_log.md`.

---

## Phase 2 — Welcome emails (automatic)

Welcome sends when:
- `marketing_opt_in` = `TRUE`
- `welcome_sent` is empty
- Row has valid `email`

**Runs daily** with reminder workflow when `NURTURE_LIVE=true` (or dry-run until approved).

### Test welcome (agent must run before live)

```bash
cd scripts/reminder-engine
# Seed a test row in sheet first, then:
npm run welcome -- --dry-run
```

GitHub Actions → **CTC Subscriber Nurture** → `job: welcome` → `test_email: bgillis99@gmail.com` → Run.

**Bryan checkpoint:** Reply **"approved welcome"** → set secret `NURTURE_LIVE=true`.

---

## Phase 3 — Blasts (manual approval per campaign)

Blasts re-engage **all** subscribers where `marketing_opt_in=TRUE` and they have not received this `campaign-id` yet.

### Approved campaigns (do not invent new IDs)

| `campaign-id` | When to use |
|---------------|-------------|
| `tools-launch-v1` | First blast — announce tools hub to full list |
| `when-is-my-test-due-v1` | Promote deadline calculator |
| `managed-care-v1` | Promote Full Care $40/year offer |

### Send a blast (agent steps)

1. Dry run:

```bash
npm run blast -- --campaign-id tools-launch-v1 --dry-run
```

2. GitHub Actions → **CTC Subscriber Nurture** → `job: blast` → `campaign_id: tools-launch-v1` → `dry_run: true` → review log.

3. Bryan approves copy in `email/templates/blast-new-tool.html` + campaign text in `send-nurture.js`.

4. Set secret `BLAST_APPROVED=true` **only for that send**.

5. Run workflow with `dry_run: false`.

6. Immediately set `BLAST_APPROVED` back to empty or `false` after send completes.

---

## Phase 4 — Squarespace signup (new leads)

The reminder snippet now sends:
- `audience_type: NEW_LEAD`
- `source: tool_calculator`
- `marketing_opt_in: true`

Every tool signup → row in sheet → welcome within 24h → deadline reminders if opted in.

**Optional:** Add a site-wide footer form "Join the NorCal family" with `audience_type: SUBSCRIBER`, `source: squarespace_form`, no deadline required.

---

## Sheet columns (full schema)

See `scripts/google-apps-script/subscribers-sheet-template.csv`.

Key nurture columns:
- `audience_type` — NEW_LEAD | EXISTING_CUSTOMER | SUBSCRIBER
- `marketing_opt_in` — TRUE/FALSE (blasts + welcome)
- `welcome_sent` — date when welcome delivered
- `last_blast_campaign` — prevents duplicate blast sends

---

## GitHub secrets (add to reminder runbook list)

| Secret | Value |
|--------|-------|
| `MANAGED_CARE_URL` | `https://norcalcarbmobile.com/managed-care` |
| `NURTURE_LIVE` | `true` after Bryan approves welcome test |
| `BLAST_APPROVED` | `true` only during an approved blast send |

---

## Approved files (nurture)

| File | Purpose |
|------|---------|
| `email/templates/welcome-new-lead.html` | New lead / subscriber welcome |
| `email/templates/welcome-existing-customer.html` | Past customer re-engagement |
| `email/templates/blast-new-tool.html` | Tool launch / promo blasts |
| `config/tools-manifest.json` | Tool list for emails (agent updates URLs only) |
| `scripts/reminder-engine/send-nurture.js` | Welcome + blast sender |
| `scripts/google-apps-script/customer-import-template.csv` | Bulk import past customers |
| `.github/workflows/ctc-subscriber-nurture.yml` | Cron + manual blast |

---

## Staying in front of them (cadence)

| Touch | Trigger |
|-------|---------|
| Welcome | Once, on signup or import |
| 90 / 60 / 30 reminders | Per deadline (if reminders enabled) |
| Tool blast | When Bryan launches a new tool (manual, approved) |
| Full Care blast | Quarterly or when pushing managed tier |

**Rule:** Max **1 marketing blast per 30 days** unless Bryan explicitly approves an exception in `change_log.md`.

---

## Verification checklist

- [ ] Imported customer CSV → rows in sheet, `welcome_sent` empty
- [ ] New lead signup → `NEW_LEAD` row → welcome dry-run picks it up
- [ ] Welcome email shows tool list + Full Care $40/year + OBD $75 / OVI $199 / Motorhome OBD $99 / Motorhome OVI $229
- [ ] Unsubscribe link sets `marketing_opt_in=FALSE`
- [ ] Blast dry-run shows correct count for `tools-launch-v1`
- [ ] Bryan approved welcome + first blast before live secrets set
