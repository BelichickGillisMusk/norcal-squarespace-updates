/**
 * Cloudflare Worker entry for the `norcalcarbmobile` worker.
 *
 * Serves the static site in ../site via the ASSETS binding, and handles the
 * contact form (POST /api/contact) by emailing the lead via Resend.
 *
 * Deploy:  wrangler deploy            (config in ../wrangler.jsonc, name = norcalcarbmobile)
 * Env vars: RESEND_API_KEY (required to send) · CONTACT_TO · CONTACT_FROM (optional)
 * Always CCs OWNER_GMAIL (bryan@norcalcarbmobile.com) on contact leads.
 *
 * NOTE: the contact logic below mirrors site/functions/api/contact.js (the Pages
 * version). If you change one, change the other.
 */

import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

const DEFAULT_TO = 'bgillis99@gmail.com';
const OWNER_GMAIL = 'bryan@norcalcarbmobile.com';
const DEFAULT_FROM = 'NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>';
const CURRENT_TERMS_VERSION = '2026-07-22';
const GOOGLE_REVIEWS_URL = 'https://maps.google.com/?cid=16019693078134296096';

const LOGO_URL = 'https://norcalcarbmobile.com/assets/img/norcal-carb-mobile-logo-250th.png';

/** Favicon + Open Graph / Twitter share image (Issue #49). Injected sitewide. */
const BRANDING_TAGS = `
<link rel="icon" href="${LOGO_URL}" type="image/png" sizes="any">
<link rel="apple-touch-icon" href="${LOGO_URL}">
<meta property="og:image" content="${LOGO_URL}">
<meta property="og:image:alt" content="NorCal CARB Mobile — Mobile Clean Truck Check">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="${LOGO_URL}">
<meta name="twitter:image:alt" content="NorCal CARB Mobile logo">
`;

function schemaTag(pageUrl) {
  const page = new URL(pageUrl);
  page.hash = '';
  const canonicalUrl = page.toString();
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // AutoRepair is the Google-recommended LocalBusiness subtype for emissions/test shops.
        // Do NOT self-serve aggregateRating/review stars here — use Google Business Profile reviews.
        '@type': ['AutoRepair', 'AutomotiveBusiness', 'LocalBusiness'],
        '@id': 'https://norcalcarbmobile.com/#business',
        name: 'NorCal CARB Mobile LLC',
        legalName: 'NorCal CARB Mobile LLC',
        alternateName: 'NorCal CARB Mobile',
        url: 'https://norcalcarbmobile.com/',
        telephone: '+1-916-890-4427',
        email: 'sales@norcalcarbmobile.com',
        image: LOGO_URL,
        logo: { '@type': 'ImageObject', url: LOGO_URL },
        priceRange: '$75-$229',
        description: 'Mobile CARB Clean Truck Check testing for heavy-duty vehicles. Certified OBD and OVI smoke opacity testing at customer yards and jobsites across Northern California, with service available in San Diego County by appointment.',
        knowsAbout: [
          'CARB Clean Truck Check',
          'SAE J1667 Smoke Opacity Testing',
          'Heavy-Duty Diesel Emissions Compliance',
          'OBD Clean Truck Check Testing',
          'OVI Clean Truck Check Testing'
        ],
        areaServed: [
          'Sacramento County', 'Placer County', 'El Dorado County', 'Yolo County',
          'Yuba County', 'Butte County', 'San Joaquin County', 'Contra Costa County',
          'Solano County', 'Napa County', 'Santa Clara County', 'Sonoma County',
          'Alameda County', 'Stanislaus County', 'Merced County', 'Fresno County',
          'Tulare County', 'Tuolumne County', 'San Diego County'
        ].map((name) => ({ '@type': 'AdministrativeArea', name })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Mobile CARB Testing Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'OBD Clean Truck Check', serviceType: 'HD-OBD Clean Truck Check' }, price: 75, priceCurrency: 'USD' },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'OVI Smoke Opacity Test', serviceType: 'SAE J1667 OVI Smoke Opacity' }, price: 199, priceCurrency: 'USD' },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Motorhome OBD', serviceType: 'Motorhome HD-OBD' }, price: 99, priceCurrency: 'USD' },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Motorhome OVI', serviceType: 'Motorhome OVI Smoke Opacity' }, price: 229, priceCurrency: 'USD' }
          ]
        },
        sameAs: [
          'https://www.facebook.com/carbcleantruckcheck/',
          'https://www.instagram.com/carb.mobiletruckcheck/',
          'https://x.com/carbcleantruck',
          'https://www.youtube.com/@CARBCLEANTRUCKMOBILE',
          GOOGLE_REVIEWS_URL
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://norcalcarbmobile.com/#website',
        url: 'https://norcalcarbmobile.com/',
        name: 'NorCal CARB Mobile',
        publisher: { '@id': 'https://norcalcarbmobile.com/#business' }
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        isPartOf: { '@id': 'https://norcalcarbmobile.com/#website' },
        about: { '@id': 'https://norcalcarbmobile.com/#business' }
      }
    ]
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
/**
 * Old Squarespace URL → new path.  All return 301 so search engines
 * update their indexes and any inbound links keep working.
 */
