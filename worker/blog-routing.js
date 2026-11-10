/**
 * Blog path routing used by worker/index.js.
 * Data lives in the generated blog-redirects.js; keep this function here so
 * tests can import it without loading the Cloudflare Email module.
 */
import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

/**
 * Migrated Squarespace posts are served at their EXACT old URL,
 * /clean-truck-check-blog/<slug> (keep the old slugs/paths live).
 *
 * Returns a redirect target, or null to fall through to static assets:
 *  - /blog/<legacy-slug>                → 301 to the old path (early /blog layout)
 *  - /clean-truck-check-blog            → 301 to /blog (the index)
 *  - /clean-truck-check-blog/<slug>     → served directly (null) when in LEGACY_BLOG_SLUGS
 *  - date-based /clean-truck-check-blog/2025/10/8/<slug> → 301 to the flat old path
 *  - live /blog posts with no CTC page  → 301 to /blog/<slug> (LEGACY_BLOG_FALLBACKS)
 *  - unrecoverable/unknown slugs        → closest equivalent page, else /blog
 */
export function legacyBlogTarget(pathname) {
  const path = pathname.replace(/\/+$/, '').replace(/\.html$/i, '');
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    return LEGACY_BLOG_SLUGS.has(slug) ? `/clean-truck-check-blog/${slug}` : null;
  }
  if (path !== '/clean-truck-check-blog' && !path.startsWith('/clean-truck-check-blog/')) return null;
  const slug = path.split('/').pop();
  if (slug === 'clean-truck-check-blog') return '/blog';
  if (LEGACY_BLOG_FALLBACKS[slug]) return LEGACY_BLOG_FALLBACKS[slug];
  if (LEGACY_BLOG_SLUGS.has(slug)) {
    const canonical = `/clean-truck-check-blog/${slug}`;
    return path === canonical ? null : canonical;
  }
  return '/blog';
}
