#!/usr/bin/env python3
"""Build static blog pages for norcalcarbmobile.com from the migration manifest.

Reads scripts/sonicjs-blog-migration/manifest.json (65 posts recovered from the
Squarespace WXR export + HTML export zip + current site) and generates:

  - site/clean-truck-check-blog/<slug>.html   one page per migrated legacy post
                                 (source=wxr), served at the EXACT old
                                 Squarespace URL /clean-truck-check-blog/<slug>
  - site/blog/index.html         blog index listing every published post
  - site/sitemap.xml             full sitemap including all blog URLs
  - worker/blog-redirects.js     slug set + legacy-path map used by worker/index.js
                                 (/blog/<legacy-slug> 301s to the old path;
                                 date-based old paths normalize to it)

Skipped:
  - source=site posts (already exist as hand-written pages in site/blog/)
  - i-thought-it-was-ending (body is empty in every export — redirects to /blog)

Idempotent: re-running overwrites the generated files. Hand-written pages for
the three source=site posts are never touched.
"""

import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "scripts" / "sonicjs-blog-migration" / "manifest.json"
BLOG_DIR = ROOT / "site" / "blog"
LEGACY_DIR = ROOT / "site" / "clean-truck-check-blog"
SITEMAP = ROOT / "site" / "sitemap.xml"
REDIRECTS_JS = ROOT / "worker" / "blog-redirects.js"

BASE_URL = "https://norcalcarbmobile.com"
LASTMOD = "2026-07-07"

# Posts whose bodies were empty in every export — old URLs 301 to these targets
# (keyed by the final path segment of the old /clean-truck-check-blog/... URL).
LEGACY_FALLBACKS = {
    "i-thought-it-was-ending": "/blog",
    "how-much-does-a-diesel-truck-obd-test-cost-complete-guide-to-carb-emissions-testing-prices-in-california": "/pricing",
    "smoke-opacity-test-oakland-j1667-certified-mobile-testing-for-east-bay-diesel-trucks": "/blog/oakland-clean-truck-checks-san-leandro",
    "how-to-avoid-carb-fines": "/blog/carb-violation",
    "fleet-c-arb-clean-truck-check-sacramento": "/sacramento-carb-testing",
    "what-is-clean-truck-test-fairfield": "/stockton-clean-truck-check",
}

# Old Squarespace paths that appear inside post bodies → new site paths
# (mirrors the REDIRECTS map in worker/index.js).
LINK_MAP = {
    "/contact-us": "/contact",
    "/book": "/contact",
    "/book-schedule-carb-smoke-test-sacramento": "/contact",
    "/clean-truck-check": "/services#obd",
    "/smoke-opacity-test-near-me": "/services#ovi",
    "/reviews-service-area": "/#reviews",
    "/clean-truck-check-sacramento": "/sacramento-carb-testing",
    "/stockton-modesto-merced-turlock-clean-truck-check": "/stockton-clean-truck-check",
    "/east-bay-mobile-carb-testing": "/areas#east-bay",
    "/s/Engine-Tag-Info-for-Smoke-Opacity-Tests.pdf": "/faq",
    "hayward_area_compliance_center.html": "/areas#hayward",
}

# Index-card blurbs for the three hand-written posts (kept from the old index).
SITE_POST_BLURBS = {
    "carb-clean-truck-check": "Everything you need to know about California's Clean Truck Check program — OBD vs OVI testing, who needs it, and how to stay compliant.",
    "how-mobile-carb-testing-works": "Walk through the mobile testing process from booking to paperwork. No waiting rooms — we test your trucks on-site at your yard.",
    "2026-carb-testing-deadlines": "Key compliance dates fleet operators need to know for 2026, including twice-yearly testing requirements and penalty thresholds.",
}

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def esc(s):
    return html.escape(s, quote=True)


def plain_text(fragment):
    txt = re.sub(r"<[^>]+>", " ", fragment)
    txt = html.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


def truncate(txt, limit):
    if len(txt) <= limit:
        return txt
    cut = txt[: limit - 1].rsplit(" ", 1)[0]
    return cut.rstrip(",;:.") + "…"


