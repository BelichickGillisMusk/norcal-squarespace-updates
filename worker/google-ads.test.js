/**
 * Google Ads tag inject + conversion-only-on-success.
 * Run: node worker/google-ads.test.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GOOGLE_ADS_CONVERSION_FN,
  GOOGLE_ADS_CONVERSION_SEND_TO,
  GOOGLE_ADS_CONVERSION_BOOTSTRAP,
  GOOGLE_ADS_HEAD,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_TAG,
  countGoogleAdsTagsInHead,
  injectGoogleAdsHead,
  shouldFireGoogleAdsConversion,
} from './google-ads.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

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

const samplePages = [
  'site/index.html',
  'site/contact.html',
  'site/blog.html',
  'site/carb-obd-test.html',
  'site/carb-ovi-test.html',
  'site/motorhome-carb-test.html',
  'site/clean-truck-check-blog/what-is-clean-truck-test.html',
];

const workerIndex = readFileSync(join(root, 'worker/index.js'), 'utf8');
const contactHtml = readFileSync(join(root, 'site/contact.html'), 'utf8');
const contactJs = readFileSync(join(root, 'worker/contact.js'), 'utf8');

assert(
  GOOGLE_ADS_TAG.includes(`googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`),
  'tag loads gtag.js for AW-18285811780',
);
assert(
  GOOGLE_ADS_TAG.includes(`gtag('config','${GOOGLE_ADS_ID}')`),
  'tag configs AW-18285811780',
);
assert(
  !GOOGLE_ADS_TAG.includes('GTM-'),
  'must not use Google Tag Manager container',
);

assert(
  workerIndex.includes('el.prepend(GOOGLE_ADS_HEAD'),
  'Worker prepends Google Ads head block immediately after <head>',
);
assert(
  workerIndex.includes("from './google-ads.js'"),
  'Worker imports the Google Ads head block',
);

for (const rel of samplePages) {
  const raw = readFileSync(join(root, rel), 'utf8');
  assert(
    countGoogleAdsTagsInHead(raw) === 0,
    `${rel} must not embed the Ads tag in static HTML (Worker injects it once)`,
  );
  const injected = injectGoogleAdsHead(raw);
  assert(
    countGoogleAdsTagsInHead(injected) === 1,
    `${rel} after Worker-style inject must have the Ads tag exactly once in <head>`,
  );
  const head = injected.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1];
  assert(
    head.startsWith(GOOGLE_ADS_HEAD) || head.trimStart().startsWith('<!-- Google tag (gtag.js) -->'),
    `${rel} Ads tag must be the first content in <head>`,
  );
  const conversionHits = (injected.match(/gtag\('event','conversion'/g) || []).length;
  assert(conversionHits === 1, `${rel} conversion gtag must appear once (injected bootstrap only)`);
}

assert(shouldFireGoogleAdsConversion('?sent=1') === true, '?sent=1 fires conversion');
assert(shouldFireGoogleAdsConversion('sent=1') === true, 'sent=1 without ? fires conversion');
assert(shouldFireGoogleAdsConversion('') === false, 'empty search does not fire');
assert(shouldFireGoogleAdsConversion('?error=1') === false, '?error=1 does not fire');
assert(shouldFireGoogleAdsConversion('?sent=1&error=1') === false, 'sent+error does not fire');
assert(shouldFireGoogleAdsConversion('?utm_source=google') === false, 'unrelated query does not fire');

assert(
  GOOGLE_ADS_CONVERSION_BOOTSTRAP.includes(`gtag('event','conversion',{'send_to':'${GOOGLE_ADS_CONVERSION_SEND_TO}'})`),
  'bootstrap contains the conversion send_to',
);
assert(
  GOOGLE_ADS_CONVERSION_BOOTSTRAP.includes(`q.get('sent')==='1' && q.get('error')!=='1'`),
  'bootstrap auto-fire is gated on sent=1 and not error=1',
);
assert(
  GOOGLE_ADS_CONVERSION_BOOTSTRAP.includes("sessionStorage.getItem('ncm-aw-contact-conv')"),
  'bootstrap guards refresh double-fire via sessionStorage',
);

const successIdx = contactHtml.indexOf('if (res.ok)');
const elseIdx = contactHtml.indexOf('} else {', successIdx);
const catchIdx = contactHtml.lastIndexOf('.catch(function () {');
assert(successIdx > 0 && elseIdx > successIdx && catchIdx > elseIdx, 'contact.html has a fetch success branch');
const successBranch = contactHtml.slice(successIdx, elseIdx);
const errorBranch = contactHtml.slice(elseIdx, catchIdx);
const catchBranch = contactHtml.slice(catchIdx);
assert(
  successBranch.includes(`window.${GOOGLE_ADS_CONVERSION_FN}()`),
  'contact.html fetch 2xx success branch fires the conversion helper',
);
assert(
  !errorBranch.includes(GOOGLE_ADS_CONVERSION_FN),
  'contact.html error branch must not fire conversion',
);
assert(
  !catchBranch.includes(GOOGLE_ADS_CONVERSION_FN),
  'contact.html catch branch must not fire conversion',
);
assert(
  !contactHtml.includes(GOOGLE_ADS_CONVERSION_SEND_TO),
  'contact.html must not embed send_to (lives in Worker success helper only)',
);

const sentBannerBlock = contactHtml.slice(
  contactHtml.indexOf("p.get('sent') === '1'"),
  contactHtml.indexOf("var form = document.getElementById('contact-form')"),
);
assert(
  !sentBannerBlock.includes(GOOGLE_ADS_CONVERSION_FN),
  'contact.html thank-you banner on ?sent=1 must not fire conversion a second time',
);

assert(contactJs.includes("location = ok ? '/contact?sent=1' : '/contact?error=1'"), 'non-JSON intake success redirects to ?sent=1');
assert(
  !contactJs.includes(GOOGLE_ADS_CONVERSION_FN) && !contactJs.includes('gtag('),
  'intake API must not fire conversion server-side',
);

const landerForms = [
  'site/carb-obd-test.html',
  'site/carb-ovi-test.html',
  'site/motorhome-carb-test.html',
];
for (const rel of landerForms) {
  const html = readFileSync(join(root, rel), 'utf8');
  assert(html.includes('action="/api/contact"'), `${rel} posts to /api/contact`);
  assert(!html.includes('gtag(\'event\',\'conversion\''), `${rel} must not fire conversion on the lander itself`);
}

assert(GOOGLE_ADS_HEAD.includes(GOOGLE_ADS_TAG), 'head block includes the Google tag');

if (failed) {
  console.error(`\n${failed} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`${passed} passed`);
