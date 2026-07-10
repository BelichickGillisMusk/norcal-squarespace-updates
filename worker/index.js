/**
 * Cloudflare Worker entry for the `norcalcarbmobile` worker.
 *
 * Serves the static site in ../site via the ASSETS binding, and handles the
 * contact form (POST /api/contact) by emailing the lead via Resend.
 *
 * Deploy:  wrangler deploy            (config in ../wrangler.jsonc, name = norcalcarbmobile)
 * Env vars: RESEND_API_KEY (required to send) · CONTACT_TO · CONTACT_FROM (optional)
 *
 * NOTE: the contact logic below mirrors site/functions/api/contact.js (the Pages
 * version). If you change one, change the other.
 */

import { MIGRATED_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

const DEFAULT_TO = 'bgillis99@gmail.com';
const DEFAULT_FROM = 'NorCal CARB Mobile <noreply@mail.norcalcarbmobile.com>';

const SCHEMA_TAG = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "name": "NorCal CARB Mobile LLC",
  "legalName": "NorCal CARB Mobile LLC",
  "url": "https://norcalcarbmobile.com",
  "telephone": "+1-916-890-4427",
  "priceRange": "$$",
  "description": "Certified statewide mobile CARB Clean Truck Check provider executing official SAE J1667 smoke opacity testing and non-OBD compliance tracking across California.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4810 7th Avenue",
    "addressLocality": "Sacramento",
    "addressRegion": "CA",
    "postalCode": "95820",
    "addressCountry": "US"
  },
  "knowsAbout": [
    "CARB Clean Truck Check",
    "SAE J1667 Smoke Opacity Testing",
    "Heavy-Duty Diesel Emissions Compliance",
    "Non-OBD Truck Inspections",
    "OVI Clean Truck Check Compliance"
  ],
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Sacramento County" },
    { "@type": "AdministrativeArea", "name": "Butte County" },
    { "@type": "AdministrativeArea", "name": "San Joaquin County" },
    { "@type": "AdministrativeArea", "name": "Santa Clara County" },
    { "@type": "AdministrativeArea", "name": "Sonoma County" },
    { "@type": "AdministrativeArea", "name": "Alameda County" },
    { "@type": "AdministrativeArea", "name": "San Diego County" }
  ],
  "sameAs": [
    "https://www.facebook.com/carbcleantruckcheck/",
    "https://www.instagram.com/carb.mobiletruckcheck/",
    "https://x.com/carbcleantruck",
    "https://www.youtube.com/@CARBCLEANTRUCKMOBILE",
    "https://share.google/CUg6TEK1p3eO34S9G"
  ]
}
</script>`;

/**
 * Old Squarespace URL → new path.  All return 301 so search engines
 * update their indexes and any inbound links keep working.
 */
const REDIRECTS = {
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
  '/book-schedule-carb-smoke-test-sacramento': '/sacramento-carb-testing',
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
};

/**
 * Old Squarespace blog URLs (/clean-truck-check-blog and everything under it,
 * including date-based paths like /clean-truck-check-blog/2025/10/8/<slug>).
 * Migrated posts 301 to /blog/<slug>; posts whose content was unrecoverable
 * 301 to the closest equivalent page; anything unknown lands on /blog.
 */
function legacyBlogTarget(pathname) {
  const path = pathname.replace(/\/+$/, '');
  if (path !== '/clean-truck-check-blog' && !path.startsWith('/clean-truck-check-blog/')) return null;
  const slug = path.split('/').pop();
  if (slug === 'clean-truck-check-blog') return '/blog';
  if (LEGACY_BLOG_FALLBACKS[slug]) return LEGACY_BLOG_FALLBACKS[slug];
  if (MIGRATED_BLOG_SLUGS.has(slug)) return `/blog/${slug}`;
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

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return respond(request, false, 'Please call us directly at (916) 890-4427 to book your test.', 503);

  const lead = {
    name,
    phone,
    email: (data.email || '').trim(),
    location: (data.location || '').trim(),
    service: (data.service || '').trim(),
    message: (data.message || '').trim(),
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
    </table>`;

  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [env.CONTACT_TO || DEFAULT_TO],
    subject: `New test request: ${lead.name.replace(/[\r\n]/g, '')}${lead.location ? ' — ' + lead.location.replace(/[\r\n]/g, '') : ''}`,
    html,
  };
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

    // Everything else → static assets; inject schema into HTML responses
    const assetRes = await env.ASSETS.fetch(request);
    const ct = assetRes.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return assetRes;
    return new HTMLRewriter()
      .on('head', { element(el) { el.append(SCHEMA_TAG, { html: true }); } })
      .transform(assetRes);
  },
};
