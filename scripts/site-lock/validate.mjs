import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

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

// Blog directories contain freely-editable content and are exempt from phone-link
// enforcement. All other site files and the Worker are still checked.
const blogDirs = [join(root, "site/blog"), join(root, "site/clean-truck-check-blog")];
function isBlogFile(path) {
  return blogDirs.some((dir) => path.startsWith(dir + sep));
}

const publicFiles = walk(join(root, "site")).filter((path) => path.endsWith(".html") && !isBlogFile(path));
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
