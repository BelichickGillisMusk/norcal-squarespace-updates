/**
 * Google Ads conversion tag (/contact). Plain node, no framework.
 * Run: node worker/ads-conversion.test.js
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'site/assets/js/ads-conversion.js'), 'utf8');
const contact = readFileSync(join(root, 'site/contact.html'), 'utf8');

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) passed += 1; else { failed += 1; console.error('FAIL:', msg); }
}

function run({ search = '', config, gpc = false, dnt = null, store = {} } = {}) {
  const scripts = [];
  let clickHandler = null;
  const document = {
    head: { appendChild: (el) => scripts.push(el) },
    createElement: () => ({}),
    addEventListener: (type, fn) => { if (type === 'click') clickHandler = fn; },
  };
  const window = {
    location: { search },
    navigator: { globalPrivacyControl: gpc, doNotTrack: dnt },
    sessionStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
    URLSearchParams,
  };
  if (config) window.NCM_ADS_CONFIG_OVERRIDE = config;
  window.window = window;
  vm.runInNewContext(src, { window, document, URLSearchParams, Date, encodeURIComponent });
  const conversions = () => (window.dataLayer || [])
    .map((a) => Array.from(a))
    .filter((a) => a[0] === 'event' && a[1] === 'conversion');
  function click(href) {
    const a = { tagName: 'A', getAttribute: () => href, parentNode: document };
    clickHandler && clickHandler({ target: a });
  }
  return { window, scripts, conversions, click, store };
}

const REAL = { AW_ID: 'AW-123456789', PHONE_LABEL: 'abcPhone', FORM_LABEL: 'xyzForm' };

// Shipped file has placeholders and sends nothing.
assert(/AW_ID: 'AW-XXXXXXXXXX'/.test(src), 'shipped AW_ID is the placeholder');
assert(/PHONE_LABEL: 'PHONE_LABEL'/.test(src) && /FORM_LABEL: 'FORM_LABEL'/.test(src), 'shipped labels are placeholders');
{
  const r = run({ search: '?sent=1' });
  assert(r.scripts.length === 0, 'placeholder: gtag.js not loaded');
  assert(r.window.dataLayer === undefined, 'placeholder: no dataLayer');
  assert(r.window.NCM_ADS.enabled === false && r.window.NCM_ADS.formConversion() === false, 'placeholder: formConversion is a no-op');
}
// Real id but placeholder labels: loads tag, no conversions.
{
  const r = run({ config: { AW_ID: 'AW-123456789', PHONE_LABEL: 'PHONE_LABEL', FORM_LABEL: 'FORM_LABEL' } });
  r.click('tel:+19168904427');
  r.window.NCM_ADS.formConversion();
  assert(r.conversions().length === 0, 'placeholder labels send no conversion');
}
// Real config.
{
  const r = run({ config: REAL });
  assert(r.scripts.length === 1 && r.scripts[0].src === 'https://www.googletagmanager.com/gtag/js?id=AW-123456789', 'gtag.js loader injected for AW id');
  const cfg = r.window.dataLayer.map((a) => Array.from(a)).find((a) => a[0] === 'config');
  assert(cfg && cfg[1] === 'AW-123456789', 'gtag config for AW id');
  assert(r.conversions().length === 0, 'no conversion on plain page load');
  r.click('tel:+19168904427');
  const c = r.conversions();
  assert(c.length === 1 && c[0][2].send_to === 'AW-123456789/abcPhone', 'tel click sends phone conversion');
  assert(Object.keys(c[0][2]).join() === 'send_to', 'conversion payload has no PII (send_to only)');
  r.click('/pricing');
  r.click('mailto:sales@norcalcarbmobile.com');
  assert(r.conversions().length === 1, 'non-phone links do not convert');
  assert(r.window.NCM_ADS.formConversion() === true, 'formConversion sends');
  assert(r.window.NCM_ADS.formConversion() === false, 'formConversion only once per page');
  const f = r.conversions().filter((x) => x[2].send_to === 'AW-123456789/xyzForm');
  assert(f.length === 1, 'exactly one form conversion');
}
// Native redirect states.
{
  const ok = run({ config: REAL, search: '?sent=1' });
  assert(ok.conversions().length === 1 && ok.conversions()[0][2].send_to.endsWith('/xyzForm'), '?sent=1 counts form conversion');
  const again = run({ config: REAL, search: '?sent=1', store: ok.store });
  assert(again.conversions().length === 0, '?sent=1 reload in same session is not double counted');
  for (const q of ['?error=1', '?error=send', '?sent=1&h=1', '']) {
    assert(run({ config: REAL, search: q }).conversions().length === 0, `${q || 'no query'} does not count a form conversion`);
  }
}
// Opt-out signals.
assert(run({ config: REAL, gpc: true }).scripts.length === 0, 'Global Privacy Control disables tag');
assert(run({ config: REAL, dnt: '1' }).scripts.length === 0, 'Do Not Track disables tag');

// contact.html wiring.
assert(contact.includes('<script src="/assets/js/ads-conversion.js?v=20261123" defer></script>'), 'contact.html loads ads-conversion.js');
const okIdx = contact.indexOf('if (res.ok) {');
const convIdx = contact.indexOf('window.NCM_ADS.formConversion()');
const elseIdx = contact.indexOf('} else {', okIdx);
assert(okIdx > 0 && convIdx > okIdx && convIdx < elseIdx, 'form conversion is inside the res.ok success branch only');
assert(/res\.j\.ok === true/.test(contact) && /name=website/.test(contact), 'form conversion requires ok:true JSON and empty honeypot');
assert(!/googletagmanager|AW-\d/.test(contact), 'no hard-coded tag or id in contact.html');

console.log(`ads-conversion: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
