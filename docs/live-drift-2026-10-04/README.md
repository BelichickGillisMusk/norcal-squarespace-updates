# Live drift snapshot, 2026-10-04

These files record the `norcal-squarespace-updates-gillis` Worker (script id
60e27e13b98747cda671567336c2063b) as it was live on 2026-10-04 at about 4:05 PM PT, read with a
read-only API call. They are kept as evidence and are never built or deployed.
- `live-only-worker-code.js`: the exact live-only functions, plus sha256 of each corridor page string.
  Each hash equals the matching static file in this branch's first commit.
- `live-vs-v2-7585dcb-bundle.diff`: exact diff between the wrangler build of 7585dcb and the live script.
- The full 55,503-byte live bundle (sha256 9e2826021723bc085bd462538eb621e4059305885610209c0d8d72e2a32c3400)
  is on the ops box at `/workspace/gsc-fix/live-drift-2026-10-04/live-worker-bundle.js`.

## What the live script is
- Everything after `var __defProp` matches the wrangler/esbuild bundle of the unmerged branch
  `cursor/gsc-indexing-fixes-v2` @ 7585dcb byte for byte (`wrangler deploy --dry-run --outdir`),
  with 4 exceptions:
  1. `CORRIDOR_PAGES`, `swapAreasHtml()` and `sitemapWithCorridors()` are added *before* the esbuild
     banner. They are hand-written ES5 `var` code with JSON-escaped HTML strings, so they were pasted
     into the bundle afterwards and were never compiled from source.
  2. The fetch handler serves `/clean-truck-check-hayward`, `/carb-mobile-test-near-me` and
     `/carb-test-bay-area` from `CORRIDOR_PAGES`. It rewrites the East Bay and Bay Area cards on
     `/areas` and appends those 3 URLs to `/sitemap.xml`.
  3. REDIRECTS: `/east-bay-mobile-carb-testing` → `/clean-truck-check-hayward`,
     `/clean-truck-check-bay-area` → `/carb-test-bay-area`, and `/clean-truck-check-hayward` is no
     longer redirected.
  4. The `//# sourceMappingURL` line is gone.
- The live static assets match `cursor/gsc-indexing-fixes-v2` @ 7585dcb: sitemap (88 URLs + the 3
  appended = 91), services, about, contact, obd/ovi/motorhome pages and the motorhome guide all have
  the same body as 7585dcb and differ from main.

## Backfill in this branch
Each change serves the same bytes as live, using source files instead of the pasted code:
- `site/clean-truck-check-hayward.html`, `site/carb-mobile-test-near-me.html`,
  `site/carb-test-bay-area.html`: the exact strings from `CORRIDOR_PAGES`.
- `site/areas.html`: `swapAreasHtml()` applied to main's file. The body region equals live `/areas`.
- `site/sitemap.xml`: equals live `/sitemap.xml` byte for byte (91 URLs).
- `site/carb-obd-test.html`, `site/carb-ovi-test.html`, `site/motorhome-carb-test.html`: the live
  versions, identical to 7585dcb.
- `worker/index.js`: the 3 REDIRECTS edits above. Nothing else.
