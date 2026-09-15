#!/usr/bin/env bash
# Fail if a push/PR touches locked chrome while claiming to be a content update.
set -euo pipefail

BASE="${1:-origin/main}"
HEAD="${2:-HEAD}"

if ! git rev-parse --verify "$BASE" >/dev/null 2>&1; then
  echo "Base $BASE missing; skip path guard on first clone."
  exit 0
fi

CHANGED="$(git diff --name-only "$BASE"..."$HEAD" || true)"
if [ -z "$CHANGED" ]; then
  echo "No file diff vs $BASE."
  exit 0
fi

echo "Changed files:"
echo "$CHANGED"
echo

FORBIDDEN_REGEX='^(site/assets/styles\.css|site/assets/css/|site/index\.html|site/assets/img/ncm-logo\.png|site/assets/img/coverage-map-v2\.png|site/assets/img/norcal-carb-mobile-logo-250th\.png|worker/|wrangler\.toml|wrangler\.jsonc|wrangler\.prod-empty\.toml)$'

HITS="$(echo "$CHANGED" | grep -E "$FORBIDDEN_REGEX" || true)"
if [ -n "$HITS" ]; then
  echo "CONTENT PATH GUARD FAILED"
  echo "These files are locked chrome. A content/blog change cannot include them:"
  echo "$HITS"
  echo
  echo "Keep the PR to: blog_drafts/**, site/blog/**, site/blog.html, site/sitemap.xml, site/llms.txt, change_log.md"
  echo "Chrome edits need owner GO on a separate PR labeled layout-change."
  exit 1
fi

echo "Content path guard passed. No locked chrome in this diff."
