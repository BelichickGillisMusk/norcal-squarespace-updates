# Cold outreach — agent one-pager (30/day from Bryan’s email)

**Send from:** `camila@norcalcarbmobile.com` (preferred) or `bryan@norcalcarbmobile.com` — Google Workspace / Gmail only — **not** Resend  
**Volume cap:** **30 emails per day max** — never batch-bcc; one recipient per message  
**Do not email the AI agent** — it cannot read your inbox. Use GitHub secrets + Gmail drafts Bryan/Camila approves.
**Audience:** NorCal fleet operators, owner-operators, contractors with diesel 14k+ GVWR  
**Approval:** Bryan must reply **“approved cold send”** before the agent sends day 1

---

## Hard rules (agent must follow)

| Rule | Why |
|------|-----|
| **Max 30/day** | Protects domain reputation + avoids spam flags |
| **One-to-one** in Gmail compose | No BCC blasts, no mail-merge tools that spam |
| **Plain, personal tone** | Signed Camila — not “NorCal Marketing Team” |
| **Pricing + reviews in every cold #1** | Use pricing block + `{reviews_url}` from `config/cold-email-manifest.json` |
| **Real subject + 3–5 short paragraphs** | Under ~120 words body |
| **Include opt-out line** | CAN-SPAM: honor stops within 10 business days |
| **Log every send** in Google Sheet | See `scripts/cold-outreach/daily-send-log-template.csv` |
| **Stop if they reply STOP / unsubscribe** | Mark `status=opted_out` — never email again |
| **No attachments** on cold #1 | Link to site/tools only |
| **Business hours** | Send 8 AM–5 PM Pacific, Tue–Thu preferred |
| **Do not use Resend** for cold | Resend = opted-in nurture only |

---

## Before day 1 (one-time setup)

1. **Gmail:** Send from `camila@norcalcarbmobile.com` (recommended — dedicated outreach rep) or `bryan@` for owner follow-ups. Google DKIM on domain covers any `@norcalcarbmobile.com` mailbox (see `email-deliverability-verification.md`).
2. **Create Camila mailbox** (one-time): Google Workspace Admin → Users → Add `camila@norcalcarbmobile.com` → Bryan retains admin; Camila or Bryan can send from that inbox.
3. **Sheet:** Import `scripts/cold-outreach/daily-send-log-template.csv` → name tab **`Cold Sends`**.
4. **Lead list:** Bryan provides CSV or agent builds from public fleet/contractor sources — must have **business email + company name**; no purchased scraped lists without Bryan OK.
5. **Warm-up (week 1):** Days 1–3 send **10/day**, days 4–5 **20/day**, day 6+ **30/day** unless Bryan says full 30 immediately.

---

## Daily agent workflow

```
1. Open Cold Sends sheet → filter status = pending, opted_out = FALSE
2. Count today's sent (column sent_at = today) → if ≥30, STOP
3. Pick next N leads (N = remaining quota)
4. Personalize approved template (company name, city, hook)
5. Send from Bryan's Gmail (agent with browser access OR Bryan reviews queue)
6. Log: sent_at, template_id, subject line, status=sent
7. End of day: paste count in change_log.md
```

**Bryan review mode (recommended):** Agent drafts 30 in Gmail **Drafts** → Bryan hits Send.

---

## Pricing + reviews block (include in every template)

Copy from `config/cold-email-manifest.json`. Agent pastes this block into every cold #1:

```
OUR PRICING (mobile — we come to your yard):
• OBD Clean Truck Check — $75/truck
• OVI smoke opacity — $199/truck
• Shops often charge $90–$300+ PLUS 1–3 hrs downtime — we test at your yard

SWITCH OFFER: 50% off your first test — OBD $37.50 · OVI $99.50
Or send your current quote — we'll try to BEAT IT.

★ 4.9 stars · 47+ fleet operator reviews: {reviews_url}
```

**Reviews link (set):** `{reviews_url}` opens Google reviews directly — see `config/cold-email-manifest.json` → `google_reviews_url`.

---

## Approved templates (copy verbatim except `{braces}`)

### Template A — `deadline-hook` (default)

**Subject:** `{company} — CTC deadline + $75 mobile testing`

```
Hi {first_name},

Fleet operators in {city/area} are getting flagged in CTC-VIS when they miss the 90-day testing window. We do mobile Clean Truck Check at your yard — trucks stay working.

OUR PRICING (mobile — we come to your yard):
• OBD — $75/truck · OVI — $199/truck
• Shops: $90–$300+ plus downtime. We come to you.

SWITCHING TESTERS? 50% off first test (OBD $37.50 · OVI $99.50) or we'll beat your quote.

★ 4.9 stars · 47+ reviews from NorCal fleets: {reviews_url}

Free deadline calculator: {tools_url}/when-is-my-test-due

10-minute call this week? {booking_url} · 916-890-4427

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" — I won't follow up.
```

### Template B — `fleet-switch` (aggressive pricing lead)

**Subject:** `$75 CTC at your yard — {company}`

```
Hi {first_name},

NorCal CARB Mobile batch-tests fleets on-site — Sacramento, Stockton, Fairfield, San Jose, Bay Area. No shop wait. No drive time.

PRICING THAT BEATS MOST SHOPS:
• OBD $75 · OVI $199 per truck (mobile at your yard)
• Fleet visits — multiple trucks, one stop
• Already have a tester? We BEAT your rate OR 50% off your first truck

★ 4.9★ · 47+ verified reviews: {reviews_url}
"Tested six trucks in under two hours." — fleet operator, Sacramento

Book: {booking_url} · Call/text 916-890-4427

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" to opt out.
```

