import { NORCAL_PRICES, PUBLIC_PHONE, VIN_CHECK_URL } from '../../worker/prices.js';

export { NORCAL_PRICES, PUBLIC_PHONE, VIN_CHECK_URL };

export const SITE = 'https://norcalcarbmobile.com';
export const GBP_CID = '16019693078134296096';
export const GBP_MAPS = `https://maps.google.com/?cid=${GBP_CID}`;

export function dollar(n) {
  return `$${n}`;
}

export function landerCtas({ callClass, bookClass, bookHref = '/contact', bookLabel = 'Book a Mobile Test' }) {
  return `<div class="hero-cta">
        <a class="${callClass}" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>
        <a class="${bookClass}" href="${bookHref}">${bookLabel}</a>
      </div>`;
}

export function priceCards({ leadWith = 'obd' } = {}) {
  const obd = `<div class="card price-card${leadWith === 'obd' ? '' : ''}">
        <h3>HD-OBD Periodic Test</h3>
        <div class="price">${dollar(NORCAL_PRICES.obd)}<small> / vehicle</small></div>
        <p>2013+ diesel &amp; 2018+ alt-fuel vehicles.</p>
      </div>`;
  const ovi = `<div class="card price-card feature">
        <h3>OVI Smoke Opacity Test</h3>
        <div class="price">${dollar(NORCAL_PRICES.ovi)}<small> / vehicle</small></div>
        <p>Pre-2013 &amp; non-OBD engines.</p>
      </div>`;
  const mh = `<div class="card price-card">
        <h3>Motorhome &amp; RV</h3>
        <div class="price">${dollar(NORCAL_PRICES.motorhomeObd)}<small> OBD</small> / ${dollar(NORCAL_PRICES.motorhomeOvi)}<small> OVI</small></div>
        <p>Diesel Class A, B, and C at your location.</p>
      </div>`;
  const cards = leadWith === 'ovi' ? [ovi, obd, mh] : [obd, ovi, mh];
  return `<div class="grid grid-3">
      ${cards.join('\n      ')}
    </div>`;
}

export function priceBand({ heading, intro, leadWith = 'obd', afterHtml = '' }) {
  return `<section class="soft">
  <div class="wrap">
    <div class="section-head">
      <h2>${heading}</h2>
      <p>${intro}</p>
    </div>
    ${priceCards({ leadWith })}
    ${afterHtml}
  </div>
</section>`;
}

export function faqBlock({ heading, items }) {
  const html = items
    .map(
      (item) =>
        `<p><strong>Q:</strong> ${item.q}<br>
        <strong>A:</strong> ${item.a}</p>`
    )
    .join('\n        ');
  return `<div class="card">
        <h2>${heading}</h2>
        ${html}
      </div>`;
}

export function ctaBand({ heading, lede, callFirst = false }) {
  const call = `<a class="btn btn-call btn-lg" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>`;
  const book = `<a class="btn btn-ghost btn-lg" href="/contact">Book a Mobile Test</a>`;
  const pair = callFirst ? `${call}\n      ${book}` : `${book}\n      ${call}`;
  return `<section class="cta-band">
  <div class="wrap">
    <h2>${heading}</h2>
    <p>${lede}</p>
    <div class="hero-cta center" style="justify-content:center">
      ${pair}
    </div>
  </div>
</section>`;
}

