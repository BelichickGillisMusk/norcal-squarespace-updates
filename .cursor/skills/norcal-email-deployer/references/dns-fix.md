# DNS fix — Resend on subdomain (avoids DMARC block)

## Why

`norcalcarbmobile.com` has **DMARC `p=reject`**. Resend on the root domain without aligned DKIM = **blocked or junk**.

**Fix:** Verify **`mail.norcalcarbmobile.com`** in Resend (subdomain), not the root.

## Steps (Squarespace DNS)

1. [resend.com](https://resend.com) → Domains → **Add** `mail.norcalcarbmobile.com`
2. Squarespace → Settings → Domains → norcalcarbmobile.com → **DNS Settings**

Add records Resend shows (host names relative to subdomain):

| Type | Host in Squarespace | Notes |
|------|---------------------|-------|
| TXT | `resend._domainkey.mail` | Full DKIM value, no quotes |
| TXT | `send.mail` | SPF TXT from Resend |
| MX | `send.mail` | Priority 10 |

3. Resend → **Verify DNS Records** (15 min – 24 hr)
4. Update GitHub secret: `REMINDER_FROM_EMAIL=reminders@mail.norcalcarbmobile.com`
5. Run `npm run preflight` in `scripts/email-deploy`

## Verify

```bash
dig +short TXT resend._domainkey.mail.norcalcarbmobile.com
dig +short TXT send.mail.norcalcarbmobile.com
```

Test send → Gmail → Show original:

```txt
spf=pass
dkim=pass
dmarc=pass
```

## Do not change (keep as-is)

- Root SPF for Google + Squarespace: `include:_spf.google.com include:_squarespace-mail.com`
- Google DKIM: `google._domainkey`
- DMARC at `_dmarc` — keep `p=reject` once Resend subdomain passes tests

## If verification stuck

- Host field: use `resend._domainkey.mail` not the FQDN
- No extra quotes in TXT values
- Wait 1 hour, re-verify in Resend
