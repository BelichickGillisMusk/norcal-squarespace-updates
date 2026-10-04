/**
 * HTML-escape untrusted text (contact-form fields) before it is placed in the
 * lead email HTML. Pure function, no Workers APIs, so it is unit-tested in
 * worker/html-escape.test.mjs.
 *
 * NOTE: this file must contain the literal entities &lt; &gt; &amp; ".
 * Some write pipelines decode entities once; verify the raw bytes after a push.
 */
const HTML_ESC = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '"' };

export function esc(s) {
  return String(s || '').replace(/[<>&"]/g, (c) => HTML_ESC[c]);
}