### Template C — `full-care`

**Subject:** `skip CARB calls — Full Care $40/yr + {company}`

```
Hi {first_name},

Still logging into CTC-VIS and chasing deadlines yourself?

Full Care: we set up CTC-VIS, monitor deadlines, send reminders, and mobile-test at your yard.
• CARB annual fee (CTC-VIS) + only $40/year to us
• Tests: OBD $75 · OVI $199 — at your location

DIY option free: {tools_url}

★ 4.9 stars · 47+ fleet reviews: {reviews_url}

Want the one-pager? Reply yes or book: {booking_url}

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" and I'll close your file.
```

### Template D — `pricing-reviews` (max aggression — use for cold shops/competitors)

**Subject:** `$75 mobile CTC — see our 4.9★ reviews`

```
Hi {first_name},

Quick comparison for {company}:

NorCal CARB Mobile (we come to your yard):
  OBD $75  ·  OVI $199  ·  50% off first test if you switch

Typical shop:
  $90–$300+ per test + 1–3 hours off the road per truck

★ 4.9 stars · 47+ reviews: {reviews_url}

Call 916-890-4427 or book: {booking_url}

Camila · NorCal CARB Mobile

Reply "remove" to opt out.
```

**Template pick:**

| Lead signal | Use |
|-------------|-----|
| Unknown deadline / compliance risk | A |
| Multi-truck / fleet in name | B |
| Mentioned CTC-VIS frustration or admin burden | C |
| Price-shopping / uses a shop today | D |

---

## Personalization (required fields)

| Field | Source |
|-------|--------|
| `{first_name}` | Lead list or “there” if unknown |
| `{company}` | Lead list — required |
| `{city/area}` | NorCal city or “Northern California” |
| `{tools_url}` | `https://norcalcarbmobile.com/tools` |
| `{booking_url}` | `https://norcalcarbmobile.com/contact` |
| `{reviews_url}` | `https://share.google/CUg6TEK1p3eO34S9G` |

**Never:** fake familiarity, “Re: our call”, misleading subject lines, or urgency lies about CARB enforcement.

---

## Follow-up sequence (optional — still counts toward daily cap)

| Touch | When | Action |
|-------|------|--------|
| #1 | Day 0 | Template A/B/C |
| #2 | +4 business days | One line: *"Bumping this — still need CTC handled before your next window?"* |
| #3 | +7 days after #2 | Final: *"Closing the loop — reply if you want the free deadline tool or a quote."* |
| Stop | Any reply / remove / bounce | `status=opted_out` or `status=bounced` |

Max **3 touches total** per lead. Follow-ups count toward the **30/day** cap.

---

## Opt-out & compliance

- **CAN-SPAM:** Physical business in signature (site URL OK); clear opt-out; honor within 10 business days.
- **“Remove” / “Unsubscribe” / “Stop”** → sheet `status=opted_out`, add email to **Suppression** tab (never mail again).
- **Bounce** → `status=bounced`, do not retry.
- **No SMS** from this runbook unless Bryan separately approves TCPA consent.

---

## Junk-folder prevention (Bryan’s Gmail)

- Stay at **≤30/day**; spread sends across the day (not 30 in 10 minutes).
- Same domain as verified DKIM (`bryan@norcalcarbmobile.com` ✅).
- Avoid spam triggers: FREE!!!, act now, all caps, too many links (max 2).
- First week: monitor Gmail **Sent** → ask 2–3 test recipients to confirm inbox placement.
- If landing in spam: drop to **15/day** for 5 days; vary subject lines; increase personalization.

---

## Sheet columns (`Cold Sends` tab)

`email`, `company`, `first_name`, `city`, `template_id`, `status` (pending|sent|replied|opted_out|bounced), `sent_at`, `followup_1_at`, `followup_2_at`, `notes`

**Suppression tab:** `email`, `opted_out_at`, `reason`

---

## Agent prompt (paste to Manus / any agent)

> Cold outreach per `docs/cold-outreach-agent-one-pager.md`. Max 30/day from `camila@norcalcarbmobile.com` via Gmail only. Use approved templates A/B/C. Log every send in Cold Sends sheet. Draft for Bryan approval until he says **approved cold send**. Never email opted_out or bounced addresses. Do not use Resend.

---

## Pricing cheat sheet (do not drift — lead with these in cold)

| Offer | Price | Cold line |
|-------|-------|-----------|
| OBD mobile test | **$75** | "OBD $75 at your yard" |
| OVI mobile test | **$199** | "OVI $199 mobile" |
| Switch — 50% off first test | OBD **$37.50** · OVI **$99.50** | Always mention on cold #1 |
| Beat competitor quote | Case by case | "Send your quote — we'll try to beat it" |
| vs shops | $90–$300+ + downtime | Use in every template |
| Full Care | CARB fee + **$40/year** | Template C / upsell |
| Reviews | **4.9★ · 47+** | Link `{reviews_url}` every cold #1 |

---

## Success metrics (weekly log in `change_log.md`)

- Sent / day (avg ≤30)
- Replies / positive / booked
- Opt-outs (keep &lt;1% of sends)
- Bounce rate (keep &lt;3%)

**Blocker:** If opt-out or spam complaints spike, **pause 48h** and notify Bryan.
