# Cloudflare workflow spec — norcal-squarespace-updates-gillis

Source of truth: Cloudflare Workers CI/CD docs (Workers Builds + Wrangler), not Cursor rules.

Live Worker: `norcal-squarespace-updates-gillis`
Repo: `BelichickGillisMusk/norcal-squarespace-updates`
Domain: norcalcarbmobile.com
Assets dir: `./site`

## Official two-command model

1. Build command — empty. This site is static.
2. Deploy command:
   - Production branch (`main`): `npx wrangler deploy`
   - Any other branch / PR: `npx wrangler versions upload`

`wrangler deploy` promotes norcalcarbmobile.com.
`wrangler versions upload` returns a preview URL. It does not flip production.

## Dashboard — connect the existing Worker once

Do not create Pages. Do not dual-deploy.

1. Workers & Pages → Worker `norcal-squarespace-updates-gillis`
2. Settings → Builds → Connect
3. GitHub app: Cloudflare Workers & Pages
4. Repo: `BelichickGillisMusk/norcal-squarespace-updates`
5. Root: `/`
6. Build command: empty
7. Deploy command: `npx wrangler deploy`
8. Non-production command: `npx wrangler versions upload`
9. Production branch: `main`
10. Enable builds for non-production branches
11. Watch paths include: `site/*`, `worker/*`, `wrangler.toml`, `wrangler.jsonc`
12. Watch paths exclude: `email/*`, `scripts/*`, `google-ads/*`, `blog_drafts/*`, `docs/*`, `.cursor/*`

## Why Cursor freeze still broke layout

Rules are advisory. Agents rewrite CSS then refresh lock hashes.
Cloudflare separates upload from promote. Look at the preview. Reject if chrome moved. GO only after that.
