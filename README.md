# NorCal CARB Mobile — Squarespace LLM Update Agent

**Repo:** `BelicheckGillisMusk/norcal-squarespace-updates`  
**Site:** [norcalcarbmobile.com](https://norcalcarbmobile.com)  
**Squarespace Config Panel:** `https://aqua-alpaca-m37c.squarespace.com/config/`  
**Owner:** Bryan | fsu8813@gmail.com, bryan@norcalcarbmobile.com  
**Deadline:** July 4th holiday window (~July 3–7, 2026) — site must be clean before handoff to Cloudflare migration

---

## Purpose

This repo instructs an LLM agent (Claude or similar) to log into the NorCal CARB Mobile Squarespace site and execute a structured cleanup and content update pass before the site is migrated off Squarespace to Cloudflare Pages in July 2026.

The goal is **zero human clicks** — the agent handles everything. Tasks fall into three categories:

1. Fix broken or non-functional contact/booking forms
2. Enforce visual uniformity (fonts, layout, button styles, spacing) across all pages
3. Publish or update blog posts with current, SEO-relevant content

The site must be **production-ready and fully functional** before the Cloudflare migration window opens. Any broken UX at migration time will carry forward and compound.

---

## Authentication

### Squarespace API Key

A Squarespace API key named **`updates`** is stored as a GitHub Actions secret and as an environment variable.

- **Secret name in GitHub:** `SQUARESPACE_API_KEY_UPDATES`
- **Scope required:** Content read/write, Forms read, Pages read/write, Blog read/write
- **Base URL:** `https://api.squarespace.com/1.0/`

To retrieve in a workflow or script:

```bash
export SQUARESPACE_API_KEY=$SQUARESPACE_API_KEY_UPDATES
```

> Note: Squarespace's native API has limited form and style access. For tasks the API cannot reach (font/layout fixes, form logic), the agent must use **browser automation via Claude in Chrome** logged into `https://aqua-alpaca-m37c.squarespace.com/config/`. Credentials for the Squarespace account are stored separately in the repo's GitHub Actions secrets as `SQUARESPACE_EMAIL` and `SQUARESPACE_PASSWORD`.

---

## Agent Execution Instructions

When an LLM agent runs against this repo, it should:

1. **Read this README completely** before taking any action
2. **For all email (deploy, PM, summer ops):** load skill `.cursor/skills/norcal-email-deployer/SKILL.md` → then `docs/DEPLOY_TODAY.md` + `docs/AGENT_START_HERE_EMAILS.md`. Run `scripts/email-deploy/preflight.js` before any live send. Do not enable `REMINDERS_LIVE`, `NURTURE_LIVE`, or `BLAST_APPROVED` until Bryan approves.
3. **Check current site state** — screenshot or scrape each target page first, log what it finds
4. **Execute tasks in order** (Forms → Layout/Font → Blogs)
5. **Verify each change** before moving to the next task — do not assume a save succeeded
6. **Log all changes** to `change_log.md` in this repo with timestamps
7. **Do not publish blog posts** without running them through a spell/grammar check
8. **Do not delete any content** — archive or unpublish only
9. **Stop and log a blocker** if a task cannot be completed — do not skip silently

---

## Task List

### 1. Fix Broken Forms

**Priority: CRITICAL — these are revenue-blocking**

Target forms to inspect and repair:

| Form | Location | Known Issue |
|------|----------|-------------|
| Book a Test / Schedule | Homepage, Services pages | May not submit or confirm |
| Contact Us | Contact page | Suspected broken email routing |
| Fleet Inquiry / Quote Request | Any fleet/commercial pages | Check submit action and notification email |

**For each form:**
- Confirm the form renders on both desktop and mobile
- Submit a test entry using `test@norcalcarbtest.dev` as the email
- Verify the confirmation message appears
- Verify the notification email routes to `bgillis99@gmail.com`
- If email routing is broken, re-connect the form to the Gmail/notification integration in Squarespace settings

---

### 2. Visual Uniformity — Fonts, Layout, Buttons

**Priority: HIGH — affects trust and SEO bounce rate**

Apply the following standards site-wide. Check every page listed below.

**Font Standards:**
- Headings (H1, H2): `Montserrat` or site default sans-serif, Bold
- Body copy: `Source Sans Pro` or site default, Regular, 16–18px
- No page should use more than 2 font families
- No inline `font-size` overrides smaller than 14px

**Layout Standards:**
- Section padding: consistent top/bottom (min 60px on desktop, 30px mobile)
- No full-width image sections with broken aspect ratios
- All CTA buttons must match: same color, same border-radius, same font-weight
- Mobile breakpoint must not overflow or clip any text

**Pages to audit:**
- `/` (Homepage)
- `/services` or equivalent
- `/pricing`
- `/contact`
- `/blog` index and all published posts
- `/fleet` or `/commercial` if exists
- `/about` or `/faq` if exists

For each page: screenshot before, apply fixes, screenshot after. Save both to `/screenshots/[page-slug]/before.png` and `after.png`.

---

### 3. Blog — Publish and Update Content

**Priority: HIGH — needed for organic search before July**

**Existing drafts:** Publish any draft posts that are complete and relevant to CARB emissions testing, Clean Truck Check, or fleet compliance. Do not publish stubs or posts with placeholder content.

**New posts to create (if not already drafted):**

Write and publish at least 3 blog posts targeting the following topics. Each post should be 600–900 words, include a meta description, and be tagged appropriately.

| Topic | Target Keyword | Notes |
|-------|---------------|-------|
| What is the CARB Clean Truck Check? | `CARB Clean Truck Check Sacramento` | Explain OBD vs OVI testing, who needs it, pricing |
| How Mobile CARB Testing Works | `mobile CARB testing near me` | Walk through the appointment process, what to expect |
| 2026 CARB Testing Deadlines for Fleet Operators | `CARB compliance deadline 2026` | Urgency post — fleets testing twice/year starting 2026 |

**Blog formatting requirements:**
- H1: Post title
- H2s for major sections
- One internal link per post (link to `/contact` or `/services`)
- Featured image: use an existing site image or a royalty-free truck/fleet image
- Set publish date to actual publish date, not backdated

---

## Success Criteria

Before closing the run, the agent must confirm:

- [ ] All forms submit successfully and route to `bgillis99@gmail.com`
- [ ] No page has mismatched fonts or broken layout at 1280px and 390px viewports
- [ ] All CTA buttons are visually consistent site-wide
- [ ] Minimum 3 blog posts published with correct metadata
- [ ] `change_log.md` updated with every action taken
- [ ] No content was deleted (only edited or unpublished)

---

## Cloudflare Migration Context

In July 2026 (targeting the July 4th holiday window for low-traffic cutover), norcalcarbmobile.com will be migrated from Squarespace hosting to Cloudflare Pages. DNS is currently managed through the domain registrar and will be pointed to Cloudflare at cutover.

**This Squarespace cleanup must be complete before migration begins.** The Cloudflare build will be based on an export/clone of the current Squarespace site. Any broken forms, bad styling, or missing content at the time of export will be baked into the new site.

The agent should treat this as a **pre-flight checklist**, not a cosmetic pass.

---

## File Structure

```
/
├── README.md                  # This file — agent instructions
├── .cursor/skills/
│   ├── camila-vertex-agent/        # AI: email, forms, GBP, GSC
│   ├── norcal-email-deployer/     # Resend nurture + DNS
│   ├── gmail-send-approver/        # Cold batch execution (Camila sends)
│   └── attention-hq/               # Daily ops scorecard (Samantha)
├── docs/
│   ├── PLATFORM_EMAIL_AUDIT.md          # Squarespace + Cloudflare + email review
│   ├── camila-vertex-agent-architecture.md  # Camila AI on Workspace APIs
│   ├── camila-deploy-phases.md              # GCP + GBP + GSC rollout
│   ├── two-user-workspace-setup.md          # Bryan + Camila AI mailbox
│   ├── cloudflare-migration-email-dns.md
│   ├── DEPLOY_TODAY.md                  # Today's deploy checklist
│   ├── summer-2026-email-strategy.md    # Jun–Sep email calendar
│   ├── tools-and-cta-strategy.md        # Tool ideas, pricing, Full Care $40/yr
│   ├── AGENT_START_HERE_EMAILS.md       # Agent entry point for all email systems
│   ├── email-reminders-agent-runbook.md # 90/60/30 deadline reminders
│   ├── subscriber-nurture-agent-runbook.md # Welcome, blasts, customer import
│   ├── email-deliverability-verification.md # SPF/DKIM/DMARC — avoid junk
│   ├── cold-outreach-agent-one-pager.md     # 30/day cold email from Bryan's Gmail
│   └── attention-hq-runbook.md              # Daily ops scorecard (jobs + invoice gaps)
├── scripts/email-deploy/            # preflight.js — DNS blocker check
├── scripts/attention-hq/            # Daily ops scorecard cron (Samantha)
├── config/tools-manifest.json     # Tool list for welcome/blast emails
├── email/templates/               # Approved HTML email templates
├── scripts/
│   ├── google-apps-script/        # Sheet webhook (subscribe + cancel)
│   └── reminder-engine/           # Daily sender (Resend + GitHub Actions)
├── squarespace/                   # Code blocks to paste into Squarespace
├── change_log.md              # Auto-generated by agent, timestamped entries
├── screenshots/
│   └── [page-slug]/
│       ├── before.png
│       └── after.png
└── blog_drafts/               # Optional: pre-written blog content for agent to paste
    ├── clean-truck-check-explainer.md
    ├── how-mobile-testing-works.md
    └── 2026-fleet-deadlines.md
```

---

## Notes for Agent

- You are operating on a live production site. Be careful — there is no staging environment.
- If Squarespace's autosave triggers unexpectedly, verify the saved state before continuing.
- The Squarespace config URL (`aqua-alpaca-m37c.squarespace.com`) is the internal editor. Public site is `norcalcarbmobile.com`. Do not confuse them.
- Service areas: Sacramento, Stockton, Fairfield, San Jose, Bay Area. These must appear consistently across all service/contact pages.
- Pricing: **OBD $75** · **OVI $199** · **Motorhome OBD $99** · **Motorhome OVI $229**. San Diego area: OBD $119 · OVI $219. All prices subject to change. Source of truth: `config/pricing.json`. Both must be accurate and visible on the homepage, services, and pricing pages. Tools and CTAs should show all rates; use the switch offer (*beat your price* or *50% off first test*) for prospects who already have a tester — see `docs/tools-and-cta-strategy.md`.
- If you encounter a Squarespace plan limitation blocking a feature (e.g., custom CSS editing requires a higher plan), log it as a blocker and move on — do not attempt to work around plan restrictions.
