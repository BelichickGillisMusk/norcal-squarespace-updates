# Camila Vertex agent — deploy phases

**Agent skill:** `.cursor/skills/camila-vertex-agent/SKILL.md`  
**Config:** `config/camila-agent-manifest.json`

---

## Phase 1 — Identity & inbox (Bryan, ~30 min)

- [ ] Google Workspace: create **`camila@norcalcarbmobile.com`** (AI agent mailbox, not a human)
- [ ] Google Cloud: new project `norcal-camila-agent` (or use existing)
- [ ] Enable APIs: Gmail, Sheets, Drive, Calendar, Business Profile, Search Console
- [ ] Service account `camila-agent@...` + download JSON key → GitHub secret `CAMILA_SERVICE_ACCOUNT_JSON`
- [ ] Admin Console → Domain-wide delegation for service account with scopes in manifest
- [ ] Squarespace forms → notify **`camila@`** + CC `bryan@`

**Test:** Service account can read camila@ inbox (Gmail API list messages).

---

## Phase 2 — Gmail + Sheets automation (agent, ~2–4 hrs)

- [ ] Google Sheet **NorCal Camila Ops** — tabs: Send Queue, Form Leads, Suppression, GBP Log, GSC Weekly
- [ ] Import CSV templates from `scripts/cold-outreach/`
- [ ] Deploy Apps Script or Cloud Function: form email → Sheet row
- [ ] Wire `gmail-send-approver` skill: queue → verify-emails.js → Bryan YES → Gmail API schedule send
- [ ] Cold templates from `cold-outreach-agent-one-pager.md`

**Test:** Bryan `approved batch {date}` → 3 test scheduled sends from camila@.

---

## Phase 3 — GBP + GSC (agent + Bryan, ~2 hrs)

### GBP

- [ ] Confirm Bryan owns NorCal CARB Mobile listing in [business.google.com](https://business.google.com)
- [ ] Enable Business Profile API; link GCP project
- [ ] Paste `location_name` into `camila-agent-manifest.json`
- [ ] Camila daily job: fetch new reviews → draft reply → auto-send 4–5★, queue 1–3★ for Bryan
- [ ] Local post template: mobile $75 OBD / $199 OVI + reviews link

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
- [ ] Align OVI price on site ($199) with email copy

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

| Secret | Phase |
|--------|-------|
| `CAMILA_SERVICE_ACCOUNT_JSON` | 1 |
| `CAMILA_SHEET_ID` | 2 |
| `GOOGLE_SPREADSHEET_ID` | 2 (may merge) |
| `VERTEX_AGENT_ID` | 4 |
| `GBP_LOCATION_NAME` | 3 |