def rewrite_href(href):
    href = href.strip()
    # authoring artifacts seen in the recovered content
    href = href.replace("mailto:sales@norcarbmobile.com", "mailto:sales@norcalcarbmobile.com")
    if href.startswith("mailto:"):
        href = href.rstrip("?")
    if href == "https://ww2.arb.ca.gov/cleantruckcheck.arb.ca.gov":
        href = "https://cleantruckcheck.arb.ca.gov/"
    if href.startswith("safari-reader://"):
        href = "https://" + href[len("safari-reader://"):]
    # absolute links to our own domains → site-relative
    m = re.match(
        r"^https?://(?:www\.)?(?:norcalcarbmobile\.com|aqua-alpaca-m37c\.squarespace\.com)(/[^\"]*)?$",
        href,
    )
    if m:
        href = m.group(1) or "/"
    if href.startswith(("mailto:", "tel:", "http", "#")):
        return href
    path = href.split("?")[0].split("#")[0]
    if path in LINK_MAP:
        return LINK_MAP[path]
    # WXR tag-archive links have no equivalent page on the static site
    if path.startswith(("/blog/tag/", "/tag/")):
        return "/blog"
    if path == "/clean-truck-check-blog" or path.startswith("/clean-truck-check-blog"):
        seg = path.rstrip("/").split("/")[-1]
        if seg and seg != "clean-truck-check-blog":
            # legacy posts keep their exact old URL; only unrecoverable ones remap
            return LEGACY_FALLBACKS.get(seg, f"/clean-truck-check-blog/{seg}")
        return "/blog"
    return href


def clean_content(raw):
    c = raw
    # browsers close a script on `</script` followed by whitespace or any junk
    # before `>`, so the end-tag match must be equally permissive (CodeQL
    # py/bad-tag-filter)
    c = re.sub(r"<script\b.*?</script\b[^>]*>", "", c, flags=re.S | re.I)
    # a single h1 per page: demote in-body h1s
    c = re.sub(r"<(/?)h1\b", r"<\1h2", c, flags=re.I)
    # Squarespace CTA class → site button style
    c = c.replace('class="cta-button"', 'class="btn btn-primary"')
    # pre-wrap paragraphs render newlines as line breaks on Squarespace; the site
    # CSS normalizes white-space, so make those breaks explicit
    def brize(m):
        return m.group(1) + m.group(2).replace("\n", "<br>") + "</p>"
    c = re.sub(
        r'(<p[^>]*white-space:pre-wrap[^>]*>)(.*?)</p>',
        brize,
        c,
        flags=re.S,
    )
    # WordPress [caption] shortcodes from the WXR export → <figure>/<figcaption>
    def captionize(m):
        inner = m.group(1).strip()
        img = re.search(r"<img\b[^>]*/?>", inner)
        if img:
            text = re.sub(r"<img\b[^>]*/?>", "", inner).strip()
            cap = f"<figcaption>{text}</figcaption>" if text else ""
            return f"<figure>{img.group(0)}{cap}</figure>"
        return inner
    c = re.sub(r"\[caption\b[^\]]*\](.*?)\[/caption\]", captionize, c, flags=re.S)
    # accessibility/validity: images without alt get an empty (decorative) alt
    c = re.sub(r"<img\b(?![^>]*\balt=)([^>]*?)(/?)>", r'<img\1 alt=""\2>', c)
    c = re.sub(r'href="([^"]*)"', lambda m: f'href="{rewrite_href(m.group(1))}"', c)
    return c.strip()


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title_esc} — NorCal CARB Mobile</title>
  <meta name="description" content="{desc_esc}">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{title_esc} — NorCal CARB Mobile">
  <meta property="og:description" content="{desc_esc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">
  {jsonld}
  </script>
  <style>
    .post-body img {{ max-width: 100%; height: auto; border-radius: 8px; }}
    .post-body p, .post-body li {{ white-space: normal; }}
    .post-body h2, .post-body h3, .post-body h4 {{ margin-top: 1.4em; }}
    .post-body blockquote {{ border-left: 4px solid var(--green); margin: 1em 0; padding: .25em 0 .25em 1em; color: var(--muted); }}
  </style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img class="brand-logo" src="/assets/img/norcal-carb-mobile-logo-250th.png" alt="NorCal CARB Mobile" width="56" height="56" loading="eager">
    </a>
    <nav class="nav" aria-label="Primary">
      <button class="menu-toggle" aria-label="Menu" onclick="this.closest('.nav').classList.toggle('open')"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>
      <a class="navlink" href="/">Home</a>
      <a class="navlink" href="/services">Services</a>
      <a class="navlink" href="/pricing">Pricing</a>
      <a class="navlink" href="/areas">Areas</a>
      <a class="navlink" href="/faq">FAQ</a>
      <a class="navlink" href="/blog">Blog</a>
      <a class="navlink" href="/contact">Contact</a>
      <span class="header-cta">
        <a class="btn btn-ghost btn-book" href="/contact">Book a Test</a>
        <a class="btn btn-call" href="tel:+19168904427">Call (916) 890-4427</a>
      </span>
    </nav>
  </div>
