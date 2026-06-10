# Summer 2026 email calendar

**Season:** Compliance deadline heat (Jun–Aug) → fleets scrambling before fall windows.

## Week 0 — Deploy week (Jun 9–15, 2026)

| Date | Action | Owner |
|------|--------|-------|
| **Jun 9 (today)** | Resend subdomain DNS + preflight + Sheet + Apps Script | Agent |
| Jun 9 | Test welcome + reminder to Bryan | Agent → Bryan approves |
| Jun 10 | `NURTURE_LIVE=true` + import past customers | Agent |
| Jun 11 | `REMINDERS_LIVE=true` | Agent |
| Jun 12 | Cold outreach **10/day** (drafts for Bryan) | Agent + Bryan |
| **Jun 16 Mon** | Blast `tools-launch-v1` (after dmarc=pass test) | Bryan approves |

## Week 1–2 — Ramp (Jun 16–29)

| Cadence | Action |
|---------|--------|
| Daily 8:15 AM PT | Email Ops: welcome + reminders (automated) |
| Mon Jun 23 | Cold → **20/day** |
| Thu Jun 26 | Social post: deadline calculator + tools hub |
| Mon Jun 30 | Blast `when-is-my-test-due-v1` (if ≥50 new subscribers) |

## July — Peak urgency

| Date | Action |
|------|--------|
| Jul 1 | Blast `managed-care-v1` — Full Care $40/year |
| Jul 1–7 | Cold **30/day** — deadline hook template A |
| Jul 4 window | Low-traffic: verify Squarespace before Cloudflare migration |
| Jul 15 | Mid-month: fleet switch template B push (cold) |
| Jul 28 | Blog + email: "2026 deadlines — twice yearly" |

## August — Quarterly 2028 prep

| Date | Action |
|------|--------|
| Aug 1 | Content: 2028 quarterly cadence explainer |
| Aug 12 | Blast: fleet cost calculator (new tool or link) |
| Aug 15–Sep 15 | Cold focus: fleets with Q4 deadlines |
| Aug 26 | Re-import bounced/opted — scrub list |

## September — Close summer strong

| Date | Action |
|------|--------|
| Sep 1 | "Last chance before fall window" reminder blast |
| Sep 9 | Review metrics: replies, bookings, opt-out % |
| Sep 15 | Plan fall cadence / Cloudflare email cutover |

## Rules

- Max **1 marketing blast / 30 days** unless Bryan exception in `change_log.md`
- Cold **30/day max** — never exceed
- Pause all marketing 48h if opt-out rate > 1% or spam complaints
