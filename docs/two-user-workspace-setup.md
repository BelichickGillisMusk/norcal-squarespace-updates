# Bryan + Camila — human owner + AI agent

**Camila is a Vertex AI agent**, not a human hire. She uses the mailbox `camila@norcalcarbmobile.com` via **Google Workspace APIs** (domain-wide delegation).

Full architecture: `docs/camila-vertex-agent-architecture.md`  
Deploy phases: `docs/camila-deploy-phases.md`  
Agent skill: `.cursor/skills/camila-vertex-agent/SKILL.md`

---

## Identities

| Identity | Type | Email | Role |
|----------|------|-------|------|
| **Bryan Gillis** | Human | `bryan@norcalcarbmobile.com` | Owner, approvals, escalations, fleet deals |
| **Camila** | **Vertex AI agent** | `camila@norcalcarbmobile.com` | Email, forms, GBP, GSC — executes after Bryan approves |

You are **not tied** to a single human sender. Camila is the always-on operator; Bryan spends minutes on approvals only.

---

## Setup (Phase 1 — Bryan ~30 min)

### 1. Create camila@ mailbox (agent identity)

Google Admin → Users → **Add user**

- Email: `camila@norcalcarbmobile.com`
- Name: Camila (NorCal CARB Mobile AI)
- No human needs daily login — **service account impersonates** this user via API

### 2. Google Cloud project

- Project: `norcal-camila-agent` (or your choice)
- Enable: Gmail, Sheets, Business Profile, Search Console APIs
- Service account + domain-wide delegation → see `camila-deploy-phases.md`

### 3. Route website forms to Camila

Squarespace → form notifications:

- **To:** `camila@norcalcarbmobile.com`
- **CC:** `bryan@norcalcarbmobile.com`

Camila parses leads → auto-reply → escalates fleet/complex to Bryan.

### 4. Ops Google Sheet

**NorCal Camila Ops** — tabs:

- Send Queue (`gmail-send-queue-template.csv`)
- Form Leads
- Suppression
- GBP Log
- GSC Weekly

Share: Bryan (Editor) + service account (Editor)

### 5. Bryan approval column

Cold sends: `bryan_approved` = `YES` or chat phrase **`approved batch YYYY-MM-DD`**

---

## Who does what

| Task | Bryan | Camila (AI) |
|------|-------|-------------|
| Approve cold batch | ✅ | Builds queue, waits |
| Schedule / send cold Gmail | — | ✅ After approval |
| Form auto-reply | — | ✅ |
| GBP review replies | Approves 1–3★ | ✅ 4–5★ auto |
| GSC weekly report | Reads summary | ✅ Generates |
| Resend nurture LIVE | ✅ Secret toggle | — (separate workflow) |
| Pricing / fleet negotiation | ✅ | Drafts only |

---

## Optional: Bryan send-as Camila

If API not ready yet, Bryan can use Gmail **Send mail as** camila@ for manual bridge period. Goal: full Gmail API via Vertex agent.

---

## Approval phrases

| Bryan says | Camila may |
|------------|------------|
| `approved batch YYYY-MM-DD` | Schedule that day's cold sends |
| `approved gbp post` | Publish local post |
| `hold camila` | Pause all outbound |
