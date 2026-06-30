#!/usr/bin/env node
/**
 * City landing page generator — NorCal CARB Mobile.
 *
 * Per the owner rule (CLAUDE.md): ONE REPO PER URL. These are the canonical "stock"
 * layout city sites. Each city folder is SELF-CONTAINED (its own index.html + styles.css)
 * so it can be lifted into its own repo/worker without touching anything else.
 *
 * Run from repo root:  node cities/_generate.mjs
 * Reads the stock styles from site/assets/styles.css and stamps one page per city.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const STYLES_SRC = path.join(ROOT, 'site', 'assets', 'styles.css');
const OUT = path.join(ROOT, 'cities');

const PHONE_DISPLAY = '(916) 890-4427';
const PHONE_TEL = '+19168904427';
const EMAIL = 'sales@norcalcarbmobile.com';
const GOOGLE_REVIEWS = 'https://www.google.com/search?q=NorCal+CARB+Mobile+reviews#lrd=0x4e7c7c20def2c42d:0xac8d2d40ef5c9451,1,,,,';

const CITIES = [
  { slug: 'fairfield', name: 'Fairfield', county: 'Solano',      nearby: ['Suisun City', 'Vacaville', 'Cordelia', 'Travis AFB'], zips: '94533, 94534, 94585' },
  { slug: 'hayward',   name: 'Hayward',   county: 'Alameda',     nearby: ['Union City', 'San Leandro', 'Castro Valley', 'Fremont'], zips: '94541, 94544, 94545' },
  { slug: 'lodi',      name: 'Lodi',      county: 'San Joaquin', nearby: ['Stockton', 'Galt', 'Acampo', 'Woodbridge'], zips: '95240, 95242' },
  { slug: 'roseville', name: 'Roseville', county: 'Placer',      nearby: ['Rocklin', 'Citrus Heights', 'Antelope', 'Granite Bay'], zips: '95661, 95678, 95747' },
];

function page(c) {
  const nearbyList = c.nearby.join(' · ');
  const nearbySentence = c.nearby.slice(0, -1).join(', ') + ' and ' + c.nearby[c.nearby.length - 1];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mobile CARB Clean Truck Check in ${c.name}, CA | NorCal CARB Mobile</title>
  <meta name="description" content="Mobile CARB Clean Truck Check testing in ${c.name}, CA. OBD $75 · OVI $199. We come to your yard in ${c.name} and ${nearbySentence}. 5.0★ · 33 Google reviews. Call ${PHONE_DISPLAY}.">
  <!-- TODO(canonical): set to this city's real URL once its domain is confirmed -->
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NorCal CARB Mobile LLC",
    "description": "Mobile CARB Clean Truck Check testing (OBD and OVI) in ${c.name}, ${c.county} County, CA — we come to your yard.",
    "url": "https://norcalcarbmobile.com",
    "telephone": "+1-916-890-4427",
    "email": "${EMAIL}",
    "priceRange": "$75-$199",
    "areaServed": ["${c.name}, CA", "${c.nearby.join('", "')}"],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "33", "bestRating": "5", "worstRating": "1" }
  }
  </script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <span class="brand-mark">NC</span>
      <span class="brand-name">NorCal CARB Mobile<small>${c.name} · Clean Truck Check</small></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <span class="header-cta">
        <a class="btn btn-primary" href="tel:${PHONE_TEL}">Call ${PHONE_DISPLAY}</a>
      </span>
    </nav>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap">
      <p class="reviews-line"><span class="stars">★★★★★</span> 5.0 · 33 Google reviews</p>
      <h1>Mobile CARB Clean Truck Check in <span>${c.name}, CA</span></h1>
      <p class="lede">OBD &amp; OVI Clean Truck Check testing in ${c.name} — we come to your yard. Serving ${c.name} and ${nearbySentence}, often the same week. No waiting rooms, no hold music.</p>
      <div class="hero-cta">
        <a class="btn btn-primary btn-lg" href="tel:${PHONE_TEL}">Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-ghost btn-lg" href="mailto:${EMAIL}?subject=Clean%20Truck%20Check%20in%20${encodeURIComponent(c.name)}">Email to book</a>
      </div>
      <p class="hero-areas">Serving ${c.name} · ${nearbyList}</p>
    </div>
  </section>

  <section id="pricing">
    <div class="wrap">
      <div class="section-head"><h2>${c.name} Clean Truck Check pricing</h2><p>Upfront, per vehicle, at your location. No surprise fees.</p></div>
      <div class="grid grid-3">
        <div class="card price-card"><h3>OBD Test</h3><div class="price">$75<small> / vehicle</small></div><p>On-board diagnostic check for most 2013+ trucks.</p><a class="btn btn-ghost" href="tel:${PHONE_TEL}">Book OBD</a></div>
        <div class="card price-card feature"><span class="badge">Most thorough</span><h3>OVI (Smoke) Test</h3><div class="price">$199<small> / vehicle</small></div><p>Opacity / smoke test for older or non-OBD vehicles and motorhomes.</p><a class="btn btn-primary" href="tel:${PHONE_TEL}">Book OVI</a></div>
        <div class="card price-card"><h3>Switch &amp; Save</h3><div class="price">50%<small> off 1st test</small></div><p>Already use another tester? Switch and your first ${c.name} test is half off.</p><a class="btn btn-ghost" href="tel:${PHONE_TEL}">Claim offer</a></div>
      </div>
      <p class="center" style="margin-top:22px;color:var(--muted)">Fleet &amp; multi-truck discounts available — <a href="tel:${PHONE_TEL}">call for a quote</a>.</p>
    </div>
  </section>

  <section class="soft" id="how">
    <div class="wrap">
      <div class="section-head"><h2>How it works in ${c.name}</h2><p>Three steps and you're compliant — usually within the week.</p></div>
      <div class="grid grid-3">
        <div class="step"><div class="num">1</div><h3>Call or email</h3><p>Tell us your ${c.name} location and how many trucks need testing.</p></div>
        <div class="step"><div class="num">2</div><h3>We come to you</h3><p>Our certified tester arrives at your yard or jobsite in ${c.name} — including Saturdays.</p></div>
        <div class="step"><div class="num">3</div><h3>Pass &amp; paperwork</h3><p>You get your result on the spot and we handle the CARB Clean Truck Check submission.</p></div>
      </div>
    </div>
  </section>

  <section id="area">
    <div class="wrap">
      <div class="card">
        <h2>Serving ${c.name} &amp; ${c.county} County</h2>
        <p>We test throughout ${c.name} and nearby ${nearbySentence}. Common ZIP codes: ${c.zips}. If you're a little outside the area, call and ask — we cover a wide stretch of Northern California.</p>
      </div>
    </div>
  </section>

  <section class="soft" id="reviews">
    <div class="wrap">
      <div class="section-head"><h2>Trusted by NorCal fleets</h2><p><span class="stars" style="color:var(--gold)">★★★★★</span> 5.0 stars · 33 Google reviews</p></div>
      <div class="grid grid-3">
        <blockquote class="card quote"><span class="stars">★★★★★</span>“Tested all six trucks in under two hours. Very professional.”<cite>— Google review</cite></blockquote>
        <blockquote class="card quote"><span class="stars">★★★★★</span>“Fair price, no upselling, no waiting.”<cite>— Google review</cite></blockquote>
        <blockquote class="card quote"><span class="stars">★★★★★</span>“Came out on a Saturday before our DMV deadline. Highly recommend.”<cite>— Google review</cite></blockquote>
      </div>
      <p class="center" style="margin-top:26px"><a class="btn btn-ghost" href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener">★ Read all 33 reviews on Google</a></p>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Get your ${c.name} trucks tested</h2>
      <p>Mobile Clean Truck Check in ${c.name} and ${nearbySentence}. Same-week and Saturday appointments.</p>
      <div class="hero-cta center" style="justify-content:center">
        <a class="btn btn-ghost btn-lg" href="tel:${PHONE_TEL}">Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-ghost btn-lg" href="mailto:${EMAIL}">Email to book</a>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div><h4>NorCal CARB Mobile — ${c.name}</h4><p class="muted">Mobile CARB Clean Truck Check (OBD &amp; OVI). We come to your yard in ${c.name} and ${c.county} County.</p></div>
      <div><h4>Contact</h4><p><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
      <div><h4>Service area</h4><p class="muted">${c.name} · ${nearbyList}</p></div>
    </div>
    <div class="social" aria-label="Follow NorCal CARB Mobile">
      <!-- TODO: real page URLs -->
      <a href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 22v-8h2.7l.4-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9V11H7.5v3H10v8h3z"/></svg></a>
      <a href="#" aria-label="X (Twitter)" title="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.6l-5.2-6.8L5.2 22H2l7.8-8.9L1.5 2h6.8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 3.8H5.6L16.6 20z"/></svg></a>
      <a href="#" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7c-.2-.8-.9-1.5-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4c-.8.2-1.5.9-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.8.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.7.4-4.7zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg></a>
      <a class="reviews-pill" href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener" title="Google reviews">★ 5.0 · 33 on Google</a>
    </div>
    <div class="foot-bottom"><span>&copy; 2026 NorCal CARB Mobile LLC</span><span>Mobile Clean Truck Check · ${c.name}, CA</span></div>
  </div>
</footer>
</body>
</html>
`;
}

const styles = fs.readFileSync(STYLES_SRC, 'utf8');
const favicon = fs.readFileSync(path.join(ROOT, 'site', 'favicon.svg'), 'utf8');
let count = 0;
for (const c of CITIES) {
  const dir = path.join(OUT, c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(c), 'utf8');
  fs.writeFileSync(path.join(dir, 'styles.css'), styles, 'utf8');
  fs.writeFileSync(path.join(dir, 'favicon.svg'), favicon, 'utf8');
  count++;
  console.log(`generated cities/${c.slug}/ (index.html + styles.css)`);
}
console.log(`\nDone: ${count} city sites.`);
