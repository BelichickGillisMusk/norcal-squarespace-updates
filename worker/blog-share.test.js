/**
 * Blog share row + per-post og:image, checked against every blog post file.
 * Run: node worker/blog-share.test.js
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyBlogShare,
  isBlogPostPath,
  facebookShareHref,
  xShareHref,
  linkedinShareHref,
  smsShareHref,
  esc,
  BRAND_OG_IMAGE,
} from './blog-share.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) passed += 1;
  else {
    failed += 1;
    console.error(`FAIL ${msg}`);
  }
}

// Path rules
assert(isBlogPostPath('/blog/obd-vs-ovi-clean-truck-check-fleets'), 'blog post path');
assert(isBlogPostPath('/clean-truck-check-blog/napa-carb-clean-truck'), 'legacy post path');
assert(!isBlogPostPath('/blog'), '/blog index excluded');
assert(!isBlogPostPath('/blog/index'), '/blog/index excluded');
assert(!isBlogPostPath('/clean-truck-check-blog'), 'legacy index excluded');
assert(!isBlogPostPath('/pricing'), 'non-blog excluded');
assert(!isBlogPostPath('/blog/a/b'), 'nested path excluded');

const dirs = [
  ['site/blog', '/blog/'],
  ['site/clean-truck-check-blog', '/clean-truck-check-blog/'],
];
let posts = 0;
let photoPosts = 0;
for (const [dir, prefix] of dirs) {
  for (const name of readdirSync(join(root, dir))) {
    if (!name.endsWith('.html') || name === 'index.html') continue;
    posts += 1;
    const rel = `${dir}/${name}`;
    const html = readFileSync(join(root, rel), 'utf8');
    const path = prefix + name.replace(/\.html$/, '');
    assert(isBlogPostPath(path), `${rel} is a post path`);
    const r = applyBlogShare(html, `https://norcalcarbmobile.com${path}`);
    const out = r.html;
    assert(r.applied, `${rel} applied`);
    assert(r.url.startsWith('https://norcalcarbmobile.com/'), `${rel} canonical url`);
    assert(r.title.length > 0, `${rel} has title`);
    for (const href of [
      facebookShareHref(r.url),
      xShareHref(r.url, r.title),
      linkedinShareHref(r.url),
      smsShareHref(r.url, r.title),
    ]) {
      assert(out.includes(`href="${esc(href)}"`), `${rel} missing ${href.slice(0, 40)}`);
    }
    assert(out.includes(`data-ncm-copy href="${esc(r.url)}"`), `${rel} copy link`);
    assert((out.match(/target="_blank" rel="noopener"/g) || []).length >= 3, `${rel} web shares open safely`);
    assert((out.match(/class="ncm-share-row"/g) || []).length === 1, `${rel} exactly one share row`);
    assert(out.indexOf('class="ncm-share-row"') > out.search(/<\/h1>/i), `${rel} row after H1`);
    assert(!/Published/.test(out.slice(out.indexOf('ncm-share-row" role'), out.indexOf('ncm-share-row" role') + 2500).replace(/<script[\s\S]*?<\/script>/, '').split('</div>')[0]), `${rel} byline stays above the row`);
    // No external scripts added
    const added = (out.match(/<script\b[^>]*\bsrc=/gi) || []).length;
    const before = (html.match(/<script\b[^>]*\bsrc=/gi) || []).length;
    assert(added === before, `${rel} no external script added`);
    assert(!/widgets\.js|connect\.facebook\.net|addtoany|sharethis|platform\.linkedin/i.test(out), `${rel} no share widget`);
    // og:image
    assert(/<meta property="og:image" content="https:\/\//.test(r.headTags), `${rel} og:image absolute`);
    assert(!/<meta\b[^>]*property=["']og:image["']/i.test(out), `${rel} no duplicate og:image in body html`);
    if (r.image !== BRAND_OG_IMAGE) photoPosts += 1;
    assert(/twitter:card/.test(r.headTags), `${rel} twitter:card`);
    // Idempotent
    assert(!applyBlogShare(out, r.url).applied, `${rel} idempotent`);
    // Phone lock untouched
    assert(!/tel:(?!\+19168904427)/.test(r.headTags + out.slice(out.indexOf('ncm-share-row'), out.indexOf('ncm-share-row') + 3000)), `${rel} no new phone`);
  }
}
assert(posts >= 70, `expected 70+ posts, found ${posts}`);
console.log(`blog-share: ${posts} posts, ${photoPosts} with a post photo og:image, rest use the logo`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