export function heroSection({
  eyebrow,
  h1Html,
  lede,
  callFirst = false,
  areasLine,
  mapAlt,
  chips,
}) {
  const callClass = callFirst ? 'btn btn-call btn-lg' : 'btn btn-ghost btn-lg';
  const bookClass = callFirst ? 'btn btn-primary btn-lg' : 'btn btn-primary btn-lg';
  const ctas = callFirst
    ? landerCtas({ callClass: 'btn btn-call btn-lg', bookClass: 'btn btn-primary btn-lg' })
    : `<div class="hero-cta">
        <a class="${bookClass}" href="/contact">Book a Mobile Test</a>
        <a class="${callClass}" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>
      </div>`;
  const chipHtml = chips.map((c) => `<span>${c}</span>`).join('');
  return `<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${h1Html}</h1>
      <p class="lede">${lede}</p>
      ${ctas}
      <p class="hero-areas">${areasLine}</p>
    </div>
    <div class="hero-map">
      <a href="/areas" aria-label="Explore Northern California service areas"><img src="/assets/img/coverage-map-v2.png" width="1126" height="1200" alt="${mapAlt}" loading="eager" decoding="async"></a>
      <div class="route-chips" aria-label="Service corridors">
        ${chipHtml}
      </div>
    </div>
  </div>
</section>`;
}

export function siteHeader() {
  return `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img class="brand-logo" src="/assets/img/ncm-logo.png" alt="NorCal CARB Mobile" width="56" height="56" loading="eager">
    </a>
    <nav class="nav" aria-label="Primary">
      <button class="menu-toggle" aria-label="Menu" onclick="this.closest('.nav').classList.toggle('open')"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>
      <a class="navlink" href="/">Home</a>
      <a class="navlink" href="/about">About</a>
      <a class="navlink" href="/services">Services</a>
      <a class="navlink" href="/pricing">Pricing</a>
      <a class="navlink" href="/areas">Areas</a>
      <a class="navlink" href="/faq">FAQ</a>
      <a class="navlink" href="/blog">Blog</a>
      <a class="navlink" href="/contact">Contact</a>
      <span class="header-cta">
        <a class="btn btn-ghost btn-book" href="/contact">Book a Test</a>
        <a class="btn btn-call" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>
      </span>
    </nav>
  </div>
</header>`;
}

export function mobileCallbar() {
  return `<div class="mobile-callbar" aria-label="Call now">
  <a class="btn btn-book" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>
  <a class="btn btn-call" href="/contact">Book a Mobile Test</a>
</div>`;
}

export function siteFooter() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>NorCal CARB Mobile</h4>
        <p class="muted">Mobile CARB Clean Truck Check testing (OBD &amp; OVI). We come to your yard across Northern California.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p><a href="${PUBLIC_PHONE.href}">${PUBLIC_PHONE.display}</a><br>
        <a href="mailto:sales@norcalcarbmobile.com">sales@norcalcarbmobile.com</a></p>
      </div>
      <div>
        <h4>Service area</h4>
        <p class="muted">Sacramento · Stockton · Fairfield · San Jose · Bay Area</p>
      </div>
    </div>
    <p class="center" style="margin-top:0;margin-bottom:8px;color:var(--muted);font-size:.88rem">OBD ${dollar(NORCAL_PRICES.obd)} · OVI ${dollar(NORCAL_PRICES.ovi)} · Motorhome ${dollar(NORCAL_PRICES.motorhomeObd)}/${dollar(NORCAL_PRICES.motorhomeOvi)} · San Diego County: call for pricing</p>
    <p class="center" style="margin-top:0;margin-bottom:16px;color:var(--muted);font-size:.82rem;font-style:italic">Pricing is always subject to change due to matters out of our control.</p>
    <div class="social" aria-label="Follow NorCal CARB Mobile">
      <a href="https://www.facebook.com/carbcleantruckcheck/" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 22v-8h2.7l.4-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9V11H7.5v3H10v8h3z"/></svg></a>
      <a href="https://www.instagram.com/carb.mobiletruckcheck/" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.4 5.6 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.6 18.4 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg></a>
      <a href="https://x.com/carbcleantruck" target="_blank" rel="noopener" aria-label="X (Twitter)" title="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.6l-5.2-6.8L5.2 22H2l7.8-8.9L1.5 2h6.8l4.7 6.2L18.9 2zm-2.3 18h1.8L7.5 3.8H5.6L16.6 20z"/></svg></a>
      <a href="https://www.youtube.com/@CARBCLEANTRUCKMOBILE" target="_blank" rel="noopener" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7c-.2-.8-.9-1.5-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4c-.8.2-1.5.9-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.8.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.7.4-4.7zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg></a>
      <a href="https://share.google/CUg6TEK1p3eO34S9G" target="_blank" rel="noopener" aria-label="Google Business Profile" title="Google Business Profile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg></a>
      <a class="reviews-pill" href="https://www.google.com/search?q=NorCal+CARB+Mobile+reviews#lrd=0x4e7c7c20def2c42d:0xac8d2d40ef5c9451,1,,,," target="_blank" rel="noopener" title="Read our Google reviews">★ 5.0 · 34 on Google</a>
    </div>
    <p class="center muted" style="margin:0 0 14px">Owned and operated by NorCal CARB Mobile LLC · CARB tester ID IF530523</p>
    <div class="foot-bottom">
      <span>&copy; 2026 NorCal CARB Mobile LLC</span>
      <span><a href="/">Home</a> · <a href="/about">About</a> · <a href="/services">Services</a> · <a href="/pricing">Pricing</a> · <a href="/areas">Areas</a> · <a href="/faq">FAQ</a> · <a href="/blog">Blog</a> · <a href="/contact">Contact</a></span>
    </div>
  </div>
