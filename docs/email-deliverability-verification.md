# Email deliverability — norcalcarbmobile.com (won’t go to junk)

**Owner:** Bryan | **Domain:** `norcalcarbmobile.com`  
**Last DNS check:** June 2026 (automated `dig` from agent environment)

This doc covers **Squarespace** emails (forms, campaigns) and **Resend** emails (tool reminders, welcome, blasts from this repo).

---

## Your domain today (what we found)

| Check | Status | Notes |
|-------|--------|-------|
| SPF (root) | ✅ Present | `include:_spf.google.com` + `include:_squarespace-mail.com` |
| Google DKIM | ✅ Present | `google._domainkey` TXT |
| DMARC | ⚠️ **Strict** | `p=reject` — failing mail is **rejected**, not just junked |
| Resend DKIM | ❌ Missing | `resend._domainkey` not found |
| Resend SPF (`send`) | ❌ Missing | `send` subdomain TXT not found |

**Bottom line:** Google + Squarespace transactional mail is in good shape. **Resend reminder/welcome emails will fail DMARC** until Resend DNS is added — with `p=reject`, Gmail may block them entirely.

---

## Two email systems (don’t mix them up)

| System | Sends | Authentication |
|--------|-------|----------------|
| **Squarespace** | Form notifications, commerce, Email Campaigns | `_squarespace-mail.com` in SPF + Campaigns DKIM in dashboard |
| **Resend** (this repo) | `reminders@norcalcarbmobile.com`, welcomes, blasts | Resend-provided `send` + `resend._domainkey` records |

---

## Part A — Squarespace verification (forms & campaigns)

### A1. Form notification emails (booking, contact, fleet)

These use Squarespace’s mail — already covered by your SPF:

```txt
v=spf1 include:_spf.google.com include:_squarespace-mail.com -all
```

**Agent checklist:**
1. Squarespace → **Settings → Notifications** — confirm form emails go to `bgillis99@gmail.com` / `bryan@norcalcarbmobile.com`
2. Send a test form submission from the live site
3. In Gmail → open message → **Show original** — look for:
   - `spf=pass`
   - `dkim=pass` (Squarespace or Google)
   - `dmarc=pass`

### A2. Squarespace Email Campaigns (marketing blasts from Squarespace UI)

If you send campaigns **from Squarespace** (not Resend):

1. Squarespace → **Email Campaigns** → **Settings** → **Sender Details**
2. Click **Verify Domain** next to `norcalcarbmobile.com`
3. Squarespace shows **2 CNAME records** (often `s1._domainkey` / `s2._domainkey` or similar)
4. Add them in **Settings → Domains → norcalcarbmobile.com → DNS Settings**
5. Back in Campaigns → **Authenticate Domain** → wait for green check

Official guide: [Verifying domains for Email Campaigns](https://support.squarespace.com/hc/en-us/articles/360001280748)

**Note:** Squarespace Campaigns may not SPF-align; **DKIM alignment** is what matters for DMARC pass.

### A3. Google Workspace (bryan@norcalcarbmobile.com)

Already has SPF + `google._domainkey`. If you send from Gmail/Google Workspace, you’re covered.

---

## Part B — Resend verification (tool reminders & nurture emails)

Required before `REMINDERS_LIVE` or `NURTURE_LIVE`.

### B1. Add domain in Resend

1. [resend.com](https://resend.com) → **Domains** → **Add Domain**
2. Enter `norcalcarbmobile.com` (or subdomain `mail.norcalcarbmobile.com` — see B4)
3. Copy the **exact** records Resend shows (do not guess)

### B2. Add DNS in Squarespace

Squarespace → **Settings → Domains → norcalcarbmobile.com → DNS Settings → Custom records**

| Type | Host / Name | Value | Notes |
|------|-------------|-------|-------|
| TXT | `resend._domainkey` | *(paste from Resend)* | DKIM — copy full value, no quotes |
| TXT | `send` | *(paste from Resend)* | SPF for Resend |
| MX | `send` | *(paste from Resend)* | Priority `10` |

**Critical:** In Squarespace host field, enter only `resend._domainkey` and `send` — **not** the full domain. [Resend docs](https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying)

### B3. Verify in Resend

Click **Verify DNS Records** in Resend. Usually 15 min–24 hrs.

Terminal check (agent):

```bash
dig +short TXT resend._domainkey.norcalcarbmobile.com
dig +short TXT send.norcalcarbmobile.com
dig +short MX send.norcalcarbmobile.com
```

### B4. DMARC + `p=reject` (your current policy)

Your DMARC:

```txt
v=DMARC1; p=reject; rua=mailto:bryan@norcalcarbmobile.com; fo=1
```

With `p=reject`, Resend **must** pass DKIM alignment (Resend signs with your domain). After Resend verifies, send a test and confirm `dmarc=pass` in Gmail headers.

**Optional safer rollout:** Temporarily use `p=none` for 2 weeks while testing Resend + Squarespace Campaigns, then return to `p=quarantine` or `p=reject`.

### B5. Recommended From address

```txt
REMINDER_FROM_EMAIL=reminders@norcalcarbmobile.com
REMINDER_FROM_NAME=NorCal CARB Mobile
```

Use the **same domain** you verified in Resend. Do not send from `@gmail.com` or unverified domains.

---

## Part C — Test that it won’t go to junk

### C1. Send test (after Resend verified)

GitHub Actions → **CTC Reminder Emails** → `test_email: bryan@norcalcarbmobile.com` → Run  
Or → **CTC Subscriber Nurture** → welcome dry-run then live test.

### C2. Gmail header check

Gmail → message → **⋮ → Show original**. Confirm:

```txt
spf=pass
dkim=pass
dmarc=pass
```

If `dmarc=fail` with `p=reject`, fix before any blast.

### C3. Content rules (reduces junk folder even when auth passes)

- Include physical business identity in footer
- One-click **Unsubscribe** (already in templates)
- Don’t use ALL CAPS subject lines
- Warm up: first blast to small segment, then full list
- Max ~1 marketing blast / 30 days (per nurture runbook)

### C4. External tools

- [mail-tester.com](https://www.mail-tester.com) — send test, aim for 9+/10
- [dns.email](https://dns.email) — check SPF/DKIM/DMARC propagation

---

## Part D — Agent deploy order (deliverability)

1. ✅ Confirm Squarespace SPF includes `_squarespace-mail.com` (already done)
2. ⬜ Squarespace Email Campaigns DKIM — if using Campaigns
3. ⬜ Resend domain + DNS records in Squarespace
4. ⬜ Resend status = **verified**
5. ⬜ Test email → Gmail headers `dmarc=pass`
6. ⬜ Bryan approves → `REMINDERS_LIVE` / `NURTURE_LIVE`
7. ⬜ First blast only after step 5 passes

---

## Quick reference — where to click in Squarespace

| Task | Path |
|------|------|
| DNS records | Settings → Domains → norcalcarbmobile.com → **DNS Settings** |
| Email Campaigns DKIM | Email Campaigns → Settings → **Sender Details** → Verify Domain |
| Form routing | Settings → **Notifications** / per-form settings |
| Google site verification TXT | Already present (multiple `google-site-verification` records) |

---

## Blockers log template

If agent cannot complete verification, log in `change_log.md`:

```markdown
## Email deliverability blocker — [date]
- Issue: Resend DKIM not verifying / DMARC fail on test
- DNS host: [record name]
- dig output: [paste]
- Waiting on: Bryan to add record in Squarespace DNS
```
