# Content-only publish

Live: https://norcalcarbmobile.com/blog
Worker: norcal-squarespace-updates-gillis

Allowed in a content PR: blog_drafts/**, site/blog/**, site/blog.html, site/sitemap.xml, site/llms.txt, change_log.md
Forbidden: styles.css, site/assets/css/**, site/index.html, worker/**, wrangler.*, logo/map binaries

Review: open the Cloudflare preview URL from `versions upload`. If header/colors/map moved, reject. If only the new post exists, merge. Deploy still needs owner GO.
