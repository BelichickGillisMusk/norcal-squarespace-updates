// Unit tests for worker/html-escape.js (contact-form lead email escaping).
// Run from the repo root:  node worker/html-escape.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { esc } from './html-escape.js';

// Built from two strings so a write pipeline cannot decode it in transit.
const QUOT = '&' + 'quot;';

let passed = 0;
const failures = [];
function t(name, fn) {
  try { fn(); passed++; } catch (e) { failures.push(`${name}: ${e.message}`); }
}

t('<b> is escaped', () => assert.equal(esc('<b>bold</b>'), '&lt;b&gt;bold&lt;/b&gt;'));
t('script tag is escaped', () => assert.equal(esc('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;'));
t('& is escaped first-class', () => assert.equal(esc('Smith & Sons'), 'Smith &amp; Sons'));
t('existing entity text is escaped, not passed through', () => assert.equal(esc('&lt;b&gt;'), '&amp;lt;b&amp;gt;'));
t('" is escaped', () => assert.equal(esc('say "hi"'), `say ${QUOT}hi${QUOT}`));
t('attribute breakout is escaped', () => assert.equal(esc('"><img src=x onerror=alert(1)>'), `${QUOT}&gt;&lt;img src=x onerror=alert(1)&gt;`));
t('plain text unchanged', () => assert.equal(esc('Hayward, CA 94545'), 'Hayward, CA 94545'));
t('null/undefined -> empty string', () => { assert.equal(esc(null), ''); assert.equal(esc(undefined), ''); });
t('numbers stringified', () => assert.equal(esc(916), '916'));
t('output never contains a raw < > or "', () => assert.ok(!/[<>"]/.test(esc('<a href="x">&</a>'))));

// Source guards: the table must hold real entities (a write pipeline once
// decoded them to a no-op table), and index.js must use this module.
const src = readFileSync(new URL('./html-escape.js', import.meta.url), 'utf8');
t('html-escape.js table maps to literal entities', () => {
  assert.ok(src.includes(`{ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': QUOT }`));
  assert.ok(src.includes(`const QUOT = '&' + 'quot;';`));
});
t('quot entity output is exactly the 6-char entity', () => assert.equal(esc('"'), '&' + 'quot;'));
const index = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
t('index.js imports esc from html-escape.js', () => assert.match(index, /import \{ esc \} from '\.\/html-escape\.js';/));
t('index.js has no local no-op HTML_ESC table', () => assert.ok(!index.includes('HTML_ESC')));
t('index.js escapes every lead field', () => {
  for (const f of ['name', 'phone', 'email', 'location', 'service', 'message', 'termsVersion', 'submittedAt']) {
    assert.ok(index.includes(`esc(lead.${f})`), f);
  }
});

console.log(`${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log('FAIL', f); process.exit(1); }
