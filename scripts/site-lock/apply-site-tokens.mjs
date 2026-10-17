/**
 * Replace authored phone, service-area, and review strings with {{tokens}}.
 * Idempotent. Does not touch config/site.json.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { replacementPairs } from './site-copy.mjs';

const root = new URL('../../', import.meta.url).pathname;
const site = JSON.parse(readFileSync(join(root, 'config/site.json'), 'utf8'));
const pairs = replacementPairs(site);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'functions' && dir.endsWith('/site')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

let changed = 0;
for (const file of walk(join(root, 'site'))) {
  if (!/\.(html|txt|js|mjs)$/.test(file)) continue;
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [value, token] of pairs) {
    if (text.includes(value)) text = text.split(value).join(token);
  }
  if (text !== before) {
    writeFileSync(file, text);
    changed += 1;
    console.log(file.slice(root.length));
  }
}
console.log(`Updated ${changed} files`);
