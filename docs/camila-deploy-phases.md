# Camila Vertex agent — deploy phases

**Agent skill:** `.cursor/skills/camila-vertex-agent/SKILL.md`  
**Config:** `config/camila-agent-manifest.json`

---

## Phase 1 — Identity & inbox (Bryan, ~30 min)

**Full checklist:** [`camila-mailbox-setup-checklist.md`](./camila-mailbox-setup-checklist.md) — run `cd scripts/camila-agent && npm run preflight` before any live cold send.

- [ ] Google Workspace: create **`camila@norcalcarbmobile.com`** (AI agent — cold outreach + GBP/GSC)
- [ ] Google Workspace: create **`sales@norcalcarbmobile.com`** (AI agent — contact form greets + customer replies)
- [ ] Google Cloud: new project `norcal-camila-agent` (or use existing)
- [ ] Enable APIs: Gmail, Sheets, Drive, Calendar, Business Profile, Search Console, Places
- [ ] Service account `camila-agent@...` + download JSON key → GitHub secret `CAMILA_SERVICE_ACCOUNT_JSON`
- [ ] Admin Console → Domain-wide delegation for service account with scopes in manifest (includes `gmail.modify` + `chat.messages`)
- [ ] Squarespace forms → notify **`sales@`** + CC `camila@` + CC `bryan@`
- [ ] Google Chat: create Bryan's "NorCal Ops" space → Manage webhooks → copy URL → GitHub secret `GOOGLE_CHAT_WEBHOOK_URL`
- [ ] FMCSA SAFER: get free API key at https://ai.fmcsa.dot.gov/SMS/Carrier/ → GitHub secret `FMCSA_API_KEY`

**Test:** Service account can read camila@ inbox (Gmail API list messages).

---

## Phase 2 — Gmail + Sheets automation (agent, ~2–4 hrs)

- [ ] Google Sheet **NorCal Camila Ops** — run `scripts/google-apps-script/cold-outreach-log-setup.gs` → `setupCamilaOpsSheet()` to create all tabs automatically
  - Tabs created: Send Queue, Cold Sends, Suppression, Form Leads, GBP Log, GSC Weekly, SAFER Leads, Chat Log
- [ ] Paste `GOOGLE_CHAT_WEBHOOK_URL` into Apps Script Properties → run `installDailyTrigger()` to schedule 9 AM PT loop
- [ ] Deploy **Ops Approval Dashboard** web app → set `APPROVAL_DASHBOARD_URL` — [`approval-dashboard.md`](./approval-dashboard.md)
- [ ] Import CSV templates from `scripts/cold-outreach/` into Send Queue tab
- [ ] Wire `gmail-send-approver` skill: queue → verify-emails.js → Bryan YES → `send-batch.js` → Gmail API schedule send
- [ ] Cold templates from `cold-outreach-agent-one-pager.md` (baked into `send-batch.js`)
- [ ] Contact form handler: Squarespace → `sales@` → `contact-reply.js` auto-reply within 15 min
- [ ] Lead builder: `build-lead-queue.js --state CA` → SAFER carriers → MX verify → Send Queue import
- [ ] GitHub workflow: `.github/workflows/camila-cold-outreach.yml` — daily 9 AM PT cron

**Test:** Bryan `approved batch {date}` → 3 test scheduled drafts from camila@ (Phase 4, dry_run=false, send_approved_batch=true).

---

## Phase 3 — GBP + GSC (agent + Bryan, ~2 hrs)

### GBP

- [ ] Confirm Bryan owns NorCal CARB Mobile listing in [business.google.com](https://business.google.com)
- [ ] Enable Business Profile API; link GCP project
- [ ] Paste `location_name` into `camila-agent-manifest.json`
- [ ] Camila daily job: fetch new reviews → draft reply → auto-send 4–5★, queue 1–3★ for Bryan
- [ ] Local post template: mobile $75 OBD / $199 OVI / $99 Motorhome OBD / $229 Motorhome OVI + reviews link

### GSC

- [ ] Verify `https://norcalcarbmobile.com/` in Search Console
- [ ] Add service account as user (Owner) OR OAuth once as Bryan
- [ ] Weekly job: top queries, clicks, indexing errors → Sheet + email summary to Bryan
- [ ] On new `/tools/` page: URL inspection API

**Test:** One GBP review reply draft; one GSC weekly row in sheet.

---

## Phase 4 — Vertex AI Agent (GCP, ~4–8 hrs)

- [ ] Vertex AI → Agent Builder (or ADK) — agent name **Camila**
- [ ] System prompt: read `config/camila-agent-manifest.json` + pricing + never send cold without approval
- [ ] Tools: Gmail send draft, Sheets read/write, GBP post/reply, GSC query
- [ ] Human-in-the-loop: approval tool checks `bryan_approved` column
- [ ] Deploy agent; store `VERTEX_AGENT_ID` in manifest + GitHub secrets
- [ ] Optional: Google Chat app for Bryan approvals from phone

**Test:** “Camila, prepare today's cold batch” → queue in sheet → waits for Bryan.

---

## Phase 5 — Squarespace + Cloudflare alignment

- [ ] Resend DNS on `mail.` subdomain (automated nurture)
- [ ] Deploy reminder snippet on Squarespace
- [ ] Jul 2026: Cloudflare Pages — Camila re-submits sitemap in GSC
- [x] Align OVI price on site ($199) with email copy — **resolved**. Canonical pricing: OBD $75 · OVI $199 · Motorhome OBD $99 · Motorhome OVI $229

---

## Bryan approval cheat sheet

| Phrase | Camila may |
|--------|------------|
| `approved batch YYYY-MM-DD` | Schedule cold Gmail sends that day |
| `approved gbp post` | Publish queued local post |
| `approved welcome` | NURTURE_LIVE (with email-deployer) |
| `hold camila` | Pause all outbound until cleared |

---

## Secrets (GitHub)

| Secret | Phase | Required for |
|--------|-------|-------------|
| `CAMILA_SERVICE_ACCOUNT_JSON` | 1 | All automation |
| `CAMILA_SHEET_ID` | 2 | Queue, logs, form leads |
| `GOOGLE_SPREADSHEET_ID` | 2 | Nurture/reminder engine (separate sheet) |
| `GOOGLE_CHAT_WEBHOOK_URL` | 1 | Bryan batch-ready alerts + first-draft sent |
| `FMCSA_API_KEY` | 2 | SAFER lead builder |
| `GOOGLE_PLACES_API_KEY` | 2 | Lead domain/website enrichment |
| `COLD_OUTREACH_LIVE` | 2 | Unlock actual Gmail sends (set `true` after Bryan approves) |
| `SEND_FROM` | 2 | Default `camila@norcalcarbmobile.com` |
| `REPLY_FROM` | 2 | Default `sales@norcalcarbmobile.com` (form replies) |
| `ESCALATE_TO` | 2 | Default `bryan@norcalcarbmobile.com` |
| `VERTEX_AGENT_ID` | 4 | Full Vertex AI agent |
| `GBP_LOCATION_NAME` | 3 | GBP review/post automation |
