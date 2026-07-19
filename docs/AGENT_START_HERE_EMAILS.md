# Agent: start here for all email systems

## ⭐ Platform audit (read first if growing / bounces worried)

[`PLATFORM_EMAIL_AUDIT.md`](./PLATFORM_EMAIL_AUDIT.md) — Squarespace vs Cloudflare, email map, blockers

## Google reviews (always use these numbers)

**5 stars · 33 Google reviews** — exact numbers only, never approximate. Source: [`config/reviews.json`](../config/reviews.json). Schema.org JSON-LD: [`squarespace/schema-local-business.html`](../squarespace/schema-local-business.html) (paste in Squarespace header).

## camila@ before cold sends

[`camila-mailbox-setup-checklist.md`](./camila-mailbox-setup-checklist.md) — Workspace user, DNS, delegation, preflight. Run `scripts/camila-agent` → `npm run preflight`.

## Camila — Vertex AI agent (emails + forms + GBP + GSC)

**`.cursor/skills/camila-vertex-agent/SKILL.md`**

> Camila is AI on Workspace APIs — not a human. camila@ for email/forms; GBP + GSC. Bryan approves batches.

Architecture: `docs/camila-vertex-agent-architecture.md` · Deploy: `docs/camila-deploy-phases.md`

## Email PM skill (Resend nurture)

**`.cursor/skills/norcal-email-deployer/SKILL.md`**

> You are the NorCal email deployer. Run preflight, execute DEPLOY_TODAY.md, fix DNS blockers, advance summer-2026 schedule. Stop at Bryan approval gates.

## Deploy today

[`DEPLOY_TODAY.md`](./DEPLOY_TODAY.md) — June 9, 2026 task list

## Summer strategy

[`summer-2026-email-strategy.md`](./summer-2026-email-strategy.md)

---

## Who sends from which address

[`email-senders-guide.md`](./email-senders-guide.md) — Camila@ for cold, reminders@mail for automated. **Do not email the agent.**

## Channel runbooks

| Channel | Doc |
|---------|-----|
| Deliverability / not junk | [`email-deliverability-verification.md`](./email-deliverability-verification.md) |
| 90/60/30 reminders | [`email-reminders-agent-runbook.md`](./email-reminders-agent-runbook.md) |
| Welcome + blasts | [`subscriber-nurture-agent-runbook.md`](./subscriber-nurture-agent-runbook.md) |
| Cold 30/day Gmail | [`cold-outreach-agent-one-pager.md`](./cold-outreach-agent-one-pager.md) |
| **Gmail schedule + approval** | **`.cursor/skills/gmail-send-approver/SKILL.md`** |
| Bryan + Camila AI identity | [`two-user-workspace-setup.md`](./two-user-workspace-setup.md) |
| Camila Vertex deploy | [`camila-deploy-phases.md`](./camila-deploy-phases.md) |
| Cloudflare + email DNS | [`cloudflare-migration-email-dns.md`](./cloudflare-migration-email-dns.md) |

---

## Bryan approval gates

| Says | Agent sets |
|------|------------|
| approved test send | proceed with tests |
| approved welcome | `NURTURE_LIVE=true` |
| approved reminders | `REMINDERS_LIVE=true` |
| approved blast [id] | `BLAST_APPROVED=true` → send → reset |
| approved cold send | cold outreach day 1 |
| **approved batch YYYY-MM-DD** | **Gmail Send Approver schedules that day's queue** |

---

## Scheduled automations

| Workflow | Time (PT) |
|----------|-----------|
| Email Preflight | 7:00 AM daily |
| Email Ops Daily | 8:15 AM daily (welcome + reminders) |
