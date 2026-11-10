/**
 * Worker redirects for SoCal / San Diego / Orange County.
 * Run: node worker/redirects.test.js
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SOCAL_PAGE_REDIRECTS,
  SOCAL_REDIRECT_LOCATION,
  socalRedirectLocation,
} from './socal-redirects.js';

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

const workerSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'index.js'), 'utf8');

assert(workerSrc.includes('...SOCAL_PAGE_REDIRECTS'), 'worker/index.js spreads SOCAL_PAGE_REDIRECTS');
assert(/status:\s*301/.test(workerSrc), 'Worker redirect handler still uses status 301');
assert(
  !workerSrc.includes("'/clean-truck-check-orange-county': '/areas#orange-county'"),
  'Orange County no longer redirects to /areas#orange-county',
);
assert(
  !workerSrc.includes('https://mobilecarbsmoketest.com/'),
  'Worker REDIRECTS no longer send visitors to mobilecarbsmoketest.com',
);

const paths = [
  '/clean-truck-check-san-diego',
  '/clean-truck-check-san-diego/',
  '/san-diego',
  '/san-diego/',
  '/areas/san-diego',
  '/areas/san-diego/',
  '/clean-truck-check-orange-county',
  '/clean-truck-check-orange-county/',
];

for (const path of paths) {
  const location = socalRedirectLocation(path);
  assert(
    location === SOCAL_REDIRECT_LOCATION,
    `${path} Location should be /socal, got ${JSON.stringify(location)}`,
  );
  const listed = SOCAL_PAGE_REDIRECTS[path] || SOCAL_PAGE_REDIRECTS[path.replace(/\/$/, '')];
  assert(listed === '/socal', `${path} map target is /socal`);
}

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