const REDIRECTS = {
  // → external Google Business Profile / reviews
  '/reviews': GOOGLE_REVIEWS_URL,
  '/google': GOOGLE_REVIEWS_URL,
  '/leave-review': GOOGLE_REVIEWS_URL,

  // → homepage
  '/carb-services': '/',
  '/store': '/',

  // → /contact
  '/bookcontact': '/contact',
  '/book-schedule-carb-smoke-test-sacramento': '/contact',
  '/contact-us': '/contact',

  // → /pricing
  '/clean-truck-check-rates': '/pricing',

  // → /services
  '/clean-truck-check': '/services#obd',
  '/smoke-opacity-test-near-me': '/services#ovi',
  '/motorhome': '/services#motorhome',
  '/agricultural-vehicles-clean-truck-check': '/services#agricultural',
  '/services-mobile-ovi-smoke': '/services',

  // → /faq
  '/carb-questions-and-answers': '/faq',
  '/what-is-clean-truck-check': '/faq',
  '/faqs-carb-clean-truck-check-mobile': '/faq',
  '/carb-resources': '/faq',
  '/qa-and-glossary': '/faq',
  '/carb-mobile-app': '/faq',
  '/carb-penalties-deadlines': '/faq',

  // → /areas
  '/carb-locations': '/areas',
  '/service-area-sacramento-carb-testing': '/sacramento-carb-testing',
  '/clean-truck-check-napa-st-helena-calistoga': '/areas#napa',
  '/north-bay-carb-mobile-testing': '/areas#north-bay',
  '/east-bay-mobile-carb-testing': '/areas#east-bay',
  '/clean-truck-check-bay-area': '/areas#bay-area',
  '/tracy-livermore-clean-truck-check-j1667': '/areas#tracy',
  '/clean-truck-check-fresno': '/areas#central-valley',
  '/clean-truck-check-hayward': '/areas#hayward',
  '/clean-truck-check-fairfield': '/areas#fairfield',
  '/service-area-butte-county-clean-truck-check': '/areas#butte',
  '/service-area-san-joaquin-county-mobile-testing': '/areas#san-joaquin',
  '/san-jose-mobile-carb-testing': '/areas#san-jose',
  '/clean-truck-check-lodi': '/areas#lodi',
  '/clean-truck-check-roseville': '/areas#roseville',
  '/carb-mobile-clean-truck-check-antioch-california': '/areas#antioch',
  '/clean-truck-check-san-diego': '/areas#san-diego',
  '/clean-truck-check-orange-county': '/areas#orange-county',
  '/service-locations': '/areas',
  '/new-page': '/areas',
  '/qa-glossary': '/faq',
  '/norcal-carb-mobile-2026': '/',
  '/services/opacity-smoke-test/': '/services#ovi',
  '/carb-clean-truck-check-store': '/pricing',
  '/service-locations/blog-post-title-four-6x6kf': '/',
  '/anitoch-clean-truck-check': '/bay-area-mobile-carb',
  '/antioch-clean-truck-check': '/bay-area-mobile-carb',

  // → homepage #reviews section (no standalone reviews page yet)
  '/clean-truck-top-review': '/#reviews',
  '/reviews-service-area': '/#reviews',

  // GSC / legacy broken paths (2026-08-07 audit — admin@ GSC top pages + crawl)
  '/privacy': '/testing-terms',
  '/privacy.html': '/testing-terms',
  '/terms': '/testing-terms',
  '/terms.html': '/testing-terms',
  '/terms-of-service': '/testing-terms',
  '/glossary': '/faq',
  '/glossary.html': '/faq',
  '/team': '/for-clients',
  '/team.html': '/for-clients',
  '/s/marketing-landing.html': '/',
  '/marketing-landing': '/',
  '/contact-us.html': '/contact',
  '/services-mobile-ovi-smoke.html': '/services',
  '/clean-truck-check.html': '/services',
  '/service-locations.html': '/areas',
  '/faqs-carb-clean-truck-check-mobile.html': '/faq',
  '/carb-resources.html': '/faq',
  '/carb-penalties-deadlines.html': '/faq',
  '/smoke-opacity-test-near-me.html': '/services#ovi',
  '/agricultural-vehicles-clean-truck-check.html': '/services#agricultural',
  '/book': '/contact',
  '/booking': '/contact',
};

