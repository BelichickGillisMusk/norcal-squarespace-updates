/**
 * HTML-escape untrusted text (contact-form fields) before it is placed in the
 * lead email HTML. Pure function, no Workers APIs, so it is unit-tested in
 * worker/html-escape.test.mjs.
 *
 * The table must hold real entities. The GitHub write pipeline decodes entities
 * once (and the quot entity twice), which once turned this table into a no-op.
 * The quot entity is therefore assembled from two strings; verify the raw bytes after any push.
 */
const QUOT = '&' + 'quot;';
const HTML_ESC = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': QUOT };

export function esc(s) {
  return String(s || '').replace(/[<>&"]/g, (c) => HTML_ESC[c]);
}
