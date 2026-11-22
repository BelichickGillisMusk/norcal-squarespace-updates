/**
 * Blog post share row + per-post Open Graph image.
 *
 * Applied by the Worker to every blog post response (/blog/<slug> and
 * /clean-truck-check-blog/<slug>), so current and future posts get it without
 * editing post HTML one file at a time. The blog indexes are not posts.
 *
 * Plain anchor links only: Facebook, X, LinkedIn, text (sms:) and copy link.
 * No third-party widget, SDK, pixel or external JS. The only script is a tiny
 * inline clipboard helper for "Copy link"; without JS the link still works.
 *
 * Note: the HTML ampersand entity is built from \u0026 on purpose so file
 * uploads that rewrite a literal entity cannot change this source.
 */

export const SITE_ORIGIN = 'https://norcalcarbmobile.com';
export const BRAND_OG_IMAGE = `${SITE_ORIGIN}/assets/img/norcal-carb-mobile-logo-web-512x512.png`;

const AMP = '\u0026amp;';

/** Escape text for an HTML attribute or text node. */
export function esc(s) {
  return String(s)
    .replace(/&/g, AMP)
    .replace(/"/g, '\u0026quot;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;');
}

/** Decode the few entities that show up in titles. */
export function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&lsquo;|&#8216;/g, '\u2018')
    .replace(/&ldquo;|&#8220;/g, '\u201c')
    .replace(/&rdquo;|&#8221;/g, '\u201d')
    .replace(/&(?:quot);/g, '"')
    .replace(/&#39;|&(?:apos);/g, "'")
    .replace(/&(?:lt);/g, '<')
    .replace(/&(?:gt);/g, '>')
    .replace(/&(?:amp);/g, '&');
}

/** Blog post path (canonical form, no trailing slash). Indexes are excluded. */
export function isBlogPostPath(path) {
  const m = /^\/(blog|clean-truck-check-blog)\/([^/]+)$/.exec(path || '');
  if (!m) return false;
  return m[2] !== 'index' && m[2] !== 'index.html';
}

function metaContent(html, attr, name) {
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = re.exec(html);
  if (!tag) return '';
  const c = /\bcontent=["']([^"']*)["']/i.exec(tag[0]);
  return c ? c[1] : '';
}

function mainRegion(html) {
  const m = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  return m ? m[1] : html;
}

/** Post title for share text: the H1, else og:title, else <title>. Plain text. */
export function postTitle(html) {
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(mainRegion(html));
  let t = h1 ? h1[1].replace(/<[^>]+>/g, '') : '';
  if (!t.trim()) t = metaContent(html, 'property', 'og:title');
  if (!t.trim()) {
    const tt = /<title>([\s\S]*?)<\/title>/i.exec(html);
    t = tt ? tt[1] : '';
  }
  return decodeEntities(t).replace(/\s+/g, ' ').trim();
}

/** Canonical URL from <link rel="canonical">, else the given fallback. */
export function postUrl(html, fallbackUrl) {
  const m = /<link\b[^>]*rel=["']canonical["'][^>]*>/i.exec(html);
  const href = m ? /\bhref=["']([^"']+)["']/i.exec(m[0]) : null;
  if (href && href[1].startsWith(`${SITE_ORIGIN}/`)) return decodeEntities(href[1]);
  return fallbackUrl;
}

function absolutize(src) {
  const s = decodeEntities(src.trim());
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/')) return `${SITE_ORIGIN}${s}`;
  return '';
}

/**
 * Post image for og:image: the post's own og:image if it has one, else the
 * first content image in <main> (skipping the brand logo), else the site logo.
 */
export function postImage(html) {
  const own = metaContent(html, 'property', 'og:image');
  if (own && absolutize(own)) return { url: absolutize(own), isPhoto: true };
  const re = /<img\b[^>]*>/gi;
  const region = mainRegion(html);
  let m;
  while ((m = re.exec(region))) {
    const tag = m[0];
    if (/class=["'][^"']*brand-logo/i.test(tag)) continue;
    const src = /\bsrc=["']([^"']+)["']/i.exec(tag);
    if (!src || src[1].startsWith('data:')) continue;
    const abs = absolutize(src[1]);
    if (!abs || /logo/i.test(abs)) continue;
    const alt = /\balt=["']([^"']*)["']/i.exec(tag);
    return { url: abs, alt: alt ? decodeEntities(alt[1]) : '', isPhoto: true };
  }
  return { url: BRAND_OG_IMAGE, isPhoto: false };
}

export function facebookShareHref(url) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
export function xShareHref(url, title) {
  return `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}
export function linkedinShareHref(url) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
/** sms:?&body= opens the Messages app on iOS and Android with the text filled in. */
export function smsShareHref(url, title) {
  return `sms:?&body=${encodeURIComponent(`${title} ${url}`)}`;
}

const SHARE_STYLE = `<style id="ncm-share-style">
.ncm-share-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:14px 0 6px}
.ncm-share-row .ncm-share-label{font-size:.9rem;color:var(--muted);margin-right:.15rem}
.ncm-share-row .ncm-share{display:inline-flex;align-items:center;justify-content:center;min-height:40px;min-width:44px;padding:6px 14px;border-radius:8px;border:1.5px solid var(--line,#e4e4e7);background:transparent;color:var(--ink);font-size:.9rem;font-weight:600;text-decoration:none;line-height:1.2;box-sizing:border-box}
.ncm-share-row .ncm-share:hover,.ncm-share-row .ncm-share:focus-visible{border-color:var(--green,#4ab94e);color:var(--ink)}
</style>`;

const COPY_SCRIPT = `<script>(function(){var a=document.querySelector('[data-ncm-copy]');if(!a||!navigator.clipboard)return;a.addEventListener('click',function(e){e.preventDefault();navigator.clipboard.writeText(a.getAttribute('href')).then(function(){a.textContent='Link copied';setTimeout(function(){a.textContent='Copy link'},2000)})})})();</script>`;

/** The share row HTML for one post. */
export function shareRowHtml(url, title) {
  const web = 'target="_blank" rel="noopener"';
  return `${SHARE_STYLE}
<div class="ncm-share-row" role="group" aria-label="Share this post">
  <span class="ncm-share-label">Share:</span>
  <a class="ncm-share" data-ncm-share="facebook" href="${esc(facebookShareHref(url))}" ${web} aria-label="Share this post on Facebook">Facebook</a>
  <a class="ncm-share" data-ncm-share="x" href="${esc(xShareHref(url, title))}" ${web} aria-label="Share this post on X">X</a>
  <a class="ncm-share" data-ncm-share="linkedin" href="${esc(linkedinShareHref(url))}" ${web} aria-label="Share this post on LinkedIn">LinkedIn</a>
  <a class="ncm-share" data-ncm-share="sms" href="${esc(smsShareHref(url, title))}" aria-label="Share this post by text message">Text</a>
  <a class="ncm-share" data-ncm-share="copy" data-ncm-copy href="${esc(url)}" aria-label="Copy the link to this post">Copy link</a>
</div>
${COPY_SCRIPT}`;
}

/** Head tags for a post: og:image (+alt), twitter card/image, og:title/og:url if missing. */
export function postHeadTags(html, url, title) {
  const img = postImage(html);
  const alt = img.alt || title || 'NorCal CARB Mobile — Mobile Clean Truck Check';
  const tags = [
    `<meta property="og:image" content="${esc(img.url)}">`,
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    `<meta name="twitter:card" content="${img.isPhoto ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:image" content="${esc(img.url)}">`,
    `<meta name="twitter:image:alt" content="${esc(alt)}">`,
  ];
  if (!metaContent(html, 'property', 'og:title')) tags.push(`<meta property="og:title" content="${esc(title)}">`);
  if (!metaContent(html, 'property', 'og:url')) tags.push(`<meta property="og:url" content="${esc(url)}">`);
  if (!metaContent(html, 'property', 'og:type')) tags.push('<meta property="og:type" content="article">');
  return { tags: `\n${tags.join('\n')}\n`, image: img.url };
}

/** Drop the post's own og:image / twitter image+card tags; postHeadTags re-adds one set. */
export function stripImageMeta(html) {
  return html.replace(
    /[ \t]*<meta\b[^>]*\b(?:property|name)=["'](?:og:image(?::alt)?|twitter:card|twitter:image(?::alt)?)["'][^>]*>[ \t]*\r?\n?/gi,
    '',
  );
}

/** Insert the share row after the post's first H1 (and its Published byline) inside <main>. */
export function insertShareRow(html, row) {
  const mainAt = html.search(/<main\b/i);
  const from = mainAt >= 0 ? mainAt : 0;
  const rel = html.slice(from).search(/<\/h1>/i);
  if (rel < 0) return html;
  let at = from + rel + '</h1>'.length;
  // Keep the "Published <date>" byline under the title; the row goes after it.
  const byline = /^\s*<p\b[^>]*>\s*Published\b[\s\S]*?<\/p>/i.exec(html.slice(at));
  if (byline) at += byline[0].length;
  return `${html.slice(0, at)}\n${row}${html.slice(at)}`;
}

/**
 * Full post transform used by the Worker. Returns the new HTML plus the head
 * tags the Worker appends in place of the sitewide og:image/twitter tags.
 */
export function applyBlogShare(html, fallbackUrl) {
  if (html.includes('class="ncm-share-row"')) return { html, headTags: '', applied: false };
  const url = postUrl(html, fallbackUrl);
  const title = postTitle(html);
  const head = postHeadTags(html, url, title);
  const out = insertShareRow(stripImageMeta(html), shareRowHtml(url, title));
  return { html: out, headTags: head.tags, image: head.image, url, title, applied: true };
}
