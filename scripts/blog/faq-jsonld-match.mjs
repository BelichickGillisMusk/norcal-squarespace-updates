#!/usr/bin/env node
/**
 * Visible FAQ text vs FAQPage JSON-LD must match word for word.
 * Usage: node scripts/blog/faq-jsonld-match.mjs [file.html|dir ...]
 * Default: site/ HTML with FAQPage JSON-LD and recognized visible FAQ markup.
 * Skips legacy pages whose visible FAQ is not Q:/A:, h2 FAQ + h3, or
 * Frequently asked questions + strong/p (faq.html, facts, motorhome).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SKIP_DEFAULT = new Set([
  "faq.html",
  "clean-truck-check-facts.html",
  "motorhome-carb-test.html",
]);

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walkHtml(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

const args = process.argv.slice(2);
const seeds = args.length
  ? args.map((p) => (p.startsWith("/") ? p : resolve(process.cwd(), p)))
  : [join(root, "site")];

const files = [];
for (const seed of seeds) {
  try {
    if (statSync(seed).isDirectory()) files.push(...walkHtml(seed));
    else files.push(seed);
  } catch {
    /* missing path */
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html) {
  return decodeEntities(String(html || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
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
      /* ignore unparseable */
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

function faqEntities(html) {
  const nodes = [];
  for (const block of extractJsonLdBlocks(html)) flattenNodes(block, nodes);
  const entities = [];
  for (const node of nodes) {
    const types = [].concat(node["@type"] || []);
    if (!types.includes("FAQPage")) continue;
    for (const item of node.mainEntity || []) {
      const name = item.name;
      const text = item.acceptedAnswer?.text;
      if (name && text) entities.push({ name: stripTags(name), text: stripTags(text) });
    }
  }
  return entities;
}

function visibleFromQA(html) {
  const pairs = [];
  const re =
    /<strong>\s*Q:\s*<\/strong>\s*([\s\S]*?)<br\s*\/?>\s*<strong>\s*A:\s*<\/strong>\s*([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    pairs.push({ q: stripTags(m[1]), a: stripTags(m[2]) });
  }
  return pairs;
}

function faqRegion(html) {
  const start = html.search(/<h2\b[^>]*>\s*(?:FAQ|Frequently asked questions)\s*<\/h2>/i);
  if (start === -1) return html;
  const rest = html.slice(start);
  const end = rest.search(/<section\b|<footer\b|<p style="margin-top:2rem">/i);
  return end === -1 ? rest : rest.slice(0, end);
}

function visibleFromH3(html) {
  const pairs = [];
  const re = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  const region = faqRegion(html);
  while ((m = re.exec(region))) {
    pairs.push({ q: stripTags(m[1]), a: stripTags(m[2]) });
  }
  return pairs;
}

function visibleFromStrongP(html) {
  const pairs = [];
  const re = /<p><strong>([\s\S]*?)<\/strong><\/p>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  const region = faqRegion(html);
  while ((m = re.exec(region))) {
    pairs.push({ q: stripTags(m[1]), a: stripTags(m[2]) });
  }
  return pairs;
}

function visibleFaqs(html, entityCount) {
  const candidates = [visibleFromQA(html), visibleFromH3(html), visibleFromStrongP(html)];
  const exact = candidates.find((p) => p.length === entityCount && p.length > 0);
  if (exact) return exact;
  return candidates.reduce((best, p) => (p.length > best.length ? p : best), []);
}

let failed = 0;
let checked = 0;
let skipped = 0;

for (const file of files) {
  if (!file.endsWith(".html")) continue;
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const entities = faqEntities(html);
  if (!entities.length) continue;
  const rel = relative(root, file);
  const base = file.split("/").pop();
  if (!args.length && SKIP_DEFAULT.has(base)) {
    skipped += 1;
    continue;
  }
  const vis = visibleFaqs(html, entities.length);
  if (!vis.length) {
    skipped += 1;
    continue;
  }
  checked += 1;
  if (vis.length !== entities.length) {
    failed += 1;
    console.error(`FAIL ${rel}: visible FAQ count ${vis.length} != JSON-LD mainEntity ${entities.length}`);
  }
  const n = Math.max(vis.length, entities.length);
  for (let i = 0; i < n; i++) {
    const v = vis[i];
    const e = entities[i];
    const name = e ? e.name : "";
    const text = e ? e.text : "";
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

if (!checked && !skipped) {
  console.log("FAQ JSON-LD MATCH: no FAQPage files in scope");
  process.exit(0);
}
if (failed) {
  console.error(`\nFAQ JSON-LD MATCH FAILED (${failed} mismatch(es) across ${checked} file(s))`);
  process.exit(1);
}
console.log(
  `FAQ JSON-LD MATCH PASSED (${checked} file(s), visible Q/A match JSON-LD${skipped ? `, ${skipped} skipped` : ""})`,
);
