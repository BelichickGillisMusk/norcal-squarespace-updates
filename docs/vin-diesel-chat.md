# Vin Diesel website chat


Floating chat on every HTML page. The Worker injects a small button. The chat script loads on the first click, so the first paint does not wait on it.

- `POST /api/chat` calls xAI (`grok-4.3` unless `XAI_MODEL` is set) with the Mila script, chat wording. The key is the Worker secret `XAI_API_KEY`. It is not in the repo or the browser.
- `book_appointment` stores a **requested** slot in D1. It does not confirm.
- `send_call_summary` writes the row to D1 `chat_leads` first (timestamp, fields, urgent flag, transcript), then emails `carb@norcalcarbmobile.com` with the `EMAIL` send_email binding. `URGENT` is in the subject when flagged. If email fails, the row stays.
- `/admin/leads` asks for the Worker secret `ADMIN_TOKEN` and lists the newest leads.
- Public phone in the chat is (916) 890-4427 only.
- Rate limit: 20 messages per IP per 10 minutes. Message cap: 1,200 characters.

Do not `wrangler deploy` from this change until the secrets and D1 id below are set. Merge is a separate approval.

### Set the secret and test `/api/chat`

```bash
npx wrangler d1 create norcal-chat-leads
# Paste the database_id into wrangler.toml and wrangler.jsonc (replace the placeholder).

npx wrangler d1 execute norcal-chat-leads --remote --file=worker/d1/0001_chat_leads.sql
npx wrangler secret put XAI_API_KEY
npx wrangler secret put ADMIN_TOKEN

# Optional from-address. Must be on a domain onboarded to Cloudflare Email.
# Default: NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>
npx wrangler secret put CHAT_FROM

# carb@norcalcarbmobile.com must be a verified Email Routing / Email Sending destination.
# Local logic check (no key, no network):
node --test worker/vin-diesel.test.mjs

# Live check after deploy (do not deploy without approval):
curl -sS https://norcalcarbmobile.com/api/chat \
  -H 'content-type: application/json' \
  -H 'origin: https://norcalcarbmobile.com' \
  -d '{"messages":[{"role":"user","content":"How much is an OBD test?"}]}'
```

Open `/admin/leads` and enter `ADMIN_TOKEN`. Leads are newest first.
