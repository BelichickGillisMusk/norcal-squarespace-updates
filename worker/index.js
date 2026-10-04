/**
 * Cloudflare Worker entry for the `norcalcarbmobile` worker.
 *
 * Serves the static site in ../site via the ASSETS binding, and handles the
 * contact form (POST /api/contact) by emailing the lead via Resend.
 *
 * Deploy:  wrangler deploy            (config in ../wrangler.jsonc, name = norcalcarbmobile)
 * Env vars: RESEND_API_KEY (required to send) · CONTACT_TO · CONTACT_FROM (optional)
 * Form To is always sales@ + carb@ + fsu9913@gmail.com (Resend accepts an array).
 * CONTACT_TO may add more addresses but cannot drop those three or add never-To
 * inboxes (mila@*, bgillis99@gmail.com, admin@mobilecarbsmoketest.com).
 * Always CCs OWNER_GMAIL (bryan@norcalcarbmobile.com) unless already in To.
 *
 * NOTE: the contact logic below mirrors site/functions/api/contact.js (the Pages
 * version). If you change one, change the other.
 */

import { GOOGLE_REVIEWS_URL, resolveRedirect } from './redirects.js';

const DEFAULT_TO = [
  'sales@norcalcarbmobile.com',
  'carb@norcalcarbmobile.com',
  'fsu9913@gmail.com',
];
const OWNER_GMAIL = 'bryan@norcalcarbmobile.com';
const NEVER_TO = [
  'bgillis99@gmail.com',
  'admin@mobilecarbsmoketest.com',
];
const DEFAULT_FROM = 'NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>';
const CURRENT_TERMS_VERSION = '2026-07-22';

const LOGO_URL = 'https://norcalcarbmobile.com/assets/img/ncm-logo.png';
const OG_IMAGE_URL = 'https://norcalcarbmobile.com/assets/img/norcal-carb-mobile-logo-web-512x512.png';

/** Cloudflare Web Analytics RUM beacon (Ally NAP). Injected sitewide before </body>. */
const CF_WEB_ANALYTICS_BEACON =
  `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "231f8b2f40e24c50b92870168dbb3f06"}'></script>`;

/** Favicon + Open Graph / Twitter share image. Injected sitewide. */
const BRANDING_TAGS = `
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="${OG_IMAGE_URL}">
<meta property="og:image:alt" content="NorCal CARB Mobile — Mobile Clean Truck Check">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="${OG_IMAGE_URL}">
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
const HTML_ESC = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
function esc(s) {
  return String(s || '').replace(/[<>&]/g, (c) => HTML_ESC[c]);
}

function parseAddressList(value) {
  const raw = Array.isArray(value) ? value : String(value == null ? '' : value).split(/[,;]+/);
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const email = String(item || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out;
}

function isNeverTo(email) {
  const key = String(email || '').trim().toLowerCase();
  if (!key) return true;
  if (NEVER_TO.includes(key)) return true;
  // Never route form leads to mila@ on any domain.
  return key.startsWith('mila@');
}

/** Resend `to` array: required form inboxes, plus any extra allowed CONTACT_TO addresses. */
function contactToList(env) {
  const extra = parseAddressList(env && env.CONTACT_TO).filter((email) => !isNeverTo(email));
  return parseAddressList([...DEFAULT_TO, ...extra]);
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

  const to = contactToList(env);
  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to,
    subject: `New test request: ${lead.name.replace(/[\r\n]/g, '')}${lead.location ? ' — ' + lead.location.replace(/[\r\n]/g, '') : ''}`,
    html,
  };
  const toLower = new Set(to.map((email) => email.toLowerCase()));
  if (!toLower.has(OWNER_GMAIL.toLowerCase())) {
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
    if (!r.ok) return respond(request, false, 'We couldn’t send that — please call (916) 890-4427.', 502);
  } catch {
    return respond(request, false, 'We couldn’t send that — please call (916) 890-4427.', 502);
  }

  return respond(request, true);
}

const ALIAS_DOMAINS = ['mobileovitest.com', 'www.mobileovitest.com'];
const CANONICAL_ORIGIN = 'https://norcalcarbmobile.com';
const WWW_HOST = 'www.norcalcarbmobile.com';
const APEX_HOST = 'norcalcarbmobile.com';

/** 301 with an absolute Location on the canonical https apex origin. */
function permanentRedirect(target) {
  const location = /^https?:\/\//.test(target) ? target : CANONICAL_ORIGIN + target;
  return new Response(null, {
    status: 301,
    headers: { 'Location': location, 'Cache-Control': 'public, max-age=86400' },
  });
}

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
    // Old Squarespace URLs + canonical-path normalization (trailing slash,
    // .html, /index.html) — all permanent 301s, one hop, before assets.
    const redirect = resolveRedirect(url.pathname, url.search);
    // www → apex and http → https in the SAME hop as any path fix. Today the
    // zone answers www/http before the Worker runs; if that zone rule is
    // removed (see PR notes), this keeps every variant to exactly one 301.
    // GET/HEAD only, so a form POST is never turned into a GET.
    const offCanonicalHost =
      url.hostname === WWW_HOST || (url.hostname === APEX_HOST && url.protocol === 'http:');
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    if (redirect) return permanentRedirect(redirect);
    if (offCanonicalHost && safeMethod) return permanentRedirect(url.pathname + url.search);

    // Everything else → static assets; inject branding, schema, and CF Web Analytics
    const assetRes = await env.ASSETS.fetch(request);
    const ct = assetRes.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return assetRes;
    // /404 is the error page itself: never answer it with 200 (soft 404).
    const isErrorPage = url.pathname === '/404';
    // HEAD has no body to rewrite — return the asset headers as-is (was a 500).
    if (request.method === 'HEAD') return isErrorPage ? notFound(assetRes) : assetRes;
    const page = new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(BRANDING_TAGS, { html: true });
          el.append(schemaTag(url.toString()), { html: true });
        },
      })
      .on('body', {
        element(el) {
          el.append(CF_WEB_ANALYTICS_BEACON, { html: true });
        },
      })
      .transform(assetRes);
    return isErrorPage ? notFound(page) : page;
  },
};

function notFound(res) {
  const headers = new Headers(res.headers);
  headers.set('X-Robots-Tag', 'noindex');
  return new Response(res.body, { status: 404, statusText: 'Not Found', headers });
}