</footer>`;
}

export function mapReviewsSection() {
  return `<section class="soft" id="map-reviews">
    <div class="wrap">
      <div class="section-head">
        <h2>Find NorCal CARB Mobile on Google</h2>
        <p>One Google Business Profile for the company — we come to your yard. <a href="${GBP_MAPS}" target="_blank" rel="noopener">Open our Google Business Profile · map &amp; reviews</a></p>
      </div>
      <div class="map-embed" style="overflow:hidden;border-radius:12px;border:1px solid #e4e4e7">
        <iframe title="NorCal CARB Mobile — Google Maps" src="https://maps.google.com/maps?cid=${GBP_CID}&amp;hl=en&amp;z=10&amp;output=embed" width="100%" height="360" style="border:0;display:block" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
      <p class="muted" style="margin-top:12px;text-align:center"><a href="${GBP_MAPS}" target="_blank" rel="noopener">★★★★★ Read &amp; leave a Google review</a> · Call <a href="${PUBLIC_PHONE.href}">${PUBLIC_PHONE.display}</a> · <a href="mailto:sales@norcalcarbmobile.com">sales@norcalcarbmobile.com</a></p>
    </div>
  </section>`;
}

export function documentShell({ title, description, canonicalPath, ogTitle, schema, openBar, mainHtml }) {
  const canonical = `${SITE}${canonicalPath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <script type="application/ld+json">
  ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ')}
  </script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

${siteHeader()}

<p class="open-bar"><span class="wrap">${openBar}</span></p>

<main id="main">
${mainHtml}
</main>

${mobileCallbar()}

${siteFooter()}
</body>
</html>
`;
}

export function norcalOffers(leadWith = 'obd') {
  const obd = { '@type': 'Offer', name: 'HD-OBD', price: String(NORCAL_PRICES.obd), priceCurrency: 'USD' };
  const ovi = { '@type': 'Offer', name: 'OVI', price: String(NORCAL_PRICES.ovi), priceCurrency: 'USD' };
  return leadWith === 'ovi' ? [ovi, obd] : [obd, ovi];
}

export function serviceSchema({ name, areaServed, extraGraph = [], leadWith = 'obd' }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE}/#business`,
        name: 'NorCal CARB Mobile LLC',
        alternateName: 'NorCal CARB Mobile',
        url: SITE,
        telephone: PUBLIC_PHONE.schema,
        areaServed,
      },
      {
        '@type': 'Service',
        name,
        serviceType: 'CARB Clean Truck Check (HD I/M) emissions testing',
        provider: { '@id': `${SITE}/#business` },
        areaServed,
        offers: norcalOffers(leadWith),
      },
      ...extraGraph,
    ],
  };
}