</header>

<main id="main">

  <section style="padding:48px 0 0">
    <div class="wrap" style="max-width:760px">
      <p style="margin-bottom:8px"><a href="/blog" style="color:var(--muted);font-size:.9rem">&larr; Back to blog</a></p>
      <h1>{title_esc}</h1>
      <p style="color:var(--muted);font-size:.9rem">Published {date_display} &middot; NorCal CARB Mobile</p>
    </div>
  </section>

  <section style="padding:32px 0 56px">
    <div class="wrap post-body" style="max-width:760px">

{content}

      <p style="margin-top:2em"><a class="btn btn-primary" href="/contact">Book a test</a> or call <a href="tel:+19168904427">(916) 890-4427</a> to schedule mobile Clean Truck Check testing.</p>

    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Ready to get compliant?</h2>
      <p>Book mobile Clean Truck Check testing anywhere in Northern California.</p>
      <div class="hero-cta center" style="justify-content:center">
        <a class="btn btn-ghost btn-lg" href="/contact">Book a Test</a>
        <a class="btn btn-ghost btn-lg" href="tel:+19168904427">Call (916) 890-4427</a>
      </div>
    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>NorCal CARB Mobile</h4>
        <p class="muted">Mobile CARB Clean Truck Check testing (OBD &amp; OVI). We come to your yard across Northern California.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p><a href="tel:+19168904427">(916) 890-4427</a><br>
        <a href="mailto:sales@norcalcarbmobile.com">sales@norcalcarbmobile.com</a></p>
      </div>
      <div>
        <h4>Service area</h4>
        <p class="muted">Sacramento · Stockton · Fairfield · San Jose · Bay Area</p>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; 2026 NorCal CARB Mobile LLC</span>
      <span><a href="/">Home</a> · <a href="/services">Services</a> · <a href="/pricing">Pricing</a> · <a href="/areas">Areas</a> · <a href="/faq">FAQ</a> · <a href="/blog">Blog</a> · <a href="/contact">Contact</a></span>
    </div>
  </div>
</footer>
</body>
</html>
"""


def post_path(post):
    """Site-relative URL for a post: legacy posts keep their exact old
    Squarespace path; the hand-written site posts live under /blog/."""
    prefix = "/blog" if post["source"] == "site" else "/clean-truck-check-blog"
    return f"{prefix}/{post['slug']}"


def build_post_page(post):
    title_plain = plain_text(post["title"])
    content = clean_content(post["content"])
    body_text = plain_text(content)
    excerpt = plain_text(post.get("excerpt") or "")
    desc = excerpt if 25 <= len(excerpt) <= 160 else truncate(body_text, 155)
    date = datetime.fromisoformat(post["publishedAt"].replace("Z", "+00:00"))
    url = f"{BASE_URL}{post_path(post)}"
    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title_plain,
            "description": desc,
            "author": {"@type": "Organization", "name": "NorCal CARB Mobile"},
            "publisher": {"@type": "Organization", "name": "NorCal CARB Mobile"},
            "datePublished": date.strftime("%Y-%m-%d"),
            "url": url,
        },
        ensure_ascii=False,
        indent=2,
    )
    return PAGE_TEMPLATE.format(
        title_esc=esc(title_plain),
        desc_esc=esc(desc),
        url=url,
        jsonld=jsonld,
        date_display=date.strftime("%B %-d, %Y"),
        content=content,
    )


INDEX_CARD = """        <a href="{path}" class="card" style="text-decoration:none;color:inherit">
          <p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">{month_year}</p>
          <h3 style="color:var(--green);font-size:1.05rem">{title_esc}</h3>
          <p style="color:var(--body);font-size:.95rem">{blurb_esc}</p>
          <span style="color:var(--green);font-weight:600;font-size:.9rem">Read more &rarr;</span>
        </a>
