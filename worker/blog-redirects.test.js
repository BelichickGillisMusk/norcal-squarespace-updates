/**
 * Legacy CTC blog routing — one-hop fallbacks for live /blog posts.
 * Plain node, no test framework.
 *
 * Run: node worker/blog-redirects.test.js
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';
import { legacyBlogTarget } from './blog-routing.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = join(ROOT, 'site', 'blog');

let failed = 0;
let passed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error('FAIL:', msg);
}

const SITE_BLOG_NINE = [
  'which-trucks-dont-need-clean-truck-check',
  'clean-truck-check-west-sacramento-elite-rentals',
  'jobsite-clean-truck-check-near-me-oakland',
  'clean-truck-check-sacramento-construction-fleets',
  'harvest-season-clean-truck-check',
  'bayshore-sf-free-retest-ovi-wager-6500',
  'craft-so-good-they-copy-us-hotdog-clipboard',
  'fleets-ovi-obd-porterville-mojave',
  'obd-vs-ovi-clean-truck-check-fleets',
];

const EXISTING_BLOG_FALLBACKS = [
  '2026-carb-testing-deadlines',
  'how-mobile-carb-testing-works',
  'carb-clean-truck-check',
];

const SAMPLE_LEGACY = [
  'carb-violation',
  'napa-carb-clean-truck',
  'woodland-agriculture-meets-carb-compliance',
  'how-to-calculate-90-days-for-carb-testing-compliance',
  'oakland-clean-truck-checks-san-leandro',
  'motorhome-carb-testing-in-california-your-complete-guide',
  'ca-ag-vehicles-clean-truck-testing-info',
  'top-5-reasons-trucks-fail-clean-truck-check-and-how-to-avoid-them',
];

const diskBlogSlugs = readdirSync(BLOG_DIR)
  .filter((name) => name.endsWith('.html') && name !== 'index.html')
  .map((name) => name.replace(/\.html$/i, ''));

assert(LEGACY_BLOG_SLUGS.size === 60, `expected 60 legacy CTC slugs, got ${LEGACY_BLOG_SLUGS.size}`);

for (const slug of SITE_BLOG_NINE) {
  const fromCtc = legacyBlogTarget(`/clean-truck-check-blog/${slug}`);
  assert(
    fromCtc === `/blog/${slug}`,
    `/clean-truck-check-blog/${slug} → ${fromCtc}, expected /blog/${slug}`,
  );
  const fromCtcSlash = legacyBlogTarget(`/clean-truck-check-blog/${slug}/`);
  assert(
    fromCtcSlash === `/blog/${slug}`,
    `trailing-slash CTC path for ${slug} → ${fromCtcSlash}`,
  );
  const fromBlog = legacyBlogTarget(`/blog/${slug}`);
  assert(fromBlog === null, `/blog/${slug} must be served (got ${fromBlog})`);
  assert(!LEGACY_BLOG_SLUGS.has(slug), `${slug} must not be a legacy CTC slug`);
}

for (const slug of EXISTING_BLOG_FALLBACKS) {
  assert(
    legacyBlogTarget(`/clean-truck-check-blog/${slug}`) === `/blog/${slug}`,
    `existing fallback ${slug} still maps to /blog/${slug}`,
  );
  assert(legacyBlogTarget(`/blog/${slug}`) === null, `/blog/${slug} stays on /blog`);
}

for (const slug of diskBlogSlugs) {
  assert(
    LEGACY_BLOG_FALLBACKS[slug] === `/blog/${slug}`,
    `disk /blog page ${slug} must auto-fallback from the CTC path`,
  );
  assert(!LEGACY_BLOG_SLUGS.has(slug), `disk /blog page ${slug} must not also be a legacy slug`);
}

for (const slug of SAMPLE_LEGACY) {
  assert(LEGACY_BLOG_SLUGS.has(slug), `sample legacy slug missing: ${slug}`);
  assert(
    legacyBlogTarget(`/clean-truck-check-blog/${slug}`) === null,
    `legacy ${slug} must still be served at the CTC path`,
  );
  assert(
    legacyBlogTarget(`/blog/${slug}`) === `/clean-truck-check-blog/${slug}`,
    `/blog/${slug} must still 301 to the CTC path`,
  );
  assert(
    LEGACY_BLOG_FALLBACKS[slug] === undefined,
    `legacy ${slug} must not have a /blog fallback (loop)`,
  );
}

for (const slug of LEGACY_BLOG_SLUGS) {
  const ctcPath = `/clean-truck-check-blog/${slug}`;
  const fromCtc = legacyBlogTarget(ctcPath);
  assert(fromCtc === null, `loop: CTC ${slug} redirected to ${fromCtc}`);
  const fromBlog = legacyBlogTarget(`/blog/${slug}`);
  assert(fromBlog === ctcPath, `loop: /blog/${slug} → ${fromBlog}`);
  assert(
    legacyBlogTarget(fromBlog) === null,
    `loop: /blog/${slug} 301s to ${fromBlog} which then 301s again`,
  );
  assert(
    LEGACY_BLOG_FALLBACKS[slug] === undefined,
    `loop: legacy slug ${slug} is also a fallback`,
  );
}

for (const [slug, target] of Object.entries(LEGACY_BLOG_FALLBACKS)) {
  const fromCtc = legacyBlogTarget(`/clean-truck-check-blog/${slug}`);
  assert(fromCtc === target, `fallback ${slug} → ${fromCtc}, expected ${target}`);
  assert(fromCtc !== `/clean-truck-check-blog/${slug}`, `fallback ${slug} points at itself`);
  const hop2 = legacyBlogTarget(target);
  assert(
    hop2 === null || hop2 !== `/clean-truck-check-blog/${slug}`,
    `loop: ${slug} → ${target} → ${hop2}`,
  );
  if (target === `/blog/${slug}`) {
    assert(
      legacyBlogTarget(`/blog/${slug}`) === null,
      `loop: /blog/${slug} bounces back to CTC`,
    );
  }
}

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
