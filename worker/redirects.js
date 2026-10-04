/**
 * URL routing for norcalcarbmobile.com — legacy Squarespace redirects and
 * canonical-path normalization. Pure functions (no Workers APIs) so they can be
 * unit-tested with plain Node: see worker/redirects.test.mjs.
 *
 * Canonical form: https apex, no trailing slash, no `.html`. Today www → apex
 * and http → https are answered by the Cloudflare zone before the Worker runs;
 * worker/index.js also 301s www/http in the same hop if those requests reach it.
 */

import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

export const GOOGLE_REVIEWS_URL = 'https://maps.google.com/?cid=16019693078134296096';

/**
 * Old Squarespace URL → new path.  All return 301 so search engines
 * update their indexes and any inbound links keep working.
 */
export const REDIRECTS = {
  // → external Google Business Profile / reviews
  '/reviews': GOOGLE_REVIEWS_URL,
  '/google': GOOGLE_REVIEWS_URL,
  '/leave-review': GOOGLE_REVIEWS_URL,

  // → closest real page (a redirect to the homepage reads as a soft 404)
  '/carb-services': '/services',
  '/store': '/pricing',

  // → /contact
  '/bookcontact': '/contact',
  '/book-schedule-carb-smoke-test-sacramento': '/contact',
  '/contact-us': '/contact',

  // → /pricing
  '/clean-truck-check-rates': '/pricing',

  // → /services
  '/clean-truck-check': '/services#obd',
  '/smoke-opacity-test-near-me': '/services#ovi',
  '/motorhome': '/services#motorhome',
  '/agricultural-vehicles-clean-truck-check': '/services#agricultural',
  '/services-mobile-ovi-smoke': '/services',

  // → /faq
  '/carb-questions-and-answers': '/faq',
  '/what-is-clean-truck-check': '/faq',
  '/faqs-carb-clean-truck-check-mobile': '/faq',
  '/carb-resources': '/faq',
  '/qa-and-glossary': '/faq',
  '/carb-mobile-app': '/faq',
  '/blog/check-compliance-carb-app': '/faq',
  '/clean-truck-check-blog/check-compliance-carb-app': '/faq',
  '/blog/vin-diesel-best-lunch-norcal-routes': '/blog',
  '/carb-penalties-deadlines': '/faq',

  // → /areas
  '/carb-locations': '/areas',
  '/service-area-sacramento-carb-testing': '/sacramento-carb-testing',
  '/clean-truck-check-napa-st-helena-calistoga': '/areas#napa',
  '/north-bay-carb-mobile-testing': '/areas#north-bay',
  '/east-bay-mobile-carb-testing': '/areas#east-bay',
  '/clean-truck-check-bay-area': '/areas#bay-area',
  '/tracy-livermore-clean-truck-check-j1667': '/areas#tracy',
  '/clean-truck-check-fresno': '/areas#central-valley',
  '/clean-truck-check-hayward': '/areas#hayward',
  '/clean-truck-check-fairfield': '/areas#fairfield',
  '/service-area-butte-county-clean-truck-check': '/areas#butte',
  '/service-area-san-joaquin-county-mobile-testing': '/areas#san-joaquin',
  '/san-jose-mobile-carb-testing': '/areas#san-jose',
  // Lodi now has its own full corridor page at /clean-truck-check-lodi
  // '/clean-truck-check-lodi': '/areas#lodi',
  '/clean-truck-check-roseville': '/areas#roseville',
  '/carb-mobile-clean-truck-check-antioch-california': '/areas#antioch',
  // San Diego County booking/pricing lives on the sibling site. Absolute Location
  // is returned as-is by the redirect handler. Trailing-slash keys are listed
  // because lookup is exact, then one trailing slash stripped.
  '/clean-truck-check-san-diego': 'https://mobilecarbsmoketest.com/',
  '/san-diego': 'https://mobilecarbsmoketest.com/',
  '/san-diego/': 'https://mobilecarbsmoketest.com/',
  '/areas/san-diego': 'https://mobilecarbsmoketest.com/',
  '/areas/san-diego/': 'https://mobilecarbsmoketest.com/',
  '/clean-truck-check-orange-county': '/areas',
  '/service-locations': '/areas',
  // Legacy Squarespace path. One trailing slash is stripped in the lookup below.
  '/service-areas': '/areas',
  // Legacy alias — restore after 404 regression (Jennifer pulse 2026-09-27)
  '/locations': '/areas',
  // Squarespace "New Page" stub. Stable Shorts URL is the facts hub.
  '/new-page': '/clean-truck-check-facts',
  '/new-page.html': '/clean-truck-check-facts',
  '/qa-glossary': '/faq',
  '/norcal-carb-mobile-2026': '/',
  '/services/opacity-smoke-test/': '/services#ovi',
  '/carb-clean-truck-check-store': '/pricing',
  '/service-locations/blog-post-title-four-6x6kf': '/',
  '/anitoch-clean-truck-check': '/bay-area-mobile-carb',
  '/antioch-clean-truck-check': '/bay-area-mobile-carb',

  // → homepage #reviews section (no standalone reviews page yet)
  '/clean-truck-top-review': '/#reviews',
  '/reviews-service-area': '/#reviews',

  // GSC / legacy broken paths (2026-08-07 audit — admin@ GSC top pages + crawl)
  '/privacy': '/testing-terms',
  '/privacy.html': '/testing-terms',
  '/terms': '/testing-terms',
  '/terms.html': '/testing-terms',
  '/terms-of-service': '/testing-terms',
  '/glossary': '/faq',
  '/glossary.html': '/faq',
  '/team': '/for-clients',
  '/team.html': '/for-clients',
  '/s/marketing-landing.html': '/',
  '/marketing-landing': '/',
  '/contact-us.html': '/contact',
  '/services-mobile-ovi-smoke.html': '/services',
  '/clean-truck-check.html': '/services',
  '/service-locations.html': '/areas',
  '/faqs-carb-clean-truck-check-mobile.html': '/faq',
  '/carb-resources.html': '/faq',
  '/carb-penalties-deadlines.html': '/faq',
  '/smoke-opacity-test-near-me.html': '/services#ovi',
  '/agricultural-vehicles-clean-truck-check.html': '/services#agricultural',
  '/book': '/contact',
  '/booking': '/contact',

  // Old Squarespace sitemap URLs still 404ing in GSC (2026-10-04 audit, AUDIT.md)
  '/home': '/',
  '/privacy-policy': '/testing-terms',
  '/terms-and-conditions': '/testing-terms',
  '/thank-you': '/contact',
  '/clean-truck-check-sacramento': '/sacramento-carb-testing',
  '/faqs-clean-truck-check-mobile-sacramento': '/faq',
  '/stockton-modesto-merced-turlock-clean-truck-check': '/stockton-clean-truck-check',
  '/october-clean-truck-check': '/clean-truck-check-facts',
};

