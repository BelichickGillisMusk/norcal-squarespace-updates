import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const lock = JSON.parse(readFileSync(join(root, "config/site-template-lock.json"), "utf8"));
const failures = [];

function fail(message) {
  failures.push(message);
}

function text(path) {
  return readFileSync(join(root, path), "utf8");
}

function hash(path) {
  return createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
}

function walk(dir) {
  const output = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) output.push(...walk(path));
    else output.push(path);
  }
  return output;
}

for (const [path, expected] of Object.entries(lock.protectedFiles)) {
  if (!existsSync(join(root, path))) {
    fail(`Protected file is missing: ${path}`);
    continue;
  }
  const actual = hash(path);
  if (actual !== expected) {
    fail(`Protected template changed: ${path}. Restore it or deliberately update config/site-template-lock.json after Bryan approves the new template.`);
  }
}

const css = text("site/assets/styles.css");
for (const [token, value] of Object.entries(lock.requiredColors)) {
  if (!css.includes(`${token}: ${value}`)) fail(`Locked color changed or disappeared: ${token} must remain ${value}`);
}

const worker = text("worker/index.js");
if (!worker.includes(`telephone: \'${lock.requiredPhoneSchema}\'`)) fail("Sitewide schema phone changed.");
if (/"address"\s*:|"streetAddress"\s*:|"postalCode"\s*:/.test(worker)) fail("Public Worker schema must not expose a street or mailing address.");
if (!worker.includes("areaServed: [")) fail("Sitewide schema is missing areaServed.");
for (const area of lock.requiredServiceAreas) {
  if (!worker.includes(`\'${area}\'`)) fail(`Sitewide schema is missing service area: ${area}`);
}

const homepage = text("site/index.html");
const cfToken = lock.requiredCfWebAnalyticsToken;
const cfBeaconSnippet = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfToken}"}'></script>`;
// Homepage HTML is Worker-injected (run_worker_first). Static site/index.html stays
// hash-locked; the beacon must appear in the inject that produces served homepage HTML.
if (!worker.includes(cfBeaconSnippet) && !homepage.includes(cfBeaconSnippet)) {
  fail("Cloudflare Web Analytics beacon missing from homepage HTML (Worker inject or site/index.html).");
}
if (!worker.includes(cfToken) && !homepage.includes(cfToken)) {
  fail(`Cloudflare Web Analytics token missing from homepage HTML: ${cfToken}`);
}

const canaryId = lock.requiredCanaryId;
const canaryHref = lock.requiredCanaryCssHref;
if (!existsSync(join(root, "site/assets/css/ncm-canary.css"))) {
  fail("Isolated canary CSS is missing: site/assets/css/ncm-canary.css (Bryan 711 — do not merge into styles.css).");
} else {
  const canaryCss = text("site/assets/css/ncm-canary.css");
  if (!canaryCss.includes(canaryId)) fail(`Isolated canary CSS is missing unique token: ${canaryId}`);
  if (!canaryCss.includes("--ncm-canary-token")) fail("Isolated canary CSS is missing the inert --ncm-canary-token property.");
  if (/margin:|padding:|position:\s*fixed|width:\s*[1-9]|height:\s*[1-9]|font-size:|display:\s*flex|display:\s*grid/.test(canaryCss)) {
    fail("Isolated canary CSS must stay layout-inert (no box-model / flex / grid / fixed positioning).");
  }
}
if (!worker.includes(canaryHref)) fail("Worker must link isolated canary CSS (Bryan 711 — do not merge into styles.css).");
if (!worker.includes(canaryId)) fail(`Worker missing scrape-canary id: ${canaryId}`);
if (!worker.includes("ncm-canary: norcalcarbmobile.com provenance")) fail("Worker missing HTML comment canary.");
if (!worker.includes("data-ncm-canary=")) fail("Worker missing data-ncm-canary wrapper.");

const publicFiles = walk(join(root, "site")).filter((path) => path.endsWith(".html"));
publicFiles.push(join(root, "worker/index.js"));
for (const file of publicFiles) {
  const content = readFileSync(file, "utf8");
  const relative = file.slice(root.length);
  for (const match of content.matchAll(/href=["'](tel:[^"']+)["']/gi)) {
    if (match[1] !== lock.requiredPhoneHref) fail(`Unapproved telephone link in ${relative}: ${match[1]}`);
  }
  if (/619-786-4328|\+1-619|415-900-8563|916-890-4277|\$119|\$219/.test(content)) {
    fail(`Legacy phone number or fixed San Diego price found in ${relative}`);
  }
}

const robots = text("site/robots.txt");
if (!/^User-agent:\s*\*$/m.test(robots) || !/^Allow:\s*\/\s*$/m.test(robots)) {
  fail("robots.txt must Allow: / for normal crawlers.");
}
if (!/User-agent:\s*Googlebot/i.test(robots) || !/search=yes/.test(robots)) {
  fail("robots.txt must keep Google search open (Googlebot + Content-Signal search=yes).");
}
if (!/ai-train=no/.test(robots)) {
  fail("robots.txt must soften training with Content-Signal ai-train=no.");
}
if (/User-agent:\s*GPTBot[\s\S]{0,80}Disallow:\s*\//i.test(robots)) {
  fail("robots.txt must not blanket Disallow GPTBot (kills citation). Prefer ai-train=no.");
}
if (/^\s*Disallow:\s*\/(services|pricing|contact|areas|blog)\b/im.test(robots)) {
  fail("robots.txt must not Disallow money paths (/ /services /pricing /contact /areas /blog).");
}

const llms = text("site/llms.txt");
if (!llms.includes(lock.requiredPhoneDisplay)) {
  fail(`llms.txt must keep public phone ${lock.requiredPhoneDisplay}.`);
}
if (/415-900-8563|916-661-8288/.test(llms)) {
  fail("llms.txt must not include legacy or competitor phones.");
}
if (/cleantruckchecksacramento\.com|carb-clean-truck-check\.com/i.test(llms)) {
  fail("llms.txt must not list competitor (cleantruckchecksacramento.com) or LET-DIE (carb-clean-truck-check.com) domains.");
}
if (/Bryan|Gillis|bgillis/i.test(llms)) {
  fail("llms.txt must not include owner name.");
}
if (/stockton-clean-truck-check|bay-area-mobile-carb|sacramento-carb-testing|san-jose-carb/i.test(llms)) {
  fail("llms.txt must not list corridor/city lander URLs (clone map).");
}

for (const configPath of ["wrangler.toml", "wrangler.jsonc"]) {
  const config = text(configPath);
  if (!config.includes(lock.requiredWorkerName)) fail(`${configPath} no longer targets the locked NorCal Worker.`);
  for (const domain of lock.requiredDomains) {
    if (!config.includes(domain)) fail(`${configPath} is missing locked domain ${domain}`);
  }
}

if (failures.length) {
  console.error("\nNORCAL SITE LOCK FAILED\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nHomepage, colors, logo, map, phone, schema and Worker routing require explicit approval to change.\n");
  process.exit(1);
}

console.log("NORCAL SITE LOCK PASSED");
console.log(`Protected template version: ${lock.version}`);
console.log("Homepage, colors, logo, map, 916 phone, service-area schema and Worker routing are unchanged.");
