// Unit tests for worker/redirects.js — plain Node, no deps, no network.
// Run from the repo root:  node --experimental-detect-module worker/redirects.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { resolveRedirect, canonicalPath, REDIRECTS } from './redirects.js';
import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

const root = new URL('../', import.meta.url).pathname;
const site = join(root, 'site');
let passed = 0;
const failures = [];
function t(name, fn) {
  try { fn(); passed++; } catch (e) { failures.push(`${name}: ${e.message}`); }
}

/** Does an internal target path resolve to a real page in site/ (served 200)? */
function pageExists(target) {
  if (/^https?:\/\//.test(target)) return true; // external
  const p = target.split('#')[0].split('?')[0];
  if (p === '/') return existsSync(join(site, 'index.html'));
  return existsSync(join(site, `${p}.html`)) || existsSync(join(site, p, 'index.html'));
}
/** A target is "final" if requesting it would not redirect again. */
function isFinal(target) {
  if (/^https?:\/\//.test(target)) return true;
  const p = target.split('#')[0].split('?')[0];
  return resolveRedirect(p) === null;
}

// 1. The 37 old-Squarespace-sitemap URLs that 404 on prod today.
const SERVICE_LOCATION_POSTS = [
  'carb-compliance-guide-for-truckers-in-merced-county-navigating-clean-truck-regulations',
  'carb-j1667-opacity-test-antioch-mobile-clean-truck-check',
  'four-counties-six-stops-one-day-keeping-california-fleets-carb-clean-truck',
  'how-norcal-carb-mobile-keeps-mitchell-concrete-moving-strong-in-rancho-cordova',
  'keeping-pallets-moving-amp-trucks-carb-clean-a-partnership-with-all-good-pallets-stockton-ca',
  'keeping-republic-electric-wests-fleet-road-ready-how-norcal-carb-mobile-delivers-247-clean-truck-check-excellence',
  'keeping-sm-transport-rolling-how-norcal-carb-mobile-powers-on-time-deliveries',
  'mobile-clean-truck-checks-in-brentwood-and-beyond',
  'motorhome-carb-testing-in-california-your-complete-guide',
  'napa-carb-clean-truck',
  'on-the-road-opacity-testing-amp-visual-inspections-across-northern-californias-major-corridors',
  'when-friday-deadline-pressure-hits-how-norcal-carb-mobile-kept-the-plaster-groups-f550-fleet-compliant',
  'woodland-agriculture-meets-carb-compliance',
];
const TAGS = [
  'CARB+Compliance+Clean+Truck+Program+Stockton+Business+Fleet+Service+California+Trucking+Emissions+Testing+Mobile+Truck+Service+All+Good+Pallets+Bay+Area+Logistics+Sustainable+Trucking',
  'CARB+Compliance+Clean+Truck+Program+Stockton+Business+Petaluma+Business+San+Francisco+Business+Rancho+Cordova+Business+Delta+Charter+Bus+Seddon+Construction+I-Drill+Engineering+Sierra+Asphalt+Fleet+Service+Emissions+Testing+Sustainable+Trucking+Mobile+Truck+Service',
  'CARB+Compliance+Napa+Valley+Mobile+Testing+Fleet+Management+Wine+Country+Napa+Businesses+Commercial+Vehicles+Napa+County+On-Site+Service+Winery+Services',
  'CARB+Testing+Motorhome+Services+RV+Compliance+Diesel+Emissions+California+Regulations+Mobile+Testing+RV+Maintenance+Emissions+Standards',
  'CARB+compliance+services++California+emissions+testing++mobile+diesel+diagnostics++construction+fleet+maintenance++Mitchell+Concrete+partnership++CARB+retrofit+solutions++Sacramento+mobile+emissions+testing++on-site+engine+diagnostics++fleet+regulatory+compliance++construction+equipment+CARB+compliance',
  'CARB+testing+Sacramento+fleet+CARB+testing+California+Sacramento+County+truck+testing+F550+diesel+testing+construction+fleet+compliance+The+Plaster+Group+Sacramento+commercial+testing+Northern+California+fleet+services+mobile+emissions+testing+Friday+deadline+compliance+fleet+testing+Sacramento+J1667+smoke+testing+Sacramento+OBD+fleet+testing+construction+truck+inspection+same+day+fleet+CARB+test+contractor+fleet+compliance',
  'Clean+Truck+Check++CARB+compliance++Brentwood+CA+businesses++Mobile+emissions+testing++Fleet+compliance+services++Contra+Costa+truck+inspections++JC+Tree+Service++NorCal+CARB+Mobile++On-site+truck+testing++California+emissions+standards',
  'Merced+County+Diesel+Emissions+Truck+Fleet+Management+San+Joaquin+Valley+Clean+Air+Regulations+Agricultural+Vehicles+Truck+Modernization',
  'Sacramento+County+CARB+Regulations+Fleet+Testing+Emissions+Compliance+Commercial+Trucking+Vehicle+Inspections+Clean+Air+Initiatives',
  'carb+testing+sacramento+motorhome+carb+test+northern+california+rv+emissions+testing+i-80+corridor+mobile+diesel+testing+service+california+motorhome+inspection+carb+compliance+motorhome+diesel+rv+testing+service+motorhome+smoke+test+california+rv+carb+testing+near+me+mobile+motorhome+emissions',
  'carb-testing-woodland+mobile-carb-testing+diesel-emissions-testing+carb-compliance-service+norcal-carb-mobile+emissions-inspection+carb-certification',
  'farm-carb-testing+agricultural-compliance+tractor-emissions-testing+farm-equipment-carb+harvest-season-testing+irrigation-pump-carb+dairy-farm-compliance+vineyard-equipment-testing+organic-farm-carb+livestock-operation-carb',
  'motorhome+carb+testing+california+rv+emissions+testing+diesel+motorhome+testing+mobile+carb+testing+rv+smoke+opacity+testing+northern+california+carb+testing+motorhome+emissions+compliance+california+diesel+rv+testing+mobile+emissions+testing+service',
  'opacity+testing+diesel+emissions+CARB+compliance+mobile+testing+service+visual+inspections+fleet+maintenance+I-5+corridor+I-80+corridor+Northern+California+Sacramento+Bay+Area+diesel+particulate+filter+emissions+testing+commercial+vehicles+heavy-duty+diesel',
  'sacramento+carb+testing+northern+california+emissions+i-80+corridor+testing+i-5+motorhome+testing+highway+99+rv+service+bay+area+motorhome+testing+central+valley+carb+testing+davis+motorhome+testing+stockton+rv+emissions+modesto+carb+testing',
  'tractor-carb-inspection+harvester-emissions+diesel-truck-testing+farm-machinery-carb+irrigation-equipment+agricultural-vehicles+heavy-equipment-carb+fleet-carb-testing',
  'woodland-california+yolo-county-services+central-valley-carb+northern-california+sacramento-valley+woodland-ca-business+local-carb-testing',
];
const EXPLICIT = {
  '/home': '/',
  '/privacy-policy': '/testing-terms',
  '/terms-and-conditions': '/testing-terms',
  '/thank-you': '/contact',
  '/clean-truck-check-sacramento': '/sacramento-carb-testing',
  '/faqs-clean-truck-check-mobile-sacramento': '/faq',
  '/stockton-modesto-merced-turlock-clean-truck-check': '/stockton-clean-truck-check',
};
const OLD_404 = [
  ...SERVICE_LOCATION_POSTS.map((s) => [`/service-locations/${s}`, `/clean-truck-check-blog/${s}`]),
  ...TAGS.map((s) => [`/service-locations/tag/${s}`, '/areas']),
  ...Object.entries(EXPLICIT),
];
t('37 old-sitemap 404s are covered', () => assert.equal(OLD_404.length, 37));
for (const [from, to] of OLD_404) {
  t(`legacy ${from.slice(0, 60)}`, () => {
    assert.equal(resolveRedirect(from), to);
    assert.ok(pageExists(to), `target missing in site/: ${to}`);
    assert.ok(isFinal(to), `target redirects again: ${to}`);
  });
}
t('/october-clean-truck-check (Wayback) → facts hub', () => assert.equal(resolveRedirect('/october-clean-truck-check'), '/clean-truck-check-facts'));
t('unknown /service-locations/<slug> stays 404', () => assert.equal(resolveRedirect('/service-locations/not-a-post'), null));
t('/carb-services → /services (not the homepage)', () => assert.equal(resolveRedirect('/carb-services'), '/services'));
t('/store → /pricing (not the homepage)', () => assert.equal(resolveRedirect('/store'), '/pricing'));
t('/404.html → /404 (served with a 404 status by the Worker)', () => assert.equal(resolveRedirect('/404.html'), '/404'));
t('/service-locations/tag/<plus-encoded> → /areas', () => assert.equal(resolveRedirect('/service-locations/tag/CARB+Compliance+Napa+Valley'), '/areas'));
t('/service-locations/blog-post-title-four-6x6kf kept → /', () => assert.equal(resolveRedirect('/service-locations/blog-post-title-four-6x6kf'), '/'));

// 2. Canonical-path normalization (301, one hop, root/assets untouched).
const CANON = [
  ['/', null], ['/about', null], ['/about/', '/about'], ['/about//', '/about'],
  ['/about.html', '/about'], ['/index.html', '/'], ['/blog', null], ['/blog/', '/blog'],
  ['/blog/index.html', '/blog'], ['/contact/?sent=1', '/contact?sent=1', '?sent=1'],
  ['/blog/2026-carb-testing-deadlines/', '/blog/2026-carb-testing-deadlines'],
  ['/assets/styles.css', null], ['/sitemap.xml', null], ['/robots.txt', null], ['/favicon.ico', null],
  ['/locations', '/areas'], ['/locations/', '/areas'], ['/service-areas/', '/areas'],
  ['/contact-us.html', '/contact'], ['/new-page.html', '/clean-truck-check-facts'],
  ['/home.html', '/'], ['/home/', '/'],
];
for (const [path, want, search] of CANON) {
  const pathOnly = path.split('?')[0];
  t(`canon ${path}`, () => assert.equal(resolveRedirect(pathOnly, search || ''), want));
}
t('canonicalPath(/) is /', () => assert.equal(canonicalPath('/'), '/'));

// 3. Blog chains collapsed + 60 old-post .html URLs land on their own post.
t('60 legacy slugs', () => assert.equal(LEGACY_BLOG_SLUGS.size, 60));
for (const slug of LEGACY_BLOG_SLUGS) {
  t(`.html → own post ${slug.slice(0, 40)}`, () => {
    assert.equal(resolveRedirect(`/clean-truck-check-blog/${slug}.html`), `/clean-truck-check-blog/${slug}`);
    assert.equal(resolveRedirect(`/clean-truck-check-blog/${slug}`), null);
    assert.equal(resolveRedirect(`/blog/${slug}`), `/clean-truck-check-blog/${slug}`);
  });
}
for (const [slug, to] of Object.entries(LEGACY_BLOG_FALLBACKS)) {
  t(`fallback ${slug.slice(0, 40)} is one hop`, () => {
    assert.ok(pageExists(to), `fallback target missing: ${to}`);
    assert.ok(isFinal(to), `fallback target redirects again: ${to}`);
  });
}
t('Oakland chain collapsed', () => assert.equal(resolveRedirect('/clean-truck-check-blog/smoke-opacity-test-oakland-j1667-certified-mobile-testing-for-east-bay-diesel-trucks'), '/clean-truck-check-blog/oakland-clean-truck-checks-san-leandro'));
t('carb-fines chain collapsed', () => assert.equal(resolveRedirect('/clean-truck-check-blog/how-to-avoid-carb-fines'), '/clean-truck-check-blog/carb-violation'));

// 4. Every REDIRECTS target exists and is final (no chains anywhere in the map).
for (const [from, to] of Object.entries(REDIRECTS)) {
  t(`map ${from} → ${to}`, () => {
    assert.ok(pageExists(to), `target missing in site/: ${to}`);
    assert.ok(isFinal(to), `target redirects again: ${to}`);
  });
}

// 5. Nothing in the sitemap or site/ redirects; sitemap entries exist.
const locs = [...readFileSync(join(site, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/norcalcarbmobile\.com([^<]*)<\/loc>/g)].map((m) => m[1]);
t('sitemap has 91 URLs (88 + 3 live corridor pages)', () => assert.equal(locs.length, 91));
// Live corridor pages (2026-10-04 live-sync): served as pages, old East Bay / Bay Area URLs point at them.
t('/clean-truck-check-hayward serves the landing page', () => assert.equal(resolveRedirect('/clean-truck-check-hayward'), null));
t('/clean-truck-check-hayward/ -> one 301 to canonical', () => assert.equal(resolveRedirect('/clean-truck-check-hayward/'), '/clean-truck-check-hayward'));
t('/carb-test-bay-area serves', () => assert.equal(resolveRedirect('/carb-test-bay-area'), null));
t('/carb-mobile-test-near-me serves', () => assert.equal(resolveRedirect('/carb-mobile-test-near-me'), null));
t('/east-bay-mobile-carb-testing -> Hayward page', () => assert.equal(resolveRedirect('/east-bay-mobile-carb-testing'), '/clean-truck-check-hayward'));
t('/clean-truck-check-bay-area -> Bay Area page', () => assert.equal(resolveRedirect('/clean-truck-check-bay-area'), '/carb-test-bay-area'));
for (const p of locs) {
  t(`sitemap ${p}`, () => { assert.equal(resolveRedirect(p), null); assert.ok(pageExists(p), `no page for ${p}`); });
}
t('sitemap lastmod values valid', () => {
  for (const m of readFileSync(join(site, 'sitemap.xml'), 'utf8').matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) {
    assert.match(m[1], /^\d{4}-\d{2}-\d{2}$/);
    // lastmod may be a scheduled publish date, but never more than 14 days out
    const max = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
    assert.ok(m[1] <= max, `future lastmod ${m[1]}`);
  }
});
function walk(d) { return readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const pages = walk(site).filter((f) => f.endsWith('.html')).map((f) => f.slice(site.length).replace(/\/index\.html$/, '/').replace(/\.html$/, ''));
t('site/blog/index.html removed (no /blog/ duplicate)', () => assert.ok(!existsSync(join(site, 'blog', 'index.html'))));
for (const p of pages) {
  if (p === '/reviews/' || p === '/404') continue; // /reviews 301s to GBP by design; /404 is the error page
  t(`page ${p}`, () => assert.equal(resolveRedirect(p === '/' ? '/' : p.replace(/\/$/, '')), null));
}

console.log(`${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log('FAIL', f); process.exit(1); }
