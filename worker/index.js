/**
 * Cloudflare Worker entry for the `norcalcarbmobile` worker.
 *
 * Serves the static site in ../site via the ASSETS binding, and handles the
 * contact form (POST /api/contact) by emailing the lead through the
 * Cloudflare Email Workers `send_email` binding (env.EMAIL). No Resend, no API key.
 *
 * Deploy:  push to main (Workers Builds runs wrangler deploy; config in ../wrangler.jsonc)
 * Binding: EMAIL (send_email) with allowed_destination_addresses = FORM_TO.
 * Email Routing on norcalcarbmobile.com only lets the binding send to verified
 * destination addresses (free on all plans). sales@ / carb@ / bryan@ are routed
 * addresses (catch-all forwards to bgillis99@gmail.com), so the form sends to the
 * verified Gmail destinations directly. Add an address here AND in the binding's
 * allowed_destination_addresses, and verify it in Email Routing first.
 *
 * NOTE: site/functions/api/contact.js is an old Pages copy that is not deployed.
 */

import { EmailMessage } from 'cloudflare:email';
import { LEGACY_BLOG_SLUGS, LEGACY_BLOG_FALLBACKS } from './blog-redirects.js';

// Verified Email Routing destinations. sales@norcalcarbmobile.com forwards to
// bgillis99@gmail.com; fsu9913@gmail.com is the third form inbox.
const FORM_TO = ['bgillis99@gmail.com', 'fsu9913@gmail.com'];
const FORM_FROM = { email: 'website@norcalcarbmobile.com', name: 'NorCal CARB Mobile Website' };
const CURRENT_TERMS_VERSION = '2026-07-22';
const GOOGLE_REVIEWS_URL = 'https://maps.google.com/?cid=16019693078134296096';

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
  const socal = page.pathname === '/socal' || page.pathname === '/socal/';
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
        priceRange: socal ? '$99-$249' : '$75-$229',
        description: socal
          ? 'Mobile OVI Test. OBD $99. OVI smoke $249. 50-mile radius of 92553, Moreno Valley.'
          : 'Mobile CARB Clean Truck Check testing for heavy-duty vehicles. Headquarters in Northern California. OBD $75. OVI $199.',
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
        ].map((name) => ({ '@type': 'AdministrativeArea', name })).concat(socal ? [{
          '@type': 'GeoCircle',
          name: '50 miles of 92553, Moreno Valley, CA',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 33.9425,
            longitude: -117.2297,
            postalCode: '92553',
            addressCountry: 'US',
          },
          geoRadius: 80467,
        }] : []),
        hasOfferCatalog: socal ? {
          '@type': 'OfferCatalog',
          name: 'Mobile OVI Test',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'OBD Clean Truck Check', serviceType: 'HD-OBD Clean Truck Check' }, price: 99, priceCurrency: 'USD' },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'OVI Smoke Opacity Test', serviceType: 'SAE J1667 OVI Smoke Opacity' }, price: 249, priceCurrency: 'USD' }
          ]
        } : {
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
  '/blog/check-compliance-carb-app': '/faq',
  '/clean-truck-check-blog/check-compliance-carb-app': '/faq',
  '/blog/vin-diesel-best-lunch-norcal-routes': '/blog',
  '/carb-penalties-deadlines': '/faq',

  // → /areas
  '/carb-locations': '/areas',
  '/service-area-sacramento-carb-testing': '/sacramento-carb-testing',
  '/clean-truck-check-napa-st-helena-calistoga': '/areas#napa',
  '/north-bay-carb-mobile-testing': '/areas#north-bay',
  '/east-bay-mobile-carb-testing': '/clean-truck-check-hayward',
  '/clean-truck-check-bay-area': '/carb-test-bay-area',
  '/tracy-livermore-clean-truck-check-j1667': '/areas#tracy',
  '/clean-truck-check-fresno': '/areas#central-valley',
  // Hayward now has its own full corridor page at /clean-truck-check-hayward
  // '/clean-truck-check-hayward': '/areas#hayward',
  // Fairfield now has its own full corridor page at /areas-fairfield
  '/clean-truck-check-fairfield': '/areas-fairfield',
  '/clean-truck-check-fairfield/': '/areas-fairfield',
  '/service-area-butte-county-clean-truck-check': '/areas#butte',
  '/service-area-san-joaquin-county-mobile-testing': '/areas#san-joaquin',
  '/san-jose-mobile-carb-testing': '/areas#san-jose',
  // Lodi now has its own full corridor page at /clean-truck-check-lodi
  // '/clean-truck-check-lodi': '/areas#lodi',
  '/clean-truck-check-roseville': '/areas#roseville',
  '/carb-mobile-clean-truck-check-antioch-california': '/areas#antioch',
  // San Diego County booking/pricing lives on the sibling site. Absolute Location
  // is returned as-is by the redirect handler. Trailing-slash keys are listed
  // because lookup is exact, then one trailing slash stripped.
  '/clean-truck-check-san-diego': 'https://mobilecarbsmoketest.com/',
  '/san-diego': 'https://mobilecarbsmoketest.com/',
  '/san-diego/': 'https://mobilecarbsmoketest.com/',
  '/areas/san-diego': 'https://mobilecarbsmoketest.com/',
  '/areas/san-diego/': 'https://mobilecarbsmoketest.com/',
  '/clean-truck-check-orange-county': '/areas#orange-county',
  '/service-locations': '/areas',
  // Legacy Squarespace path. One trailing slash is stripped in the lookup below.
  '/service-areas': '/areas',
  // Legacy alias — restore after 404 regression (Jennifer pulse 2026-09-27)
  '/locations': '/areas',
  // Aria COS 2026-10-06 — short aliases → carb-*-test landers; not sitemap.
  '/obd': '/carb-obd-test',
  '/ovi': '/carb-ovi-test',
  // Squarespace "New Page" stub. Stable Shorts URL is the facts hub.
  '/new-page': '/clean-truck-check-facts',
  '/new-page.html': '/clean-truck-check-facts',
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
  // Old Squarespace sitemap URLs still 404ing (Ally audit 2026-10-11).
  // Each target is an existing 200 page. Tag archives → /areas.
  '/home': '/',
  '/privacy-policy': '/testing-terms',
  '/terms-and-conditions': '/testing-terms',
  '/thank-you': '/contact',
  '/clean-truck-check-sacramento': '/sacramento-carb-testing',
  '/faqs-clean-truck-check-mobile-sacramento': '/faq',
  '/stockton-modesto-merced-turlock-clean-truck-check': '/carb-test-stockton',
  '/service-locations/carb-compliance-guide-for-truckers-in-merced-county-navigating-clean-truck-regulations': '/clean-truck-check-blog/carb-compliance-guide-for-truckers-in-merced-county-navigating-clean-truck-regulations',
  '/service-locations/carb-j1667-opacity-test-antioch-mobile-clean-truck-check': '/clean-truck-check-blog/carb-j1667-opacity-test-antioch-mobile-clean-truck-check',
  '/service-locations/four-counties-six-stops-one-day-keeping-california-fleets-carb-clean-truck': '/clean-truck-check-blog/four-counties-six-stops-one-day-keeping-california-fleets-carb-clean-truck',
  '/service-locations/how-norcal-carb-mobile-keeps-mitchell-concrete-moving-strong-in-rancho-cordova': '/clean-truck-check-blog/how-norcal-carb-mobile-keeps-mitchell-concrete-moving-strong-in-rancho-cordova',
  '/service-locations/keeping-pallets-moving-amp-trucks-carb-clean-a-partnership-with-all-good-pallets-stockton-ca': '/clean-truck-check-blog/keeping-pallets-moving-amp-trucks-carb-clean-a-partnership-with-all-good-pallets-stockton-ca',
  '/service-locations/keeping-republic-electric-wests-fleet-road-ready-how-norcal-carb-mobile-delivers-247-clean-truck-check-excellence': '/clean-truck-check-blog/keeping-republic-electric-wests-fleet-road-ready-how-norcal-carb-mobile-delivers-247-clean-truck-check-excellence',
  '/service-locations/keeping-sm-transport-rolling-how-norcal-carb-mobile-powers-on-time-deliveries': '/clean-truck-check-blog/keeping-sm-transport-rolling-how-norcal-carb-mobile-powers-on-time-deliveries',
  '/service-locations/mobile-clean-truck-checks-in-brentwood-and-beyond': '/clean-truck-check-blog/mobile-clean-truck-checks-in-brentwood-and-beyond',
  '/service-locations/motorhome-carb-testing-in-california-your-complete-guide': '/clean-truck-check-blog/motorhome-carb-testing-in-california-your-complete-guide',
  '/service-locations/napa-carb-clean-truck': '/clean-truck-check-blog/napa-carb-clean-truck',
  '/service-locations/on-the-road-opacity-testing-amp-visual-inspections-across-northern-californias-major-corridors': '/clean-truck-check-blog/on-the-road-opacity-testing-amp-visual-inspections-across-northern-californias-major-corridors',
  '/service-locations/when-friday-deadline-pressure-hits-how-norcal-carb-mobile-kept-the-plaster-groups-f550-fleet-compliant': '/clean-truck-check-blog/when-friday-deadline-pressure-hits-how-norcal-carb-mobile-kept-the-plaster-groups-f550-fleet-compliant',
  '/service-locations/woodland-agriculture-meets-carb-compliance': '/clean-truck-check-blog/woodland-agriculture-meets-carb-compliance',
  '/service-locations/tag/CARB+Compliance+Clean+Truck+Program+Stockton+Business+Fleet+Service+California+Trucking+Emissions+Testing+Mobile+Truck+Service+All+Good+Pallets+Bay+Area+Logistics+Sustainable+Trucking': '/areas',
  '/service-locations/tag/CARB+Testing+Motorhome+Services+RV+Compliance+Diesel+Emissions+California+Regulations+Mobile+Testing+RV+Maintenance+Emissions+Standards': '/areas',
  '/service-locations/tag/CARB+Compliance+Napa+Valley+Mobile+Testing+Fleet+Management+Wine+Country+Napa+Businesses+Commercial+Vehicles+Napa+County+On-Site+Service+Winery+Services': '/areas',
  '/service-locations/tag/CARB+Compliance+Clean+Truck+Program+Stockton+Business+Petaluma+Business+San+Francisco+Business+Rancho+Cordova+Business+Delta+Charter+Bus+Seddon+Construction+I-Drill+Engineering+Sierra+Asphalt+Fleet+Service+Emissions+Testing+Sustainable+Trucking+Mobile+Truck+Service': '/areas',
  '/service-locations/tag/CARB+compliance+services++California+emissions+testing++mobile+diesel+diagnostics++construction+fleet+maintenance++Mitchell+Concrete+partnership++CARB+retrofit+solutions++Sacramento+mobile+emissions+testing++on-site+engine+diagnostics++fleet+regulatory+compliance++construction+equipment+CARB+compliance': '/areas',
  '/service-locations/tag/CARB+testing+Sacramento+fleet+CARB+testing+California+Sacramento+County+truck+testing+F550+diesel+testing+construction+fleet+compliance+The+Plaster+Group+Sacramento+commercial+testing+Northern+California+fleet+services+mobile+emissions+testing+Friday+deadline+compliance+fleet+testing+Sacramento+J1667+smoke+testing+Sacramento+OBD+fleet+testing+construction+truck+inspection+same+day+fleet+CARB+test+contractor+fleet+compliance': '/areas',
  '/service-locations/tag/Clean+Truck+Check++CARB+compliance++Brentwood+CA+businesses++Mobile+emissions+testing++Fleet+compliance+services++Contra+Costa+truck+inspections++JC+Tree+Service++NorCal+CARB+Mobile++On-site+truck+testing++California+emissions+standards': '/areas',
  '/service-locations/tag/Merced+County+Diesel+Emissions+Truck+Fleet+Management+San+Joaquin+Valley+Clean+Air+Regulations+Agricultural+Vehicles+Truck+Modernization': '/areas',
  '/service-locations/tag/carb+testing+sacramento+motorhome+carb+test+northern+california+rv+emissions+testing+i-80+corridor+mobile+diesel+testing+service+california+motorhome+inspection+carb+compliance+motorhome+diesel+rv+testing+service+motorhome+smoke+test+california+rv+carb+testing+near+me+mobile+motorhome+emissions': '/areas',
  '/service-locations/tag/carb-testing-woodland+mobile-carb-testing+diesel-emissions-testing+carb-compliance-service+norcal-carb-mobile+emissions-inspection+carb-certification': '/areas',
  '/service-locations/tag/Sacramento+County+CARB+Regulations+Fleet+Testing+Emissions+Compliance+Commercial+Trucking+Vehicle+Inspections+Clean+Air+Initiatives': '/areas',
  '/service-locations/tag/motorhome+carb+testing+california+rv+emissions+testing+diesel+motorhome+testing+mobile+carb+testing+rv+smoke+opacity+testing+northern+california+carb+testing+motorhome+emissions+compliance+california+diesel+rv+testing+mobile+emissions+testing+service': '/areas',
  '/service-locations/tag/farm-carb-testing+agricultural-compliance+tractor-emissions-testing+farm-equipment-carb+harvest-season-testing+irrigation-pump-carb+dairy-farm-compliance+vineyard-equipment-testing+organic-farm-carb+livestock-operation-carb': '/areas',
  '/service-locations/tag/opacity+testing+diesel+emissions+CARB+compliance+mobile+testing+service+visual+inspections+fleet+maintenance+I-5+corridor+I-80+corridor+Northern+California+Sacramento+Bay+Area+diesel+particulate+filter+emissions+testing+commercial+vehicles+heavy-duty+diesel': '/areas',
  '/service-locations/tag/sacramento+carb+testing+northern+california+emissions+i-80+corridor+testing+i-5+motorhome+testing+highway+99+rv+service+bay+area+motorhome+testing+central+valley+carb+testing+davis+motorhome+testing+stockton+rv+emissions+modesto+carb+testing': '/areas',
  '/service-locations/tag/tractor-carb-inspection+harvester-emissions+diesel-truck-testing+farm-machinery-carb+irrigation-equipment+agricultural-vehicles+heavy-equipment-carb+fleet-carb-testing': '/areas',
  '/service-locations/tag/woodland-california+yolo-county-services+central-valley-carb+northern-california+sacramento-valley+woodland-ca-business+local-carb-testing': '/areas',
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
  const path = pathname.replace(/\/+$/, '').replace(/\.html$/i, '');
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

/**
 * Old Squarespace service-locations collection. Posts that were migrated live
 * at /clean-truck-check-blog/<slug>. Tag archives go to the areas hub.
 */
function serviceLocationsTarget(pathname) {
  const path = pathname.replace(/\/+$/, '').replace(/\.html$/i, '');
  if (path.startsWith('/service-locations/tag/')) return '/areas';
  if (!path.startsWith('/service-locations/')) return null;
  const slug = path.slice('/service-locations/'.length);
  if (slug && !slug.includes('/') && LEGACY_BLOG_SLUGS.has(slug)) {
    return `/clean-truck-check-blog/${slug}`;
  }
  return null;
}

/** Canonical path: no trailing slash (except "/"), no .html, no /index.html. */
function canonicalPath(pathname) {
  if (pathname === '/') return '/';
  let p = pathname.replace(/\/+$/, '') || '/';
  if (/\/index\.html$/i.test(p)) p = p.replace(/\/index\.html$/i, '') || '/';
  else if (/\.html$/i.test(p)) p = p.replace(/\.html$/i, '') || '/';
  return p;
}

/**
 * One 301 target, or null to serve the asset.
 * Checked on the raw path, the path minus one trailing slash, and the
 * canonical path, before ASSETS.fetch — so .html and trailing-slash variants
 * are 301s, not the 307 from html_handling=auto-trailing-slash.
 */
function resolveRedirect(pathname, search = '') {
  const clean = canonicalPath(pathname);
  const target =
    REDIRECTS[pathname] ||
    REDIRECTS[pathname.replace(/\/$/, '')] ||
    REDIRECTS[clean] ||
    legacyBlogTarget(clean) ||
    serviceLocationsTarget(clean);
  if (target && target !== pathname) return target;
  if (clean !== pathname) return clean + (search || '');
  return null;
}

function notFound(res) {
  const headers = new Headers(res.headers);
  headers.set('X-Robots-Tag', 'noindex');
  return new Response(res.body, { status: 404, statusText: 'Not Found', headers });
}

const HTML_ESC = { '<': '<', '>': '>', '&': '&' };
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

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/.{1,76}/g, '$&\r\n');
}

