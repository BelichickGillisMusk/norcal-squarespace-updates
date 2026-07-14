# Booking Deposit Strategy — Hold Appointments with 50% Upfront

Where the booking page lives, why it currently loses appointments to no-shows, and how to add a paid "reserve your spot" step.

---

## Where the page is

- **Live URL:** `norcalcarbmobile.com/book-schedule-carb-smoke-test-sacramento`
- **Hosted on:** Squarespace (not in this repo — see `AGENTS.md`: "the public website itself is hosted externally on Squarespace and is not part of this repo"). Edits happen in the Squarespace config panel (`https://aqua-alpaca-m37c.squarespace.com/config/`) or via the Squarespace API, not by editing files here.
- **Linked from:** the homepage hero and multiple CTA buttons ("Book a mobile visit") — confirmed in `site-export/index.html` (a homepage snapshot only; the booking page itself isn't exported into this repo).
- **Current mechanism:** a plain Squarespace **Form block** (lead capture — name/contact/vehicle info), not a paid scheduling system. There is no Acuity/Calendly integration and **no payment step today**, which is why appointments can be booked with zero commitment and no-showed.

## The problem

Nothing is collected at booking time, so a scheduled visit costs the customer nothing to skip. A mobile technician can drive out for a no-show. A deposit fixes this by making the customer commit before the slot is held.

## Recommended flow

1. Customer fills out the existing "Book a Test" form (test type, vehicle, preferred date/time, contact info) — keep this as-is, it's just lead capture.
2. Immediately after submit (or as the form's confirmation/redirect step), present a **CTA to pay a 50% deposit** matching their selected test type.
3. Appointment is held only once the deposit clears. Confirmation email states the balance due on-site and the cancellation policy.
4. Remaining 50% is collected on-site at time of service (card, same as today).

## Deposit amounts (50% of `config/pricing.json` list price)

| Test type | Full price | **Deposit to hold appointment** | Balance due on-site |
|---|---|---|---|
| OBD (standard) | $75 | **$37.50** | $37.50 |
| OVI (standard) | $199 | **$99.50** | $99.50 |
| Motorhome OBD | $99 | **$49.50** | $49.50 |
| Motorhome OVI | $229 | **$114.50** | $114.50 |
| San Diego OBD | $119 | **$59.50** | $59.50 |
| San Diego OVI | $219 | **$109.50** | $109.50 |

> Note: the OBD/OVI deposit amounts ($37.50 / $99.50) happen to equal the existing **switch offer** first-test prices in `docs/tools-and-cta-strategy.md`. These are two different things — do not conflate them in copy. Switch offer = a discount for competitors' customers. Deposit = a partial prepayment for everyone, refunded/applied at service, not a discount.

## CTA copy

**Button (replaces plain "Book a mobile visit" on booking-flow pages):**
> **Reserve My Appointment — $37.50 to Hold Your Spot**
> *(auto-updates to $99.50 / $49.50 / $114.50 based on test type selected)*

**Supporting line under the button:**
> We require a 50% deposit to reserve your mobile visit. The rest ($37.50–$114.50 depending on service) is due on-site when we test. Your slot isn't held until the deposit is paid.

**Cancellation/reschedule policy (needs Bryan's sign-off on exact windows):**
> Reschedule free of charge with 24+ hours' notice. Cancellations inside 24 hours or no-shows forfeit the deposit. *(Draft — confirm before publishing.)*

## Implementation options (ranked)

**1. Stripe Payment Links — no code, fastest, do this first.**
Create one Payment Link per row above in the Stripe Dashboard (or via the Stripe MCP tools once the connector is authorized — see below). Add the correct link as a button directly under the existing booking Form block in Squarespace, one per test-type section, or as the form's post-submit redirect. Works entirely inside Squarespace with zero backend code.

**2. Dynamic Stripe Checkout Session — do this after the Cloudflare migration.**
This repo already has `worker/index.js` (Cloudflare Worker). Once the site moves to Cloudflare Pages, a Worker route can create a Checkout Session server-side with the deposit amount computed from the form's test-type selection, and pass booking metadata (name, date, vehicle) through to Stripe for reconciliation. More flexible than Payment Links but not needed for the pre-migration fix.

**3. Squarespace Scheduling (Acuity) with native deposit.**
Acuity supports requiring a Stripe/Square deposit natively, but that means replacing the current Form block with the Scheduling block — a bigger structural change than this deadline likely allows. Worth considering post-migration, not before.

## What's needed before this can go live

- **Stripe connector authorization** — the `stripe` plugin is installed, but the Stripe MCP connector needs Bryan to complete OAuth (via `claude mcp` / `/mcp` in an interactive session); it can't be done from this headless session.
- **Squarespace edit access** — adding the CTA/Payment Link buttons to the live booking page requires the Squarespace config panel or browser automation session (`SQUARESPACE_EMAIL` / `SQUARESPACE_PASSWORD`), not available in this session.
- **Bryan's sign-off** on the cancellation/reschedule window before it's published — it's a real policy, not just copy.

## Once live

- Add the deposit amounts to `config/pricing.json` (done in this change) so every tool/CTA that reads pricing from there stays in sync.
- Update the homepage/service-page "Book a mobile visit" buttons site-wide per README's CTA-consistency rule (same color/border-radius/font-weight).
- Log the change in `change_log.md` per the agent execution instructions in `README.md`.