"""

INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog — NorCal CARB Mobile</title>
  <meta name="description" content="CARB Clean Truck Check news, deadlines, and compliance tips from NorCal CARB Mobile. Stay current on OBD and OVI testing requirements for California fleets.">
  <link rel="canonical" href="https://norcalcarbmobile.com/blog">
  <meta property="og:title" content="Blog — NorCal CARB Mobile">
  <meta property="og:description" content="CARB Clean Truck Check news, fleet compliance tips, and testing deadlines for Northern California.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://norcalcarbmobile.com/blog">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img class="brand-logo" src="/assets/img/norcal-carb-mobile-logo-250th.png" alt="NorCal CARB Mobile" width="56" height="56" loading="eager">
    </a>
    <nav class="nav" aria-label="Primary">
      <button class="menu-toggle" aria-label="Menu" onclick="this.closest('.nav').classList.toggle('open')"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>
      <a class="navlink" href="/">Home</a>
      <a class="navlink" href="/services">Services</a>
      <a class="navlink" href="/pricing">Pricing</a>
      <a class="navlink" href="/areas">Areas</a>
      <a class="navlink" href="/faq">FAQ</a>
      <a class="navlink" href="/blog">Blog</a>
      <a class="navlink" href="/contact">Contact</a>
      <span class="header-cta">
        <a class="btn btn-ghost btn-book" href="/contact">Book a Test</a>
        <a class="btn btn-call" href="tel:+19168904427">Call (916) 890-4427</a>
      </span>
    </nav>
  </div>
</header>

<main id="main">

  <section class="hero" style="padding:48px 0 36px">
    <div class="wrap">
      <h1>CARB Testing Blog</h1>
      <p class="lede">News, compliance tips, and deadline alerts for California fleet operators and truck owners — {count} posts and counting.</p>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="grid grid-3">

{cards}
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Need your trucks tested?</h2>
      <p>Book mobile Clean Truck Check testing anywhere in Northern California. Same-week and Saturday appointments available.</p>
      <div class="hero-cta center" style="justify-content:center">
        <a class="btn btn-ghost btn-lg" href="/contact">Book a Test</a>
        <a class="btn btn-ghost btn-lg" href="tel:+19168904427">Call (916) 890-4427</a>
      </div>
    </div>
  </section>

</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>NorCal CARB Mobile</h4>
        <p class="muted">Mobile CARB Clean Truck Check testing (OBD &amp; OVI). We come to your yard across Northern California.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p><a href="tel:+19168904427">(916) 890-4427</a><br>
        <a href="mailto:sales@norcalcarbmobile.com">sales@norcalcarbmobile.com</a></p>
      </div>
      <div>
        <h4>Service area</h4>
        <p class="muted">Sacramento · Stockton · Fairfield · San Jose · Bay Area</p>
      </div>
    </div>
    <p class="center" style="margin-top:0;margin-bottom:8px;color:var(--muted);font-size:.88rem">OBD $75 · OVI $199 · Motorhome $99/$229 · San Diego OBD $119 · OVI $219</p>
    <p class="center" style="margin-top:0;margin-bottom:16px;color:var(--muted);font-size:.82rem;font-style:italic">Pricing is always subject to change due to matters out of our control.</p>
    <div class="foot-bottom">
      <span>&copy; 2026 NorCal CARB Mobile LLC</span>
      <span><a href="/">Home</a> · <a href="/services">Services</a> · <a href="/pricing">Pricing</a> · <a href="/areas">Areas</a> · <a href="/faq">FAQ</a> · <a href="/blog">Blog</a> · <a href="/contact">Contact</a></span>
    </div>
  </div>
</footer>
</body>
</html>
"""

STATIC_SITEMAP_PATHS = [
    "/",
    "/services",
    "/pricing",
    "/areas",
    "/faq",
    "/blog",
    "/contact",
    "/sacramento-carb-testing",
    "/stockton-clean-truck-check",
    "/bay-area-mobile-carb",
]


