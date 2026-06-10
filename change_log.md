# Change log — NorCal CARB Mobile agent runs

Agents append timestamped entries below.

---

## 2026-06-09 — Email deployer skill + summer strategy

- Added `.cursor/skills/norcal-email-deployer/` — PM + deployer skill for all email channels
- Added `docs/DEPLOY_TODAY.md`, `docs/summer-2026-email-strategy.md`
- Added `scripts/email-deploy/preflight.js` — DNS blocker detection
- Added workflows: `email-preflight.yml` (7 AM PT), `email-ops-daily.yml` (8:15 AM PT)
- **Blocker:** Resend DKIM on `mail.norcalcarbmobile.com` not yet in DNS — awaiting Bryan Squarespace DNS paste
- **Next:** Bryan adds Resend subdomain records → preflight pass → test sends → approval gates
