# Cloudflare migration — email & DNS checklist

**When:** July 2026 window (per README)  
**Now:** Site on Squarespace; **no Cloudflare config in repo yet**

---

## Before migration

- [ ] Squarespace forms work (README success criteria)
- [ ] Resend verified on `mail.norcalcarbmobile.com` **while still on Squarespace DNS**
- [ ] `NURTURE_LIVE` + `REMINDERS_LIVE` tested and running
- [ ] Export static site / build Cloudflare Pages project in repo

---

## DNS records to copy to Cloudflare (do not lose)

### Keep (Google Workspace — bryan@ + camila@)

| Type | Host | Purpose |
|------|------|---------|
| MX | `@` | Google mail routing |
| TXT | `@` | SPF with `include:_spf.google.com` |
| TXT | `google._domainkey` | Gmail DKIM |

### Keep (Resend automated mail)

| Type | Host | Purpose |
|------|------|---------|
| TXT | `resend._domainkey.mail` | Resend DKIM |
| TXT | `send.mail` | Resend SPF |
| MX | `send.mail` | Resend bounces |

### Keep (security)

| Type | Host | Purpose |
|------|------|---------|
| TXT | `_dmarc` | DMARC policy |

### Remove after Squarespace gone

| Type | Change |
|------|--------|
| SPF | Remove `include:_squarespace-mail.com` when no Squarespace mail |
| Squarespace Campaigns DKIM | Remove if unused |

### Cloudflare Pages (website)

| Type | Host | Value |
|------|------|-------|
| CNAME | `@` or `www` | `*.pages.dev` or custom Pages target |

**Email MX stays on Google** — website on Cloudflare does not move mail if MX records preserved.

---

## What breaks if you mess up DNS

| Mistake | Result |
|---------|--------|
| Delete Google MX | bryan@ and camila@ stop receiving |
| Delete Resend `mail.` records | Welcome/reminder emails bounce |
| Change DMARC to reject before Resend aligned | Automated mail blocked |
| Point root MX to Cloudflare | **Critical** — never do this |

---

## Post-migration email

1. Replace Squarespace Code block with same `reminder-signup-snippet.html` on static `/tools/` page
2. Keep Google Sheet + Apps Script + GitHub Actions — **no change**
3. Update `SITE_BASE_URL` if URLs change (unlikely)
4. Re-run `preflight.js` after DNS propagates on Cloudflare

---

## Repo gap (agent work before Jul)

- [ ] Create Cloudflare Pages project + `wrangler.toml` or GitHub Pages build
- [ ] Static `/tools/*` pages
- [ ] DNS cutover runbook with rollback
