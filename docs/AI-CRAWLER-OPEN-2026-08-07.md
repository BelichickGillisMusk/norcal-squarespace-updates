# Allow AI to see CARB sites · 2026-08-07

## Problem
Cloudflare **Managed robots.txt** injects:

```
# BEGIN Cloudflare Managed content
User-agent: GPTBot / ClaudeBot / Google-Extended / …
Disallow: /
```

That tells ChatGPT training crawlers, ClaudeBot, and Gemini Extended to skip your content even when origin `robots.txt` says Allow.

## Fix (dashboard — required; API not exposed on this Free/settings set)

For **each** money domain (start with norcalcarbmobile.com):

1. https://dash.cloudflare.com → select zone  
2. **Security** → **Settings** → filter **Bot traffic**  
3. Turn **OFF**: *Set your preference to block training in robots.txt*  
4. **AI Crawl Control** (`/:account/:zone/ai`) → for **GPTBot, ClaudeBot, Google-Extended, OAI-SearchBot, PerplexityBot** set **Allow**  
5. Confirm live: `curl -s https://DOMAIN/robots.txt | grep -A2 GPTBot` should **not** show `Disallow: /`

### Domains on this CF account that showed managed AI blocks
- norcalcarbmobile.com  
- cleantruckcheckhayward.com  
- carb-clean-truck-check.com  
- (check others with curl)

### Direct links (after you pick account)
- Security settings: `https://dash.cloudflare.com/?to=/:account/:zone/security/settings`  
- AI Crawl Control: `https://dash.cloudflare.com/?to=/:account/:zone/ai`

## Origin files (deployed with site)
- `site/robots.txt` — explicit Allow for GPTBot, ClaudeBot, Google-Extended, OAI-SearchBot, PerplexityBot  
- `site/llms.txt` — short AI grounding (prices, CTA, key URLs)

## WAF note
norcalcarbmobile.com custom rule currently only hard-blocks **PerplexityBot** by UA. Consider **Allow** there too if you want Perplexity citations.

## Blog shipped
- `/blog/obd-vs-ovi-clean-truck-check-fleets` · Aug 7 2026  
- Indexed on `/blog` + sitemap
