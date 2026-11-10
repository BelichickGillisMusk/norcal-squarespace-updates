/**
 * East Bay landers share one price source and the same partials.
 * Run: node scripts/landers/test.js
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NORCAL_PRICES, PUBLIC_PHONE, VIN_CHECK_URL } from '../../worker/prices.js';
import { renderBayPage, renderOaklandPage, BAY_PATH, OAKLAND_PATH } from './pages.js';
import { writeLanders } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
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

const bay = renderBayPage();
const oakland = renderOaklandPage();
writeLanders();

const bayFile = readFileSync(join(root, 'site/bay-area-mobile-carb.html'), 'utf8');
const oakFile = readFileSync(join(root, 'site/oakland-mobile-carb-test.html'), 'utf8');
const sitemap = readFileSync(join(root, 'site/sitemap.xml'), 'utf8');
const areas = readFileSync(join(root, 'site/areas.html'), 'utf8');
const worker = readFileSync(join(root, 'worker/index.js'), 'utf8');
const pricesSrc = readFileSync(join(root, 'worker/prices.js'), 'utf8');

assert(existsSync(join(root, 'site/oakland-mobile-carb-test.html')), 'Oakland HTML exists');
assert(bayFile === bay, 'Committed Bay HTML matches renderer');
assert(oakFile === oakland, 'Committed Oakland HTML matches renderer');

assert(NORCAL_PRICES.obd === 75, 'OBD stays $75');
assert(NORCAL_PRICES.ovi === 199, 'OVI stays $199');
assert(NORCAL_PRICES.motorhomeObd === 99, 'Motorhome OBD stays $99');
assert(NORCAL_PRICES.motorhomeOvi === 229, 'Motorhome OVI stays $229');

assert(pricesSrc.includes('obd: 75'), 'Price constant file is the one-line swap');
assert(worker.includes('NORCAL_PRICES.obd'), 'Worker schema uses shared prices');
assert(worker.includes('oakland-mobile-carb-test'), 'Worker footer links Oakland');

for (const html of [bay, oakland]) {
  assert(html.includes(`$${NORCAL_PRICES.ovi}`), 'Lander shows OVI from shared constant');
  assert(html.includes(`$${NORCAL_PRICES.obd}`), 'Lander shows OBD from shared constant');
  assert(html.includes(PUBLIC_PHONE.href), 'Lander uses public tel link');
  assert(html.includes(PUBLIC_PHONE.display), 'Lander shows public phone');
  assert(!/Bryan|Gillis|bgillis/i.test(html), 'No owner name in lander copy');
  assert(!/streetAddress|postalCode/.test(html), 'No street/postal address in lander');
  assert(!html.includes('$119') && !html.includes('$219'), 'No sibling San Diego dollar strings');
}

assert(oakland.includes('<title>Oakland Mobile CARB Test | Hayward &amp; Richmond | NorCal CARB Mobile</title>') || oakland.includes('<title>Oakland Mobile CARB Test | Hayward & Richmond | NorCal CARB Mobile</title>'), 'Unique Oakland title');
assert(oakland.includes(`<link rel="canonical" href="https://norcalcarbmobile.com${OAKLAND_PATH}">`), 'Oakland canonical');
assert(oakland.includes(VIN_CHECK_URL), 'Oakland links VIN check');
assert(oakland.includes('Hayward') && oakland.includes('Richmond') && /based in Oakland/i.test(oakland), 'Oakland/Hayward/Richmond copy');
assert(/next-day/i.test(oakland) && /same-day/i.test(oakland), 'Next-day and same-day');

const oviIdx = oakland.indexOf('OVI Smoke Opacity Test');
const obdIdx = oakland.indexOf('HD-OBD Periodic Test');
assert(oviIdx !== -1 && obdIdx !== -1 && oviIdx < obdIdx, 'Oakland leads with OVI card');

const heroEnd = oakland.indexOf('</section>');
const hero = oakland.slice(0, heroEnd);
assert(hero.includes(PUBLIC_PHONE.href) && hero.includes('href="/contact"'), 'Oakland above-the-fold call + contact');
assert(oakland.includes('cta-band') && oakland.includes(PUBLIC_PHONE.href), 'Oakland bottom CTA includes call');

assert(bay.includes(`<link rel="canonical" href="https://norcalcarbmobile.com${BAY_PATH}">`), 'Bay canonical unchanged');
assert(bay.includes('Mobile CARB Clean Truck Check in the <span>Bay Area</span>'), 'Bay H1 unchanged');
assert(bay.includes("Isn't it far from Sacramento?"), 'Bay Sacramento FAQ kept');
assert(bay.includes('And better hot dog spots.'), 'Bay hot dog FAQ kept');
assert(bay.includes(OAKLAND_PATH), 'Bay page links Oakland lander');
assert(bay.includes('One Google Business Profile'), 'Bay still one GBP');

assert(sitemap.includes(`https://norcalcarbmobile.com${OAKLAND_PATH}`), 'Sitemap has Oakland');
assert(areas.includes(OAKLAND_PATH), 'Areas page links Oakland');

assert(!existsSync(join(root, 'site/landers')), 'Lander source is not under public site/');

if (failed) {
  console.error(`\nLANDER TESTS FAILED: ${failed} fail, ${passed} pass`);
  process.exit(1);
}
console.log(`LANDER TESTS PASSED (${passed})`);