/**
 * Blog routing. Migrated Squarespace posts are served at their EXACT old URL,
 * /clean-truck-check-blog/<slug> (per Bryan — keep the old slugs/paths live).
 *
 * Returns a redirect target, or null to fall through to static assets:
 *  - /blog/<legacy-slug>                → 301 to the old path (early /blog layout)
 *  - /clean-truck-check-blog            → 301 to /blog (the index)
 *  - /clean-truck-check-blog/<slug>     → served directly (null)
 *  - date-based /clean-truck-check-blog/2025/10/8/<slug> → 301 to the flat old path
 *  - unrecoverable/unknown slugs        → closest equivalent page, else /blog
 */
function legacyBlogTarget(pathname) {
  const path = pathname.replace(/\/+$/, '');
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    return LEGACY_BLOG_SLUGS.has(slug) ? `/clean-truck-check-blog/${slug}` : null;
  }
  if (path !== '/clean-truck-check-blog' && !path.startsWith('/clean-truck-check-blog/')) return null;
  const slug = path.split('/').pop();
  if (slug === 'clean-truck-check-blog') return '/blog';
  if (LEGACY_BLOG_FALLBACKS[slug]) return LEGACY_BLOG_FALLBACKS[slug];
  if (LEGACY_BLOG_SLUGS.has(slug)) {
    const canonical = `/clean-truck-check-blog/${slug}`;
    return path === canonical ? null : canonical;
  }
  return '/blog';
}

const HTML_ESC = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
function esc(s) {
  return String(s || '').replace(/[<>&]/g, (c) => HTML_ESC[c]);
}

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return await request.json();
  const form = await request.formData();
  const obj = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === 'string' ? v : '';
  return obj;
}

function respond(request, ok, message, status) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error: message }), {
      status: status || (ok ? 200 : 400),
      headers: { 'content-type': 'application/json' },
    });
  }
  const location = ok ? '/contact?sent=1' : '/contact?error=1';
  return new Response(null, { status: 303, headers: { Location: location } });
}

