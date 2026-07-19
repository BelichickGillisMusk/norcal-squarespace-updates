# camila@ setup checklist — 100% before cold outreach

**Goal:** `camila@norcalcarbmobile.com` sends through **real Google Workspace** with passing SPF/DKIM/DMARC — so you stay off blacklists and out of spam.

**Run automated checks:**

```bash
cd scripts/camila-agent && npm ci && npm run preflight
```

Fix every ❌ before setting `COLD_OUTREACH_LIVE=true` in GitHub.

---

## 1. Google Workspace users (not aliases)

In [Google Admin](https://admin.google.com) → **Directory → Users → Add user**:

| Mailbox | Purpose | Must be |
|---------|---------|---------|
| `camila@norcalcarbmobile.com` | Cold outreach (Gmail API sends as Camila) | **Licensed user** — not a group alias |
| `sales@norcalcarbmobile.com` | Contact form auto-replies | **Licensed user** |
| `bryan@norcalcarbmobile.com` | Owner / escalations | Already exists |

**Why:** Aliases cannot be impersonated reliably for Gmail API; DMARC alignment needs a real mailbox.

Optional: set Camila display name to **Camila · NorCal CARB Mobile** and add a short signature in Gmail settings (human bridge period).

---

## 2. DNS (Squarespace or Cloudflare — do not break Google MX)

| Record | Required for camila@ |
|--------|----------------------|
| **MX** `@` → Google (`aspmx.l.google.com` etc.) | Receive bounces, replies, form copies |
| **SPF** root TXT includes `include:_spf.google.com` | Gmail send passes SPF |
| **DKIM** `google._domainkey` TXT | Gmail send passes DKIM |
| **DMARC** `_dmarc` TXT | You use `p=reject` — only authenticated Google mail should send from `@norcalcarbmobile.com` |

**Do not** send cold mail through Resend on the root domain — use Resend only on `mail.norcalcarbmobile.com` for nurture (`reminders@mail...`).

Verify in Admin → **Apps → Google Workspace → Gmail → Authenticate email** — both DKIM and SPF should show **Authenticating**.

Register domain in [Google Postmaster Tools](https://postmaster.google.com/) with `bryan@` — watch spam rate and domain reputation.

---

## 3. Domain-wide delegation (Gmail API)

1. GCP project → **IAM → Service accounts** → create `camila-agent@...`
2. Enable **Gmail API** + **Google Sheets API**
3. Download JSON key → GitHub secret `CAMILA_SERVICE_ACCOUNT_JSON`
4. Admin → **Security → API controls → Domain-wide delegation** → Add client ID from service account
5. Scopes (one line, comma-separated) — copy from `config/camila-agent-manifest.json` → `workspace_domain_wide_delegation.scopes`

**Test:** `npm run preflight` with the secret exported locally — must show ✅ for both `camila@` and `sales@`.

---

## 4. GitHub secrets (cold outreach)

See `.cursor/skills/norcal-email-deployer/references/secrets-checklist.md`.

Minimum before first live batch:

- `CAMILA_SERVICE_ACCOUNT_JSON`
- `CAMILA_SHEET_ID` (NorCal Camila Ops sheet)
- `GOOGLE_CHAT_WEBHOOK_URL` (Bryan batch-ready alerts)
- `SEND_FROM` = `camila@norcalcarbmobile.com`
- `REPLY_FROM` = `sales@norcalcarbmobile.com`

**Only after Bryan says `approved batch YYYY-MM-DD`:**

- `COLD_OUTREACH_LIVE` = `true`

---

## 5. Blacklist prevention (enforced in code)

| Rule | Value |
|------|-------|
| Max cold sends / day | **30** |
| Min gap between sends | **7 minutes** |
| Bryan approval | `bryan_approved=YES` on every Send Queue row |
| Bounces | Run `scripts/cold-outreach/verify-emails.js` — skip `mx_ok=FALSE` |
| Suppression | Never email opted-out / bounced addresses (Suppression tab) |
| Format | One recipient per message — **no BCC blasts**, no attachments on cold #1 |
| Window | 8 AM – 4 PM Pacific, Tue–Thu preferred |

If Gmail shows elevated bounces: **pause 72 hours**, run preflight again, review list quality.

---

## 6. Squarespace forms

Settings → Notifications → Contact / Booking:

- **To:** `sales@norcalcarbmobile.com`
- **CC:** `camila@norcalcarbmobile.com`, `bryan@norcalcarbmobile.com`

---

## 7. Bryan sign-off

Before day 1 live cold sends, Bryan confirms:

- [ ] `npm run preflight` passes (DNS + Gmail API)
- [ ] Test message from camila@ to personal Gmail — **Show original** shows `spf=pass`, `dkim=pass`, `dmarc=pass`
- [ ] Send Queue has ≤30 rows, MX verified, `bryan_approved=YES`
- [ ] Says **`approved batch YYYY-MM-DD`**

Then run GitHub Actions **Camila Cold Outreach** → `send_approved_batch=true`, `dry_run=false`.

---

**Related:** `docs/two-user-workspace-setup.md`, `docs/camila-deploy-phases.md`, `.cursor/skills/gmail-send-approver/SKILL.md`