/** Raw RFC 5322 message for the legacy EmailMessage API (one recipient). */
function rawMime(message, to) {
  const boundary = 'ncm-' + crypto.randomUUID();
  const enc = (v) => '=?UTF-8?B?' + btoa(String.fromCharCode(...new TextEncoder().encode(v))) + '?=';
  const headers = [
    `From: ${enc(message.from.name)} <${message.from.email}>`,
    `To: <${to}>`,
    `Subject: ${enc(message.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@norcalcarbmobile.com>`,
    'MIME-Version: 1.0',
  ];
  if (message.replyTo) headers.push(`Reply-To: <${message.replyTo}>`);
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  return headers.join('\r\n') + '\r\n\r\n' +
    `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64utf8(message.text)}` +
    `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64utf8(message.html)}` +
    `--${boundary}--\r\n`;
}

/**
 * Send via the structured send() API. If this runtime only supports the legacy
 * EmailMessage form (no error code, e.g. a TypeError), fall back to raw MIME,
 * one message per verified recipient.
 */
async function sendLead(env, message) {
  try {
    return await env.EMAIL.send(message);
  } catch (err) {
    if (err && err.code) throw err;
    for (const to of message.to) {
      await env.EMAIL.send(new EmailMessage(message.from.email, to, rawMime(message, to)));
    }
  }
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

  const name = String(data.name || '').trim().slice(0, 200);
  const phone = String(data.phone || '').trim().slice(0, 50);
  if (!name || !phone) return respond(request, false, 'Please include your name and a phone number.', 422);

  const termsAccepted = String(data.terms_accepted || '').toLowerCase() === 'yes';
  if (!termsAccepted) {
    return respond(request, false, 'Please accept the Testing Terms & Customer Rights before sending your request.', 422);
  }

  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
    return respond(request, false, 'Please call us directly at (916) 890-4427 to book your test.', 503);
  }

  const field = (k, max) => String(data[k] || '').trim().slice(0, max);
  const lead = {
    name,
    phone,
    email: field('email', 200),
    city: field('location', 200) || field('city', 200),
    trucks: field('trucks', 10),
    service: field('service', 100),
    message: field('message', 5000),
    termsVersion: field('terms_version', 40) || CURRENT_TERMS_VERSION,
    submittedAt: new Date().toISOString(),
  };

  const rows = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['City / yard', lead.city],
    ['Truck count', lead.trucks],
    ['Service', lead.service],
    ['Details', lead.message],
    ['Terms accepted', 'Yes — version ' + lead.termsVersion],
    ['Submitted', lead.submittedAt],
  ];
  const html = `
    <h2>New test request — norcalcarbmobile.com</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td valign="top"><strong>${k}</strong></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('\n      ')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#555">New lead from the website contact form. Call or text them to confirm schedule and payment.</p>`;
  const text = 'New test request — norcalcarbmobile.com\n\n' +
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    '\n\nNew lead from the website contact form. Call or text them to confirm schedule and payment.';

  const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');
  const message = {
    to: FORM_TO,
    from: FORM_FROM,
    subject: `New test request: ${oneLine(lead.name)}${lead.city ? ' — ' + oneLine(lead.city) : ''}`,
    html,
    text,
  };
  const cleanEmail = oneLine(lead.email);
  if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) message.replyTo = cleanEmail;

  try {
    await sendLead(env, message);
  } catch (err) {
    console.error('contact send failed', err && err.code, err && err.message);
    return respond(request, false, 'We couldn’t send that — please call (916) 890-4427.', 502);
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
    // Old Squarespace URLs, legacy blog paths, and canonical-path normalization
    // (.html, /index.html, trailing slash). All 301s, one hop, before assets.
    // /api/* is left alone so the contact handler and any future API routes
    // are not rewritten into a redirect.
    if (!url.pathname.startsWith('/api/')) {
      const redirect = resolveRedirect(url.pathname, url.search);
      if (redirect) {
        return new Response(null, {
          status: 301,
          headers: { 'Location': redirect, 'Cache-Control': 'public, max-age=86400' },
        });
      }
    }

    // Everything else → static assets; inject branding, schema, and CF Web Analytics.
    // /404 is a real file, so html_handling would answer it with 200. Force 404.
    // Unknown paths already come back as 404 via not_found_handling=404-page.
    const assetRes = await env.ASSETS.fetch(request);
    const ct = assetRes.headers.get('content-type') || '';
    const force404 = canonicalPath(url.pathname) === '/404' || assetRes.status === 404;
    if (!ct.includes('text/html')) return force404 ? notFound(assetRes) : assetRes;
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
    return force404 ? notFound(page) : page;
  },
};
