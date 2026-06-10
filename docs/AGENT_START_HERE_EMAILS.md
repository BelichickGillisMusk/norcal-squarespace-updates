# Agent: start here for all email systems

## ⭐ Email PM skill (read first)

**`.cursor/skills/norcal-email-deployer/SKILL.md`**

> You are the NorCal email deployer. Run preflight, execute DEPLOY_TODAY.md, fix DNS blockers, advance summer-2026 schedule. Stop at Bryan approval gates.

## Deploy today

[`DEPLOY_TODAY.md`](./DEPLOY_TODAY.md) — June 9, 2026 task list

## Summer strategy

[`summer-2026-email-strategy.md`](./summer-2026-email-strategy.md)

---

## Channel runbooks

| Channel | Doc |
|---------|-----|
| Deliverability / not junk | [`email-deliverability-verification.md`](./email-deliverability-verification.md) |
| 90/60/30 reminders | [`email-reminders-agent-runbook.md`](./email-reminders-agent-runbook.md) |
| Welcome + blasts | [`subscriber-nurture-agent-runbook.md`](./subscriber-nurture-agent-runbook.md) |
| Cold 30/day Gmail | [`cold-outreach-agent-one-pager.md`](./cold-outreach-agent-one-pager.md) |

---

## Bryan approval gates

| Says | Agent sets |
|------|------------|
| approved test send | proceed with tests |
| approved welcome | `NURTURE_LIVE=true` |
| approved reminders | `REMINDERS_LIVE=true` |
| approved blast [id] | `BLAST_APPROVED=true` → send → reset |
| approved cold send | cold outreach day 1 |

---

## Scheduled automations

| Workflow | Time (PT) |
|----------|-----------|
| Email Preflight | 7:00 AM daily |
| Email Ops Daily | 8:15 AM daily (welcome + reminders) |
