#!/usr/bin/env bash
# Deploy money site ONLY to empty Bryan CF account.
# Never use Gillis default OAuth if account_id is set on empty account.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
CFG="wrangler.prod-empty.toml"

if ! grep -qE '^account_id\s*=\s*"[a-f0-9]{32}"' "$CFG"; then
  echo "BLOCKED: set account_id in $CFG to the EMPTY bryan@norcalcarbmobile.com account."
  echo "Do not use Gillis account bafa242dd95d3fdce72540d20accd0a2."
  echo "Run: npx wrangler logout && npx wrangler login  # as bryan@norcalcarbmobile.com"
  echo "Then: npx wrangler whoami  # paste Account ID into $CFG"
  exit 1
fi

if grep -q 'bafa242dd95d3fdce72540d20accd0a2' "$CFG"; then
  echo "BLOCKED: $CFG points at Gillis Institute — money site must not deploy there."
  exit 1
fi

echo "Deploying norcalcarbmobile-prod via $CFG …"
npx wrangler@4 deploy --config "$CFG" --commit-dirty=true

echo "Done. Smoke:"
curl -sS -o /dev/null -w "home %{http_code}\n" -m 20 https://norcalcarbmobile.com/ || true
