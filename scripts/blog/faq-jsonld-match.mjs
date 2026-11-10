#!/usr/bin/env node
/**
 * Visible FAQ text vs FAQPage JSON-LD must match word for word.
 * Usage: node scripts/blog/faq-jsonld-match.mjs [file.html ...]
 * Default: all site/*.html that contain FAQPage JSON-LD.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const files = args.length
  ? args.map((p) => (p.startsWith("/") ? p : join(process.cwd(), p)))
  : readdirSync(join(root, "site"))
      .filter((n) => n.endsWith(".html"))
      .map((n) => join(root, "site", n));

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function norm(s) {
  return decodeEntities(String(s || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      blocks.push({ __parseError: true, raw: m[1] });
    }
  }
  return blocks;
}

function flattenNodes(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;
  if (Array.isArray(obj)) {
    for (const n of obj) flattenNodes(n, acc);
    return acc;
  }
  acc.push(obj);
  if (obj["@graph"]) flattenNodes(obj["@graph"], acc);
  return acc;
}

function faqPages(html) {
  const nodes = [];
  for (const block of extractJsonLdBlocks(html)) {
    flattenNodes(block, nodes);
  }
  return nodes.filter((n) => n["@type"] === "FAQPage");
}

function visibleFaqs(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const region = main ? main[1] : html;
  const pairs = [];
  const re =
    /<strong>\s*Q:\s*<\/strong>\s*([\s\S]*?)<br\s*\/?>\s*<strong>\s*A:\s*<\/strong>\s*([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(region))) {
    pairs.push({
      q: norm(m[1].replace(/<[^>]+>/g, "")),
      a: norm(m[2].replace(/<[^>]+>/g, "")),
    });
  }
  return pairs;
}

let failed = 0;
let checked = 0;

for (const file of files) {
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!/FAQPage/.test(html)) continue;
  checked += 1;
  const rel = file.replace(root.replace(/\/$/, "") + "/", "");
  const pages = faqPages(html);
  if (pages.length !== 1) {
    failed += 1;
    console.error(`FAIL ${rel}: expected exactly 1 FAQPage, found ${pages.length}`);
    continue;
  }
  const entities = pages[0].mainEntity || [];
  const vis = visibleFaqs(html);
  if (vis.length !== entities.length) {
    failed += 1;
    console.error(
      `FAIL ${rel}: visible FAQ count ${vis.length} != JSON-LD mainEntity ${entities.length}`,
    );
  }
  const n = Math.max(vis.length, entities.length);
  for (let i = 0; i < n; i++) {
    const v = vis[i];
    const e = entities[i];
    const name = e ? norm(e.name) : "";
    const text = e ? norm(e.acceptedAnswer && e.acceptedAnswer.text) : "";
    if (!v || v.q !== name) {
      failed += 1;
      console.error(`FAIL ${rel} Q${i + 1} name mismatch`);
      console.error(`  visible: ${v ? v.q : "(missing)"}`);
      console.error(`  jsonld:  ${name || "(missing)"}`);
    }
    if (!v || v.a !== text) {
      failed += 1;
      console.error(`FAIL ${rel} Q${i + 1} answer mismatch`);
      console.error(`  visible: ${v ? v.a : "(missing)"}`);
      console.error(`  jsonld:  ${text || "(missing)"}`);
    }
  }
}

if (!checked) {
  console.log("FAQ JSON-LD MATCH: no FAQPage files in scope");
  process.exit(0);
}
if (failed) {
  console.error(`\nFAQ JSON-LD MATCH FAILED (${failed} mismatch(es) across ${checked} file(s))`);
  process.exit(1);
}
console.log(`FAQ JSON-LD MATCH PASSED (${checked} file(s), visible Q/A match JSON-LD)`);
