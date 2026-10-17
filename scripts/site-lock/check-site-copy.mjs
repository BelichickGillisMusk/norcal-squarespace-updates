/**
 * Fail if a phone number or service-area phrase is authored outside config/site.json.
 * Schema/JSON-LD is allowlisted only when that file generates it from site.json.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  expandTokens,
  isGeneratedJsonLd,
  phoneHits,
  phoneVariants,
  regionPhrases,
  stripGeneratedJsonLd,
  tokenMap,
} from './site-copy.mjs';

const root = new URL('../../', import.meta.url).pathname;
const site = JSON.parse(readFileSync(join(root, 'config/site.json'), 'utf8'));
const failures = [];

function fail(message) {
  failures.push(message);
}

const BANNED = [
  ['209', '818', '1371'].join('-'),
  ['(', '209', ') 818-1371'].join(''),
  ['678', '1090'].join('-'),
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'functions' && dir.endsWith('/site')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function scannedFiles() {
  const files = [];
  for (const file of walk(join(root, 'site'))) {
    if (/\.(html|txt|js|mjs)$/.test(file)) files.push(file);
  }
  files.push(join(root, 'worker/index.js'));
  return files;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function digits(value) {
  return String(value).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
}

const ourDigits = new Set(phoneVariants(site).map(digits).filter((value) => value.length >= 10));

function phoneFindings(text, rel) {
  const hits = phoneHits(text);
  // Legacy Squarespace posts quote agency hotlines. Those are not the NAP.
  // Our numbers, every tel: link, and any phone on a live template still fail.
  if (!rel.startsWith('site/clean-truck-check-blog/')) return hits;
  return hits.filter((hit) => hit.startsWith('tel:') || ourDigits.has(digits(hit)));
}

function scan(raw, rel) {
  for (const banned of BANNED) {
    const at = raw.indexOf(banned);
    if (at !== -1) fail(`${rel}:${lineOf(raw, at)} banned phone ${banned}`);
  }
  const body = stripGeneratedJsonLd(raw, site);
  for (const phrase of regionPhrases(site)) {
    let from = 0;
    while (from < body.length) {
      const at = body.indexOf(phrase, from);
      if (at === -1) break;
      fail(`${rel}:${lineOf(body, at)} hardcoded service-area text: ${phrase}`);
      from = at + phrase.length;
    }
  }
  for (const hit of phoneFindings(body, rel)) {
    const at = body.indexOf(hit);
    fail(`${rel}:${lineOf(body, at)} hardcoded phone ${hit}`);
  }
}

function selfTest() {
  const phone = site.phones.primary.schema;
  const county = site.serviceArea.counties[0];
  const generated = `<script type="application/ld+json">{"telephone":"${phone}","areaServed":"${county}"}</script>`;
  const workerish = `import site from '../config/site.json';\nsite.phones.primary.schema;\nsite.serviceArea.counties;\n${generated}`;
  const before = failures.length;
  scan(workerish, 'self-test/worker.js', workerish);
  if (failures.length !== before) fail('self-test: generated JSON-LD was not allowlisted');
  scan(generated, 'self-test/page.html', generated);
  if (!failures.slice(before).some((item) => item.includes('self-test/page.html'))) {
    fail('self-test: handwritten JSON-LD was allowlisted');
  }
  failures.splice(before);
  const expanded = expandTokens('Call {{phone.primary.display}} in {{serviceArea.name}}', tokenMap(site));
  if (expanded !== `Call ${site.phones.primary.display} in ${site.serviceArea.name}`) {
    fail(`self-test: token expand mismatch: ${expanded}`);
  }
  if (!isGeneratedJsonLd(`{"telephone":"${phone}"}`, site, workerish)) {
    fail('self-test: generator predicate rejected site.json schema');
  }
  if (isGeneratedJsonLd(`{"telephone":"${phone}"}`, site, generated)) {
    fail('self-test: page JSON-LD passed the generator predicate');
  }
}

selfTest();

for (const banned of BANNED) {
  if (JSON.stringify(site).includes(banned)) fail(`config/site.json contains banned phone ${banned}`);
}

const map = tokenMap(site);
for (const file of scannedFiles()) {
  const rel = file.slice(root.length);
  const raw = readFileSync(file, 'utf8');
  scan(raw, rel, raw);
  if (rel.endsWith('.html') || rel.endsWith('.txt')) {
    const expanded = expandTokens(raw, map);
    if (/\{\{(?:phone|serviceArea|reviews)\./.test(expanded)) {
      fail(`${rel} has a site token that config/site.json does not define`);
    }
  }
}

const home = expandTokens(readFileSync(join(root, 'site/index.html'), 'utf8'), map);
for (const needle of [
  site.phones.primary.display,
  site.phones.primary.href,
  site.serviceArea.name,
  String(site.reviews.count),
]) {
  if (!home.includes(needle)) fail(`Expanded homepage is missing live copy: ${needle}`);
}
if (home.includes(site.phones.secondary.display) || home.includes(site.phones.secondary.compact)) {
  fail('Expanded homepage must not show the secondary phone');
}
if (home.includes('{{')) fail('Expanded homepage still has unresolved tokens');

if (failures.length) {
  console.error('\nSITE COPY CHECK FAILED\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('\nPhones and service-area text belong in config/site.json.\n');
  process.exit(1);
}

console.log('SITE COPY CHECK PASSED');
console.log('Phones, service area, and review count are authored in config/site.json.');
