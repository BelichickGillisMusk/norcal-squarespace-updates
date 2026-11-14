/**
 * Blog share layout — every published post gets a Facebook sharer link and OG tags.
 * Run: node worker/blog-share.test.js
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyBlogShareLayout,
  auditBlogOg,
  BRAND_OG_IMAGE,
  GBP_POSTS_URL,
  canonicalPath,
  facebookShareHref,
  gbpShareText,
  isBlogPostPath,
  shareTitleFromHtml,
  xShareHref,
} from './blog-share.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');

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

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

function publicPathFromFile(absPath) {
  const rel = absPath.slice(site.length).replace(/\\/g, '/');
  return canonicalPath(rel.endsWith('.html') ? rel : rel);
}

const postFiles = [
  ...walk(join(site, 'blog')),
  ...walk(join(site, 'clean-truck-check-blog')),
].filter((path) => path.endsWith('.html') && !path.endsWith('/index.html'));

assert(!isBlogPostPath('/blog'), 'index /blog is not a post');
assert(!isBlogPostPath('/blog/'), 'trailing-slash index is not a post');
assert(!isBlogPostPath('/clean-truck-check-blog'), 'legacy index is not a post');
assert(isBlogPostPath('/blog/how-mobile-carb-testing-works'), 'hand-written /blog slug is a post');
assert(
  isBlogPostPath('/clean-truck-check-blog/what-is-clean-truck-test.html'),
  'legacy slug is a post',
);
assert(
  facebookShareHref('https://norcalcarbmobile.com/blog/how-mobile-carb-testing-works') ===
    'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fnorcalcarbmobile.com%2Fblog%2Fhow-mobile-carb-testing-works',
  'Facebook sharer URL is encoded',
);
assert(
  xShareHref(
    'https://norcalcarbmobile.com/blog/how-mobile-carb-testing-works',
    'How Mobile CARB Testing Works',
  ) ===
    'https://x.com/intent/post?url=https%3A%2F%2Fnorcalcarbmobile.com%2Fblog%2Fhow-mobile-carb-testing-works&text=How%20Mobile%20CARB%20Testing%20Works',
  'X intent URL encodes url and text',
);
assert(
  gbpShareText('How Mobile CARB Testing Works', 'https://norcalcarbmobile.com/blog/how-mobile-carb-testing-works') ===
    'How Mobile CARB Testing Works https://norcalcarbmobile.com/blog/how-mobile-carb-testing-works',
  'GBP clipboard text is title plus canonical URL',
);

{
  const dollarHtml = `<html><head><title>$1,000 Fine</title></head><body><h1>Avoid a $1,000+ Fine</h1><p>Published</p></body></html>`;
  const dollarOut = applyBlogShareLayout(dollarHtml, 'https://norcalcarbmobile.com/blog/dollar-test');
  assert(
    dollarOut.includes('Avoid a $1,000+ Fine https://norcalcarbmobile.com/blog/dollar-test'),
    'share text must keep $1 in the post title',
  );
}

assert(postFiles.length >= 70, `expected 70+ posts, got ${postFiles.length}`);

const uniqueImagePosts = [];
const descriptionGaps = [];
const imageGaps = [];

for (const file of postFiles) {
  const html = readFileSync(file, 'utf8');
  const pagePath = publicPathFromFile(file);
  const canonicalUrl = `https://norcalcarbmobile.com${pagePath}`;
  const rel = file.slice(root.length);
  const audit = auditBlogOg(html);
  if (audit.ogImage) uniqueImagePosts.push({ rel, image: audit.ogImage });
  else imageGaps.push(rel);
  if (!audit.ogDescription && !audit.description) descriptionGaps.push(rel);

  assert(isBlogPostPath(pagePath), `${rel} should be a blog post path (${pagePath})`);

  const out = applyBlogShareLayout(html, canonicalUrl);
  const title = shareTitleFromHtml(html);
  const href = facebookShareHref(canonicalUrl);
  const xHref = xShareHref(canonicalUrl, title).replace(/&/g, '&amp;');
  const copyText = gbpShareText(title, canonicalUrl)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
  assert(out.includes(href), `${rel} output missing Facebook sharer href`);
  assert(out.includes(xHref), `${rel} output missing X intent href`);
  assert(out.includes(copyText), `${rel} output missing GBP clipboard text`);
  assert(out.includes(GBP_POSTS_URL), `${rel} GBP helper missing business.google.com/posts`);
  assert(
    /aria-label="Share this post on Facebook"/.test(out),
    `${rel} missing Facebook share label`,
  );
  assert(/aria-label="Share this post on X"/.test(out), `${rel} missing X share label`);
  assert(
    /aria-label="Share this post to Google Business"/.test(out),
    `${rel} missing Google Business share label`,
  );
  assert(/data-ncm-gbp-share/.test(out), `${rel} missing GBP button`);
  assert(/Copied, paste into your Google post/.test(out), `${rel} missing GBP copied note`);
  assert(/target="_blank"/.test(out) && /rel="noopener noreferrer"/.test(out), `${rel} share link missing target/rel`);
  assert(
    !/connect\.facebook\.net|fbevents|fbq\(|platform\.twitter\.com|widgets\.js/.test(out),
    `${rel} must not load Facebook or X third-party JS`,
  );

  const served = auditBlogOg(out);
  assert(served.ogTitle, `${rel} missing og:title after layout`);
  assert(served.ogDescription, `${rel} missing og:description after layout`);
  assert(served.ogImage, `${rel} missing og:image after layout`);
  assert(served.ogUrl === canonicalUrl, `${rel} og:url should be ${canonicalUrl}, got ${served.ogUrl}`);
  assert(served.ogType === 'article', `${rel} og:type should be article, got ${served.ogType}`);
  assert(served.twitterCard, `${rel} missing twitter:card after layout`);
  if (!audit.ogImage) {
    assert(
      served.ogImage === BRAND_OG_IMAGE,
      `${rel} filled og:image should be brand image, not invented art`,
    );
  }
}

assert(descriptionGaps.length === 0, `posts missing any description: ${descriptionGaps.join(', ')}`);

if (failed) {
  console.error(`\nblog-share tests: ${passed} passed, ${failed} failed`);
  process.exit(1);
}

console.log(`blog-share tests: ${passed} passed`);
console.log(`posts covered: ${postFiles.length}`);
console.log(`source files with post-specific og:image: ${uniqueImagePosts.length}`);
console.log(`source files using brand og:image fallback: ${imageGaps.length}`);
