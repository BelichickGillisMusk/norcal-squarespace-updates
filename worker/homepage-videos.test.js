/**
 * Homepage must not load YouTube. Field Short lives on /videos.
 * Plain node, no test framework.
 *
 * Run: node worker/homepage-videos.test.js
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const homepage = readFileSync(join(root, 'site/index.html'), 'utf8');
const videosPath = join(root, 'site/videos.html');
const sitemap = readFileSync(join(root, 'site/sitemap.xml'), 'utf8');

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

assert(!homepage.includes('youtube.com/embed'), 'homepage HTML must not contain youtube.com/embed');
assert(!homepage.includes('<iframe'), 'homepage HTML must not contain <iframe');
assert(!homepage.includes('lite-youtube'), 'homepage HTML must not contain lite-youtube');
assert(!homepage.includes('youtube.com/shorts/q8osFPN8jyI'), 'homepage must not link the Short URL');
assert(homepage.includes('href="/videos"'), 'homepage must link to /videos');
assert(homepage.includes('https://www.youtube.com/watch?v=tJ78m6VYhX8'), 'CARB how-to watch link stays');

assert(existsSync(videosPath), '/videos page file exists at site/videos.html');
const videos = readFileSync(videosPath, 'utf8');
assert(videos.includes('rel="canonical" href="https://norcalcarbmobile.com/videos"'), 'videos page has self canonical');
assert(
  videos.includes('youtube-nocookie.com/embed/q8osFPN8jyI') || videos.includes('youtube.com/embed/q8osFPN8jyI'),
  'videos page contains the q8osFPN8jyI embed',
);
assert(videos.includes('<iframe'), 'videos page contains an iframe embed');
assert(videos.includes('https://www.youtube.com/@CARBCLEANTRUCKMOBILE'), 'videos page links the YouTube channel');
assert(videos.includes('loading="lazy"'), 'videos embed is lazy-loaded');
assert(sitemap.includes('https://norcalcarbmobile.com/videos'), 'sitemap lists /videos');

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
