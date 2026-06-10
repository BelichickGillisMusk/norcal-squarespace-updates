# Agent: start here for all email systems

## Reminder emails (90/60/30-day)
[`email-reminders-agent-runbook.md`](./email-reminders-agent-runbook.md)

> Deploy CTC deadline reminder emails per `docs/email-reminders-agent-runbook.md`. Stop at Bryan's test-email approval before `REMINDERS_LIVE=true`.

## Welcome, blasts & NorCal Family nurture
[`subscriber-nurture-agent-runbook.md`](./subscriber-nurture-agent-runbook.md)

> Deploy welcome emails + customer import + approved blasts per `docs/subscriber-nurture-agent-runbook.md`. New leads get "Come aboard the NorCal family" with free phone tools + Full Care ($40/year). Stop at Bryan's approval before `NURTURE_LIVE=true` or any blast with `BLAST_APPROVED=true`.

## Cold outreach (30/day from Bryan’s Gmail)
[`cold-outreach-agent-one-pager.md`](./cold-outreach-agent-one-pager.md)

> One-to-one cold leads from `bryan@norcalcarbmobile.com` only. Max 30/day. Gmail — not Resend. Approved templates + send log sheet. Wait for Bryan **approved cold send** before day 1.

## Full deploy order for Manus / any agent

1. Google Sheet + Apps Script (`WebApp.gs`) — **redeploy** if already live (schema expanded)
2. Squarespace snippet (`reminder-signup-snippet.html`)
3. Import past customers (`customer-import-template.csv`)
4. GitHub secrets (both runbooks)
5. Test welcome → Bryan approves → `NURTURE_LIVE=true`
6. Test reminders → Bryan approves → `REMINDERS_LIVE=true`
7. First blast `tools-launch-v1` → Bryan approves → `BLAST_APPROVED=true` → send → reset
