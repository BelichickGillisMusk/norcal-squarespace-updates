# NorCal CARB Mobile — Tools, Social, and CTA Strategy

Reference for building lead-gen tools on norcalcarbmobile.com and promoting them on social. Inspired by [CTC Directory's deadline calculator](https://ctcdirectory.com/when-is-my-test-due/), localized for Northern California mobile testing.

---

## Pricing (use on every tool result page and CTA)

| Test type | Price | Notes |
|-----------|-------|-------|
| **OBD** (onboard diagnostics) | **$75** | Standard Clean Truck Check for OBD-equipped vehicles |
| **OVI** (opacity / visual inspection) | **$199** | For vehicles that require OVI instead of OBD |
| **Motorhome OBD** | **$99** | OBD test for motorhomes |
| **Motorhome OVI** | **$229** | OVI test for motorhomes |

Always show both prices when the tool identifies or asks about test type. Do not quote a single flat rate without context.

**San Diego pricing:** OBD **$119** · OVI **$219** (extended service area surcharge).

### NorCal Family — Full Care (managed tier)

| Component | Price |
|-----------|-------|
| CARB annual compliance fee | Per vehicle, paid through [CTC-VIS](https://cleantruckcheck.arb.ca.gov) (CARB sets amount) |
| NorCal setup, monitoring & coordination | **$40/year** per vehicle |
| Each mobile test visit | OBD **$75** · OVI **$199** · Motorhome OBD **$99** · Motorhome OVI **$229** |

**Positioning:** *Never talk to CARB again* — we handle CTC-VIS registration, deadline monitoring, reminders, and scheduling your tests.

**DIY alternative (free):** Tools hub on phone (Add to Home Screen) — deadline calculator, OBD vs OVI, fleet math, CTC-VIS checklist. See `config/tools-manifest.json`.

**Email nurture:** New leads get `welcome-new-lead.html`; past customers get `welcome-existing-customer.html`; blasts when new tools ship. See `docs/subscriber-nurture-agent-runbook.md`.

---

## Universal CTA block

Use this structure at the end of every tool, reminder email, and social landing page.

### Primary CTA (new customers)

> **Mobile testing — we come to your yard.**  
> OBD **$75** · OVI **$199** · Motorhome OBD **$99** · Motorhome OVI **$229**  
> Sacramento · Stockton · Fairfield · San Jose · Bay Area  
> **[Book a test]** · **[Fleet quote]**

### Switch CTA (already have a tester)

After any result or before booking, ask:

> **Already working with another tester?**  
> Tell us what you're paying — we'll try to **beat that price**, or get **50% off your first test** when you switch to NorCal CARB Mobile.

**Capture fields (optional on calculator, required on fleet/switch form):**
- Current provider name (optional)
- What you pay per test today (optional)
- Test type: OBD / OVI / Not sure
- Email + phone for follow-up

**Follow-up promise (set expectations):**
- "We'll reply within one business day with your switch offer."
- Do not auto-apply 50% off in the calculator — human confirms fleet size, test type, and eligibility.

### Switch offer rules (internal)

| Scenario | Offer |
|----------|--------|
| Single truck, switching from another provider | **50% off first test** — OBD **$37.50** or OVI **$99.50** (Motorhome OBD **$49.50** · Motorhome OVI **$114.50**) |
| Fleet (3+ trucks) with quoted competitor rate | **Match or beat** per-truck price where possible; document in fleet quote |
| Already at or below our list price | Emphasize mobile convenience, batch yard visits, reminders — no forced discount |

---

## Tool-specific CTA copy

### 1. When Is My Test Due? (flagship)

**Result screen:**
- Show next 4 deadlines per CARB rules (CA renewal vs. VIN last digit).
- If user indicates OBD vs. OVI (or year/engine suggests OVI): show correct price (**$75** or **$199**).
- Primary: **Book mobile test — from $75 OBD / $199 OVI**
- Secondary: **Email me 90/60/30-day reminders**
- Tertiary (switch): **Already have a tester? See if we can beat your price →**

**Reminder emails (90 / 60 / 30 days):**
- Deadline date + link to CTC-VIS to verify.
- **Book with NorCal CARB Mobile** — OBD $75 · OVI $199.
- One line: *Switching testers? Reply for 50% off your first test or a price-match quote.*
- **I already tested** — stops reminders for that cycle.

### 2. Am I Subject to Clean Truck Check?

End with: *If you're in scope, book mobile testing from **$75** (OBD) or **$199** (OVI).*

### 3. OBD vs. OVI explainer

After quiz result:
- **Your likely test: OBD — $75** or **OVI — $199**
- Book CTA + switch CTA.

### 4. Fleet cost calculator

Compare their current per-test spend vs.:
- NorCal mobile OBD @ **$75** / OVI @ **$199** / Motorhome OBD @ **$99** / Motorhome OVI @ **$229**
- Include 2028 quarterly cadence (4×/year).

**Fleet CTA:**
> **Fleet of 3+?** Request a quote — we'll **beat your current provider** or apply **50% off the first truck** when you switch.

### 5. Mobile vs. shop ROI

Savings math uses **$75** (OBD) or **$199** (OVI) vs. shop range ($90–$300+). Motorhome pricing: **$99** (OBD) / **$229** (OVI). Compare against mobile shop convenience -- we come to you, no shop wait or drive time.

### 6. Service area checker

**We serve your area** → Book from **$75 OBD / $199 OVI** (Motorhome OBD $99 / OVI $229) + switch line.

---

## Social post templates

### Deadline calculator promo
*"When is your Clean Truck Check due? Free calculator + reminders. Mobile testing from **$75** (OBD) or **$199** (OVI) — we come to your NorCal yard."*

### Switch campaign
*"Still paying shop prices or driving to a tester? Send us your current rate — we'll try to **beat it**, or take **half off your first test** when you switch. OBD from **$37.50** first test · OVI from **$99.50** first test."*

### OVI-specific
*"Older diesel? You may need **OVI** testing, not OBD. We do mobile OVI for **$199** — no shop wait. Already have a tester? Ask us to beat their price."*

### Fleet
*"4 tests per truck in 2028. Run the fleet calculator, then ask for a quote — we'll **match or beat** your current per-truck rate."*

---

## Recommended rollout

1. **When Is My Test Due?** + reminders + switch question on results
2. **Service area checker** with dual pricing CTA
3. **OBD vs. OVI quiz** (drives correct **$75** vs **$199** expectation)
4. **Fleet cost calculator** with beat-price / 50% off first test path
5. **CTC-VIS checklist** with pricing footer

---

## Compliance disclaimer (all tools)

> Computed schedules are based on CARB Clean Truck Check rules as published. Always confirm your deadline in [CTC-VIS](https://cleantruckcheck.arb.ca.gov) before relying on a date for compliance. Switch offers and price-match quotes are subject to confirmation; advertised list prices are OBD **$75**, OVI **$199**, Motorhome OBD **$99**, and Motorhome OVI **$229**. **San Diego pricing:** OBD **$119** · OVI **$219** (extended service area surcharge). Pricing is always subject to change due to matters out of our control.

---

## Site paths (Cloudflare Pages target)

```
/tools/when-is-my-test-due/
/tools/obd-vs-ovi/
/tools/fleet-cost-calculator/
/tools/service-area/
/tools/switch-and-save/          ← dedicated switch / price-match landing
```

`/tools/switch-and-save/` — short form: current provider, current price, test type, contact → positions 50% off first test and beat-price promise without cluttering the calculator.
