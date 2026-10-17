/**
 * Shared copy helpers. config/site.json is the only authored phone,
 * service-area, and review-count copy. Pages keep {{tokens}}; the Worker
 * expands them on the way out so the served text matches the live site.
 */

export function tokenMap(site) {
  const map = {};
  const add = (token, value) => {
    if (typeof value === 'string' && value) map[token] = value;
  };
  const phone = site.phones || {};
  for (const role of ['primary', 'secondary']) {
    const entry = phone[role] || {};
    add(`{{phone.${role}.display}}`, entry.display);
    add(`{{phone.${role}.compact}}`, entry.compact);
    add(`{{phone.${role}.href}}`, entry.href);
    add(`{{phone.${role}.e164}}`, entry.e164);
    add(`{{phone.${role}.schema}}`, entry.schema);
  }
  const area = site.serviceArea || {};
  for (const key of [
    'name', 'nameEs', 'summary', 'summaryEs', 'serving', 'servingEs',
    'homepageOpenBar', 'contactOpenBar', 'contactOpenBarEs', 'footerAreas',
    'corridor', 'areaCopy', 'areaCopyEs', 'tagline', 'taglineEs', 'nap',
    'llms', 'mapAlt', 'mapAltEs', 'lede', 'ledeEs',
  ]) {
    add(`{{serviceArea.${key}}}`, area[key]);
  }
  for (const county of area.counties || []) {
    add(`{{serviceArea.county.${county.replace(/\s+/g, '')}}}`, county);
  }
  const reviews = site.reviews || {};
  for (const key of ['line', 'lineEs', 'homeKicker', 'homeBand', 'homeLink', 'pill']) {
    add(`{{reviews.${key}}}`, reviews[key]);
  }
  return map;
}

export function expandTokens(text, map) {
  let out = String(text);
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (out.includes(key)) out = out.split(key).join(map[key]);
  }
  return out;
}

/** HTML text gets escaped replacements. script/style bodies stay raw so JSON-LD stays JSON. */
export function expandHtmlTokens(text, map) {
  const escaped = {};
  for (const [token, value] of Object.entries(map)) {
    escaped[token] = value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
  const parts = String(text).split(/(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>)/gi);
  return parts.map((part) => expandTokens(part, /^<(script|style)\b/i.test(part) ? map : escaped)).join('');
}

/** Longest authored strings first, so a short phrase does not eat a longer one. */
export function replacementPairs(site) {
  const map = tokenMap(site);
  const pairs = Object.entries(map).map(([token, value]) => [value, token]);
  for (const [value, token] of [...pairs]) {
    if (value.includes('&')) pairs.push([value.replaceAll('&', '&amp;'), token]);
  }
  pairs.sort((a, b) => b[0].length - a[0].length);
  return pairs;
}

export function regionPhrases(site) {
  const area = site.serviceArea || {};
  const phrases = [];
  const push = (value) => {
    if (typeof value !== 'string' || value.length < 4) return;
    phrases.push(value);
    if (value.includes('&')) phrases.push(value.replaceAll('&', '&amp;'));
  };
  for (const key of [
    'name', 'nameEs', 'summary', 'summaryEs', 'serving', 'servingEs',
    'homepageOpenBar', 'contactOpenBar', 'contactOpenBarEs', 'footerAreas',
    'corridor', 'areaCopy', 'areaCopyEs', 'tagline', 'taglineEs', 'nap',
    'llms', 'mapAlt', 'mapAltEs', 'lede', 'ledeEs',
  ]) push(area[key]);
  for (const county of area.counties || []) push(county);
  return [...new Set(phrases)].sort((a, b) => b.length - a.length);
}

export function phoneVariants(site) {
  const out = [];
  for (const entry of Object.values(site.phones || {})) {
    for (const key of ['display', 'compact', 'href', 'e164', 'schema']) {
      if (entry[key]) out.push(entry[key]);
    }
  }
  return out;
}

const PHONE_RE = /(?:\+1[-\s.]?)?\(?\d{3}\)?[-\s.]\d{3}[-\s.]\d{4}|\+1\d{10}|tel:\+\d{10,15}/g;

export function phoneHits(text) {
  return text.match(PHONE_RE) || [];
}

/**
 * JSON-LD may contain phones and region phrases only when this file builds
 * schema from site.json and every phone in the block is one site.json authors.
 * Handwritten page schema is not on the allowlist, even if the digits match.
 */
export function isGeneratedJsonLd(jsonText, site, fileText) {
  const generates = fileText.includes('site.phones.primary.schema')
    && fileText.includes('site.serviceArea.counties')
    && /config\/site\.json/.test(fileText);
  if (!generates) return false;
  try { JSON.parse(jsonText); } catch { return false; }
  const allowedPhones = new Set(phoneVariants(site));
  const phones = phoneHits(jsonText);
  if (phones.some((hit) => !allowedPhones.has(hit))) return false;
  const regions = regionPhrases(site).filter((phrase) => jsonText.includes(phrase));
  return phones.length > 0 || regions.length > 0;
}

export function stripGeneratedJsonLd(content, site) {
  return content.replace(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi, (full, json) => {
    return isGeneratedJsonLd(json, site, content) ? '' : full;
  });
}
