# Who sends what — email addresses

**Camila = Vertex AI agent** on Workspace APIs — not a human. See `docs/camila-vertex-agent-architecture.md`.

---

## Approved senders

| Address | Role | Channel | Operator |
|---------|------|---------|----------|
| `camila@norcalcarbmobile.com` | **AI outreach + form replies** | Gmail API | Vertex agent (Bryan approves batches) |
| `bryan@norcalcarbmobile.com` | Owner, escalations | Gmail | Human |
| `reminders@mail.norcalcarbmobile.com` | Opt-in nurture + reminders | Resend | GitHub Actions |
| `bgillis99@gmail.com` | Owner notifications | Inbound | Never bulk send |

---

## Camila agent scope

| System | Camila handles |
|--------|----------------|
| Cold email (30/day) | Draft + schedule after Bryan `approved batch` |
| Squarespace forms | Auto-reply + Sheet CRM |
| Google Business Profile | Reviews, posts, Q&A |
| Google Search Console | Weekly analytics, indexing |

**Skills:** `.cursor/skills/camila-vertex-agent/SKILL.md` + `gmail-send-approver`

---

## Setup

1. Create `camila@` in Workspace (agent mailbox)
2. GCP service account + delegation — `docs/camila-deploy-phases.md`
3. Fill `config/camila-agent-manifest.json`
4. Route forms to camila@

---

## Do not email the Cursor/Vertex agent

| Need | Do this |
|------|---------|
| Approve cold batch | `approved batch YYYY-MM-DD` |
| API keys | GitHub Secrets |
| GBP/GSC IDs | `camila-agent-manifest.json` |

---

## Automated nurture (separate from Camila Gmail)

```txt
REMINDER_FROM_NAME=Camila at NorCal CARB Mobile
REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com
```

Resend handles opt-in only — not cold prospects.
