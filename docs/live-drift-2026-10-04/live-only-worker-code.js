// Live-only code from the norcal-squarespace-updates-gillis Worker, read 2026-10-04 ~4:05 PM PT (read-only GET).
// This archive is never built or deployed. Full live bundle: sha256 9e2826021723bc085bd462538eb621e4059305885610209c0d8d72e2a32c3400 (55,503 bytes),
// kept on the ops box at /workspace/gsc-fix/live-drift-2026-10-04/live-worker-bundle.js.
// In the live bundle this code sits *above* the esbuild banner (var __defProp), so it was pasted into
// an already-built bundle. The rest of the bundle is the wrangler build of cursor/gsc-indexing-fixes-v2 @ 7585dcb
// plus the edits in live-vs-v2-7585dcb-bundle.diff.
//
// var CORRIDOR_PAGES = { ... } holds 3 full HTML documents. Each one equals the static file committed in this branch's first commit:
//   "/clean-truck-check-hayward": site/clean-truck-check-hayward.html  sha256 14602f83df2681faca33807aa530c09d12197856bc220423fd73601daac5d593  (9865 bytes)
//   "/carb-mobile-test-near-me": site/carb-mobile-test-near-me.html  sha256 040978fe7910314dad181665d704fbf0533152f965c1ba36b9d7ac51ff675fcc  (7430 bytes)
//   "/carb-test-bay-area": site/carb-test-bay-area.html  sha256 376152e2d6ab82718cb52ace999767dde214fd27ccbda95d73527666bb02941d  (7568 bytes)
//
// Exact live code that follows CORRIDOR_PAGES:
function swapAreasHtml(html) {
  var eastOld = "<article class=\"card\"><p class=\"eyebrow\">Where we test</p><h3>East Bay</h3><p>Oakland, Hayward, Fremont, San Leandro, Richmond, and Concord on the I-880 unit.</p><a class=\"btn btn-ghost\" href=\"/bay-area-mobile-carb\">East Bay details</a></article>";
  var eastNew = "<article class=\"card\" id=\"east-bay\"><span id=\"hayward\"></span><a href=\"/clean-truck-check-hayward\" style=\"display:block;text-decoration:none;color:inherit\"><img src=\"/assets/img/coverage-map-v2.png\" alt=\"Map of East Bay mobile CARB coverage centered on Hayward and I-880\" width=\"900\" height=\"168\" style=\"width:100%;height:168px;object-fit:cover;border-radius:12px;display:block\"><p class=\"eyebrow\">East Bay</p><h3>Hayward corridor</h3><p>Hayward is the East Bay page. The map opens that corridor.</p></a><a class=\"btn btn-ghost\" href=\"/carb-mobile-test-near-me\">CARB mobile test near me</a></article>";
  if (html.indexOf(eastOld) === -1) return html;
  var bayOld = "<article class=\"card\"><p class=\"eyebrow\">Where we test</p><h3>Bay Area</h3>";
  var bayNew = "<article class=\"card\" id=\"bay-area\"><p class=\"eyebrow\">Where we test</p><h3>Bay Area</h3>";
  var btnOld = "San Francisco, the Peninsula, and Bay Area yards on the daily unit.</p><a class=\"btn btn-ghost\" href=\"/bay-area-mobile-carb\">Bay Area details</a>";
  var btnNew = "San Francisco, the Peninsula, and Bay Area yards on the daily unit.</p><a class=\"btn btn-ghost\" href=\"/bay-area-mobile-carb\">Bay Area details</a> <a class=\"btn btn-ghost\" href=\"/carb-test-bay-area\">CARB test Bay Area</a>";
  return html.split(eastOld).join(eastNew).split(bayOld).join(bayNew).split(btnOld).join(btnNew);
}
function sitemapWithCorridors(xml) {
  if (xml.indexOf("/carb-test-bay-area") !== -1) return xml;
  var extra = "  <url><loc>https://norcalcarbmobile.com/clean-truck-check-hayward</loc><lastmod>2026-10-04</lastmod></url>\n  <url><loc>https://norcalcarbmobile.com/carb-mobile-test-near-me</loc><lastmod>2026-10-04</lastmod></url>\n  <url><loc>https://norcalcarbmobile.com/carb-test-bay-area</loc><lastmod>2026-10-04</lastmod></url>\n";
  return xml.replace("</urlset>", extra + "</urlset>");
}