/**
 * Blog routing. Migrated Squarespace posts are served at their EXACT old URL,
 * /clean-truck-check-blog/<slug> (per Bryan — keep the old slugs/paths live).
 *
 * Returns a redirect target, or null to fall through to static assets:
 *  - /blog/<legacy-slug>                → 301 to the old path (early /blog layout)
 *  - /clean-truck-check-blog            → 301 to /blog (the index)
 *  - /clean-truck-check-blog/<slug>     → served directly (null)
 *  - date-based /clean-truck-check-blog/2025/10/8/<slug> → 301 to the flat old path
 *  - unrecoverable/unknown slugs        → closest equivalent page, else /blog
 */
export function legacyBlogTarget(pathname) {
  const path = pathname.replace(/\/+$/, '');
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

/**
 * Old Squarespace "service-locations" collection: posts that now live at
 * /clean-truck-check-blog/<slug> (only migrated slugs with a page in site/),
 * and its tag archives, which go to the service-areas hub.
 */
export function serviceLocationsTarget(path) {
  if (path.startsWith('/service-locations/tag/')) return '/areas';
  if (!path.startsWith('/service-locations/')) return null;
  const slug = path.slice('/service-locations/'.length);
  if (slug && !slug.includes('/') && LEGACY_BLOG_SLUGS.has(slug)) {
    return `/clean-truck-check-blog/${slug}`;
  }
  return null;
}

/**
 * Canonical path: no trailing slash (except root), no `.html`, no `/index.html`.
 * Root `/` is returned unchanged.
 */
export function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  let p = pathname.replace(/\/+$/, '') || '/';
  if (/\/index\.html$/i.test(p)) p = p.replace(/\/index\.html$/i, '') || '/';
  else if (/\.html$/i.test(p)) p = p.replace(/\.html$/i, '') || '/';
  return p;
}

/**
 * One-hop redirect target for a request path, or null to serve assets.
 *  1. legacy blog / service-locations / Squarespace map (checked on the raw
 *     path, the raw path minus one trailing slash, and the canonical path)
 *  2. otherwise, if the path isn't canonical (trailing slash or .html), a
 *     permanent redirect to the canonical path, query string kept.
 * Everything returned here is served as a 301 — never the 307 that static-asset
 * `auto-trailing-slash` would send.
 */
export function resolveRedirect(pathname, search = '') {
  const clean = canonicalPath(pathname);
  const target =
    legacyBlogTarget(clean) ||
    serviceLocationsTarget(clean) ||
    REDIRECTS[pathname] ||
    REDIRECTS[pathname.replace(/\/$/, '')] ||
    REDIRECTS[clean];
  if (target && target !== pathname) return target;
  if (clean !== pathname) return clean + (search || '');
  return null;
}
