#!/usr/bin/env node
/**
 * NorCal blog publish gate — word count + required post-context header + link check.
 *
 * Scope: site/blog/*.html (excludes index.html). Legacy clean-truck-check-blog/ is not gated.
 *
 * Exit 0 = pass. Non-zero = fail (do not deploy).
 *
 * Usage:
 *   node scripts/check-blog-links.mjs
 *   node scripts/check-blog-links.mjs --skip-network   # structure/word/local only
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE = join(ROOT, "site");
const BLOG_DIR = join(SITE, "blog");
const MIN_WORDS = 400;
const SKIP_NETWORK = process.argv.includes("--skip-network");
const OFFICIAL_HOST_RE = /(^|\.)(arb\.ca\.gov|ca\.gov)$/i;
const PLACEHOLDER_RE =
  /example\.com|placeholder|TODO|FIXME|your-link|changeme|localhost:\d+/i;

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function stripTags(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&middot;/gi, "·")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function wordCount(html) {
  const main = extractMain(html);
  let body = main;
  const aside = main.match(
    /<aside\b[^>]*data-post-context=["']true["'][^>]*>[\s\S]*?<\/aside>/i
  );
  if (aside) {
    body = main.replace(aside[0], " ");
  }
  const text = stripTags(body);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function listPostFiles() {
  if (!existsSync(BLOG_DIR)) {
    fail(`Missing blog directory: ${BLOG_DIR}`);
    return [];
  }
  return readdirSync(BLOG_DIR)
    .filter((n) => n.endsWith(".html") && n !== "index.html")
    .map((n) => join(BLOG_DIR, n))
    .filter((p) => statSync(p).isFile());
}

function collectHrefs(html, { anchorsOnly = false } = {}) {
  const hrefs = [];
  if (anchorsOnly) {
    const re = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
    let m;
    while ((m = re.exec(html))) hrefs.push(m[2].trim());
    return hrefs;
  }
  // Anchors + stylesheet links. Skip preconnect/dns-prefetch (bare CDN origins often 404).
  const re =
    /<(?:a\b[^>]*|link\b(?=[^>]*\brel\s*=\s*["'][^"']*stylesheet)[^>]*)\bhref\s*=\s*(["'])(.*?)\1/gi;
  let m;
  while ((m = re.exec(html))) hrefs.push(m[2].trim());
  return hrefs;
}

function resolveInternal(pathname) {
  const clean = pathname.split("?")[0].split("#")[0];
  if (!clean || clean === "/") return join(SITE, "index.html");
  const noSlash = clean.replace(/\/$/, "");
  const candidates = [
    join(SITE, noSlash.slice(1) + ".html"),
    join(SITE, noSlash.slice(1), "index.html"),
    join(SITE, noSlash.slice(1)),
  ];
  return candidates.find((c) => existsSync(c)) || null;
}

function checkPostContext(file, html) {
  const rel = file.replace(ROOT + "/", "");
  const main = extractMain(html);
  const asideMatch = main.match(
    /<aside\b[^>]*data-post-context=["']true["'][^>]*>([\s\S]*?)<\/aside>/i
  );
  if (!asideMatch) {
    fail(
      `${rel}: missing required <aside data-post-context="true"> header (Location / Industry / Test)`
    );
    return;
  }

  const asideIndex = main.indexOf(asideMatch[0]);
  const firstH1 = main.search(/<h1\b/i);
  if (firstH1 >= 0 && asideIndex > firstH1 + 2500) {
    warn(`${rel}: post-context aside is far below the H1 — keep it at the top of the article`);
  }

  const asideHtml = asideMatch[0];
  const asideText = stripTags(asideMatch[1]);
  for (const label of ["Location", "Industry", "Test"]) {
    const okLabel =
      new RegExp(`\\b${label}\\s*:`, "i").test(asideText) ||
      new RegExp(`<strong>\\s*${label}\\s*:?\\s*</strong>`, "i").test(asideHtml);
    if (!okLabel) {
      fail(`${rel}: post-context header must include "${label}:"`);
    }
  }

  const hasMandateAttrMatch = asideHtml.match(/data-has-mandate=["'](true|false)["']/i);
  if (!hasMandateAttrMatch) {
    fail(`${rel}: post-context header must set data-has-mandate="true" or "false"`);
  }
  const hasMandateAttr = hasMandateAttrMatch?.[1]?.toLowerCase() === "true";
  const hasMandateLabel = /\b(Official|Mandate)\s*:/i.test(asideText);
  if (hasMandateAttr || hasMandateLabel) {
    const hrefs = collectHrefs(asideHtml);
    const official = hrefs.find((h) => {
      try {
        const u = new URL(h, "https://norcalcarbmobile.com");
        return (
          (u.protocol === "http:" || u.protocol === "https:") &&
          OFFICIAL_HOST_RE.test(u.hostname)
        );
      } catch {
        return false;
      }
    });
    if (!official) {
      fail(
        `${rel}: mandate/official posts need a real state/CARB link in the header (e.g. https://cleantruckcheck.arb.ca.gov/)`
      );
    }
  }
}

function checkHrefShape(rel, href) {
  if (!href || href === "#" || href.toLowerCase().startsWith("javascript:")) {
    fail(`${rel}: empty/placeholder href "${href}"`);
    return null;
  }
  if (PLACEHOLDER_RE.test(href)) {
    fail(`${rel}: placeholder href "${href}"`);
    return null;
  }
  if (
    href.startsWith("tel:") ||
    href.startsWith("mailto:") ||
    href.startsWith("sms:")
  ) {
    return null;
  }
  return href;
}

async function checkHttp(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "NorCalBlogGate/1.0 (+https://norcalcarbmobile.com)" },
    });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "NorCalBlogGate/1.0 (+https://norcalcarbmobile.com)" },
      });
    }
    return res.status;
  } catch (err) {
    return `ERR:${err.cause?.code || err.name || err.message}`;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  console.log(
    `NorCal blog gate · min ${MIN_WORDS} words · ${SKIP_NETWORK ? "skip-network" : "live link check"}`
  );
  const posts = listPostFiles();
  if (!posts.length && !errors.length) {
    fail("No blog posts found under site/blog/*.html");
  }

  const external = new Map();

  for (const file of posts) {
    const rel = file.replace(ROOT + "/", "");
    const html = readFileSync(file, "utf8");
    const words = wordCount(html);
    if (words < MIN_WORDS) {
      fail(`${rel}: ${words} words (minimum ${MIN_WORDS}; sweet spot 500–700)`);
    } else {
      console.log(`  OK words ${words} · ${rel}`);
    }

    checkPostContext(file, html);

    for (const raw of collectHrefs(html)) {
      const href = checkHrefShape(rel, raw);
      if (!href) continue;

      let url;
      try {
        url = new URL(href, "https://norcalcarbmobile.com");
      } catch {
        fail(`${rel}: malformed href "${href}"`);
        continue;
      }

      if (
        url.hostname === "norcalcarbmobile.com" ||
        url.hostname === "www.norcalcarbmobile.com"
      ) {
        const resolved = resolveInternal(url.pathname);
        if (!resolved) {
          fail(
            `${rel}: internal link not found on disk: ${url.pathname} (from href="${href}")`
          );
        }
        continue;
      }

      if (url.protocol === "http:" || url.protocol === "https:") {
        if (!external.has(url.href)) external.set(url.href, []);
        external.get(url.href).push(rel);
      }
    }
  }

  if (!SKIP_NETWORK) {
    for (const [url, rels] of external) {
      const status = await checkHttp(url);
      const ok = typeof status === "number" && status >= 200 && status < 400;
      if (!ok) {
        fail(
          `Broken link HTTP ${status}: ${url}\n    referenced by: ${[...new Set(rels)].join(", ")}`
        );
      } else {
        console.log(`  OK link ${status} · ${url}`);
      }
    }
  } else {
    console.log(`  (skipped ${external.size} external URL checks)`);
  }

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (errors.length) {
    console.error("\nFAIL — blog gate blocked deploy:\n");
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(
      `\n${errors.length} error(s). Fix posts / links, then re-run: node scripts/check-blog-links.mjs\n`
    );
    process.exit(1);
  }

  console.log(
    `\nPASS — ${posts.length} post(s) meet word count, header reminder, and link checks.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