async function handleContact(request, env) {
  let data;
  try {
    data = await readBody(request);
  } catch {
    return respond(request, false, 'Please try again, or call us at (916) 890-4427.', 400);
  }

  // Honeypot — bots fill "company"; humans never see it.
  if (data.company) return respond(request, true);

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  if (!name || !phone) return respond(request, false, 'Please include your name and a phone number.', 422);

  const termsAccepted = String(data.terms_accepted || '').toLowerCase() === 'yes';
  if (!termsAccepted) {
    return respond(request, false, 'Please accept the Testing Terms & Customer Rights before sending your request.', 422);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return respond(request, false, 'Please call us directly at (916) 890-4427 to book your test.', 503);

  const lead = {
    name,
    phone,
    email: (data.email || '').trim(),
    location: (data.location || '').trim(),
    service: (data.service || '').trim(),
    message: (data.message || '').trim(),
    termsVersion: (data.terms_version || CURRENT_TERMS_VERSION).trim(),
    submittedAt: new Date().toISOString(),
  };

  const html = `
    <h2>New test request — norcalcarbmobile.com</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      <tr><td><strong>Name</strong></td><td>${esc(lead.name)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${esc(lead.phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${esc(lead.email)}</td></tr>
      <tr><td><strong>Location</strong></td><td>${esc(lead.location)}</td></tr>
      <tr><td><strong>Service</strong></td><td>${esc(lead.service)}</td></tr>
      <tr><td valign="top"><strong>Details</strong></td><td>${esc(lead.message).replace(/\n/g, '<br>')}</td></tr>
      <tr><td><strong>Terms accepted</strong></td><td>Yes — version ${esc(lead.termsVersion)}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${esc(lead.submittedAt)}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#555">New lead from the website contact form. Call or text them to confirm schedule and payment.</p>`;

  const primaryTo = env.CONTACT_TO || DEFAULT_TO;
  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [primaryTo],
    // Always CC owner Gmail on contact leads (skip if already primary To).
    subject: `New test request: ${lead.name.replace(/[\r\n]/g, '')}${lead.location ? ' — ' + lead.location.replace(/[\r\n]/g, '') : ''}`,
    html,
  };
  if (String(primaryTo).toLowerCase() !== OWNER_GMAIL.toLowerCase()) {
    payload.cc = [OWNER_GMAIL];
  }
  const cleanEmail = lead.email.replace(/[\r\n]/g, '');
  if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) payload.reply_to = cleanEmail;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return respond(request, false, "Got it! We’ll call you shortly, or reach us at (916) 890-4427.", 502);
  } catch {
    return respond(request, false, "Got it! We’ll call you shortly, or reach us at (916) 890-4427.", 502);
  }

  return respond(request, true);
}

const ALIAS_DOMAINS = ['mobileovitest.com', 'www.mobileovitest.com'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirect alias domains to the canonical domain
    if (ALIAS_DOMAINS.includes(url.hostname)) {
      url.hostname = 'norcalcarbmobile.com';
      url.port = '';
      return new Response(null, {
        status: 301,
        headers: { 'Location': url.toString(), 'Cache-Control': 'public, max-age=86400' },
      });
    }

    if (url.pathname === '/api/contact') {
      if (request.method === 'POST') return handleContact(request, env);
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    // Check for old Squarespace URL redirects
    const redirect =
      legacyBlogTarget(url.pathname) ||
      REDIRECTS[url.pathname] ||
      REDIRECTS[url.pathname.replace(/\/$/, '')];
    if (redirect) {
      return new Response(null, {
        status: 301,
        headers: { 'Location': redirect, 'Cache-Control': 'public, max-age=86400' },
      });
    }

    // Everything else → static assets; inject branding + schema into HTML responses
    const assetRes = await env.ASSETS.fetch(request);
    const ct = assetRes.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return assetRes;
    return new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(BRANDING_TAGS, { html: true });
          el.append(schemaTag(url.toString()), { html: true });
        },
      })
      .transform(assetRes);
  },
};
