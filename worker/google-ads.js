/**
 * Google Ads tag + contact-form conversion for norcalcarbmobile.com.
 *
 * Injected by the Worker (HTMLRewriter prepend on <head>) so every HTML page
 * — blogs, landers, /contact — gets the tag exactly once, first in <head>.
 * Do not add this snippet to static HTML files; that would double-fire.
 */

export const GOOGLE_ADS_ID = 'AW-18285811780';
export const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-18285811780/4JwWCNeT7ukcEMSwrY9E';
export const GOOGLE_ADS_CONVERSION_FN = 'ncmFireGoogleAdsConversion';
export const GOOGLE_ADS_CONVERSION_STORAGE_KEY = 'ncm-aw-contact-conv';

/** Exact Google tag snippet. Prepended immediately after the opening <head>. */
export const GOOGLE_ADS_TAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18285811780"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18285811780');</script>`;

/**
 * True only for the confirmed success / thank-you state after intake
 * redirects with ?sent=1. Never on page load without that flag, never on ?error=1.
 */
export function shouldFireGoogleAdsConversion(search) {
  const raw = String(search || '');
  const q = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  return q.get('sent') === '1' && q.get('error') !== '1';
}

/** Conversion bootstrap: defines the fire helper; auto-fires only on ?sent=1. */
export const GOOGLE_ADS_CONVERSION_BOOTSTRAP = `<script>
(function(){
  function ${GOOGLE_ADS_CONVERSION_FN}(){
    try{
      if(sessionStorage.getItem('${GOOGLE_ADS_CONVERSION_STORAGE_KEY}')==='1') return;
      sessionStorage.setItem('${GOOGLE_ADS_CONVERSION_STORAGE_KEY}','1');
    }catch(e){}
    gtag('event','conversion',{'send_to':'${GOOGLE_ADS_CONVERSION_SEND_TO}'});
  }
  window.${GOOGLE_ADS_CONVERSION_FN}=${GOOGLE_ADS_CONVERSION_FN};
  var q=new URLSearchParams(location.search);
  if(q.get('sent')==='1' && q.get('error')!=='1') ${GOOGLE_ADS_CONVERSION_FN}();
})();
</script>`;

export const GOOGLE_ADS_HEAD = `${GOOGLE_ADS_TAG}
${GOOGLE_ADS_CONVERSION_BOOTSTRAP}`;

/** Simulate Worker prepend for tests (HTMLRewriter is not available in Node). */
export function injectGoogleAdsHead(html) {
  return String(html).replace(/<head([^>]*)>/i, `<head$1>${GOOGLE_ADS_HEAD}`);
}

export function countGoogleAdsTagsInHead(html) {
  const match = String(html).match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!match) return 0;
  const tagRe = /googletagmanager\.com\/gtag\/js\?id=AW-18285811780/g;
  return (match[1].match(tagRe) || []).length;
}
