# Camila — Vertex AI agent architecture

**Camila is not a human hire.** She is a **Vertex AI agent** running on Google Cloud, wired to **Google Workspace APIs** for NorCal CARB Mobile only — emails, website forms, **Google Business Profile (GBP)**, and **Google Search Console (GSC)**.

**Identity:** `camila@norcalcarbmobile.com` (Workspace mailbox the agent impersonates via domain-wide delegation)  
**Owner / approvals:** Bryan (`bryan@`, `bgillis99@gmail.com`)

---

## What Camila does vs Bryan

| Domain | Camila (AI) | Bryan (human) |
|--------|-------------|---------------|
| Cold email drafts + schedule send | ✅ After approval | Approves batch only |
| Form lead auto-reply + CRM sheet | ✅ | Escalations |
| GBP review replies + local posts | ✅ Draft → auto or approve | Sensitive replies |
| GSC weekly report + indexing checks | ✅ | Strategic decisions |
| Resend nurture (opt-in) | Via email-deployer workflows | Flip LIVE secrets |
| Pricing negotiation / fleet 3+ | Draft | ✅ Takes call |

---

## System diagram

```
                    ┌─────────────────────────────────────┐
                    │     Vertex AI Agent (Camila)        │
                    │  Gemini + tools + approval gate     │
                    └──────────────┬──────────────────────┘
                                   │
     ┌─────────────┬───────────────┼───────────────┬─────────────┐
     ▼             ▼               ▼               ▼             ▼
 Gmail API    Google Sheets    Squarespace      GBP API       GSC API
 (camila@)    Send Queue +     form emails →    reviews       search
              Leads + CRM      camila@ inbox    posts Q&A       analytics
                                   │
                                   ▼
                          Bryan approval (Sheet YES
                          or Chat "approved batch")
```

---

## Google Workspace API surface (“on steroids”)

| API | Camila uses it for |
|-----|-------------------|
| **Gmail** | Read camila@ inbox, draft cold mail, schedule send, reply to leads, label bounces |
| **Sheets** | Send queue, suppression, form leads, subscriber sync, approval column |
| **Drive** | Read approved templates / manifests from shared folder |
| **Calendar** | Optional: schedule follow-up reminders for Bryan |
| **Chat** (optional) | Ping Bryan: “Batch ready — 28 emails, reply approved batch 2026-06-10” |

**Auth:** Service account + **domain-wide delegation** impersonating `camila@norcalcarbmobile.com` (not Bryan’s password in code).

---

## Website forms pipeline

### Today (Squarespace)

1. Squarespace form → notification email to **`camila@norcalcarbmobile.com`** (change from only bryan@)
2. Camila agent (Gmail watch or Apps Script trigger) parses submission
3. Appends row to Sheet tab **Form Leads**
4. Auto-reply from camila@ within 15 min: pricing + reviews link + book CTA
5. Escalates to Bryan if fleet 3+, complaint, or custom quote

### After Cloudflare

- Same flow; optional webhook POST → Cloud Function → Camila instead of email-parse

**Squarespace change (agent):** Settings → Notifications → route booking/contact/fleet to `camila@` + CC `bryan@`

---

## Google Business Profile (GBP)

**API:** [Google Business Profile APIs](https://developers.google.com/my-business/content/overview)

| Task | Cadence | Approval |
|------|---------|----------|
| Reply to new reviews | Daily | Auto 4–5★; Bryan for 1–3★ |
| Local posts (deadline season, $75 OBD) | 2×/week | Bryan optional |
| Update services / hours | On change | Bryan |
| Q&A monitor | Daily | Auto answer FAQs from manifest |

**Setup:** OAuth or service account linked to GBP location — `config/camila-agent-manifest.json` → `location_name`

**Reviews link for emails:** already in `cold-email-manifest.json` (`#lrd=` URL)

---

## Google Search Console (GSC)

**API:** [Search Console API](https://developers.google.com/webmaster-tools/v1/api_reference_index)

| Task | Cadence |
|------|---------|
| Search analytics (clicks, queries, CTR) | Weekly → Sheet + Chat summary to Bryan |
| URL inspection for `/tools/*` pages | After each new tool ships |
| Sitemap submit | After Cloudflare cutover |
| Coverage errors | Alert Bryan if spike |

**Property:** `https://norcalcarbmobile.com/` — verify in GSC, grant service account **Owner** or use OAuth as Bryan once.

---

## Approval gate (no blacklisting, no rogue sends)

Camila **never** sends cold mail or GBP posts that need approval until:

1. Sheet column `bryan_approved` = `YES` on every row, **or**
2. Bryan message: **`approved batch YYYY-MM-DD`**

Cold limits (enforced in agent + sheet):
- 30/day max
- 7+ minutes between Gmail sends
- `verify-emails.js` MX check before queue

Skill: `.cursor/skills/gmail-send-approver/SKILL.md` (execution layer)  
Skill: `.cursor/skills/camila-vertex-agent/SKILL.md` (orchestration layer)

---

## What Camila is NOT

- Not a generic ChatGPT — scoped to NorCal CARB manifests in this repo
- Not sending without Bryan approval on outbound cold
- Not using Resend for cold (Gmail API only)
- Not touching non-NorCal domains or inboxes

---

## Config file

All IDs and scopes: **`config/camila-agent-manifest.json`**

---

## Deploy order

See **`docs/camila-deploy-phases.md`** — Phase 1 Workspace identity, Phase 2 Gmail+Sheets, Phase 3 GBP+GSC, Phase 4 Vertex agent.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `docs/two-user-workspace-setup.md` | camila@ as AI mailbox (updated) |
| `docs/PLATFORM_EMAIL_AUDIT.md` | DNS / Resend blockers |
| `docs/cold-outreach-agent-one-pager.md` | Approved copy |
| `.cursor/skills/norcal-email-deployer/SKILL.md` | Resend nurture |
