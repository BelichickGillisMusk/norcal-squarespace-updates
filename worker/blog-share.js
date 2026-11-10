/**
 * Shared blog-post layout: Facebook sharer link + Open Graph fill-ins.
 * Applied by the Worker to every /blog/<slug> and /clean-truck-check-blog/<slug>
 * response so posts are not edited one at a time. No Facebook SDK, pixel, or
 * third-party script — a plain sharer.php anchor only.
 */

export const BRAND_OG_IMAGE =
  'https://norcalcarbmobile.com/assets/img/norcal-carb-mobile-logo-web-512x512.png';

const SHARE_STYLE = `<style id="ncm-fb-share-style">
.ncm-fb-share-wrap{margin:12px 0 4px}
.ncm-fb-share{
  display:inline-flex;align-items:center;gap:.45rem;
  min-height:44px;min-width:44px;padding:8px 14px;
  border-radius:8px;border:1.5px solid var(--silver-line,#c5cdd6);
  background:#fff;color:var(--navy,#012241)!important;
  font-family:var(--font-sans,inherit);font-weight:700;font-size:.95rem;
  text-decoration:none;box-sizing:border-box;line-height:1.2
}
.ncm-fb-share:hover{border-color:var(--navy,#012241);background:var(--bg-soft,#f4f7f5)}
.ncm-fb-share svg{width:20px;height:20px;flex:0 0 20px}
</style>`;

export function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  let p = pathname.replace(/\/+$/, '') || '/';
  if (/\/index\.html$/i.test(p)) p = p.replace(/\/index\.html$/i, '') || '/';
  else if (/\.html$/i.test(p)) p = p.replace(/\.html$/i, '') || '/';
  return p;
}

export function isBlogPostPath(pathname) {
  const p = canonicalPath(pathname);
  if (p === '/blog' || p === '/clean-truck-check-blog') return false;
  return p.startsWith('/blog/') || p.startsWith('/clean-truck-check-blog/');
}

export function facebookShareHref(canonicalUrl) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;
}

function attrEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function blogShareButtonHtml(canonicalUrl) {
  const href = attrEscape(facebookShareHref(canonicalUrl));
  return `<p class="ncm-fb-share-wrap"><a class="ncm-fb-share" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Share this post on Facebook"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>Share on Facebook</a></p>`;
}

function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<meta\\b[^>]*(?:(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["'])[^>]*>`,
    'i',
  );
  const match = html.match(re);
  if (!match) return null;
  const value = match[1] || match[2] || '';
  return value.trim() ? value.trim() : null;
}

function titleText(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
}

function hasMeta(html, key) {
  return metaContent(html, key) != null;
}

/**
 * Source-file audit. Does not invent images or descriptions.
 * og:image / twitter:card are often added at serve time (Worker branding).
 */
export function auditBlogOg(html) {
  const ogTitle = metaContent(html, 'og:title');
  const ogDescription = metaContent(html, 'og:description');
  const ogImage = metaContent(html, 'og:image');
  const ogUrl = metaContent(html, 'og:url');
  const ogType = metaContent(html, 'og:type');
  const twitterCard = metaContent(html, 'twitter:card');
  const description = metaContent(html, 'description');
  const missing = [];
  if (!ogTitle && !titleText(html)) missing.push('og:title');
  if (!ogDescription && !description) missing.push('og:description');
  if (!ogImage) missing.push('og:image');
  if (!ogUrl) missing.push('og:url');
  if (!ogType) missing.push('og:type');
  if (!twitterCard) missing.push('twitter:card');
  return {
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    description,
    missing,
  };
}

function ogTag(property, content) {
  return `<meta property="${property}" content="${attrEscape(content)}">`;
}

function generatedOgTags(html, canonicalUrl) {
  const tags = [];
  if (!hasMeta(html, 'og:url')) tags.push(ogTag('og:url', canonicalUrl));
  if (!hasMeta(html, 'og:type')) tags.push(ogTag('og:type', 'article'));
  if (!hasMeta(html, 'og:title')) {
    const title = titleText(html);
    if (title) tags.push(ogTag('og:title', title));
  }
  if (!hasMeta(html, 'og:description')) {
    const description = metaContent(html, 'description');
    if (description) tags.push(ogTag('og:description', description));
  }
  if (!hasMeta(html, 'og:image')) tags.push(ogTag('og:image', BRAND_OG_IMAGE));
  if (!hasMeta(html, 'twitter:card')) {
    tags.push(`<meta name="twitter:card" content="summary">`);
  }
  return tags.join('\n  ');
}

function injectHead(html, snippet) {
  if (!snippet) return html;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${snippet}\n</head>`);
  return snippet + html;
}

function injectShareButton(html, canonicalUrl) {
  if (html.includes('class="ncm-fb-share"')) return html;
  const button = blogShareButtonHtml(canonicalUrl);
  const withDate = html.replace(
    /(<h1\b[^>]*>[\s\S]*?<\/h1>)(\s*<p\b[^>]*>[\s\S]*?<\/p>)/i,
    `$1$2\n      ${button}`,
  );
  if (withDate !== html) return withDate;
  const withH1 = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, `$1\n      ${button}`);
  if (withH1 !== html) return withH1;
  return html.replace(/<main\b[^>]*>/i, (open) => `${open}\n      ${button}`);
}

export function applyBlogShareLayout(html, canonicalUrl) {
  let out = html;
  if (!out.includes('id="ncm-fb-share-style"')) {
    out = injectHead(out, SHARE_STYLE);
  }
  const og = generatedOgTags(out, canonicalUrl);
  if (og) out = injectHead(out, `  ${og}`);
  return injectShareButton(out, canonicalUrl);
}
