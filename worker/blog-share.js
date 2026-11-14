/**
 * Shared blog-post layout: Facebook / X / Google Business share + Open Graph fill-ins.
 * Applied by the Worker to every /blog/<slug> and /clean-truck-check-blog/<slug>
 * response so posts are not edited one at a time. No Facebook SDK, X widgets.js,
 * pixel, or third-party script — plain sharer anchors plus a tiny inline clipboard
 * helper for Google Business Profile (no public share URL).
 */

export const BRAND_OG_IMAGE =
  'https://norcalcarbmobile.com/assets/img/norcal-carb-mobile-logo-web-512x512.png';

export const GBP_POSTS_URL = 'https://business.google.com/posts';

const SHARE_STYLE = `<style id="ncm-fb-share-style">
.ncm-share-row,.ncm-fb-share-wrap{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:12px 0 4px}
.ncm-fb-share{
  display:inline-flex;align-items:center;gap:.45rem;
  min-height:44px;min-width:44px;padding:8px 14px;
  border-radius:8px;border:1.5px solid var(--silver-line,#c5cdd6);
  background:#fff;color:var(--navy,#012241)!important;
  font-family:var(--font-sans,inherit);font-weight:700;font-size:.95rem;
  text-decoration:none;box-sizing:border-box;line-height:1.2;cursor:pointer
}
.ncm-fb-share:hover{border-color:var(--navy,#012241);background:var(--bg-soft,#f4f7f5)}
.ncm-fb-share svg{width:20px;height:20px;flex:0 0 20px}
.ncm-gbp-note{flex-basis:100%;margin:0;font-size:.9rem;color:var(--muted,#5b6b73)}
</style>`;

const GBP_SCRIPT = `<script>
(function(){
  if (window.__ncmGbpShare) return;
  window.__ncmGbpShare = true;
  document.addEventListener('click', function(ev){
    var btn = ev.target.closest ? ev.target.closest('[data-ncm-gbp-share]') : null;
    if (!btn) return;
    ev.preventDefault();
    var text = btn.getAttribute('data-share-text') || '';
    var row = btn.closest('.ncm-share-row') || btn.parentElement;
    var note = row && row.querySelector('.ncm-gbp-note');
    function openGbp(){
      window.open(${JSON.stringify(GBP_POSTS_URL)}, '_blank','noopener,noreferrer');
    }
    function copied(){
      if (note) { note.hidden = false; note.textContent = 'Copied, paste into your Google post'; }
      openGbp();
    }
    function fallbackCopy(){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      copied();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(copied).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
})();
</script>`;

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

export function xShareHref(canonicalUrl, title) {
  return `https://x.com/intent/post?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(title)}`;
}

export function gbpShareText(title, canonicalUrl) {
  return `${title} ${canonicalUrl}`;
}

function attrEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
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
  return match ? decodeEntities(match[1].trim()) : '';
}

export function shareTitleFromHtml(html) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const text = decodeEntities(h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (text) return text;
  }
  const og = metaContent(html, 'og:title');
  if (og) return og.replace(/\s+[—–-]\s+NorCal CARB Mobile\s*$/i, '').trim();
  return titleText(html).replace(/\s+[—–-]\s+NorCal CARB Mobile\s*$/i, '').trim();
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

const FB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>`;
const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#000" d="M18.9 1.5h3.7l-8.1 9.26L24 22.5h-7.4l-5.8-7.58-6.63 7.58H.45l8.66-9.9L0 1.5h7.59l5.24 6.93L18.9 1.5zm-1.3 18.9h2.04L6.5 3.48H4.3L17.6 20.4z"/></svg>`;
const GBP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;

export function blogShareButtonHtml(canonicalUrl, title) {
  const fbHref = attrEscape(facebookShareHref(canonicalUrl));
  const xHref = attrEscape(xShareHref(canonicalUrl, title));
  const copyText = attrEscape(gbpShareText(title, canonicalUrl));
  return `<div class="ncm-share-row ncm-fb-share-wrap" data-ncm-share-row role="group" aria-label="Share this post"><a class="ncm-fb-share" href="${fbHref}" target="_blank" rel="noopener noreferrer" aria-label="Share this post on Facebook">${FB_ICON}Share on Facebook</a><a class="ncm-fb-share" href="${xHref}" target="_blank" rel="noopener noreferrer" aria-label="Share this post on X">${X_ICON}Share on X</a><button type="button" class="ncm-fb-share" data-ncm-gbp-share data-share-text="${copyText}" aria-label="Share this post to Google Business">${GBP_ICON}Share to Google Business</button><p class="ncm-gbp-note" hidden>Copied, paste into your Google post</p></div>${GBP_SCRIPT}`;
}

function injectShareButton(html, canonicalUrl) {
  const title = shareTitleFromHtml(html);
  const row = blogShareButtonHtml(canonicalUrl, title);
  if (html.includes('data-ncm-share-row')) return html;
  const replaced = html.replace(
    /<(?:p|div)\b[^>]*class="[^"]*ncm-fb-share-wrap[^"]*"[^>]*>[\s\S]*?<\/(?:p|div)>/i,
    () => row,
  );
  if (replaced !== html) return replaced;
  const withDate = html.replace(
    /(<h1\b[^>]*>[\s\S]*?<\/h1>)(\s*<p\b[^>]*>[\s\S]*?<\/p>)/i,
    (_, h1, date) => `${h1}${date}\n      ${row}`,
  );
  if (withDate !== html) return withDate;
  const withH1 = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i, (h1) => `${h1}\n      ${row}`);
  if (withH1 !== html) return withH1;
  return html.replace(/<main\b[^>]*>/i, (open) => `${open}\n      ${row}`);
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