def main():
    posts = json.loads(MANIFEST.read_text())
    published = [p for p in posts if p["slug"] not in LEGACY_FALLBACKS]
    generated = [p for p in published if p["source"] != "site"]

    for p in published:
        assert SLUG_RE.match(p["slug"]), f"unsafe slug: {p['slug']}"

    LEGACY_DIR.mkdir(exist_ok=True)
    for p in generated:
        (LEGACY_DIR / f"{p['slug']}.html").write_text(build_post_page(p))
    # clean up pages from the earlier /blog/<slug> layout
    site_slugs = {p["slug"] for p in published if p["source"] == "site"}
    for f in BLOG_DIR.glob("*.html"):
        if f.stem != "index" and f.stem not in site_slugs:
            f.unlink()
    print(f"wrote {len(generated)} post pages under /clean-truck-check-blog/")

    # ---- blog index (all published posts, newest first) ----
    cards = []
    for p in sorted(published, key=lambda p: p["publishedAt"], reverse=True):
        title_plain = plain_text(p["title"])
        if p["slug"] in SITE_POST_BLURBS:
            blurb = SITE_POST_BLURBS[p["slug"]]
        else:
            excerpt = plain_text(p.get("excerpt") or "")
            body_text = plain_text(clean_content(p["content"]))
            blurb = excerpt if 40 <= len(excerpt) <= 200 else truncate(body_text, 140)
        date = datetime.fromisoformat(p["publishedAt"].replace("Z", "+00:00"))
        cards.append(
            INDEX_CARD.format(
                path=post_path(p),
                month_year=date.strftime("%B %Y"),
                title_esc=esc(title_plain),
                blurb_esc=esc(blurb),
            )
        )
    (BLOG_DIR / "index.html").write_text(
        INDEX_TEMPLATE.format(cards="\n".join(cards), count=len(published))
    )
    print(f"wrote blog index ({len(published)} posts)")

    # ---- sitemap ----
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for path in STATIC_SITEMAP_PATHS:
        lines.append(f"  <url><loc>{BASE_URL}{path}</loc><lastmod>{LASTMOD}</lastmod></url>")
    for p in sorted(published, key=lambda p: p["publishedAt"], reverse=True):
        lines.append(
            f"  <url><loc>{BASE_URL}{post_path(p)}</loc><lastmod>{LASTMOD}</lastmod></url>"
        )
    lines.append("</urlset>")
    SITEMAP.write_text("\n".join(lines) + "\n")
    print("wrote sitemap")

    # ---- worker redirect data ----
    legacy_slugs = sorted(p["slug"] for p in published if p["source"] != "site")
    # the three hand-written posts never lived on Squarespace; if someone guesses
    # an old-style URL for them, send them to the real /blog/<slug> page
    fallbacks = dict(LEGACY_FALLBACKS)
    for s in sorted(site_slugs):
        fallbacks[s] = f"/blog/{s}"
    js = [
        "/**",
        " * Generated by scripts/blog-migration/build_blog_pages.py — do not hand-edit.",
        " *",
        " * Routing data for the legacy Squarespace blog (/clean-truck-check-blog/...).",
        " * LEGACY_BLOG_SLUGS: migrated posts served at their exact old URL",
        " * /clean-truck-check-blog/<slug> (the /blog/<slug> variant 301s there).",
        " * LEGACY_BLOG_FALLBACKS: slugs with no page at the old path, keyed by the",
        " * final URL segment, pointing at the closest equivalent page.",
        " */",
        "export const LEGACY_BLOG_SLUGS = new Set([",
    ]
    js += [f"  {json.dumps(s)}," for s in legacy_slugs]
    js.append("]);")
    js.append("")
    js.append("export const LEGACY_BLOG_FALLBACKS = {")
    js += [f"  {json.dumps(k)}: {json.dumps(v)}," for k, v in fallbacks.items()]
    js.append("};")
    REDIRECTS_JS.write_text("\n".join(js) + "\n")
    print(f"wrote worker/blog-redirects.js ({len(legacy_slugs)} legacy slugs)")


if __name__ == "__main__":
    main()
