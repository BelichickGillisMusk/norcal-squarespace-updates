import {
  NORCAL_PRICES,
  PUBLIC_PHONE,
  VIN_CHECK_URL,
  SITE,
  dollar,
  heroSection,
  priceBand,
  faqBlock,
  ctaBand,
  mapReviewsSection,
  documentShell,
  serviceSchema,
} from './partials.js';

export const OAKLAND_PATH = '/oakland-mobile-carb-test';
export const BAY_PATH = '/bay-area-mobile-carb';

const BAY_FAQ = [
  {
    q: 'Who does mobile Clean Truck Check in the Bay Area?',
    a: `NorCal CARB Mobile. Our Bay Area tester is based at our Oakland hub and comes to your yard, office, or jobsite, usually same or next day. OBD tests are $75 and OVI smoke tests are $199 per vehicle. Call ${PUBLIC_PHONE.display} to book.`,
  },
  {
    q: "Isn't it far from Sacramento?",
    a: `Not anymore. We started in Sacramento, and as we grew, and because of traffic, our other manager and tester is now based at our Oakland hub. We still sit in traffic like everyone else, but the Oakland hub puts us closer to clients from Sacramento and Stockton to the North Bay and down to San Jose, so we spend less time driving and more time testing. And better hot dog spots. Call ${PUBLIC_PHONE.display} to book.`,
  },
  {
    q: 'How much is a Clean Truck Check in the Bay Area?',
    a: `$75 per vehicle for an HD-OBD test and $199 per vehicle for an OVI smoke test. Every test includes same-day submission to CARB. Call ${PUBLIC_PHONE.display} to book. Fleet of 3 or more trucks? Call for fleet rates: ${PUBLIC_PHONE.display}`,
  },
  {
    q: 'How fast can you come out?',
    a: `Usually same or next day from our Oakland hub. Call ${PUBLIC_PHONE.display} and we'll give you a time.`,
  },
  {
    q: 'My truck got flagged at the Port of Oakland. Can you get me compliant fast?',
    a: 'Yes. We prioritize port drayage and handle same-day CARB submission.',
  },
  {
    q: 'Is travel really $0?',
    a: `In our Bay Area zone — including Oakland, Hayward, Fremont, San Leandro, Richmond, Concord, and the rest of Alameda and Contra Costa Counties — travel is $0. Call ${PUBLIC_PHONE.display} if you are unsure.`,
  },
  {
    q: 'Weekends?',
    a: 'Yes — weekends available. Free retest after repairs when booked with NorCal CARB Mobile.',
  },
];

const OAKLAND_FAQ = [
  {
    q: 'Are you based in Oakland?',
    a: `Yes. The tester works from the Oakland hub, so Oakland, Hayward, and Richmond yards get next-day service and often same-day when the route allows. Call ${PUBLIC_PHONE.display}.`,
  },
  {
    q: 'Do you have a separate Oakland shop or Google listing?',
    a: 'No. One company, one Google Business Profile. We come to your yard, office, or jobsite — there is no public street address to visit.',
  },
  {
    q: 'Which test do I need — OVI or OBD?',
    a: `OVI smoke opacity is ${dollar(NORCAL_PRICES.ovi)} (pre-2013 and non-OBD). HD-OBD is ${dollar(NORCAL_PRICES.obd)} (2013+ diesel and 2018+ alt-fuel). Check your VIN at the Clean Truck Check VIN tool, then book. Fleet of 3 or more trucks? Call for fleet rates: ${PUBLIC_PHONE.display}`,
  },
  {
    q: 'Can you cover Hayward and Richmond too?',
    a: `Yes. Morning East Bay routes regularly include Oakland, Hayward, and Richmond. Richmond is on I-80 / I-580, not I-880. Same phone: ${PUBLIC_PHONE.display}.`,
  },
];

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function faqPage(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q.replace(/&amp;/g, '&'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'),
      },
    })),
  };
}

export function renderBayPage() {
  const areaServed = [
    'Oakland, CA',
    'Hayward, CA',
    'San Leandro, CA',
    'Richmond, CA',
    'San Francisco, CA',
    'Menlo Park, CA',
    'San Jose, CA',
  ];
  const built = serviceSchema({
    name: 'Mobile CARB Testing in the Bay Area',
    areaServed,
  });
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        { name: 'Home', item: `${SITE}/` },
        { name: 'Service areas', item: `${SITE}/areas` },
        { name: 'Bay Area mobile CARB', item: `${SITE}${BAY_PATH}` },
      ]),
      built['@graph'][0],
      built['@graph'][1],
      faqPage(BAY_FAQ),
    ],
  };

  const mainHtml = `${heroSection({
    eyebrow: '<a href="/areas">Service areas</a> · Bay Area',
    h1Html: 'Mobile CARB Clean Truck Check in the <span>Bay Area</span>',
    lede: 'NorCal CARB Mobile brings Clean Truck Check testing to your yard, office, or jobsite across the Bay Area. Our Bay Area tester is based at our Oakland hub, central to Sacramento, Stockton, the North Bay, and down to San Jose, so we can usually get to you same or next day. HD-OBD tests are $75 per vehicle and OVI smoke tests are $199 per vehicle, with same-day submission to CARB. Call (916) 890-4427 to book.',
    areasLine: 'Port of Oakland priority for drayage · Weekends available · Free retest',
    mapAlt: 'NorCal CARB Mobile coverage — Oakland hub, Bay Area, Sacramento, Stockton, and San Jose',
    chips: ['Oakland hub', 'East Bay', 'San Francisco', 'Peninsula', 'North Bay', 'San Jose'],
  })}

<section>
  <div class="wrap">
    <div class="coverage-panel">
      <div class="coverage-panel-copy">
        <p class="eyebrow">Oakland hub</p>
        <h2>One crew, one listing, we come to you</h2>
        <p>The Bay tester works from the Oakland hub. That puts Sacramento, Stockton, the North Bay, and San Jose in reach on the same NorCal CARB Mobile route — not a second shop and not a second Google listing.</p>
        <p>Tell us the city or yard. We schedule the visit there. Same-day CTC-VIS submission. Same public number: <a href="${PUBLIC_PHONE.href}">${PUBLIC_PHONE.display}</a>.</p>
        <p>Need the Oakland / Hayward / Richmond morning route? See <a href="${OAKLAND_PATH}">Oakland mobile CARB testing</a>.</p>
        <p><a class="btn btn-primary" href="/contact">Book a Mobile Test</a></p>
      </div>
      <div class="coverage-panel-map">
        <div class="grid grid-2">
          <div class="card">
            <h3>Daily corridors</h3>
            <ul>
              <li>East Bay I-880</li>
              <li>Hwy 101 / Peninsula</li>
              <li>Port of Oakland drayage</li>
            </ul>
          </div>
          <div class="card">
            <h3>In zone</h3>
            <ul>
              <li>$0 travel in zone</li>
              <li>No bridge-toll line</li>
              <li>Weekends available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="soft">
  <div class="wrap">
    <div class="section-head">
      <h2>East Bay &amp; Bay Area coverage</h2>
      <p>Office, yard, or jobsite. We come to you along Hwy 101 and I-880.</p>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h2>Where the unit runs</h2>
        <ul>
          <li>Oakland · Hayward · Fremont</li>
          <li>San Leandro · Richmond · Concord</li>
          <li>Alameda County &amp; Contra Costa County</li>
          <li>San Francisco and the Peninsula</li>
          <li>North Bay down to San Jose</li>
          <li><strong>Port of Oakland</strong> — priority for drayage fleets</li>
        </ul>
        <p>Need Sacramento or Stockton from the same hub? See <a href="/sacramento-carb-testing">Sacramento testing</a> and <a href="/stockton-clean-truck-check">Stockton testing</a>.</p>
      </div>
      <div class="card">
        <h2>Who we test</h2>
        <ul>
          <li>Port of Oakland drayage fleets</li>
          <li>Warehouse and distribution fleets</li>
          <li>Construction fleets across the East Bay and Peninsula</li>
          <li>Diesel motorhomes from Bay Area RV owners</li>
        </ul>
        <p>Flat pricing across the Bay — no bridge-toll surcharges, no hidden travel fees in zone.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>How a Bay Area visit works</h2>
      <p>Three steps. Same prices as the rest of Northern California.</p>
    </div>
    <div class="grid grid-3">
      <div class="step"><div class="num">1</div><h3>Book in minutes</h3><p>Send the yard city, truck count, and test type — or call ${PUBLIC_PHONE.display}.</p></div>
      <div class="step"><div class="num">2</div><h3>We come to you</h3><p>The Oakland-hub unit arrives at the office, yard, or jobsite, including weekends.</p></div>
      <div class="step"><div class="num">3</div><h3>Pass &amp; paperwork</h3><p>On-site proof plus same-day CTC-VIS submission. Free retest after repairs when booked with us.</p></div>
    </div>
  </div>
</section>

${priceBand({
    heading: 'Bay Area pricing',
    intro: 'Every test includes same-day CTC-VIS submission to CARB and on-site proof of testing. Free retest after repairs when scheduled with us.',
    leadWith: 'obd',
    afterHtml: `<p class="center" style="margin-top:22px"><a href="/pricing">Full pricing</a> · <a href="/blog/obd-vs-ovi-clean-truck-check-fleets">OBD vs OVI for fleets</a></p>`,
  })}

<section>
  <div class="wrap">
    <div class="grid grid-2">
      <div class="card">
        <h2>Local crew, local knowledge</h2>
        <p>The Oakland-hub unit knows the yards from the Port of Oakland to Hayward, plus airport, warehouse, and cross-dock routes along I-880 — and the Hwy 101 corridor through the Peninsula down toward San Jose.</p>
        <p>Highway 101 from Novato toward San Jose also has a corridor door at <a href="/carb-test-bay-area">CARB test Bay Area</a>.</p>
      </div>
      ${faqBlock({ heading: 'Bay Area FAQ', items: BAY_FAQ })}
    </div>
  </div>
</section>

  ${mapReviewsSection()}

  <section aria-labelledby="related-field-notes">
    <div class="wrap">
      <h2 id="related-field-notes">Related field notes</h2>
      <ul>
        <li><a href="/blog/obd-vs-ovi-clean-truck-check-fleets">OBD vs OVI for fleets — which Clean Truck Check test</a></li>
        <li><a href="/blog/bayshore-sf-free-retest-ovi-wager-6500">Free retest peace of mind on Bayshore, then opacity on the spot</a></li>
        <li><a href="${OAKLAND_PATH}">Oakland, Hayward, and Richmond mobile CARB testing</a></li>
      </ul>
    </div>
  </section>

${ctaBand({
    heading: 'Ready to clear your Bay Area fleet?',
    lede: 'Send the yard city and truck count. We schedule from the Oakland hub.',
    callFirst: false,
  })}`;

  return documentShell({
    title: 'Mobile CARB Testing Bay Area | Oakland, Hayward, San Leandro | NorCal CARB Mobile',
    description: `Daily East Bay I-880 and Hwy 101 Clean Truck Check. $0 travel in zone. OBD ${dollar(NORCAL_PRICES.obd)} · OVI ${dollar(NORCAL_PRICES.ovi)}. Port of Oakland priority. Call ${PUBLIC_PHONE.display}.`,
    canonicalPath: BAY_PATH,
    ogTitle: 'Mobile CARB Testing Bay Area | Oakland, Hayward, San Leandro',
    schema,
    openBar: 'Oakland hub · East Bay I-880 · Hwy 101 · North Bay to San Jose',
    mainHtml,
  });
}

export function renderOaklandPage() {
  const areaServed = ['Oakland, CA', 'Hayward, CA', 'Richmond, CA', 'East Bay, CA'];
  const built = serviceSchema({
    name: 'Mobile CARB Testing in Oakland, Hayward, and Richmond',
    areaServed,
    leadWith: 'ovi',
  });
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        { name: 'Home', item: `${SITE}/` },
        { name: 'Service areas', item: `${SITE}/areas` },
        { name: 'Oakland mobile CARB', item: `${SITE}${OAKLAND_PATH}` },
      ]),
      built['@graph'][0],
      built['@graph'][1],
      faqPage(OAKLAND_FAQ),
    ],
  };

  const mainHtml = `${heroSection({
    eyebrow: '<a href="/areas">Service areas</a> · Oakland',
    h1Html: 'Mobile CARB testing from <span>Oakland</span>',
    lede: `We are based in Oakland. Next-day — and often same-day — Clean Truck Check at your yard in Oakland, Hayward, and Richmond. OVI smoke opacity is ${dollar(NORCAL_PRICES.ovi)} per vehicle. HD-OBD is ${dollar(NORCAL_PRICES.obd)} per vehicle. There is no public street address and no second Google listing; we come to your yard, office, or jobsite. Call ${PUBLIC_PHONE.display} to book.`,
    callFirst: true,
    areasLine: `Oakland hub · Hayward · Richmond · <a href="${VIN_CHECK_URL}" rel="noopener">Check your VIN</a>`,
    mapAlt: 'NorCal CARB Mobile coverage — Oakland hub serving Hayward, Richmond, and the East Bay',
    chips: ['Oakland', 'Hayward', 'Richmond', 'East Bay'],
  })}

<section>
  <div class="wrap">
    <div class="coverage-panel">
      <div class="coverage-panel-copy">
        <p class="eyebrow">Based in Oakland</p>
        <h2>Based in Oakland, without a shop pin</h2>
        <p>The tester works from the Oakland hub, so East Bay mornings are built around Oakland, Hayward, and Richmond instead of a long inbound drive from Sacramento. We still sit in traffic like everyone else. We just start closer.</p>
        <p>There is no street address, map pin, or LocalBusiness geo for the hub. One company, one Google Business Profile. Wider Bay coverage — San Francisco, the Peninsula, the North Bay, and San Jose — stays on <a href="${BAY_PATH}">Bay Area mobile CARB</a>.</p>
        <p>Not sure whether you need smoke opacity or OBD? <a href="${VIN_CHECK_URL}" rel="noopener">Check the VIN</a>, then call.</p>
        ${`<div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PUBLIC_PHONE.href}">Call ${PUBLIC_PHONE.display}</a>
        <a class="btn btn-primary btn-lg" href="/contact">Book a Mobile Test</a>
      </div>`}
      </div>
      <div class="coverage-panel-map">
        <div class="grid grid-2">
          <div class="card">
            <h3>Morning corridor</h3>
            <ul>
              <li>Oakland yards and jobsites</li>
              <li>Hayward and South I-880</li>
              <li>Richmond and the North East Bay</li>
            </ul>
          </div>
          <div class="card">
            <h3>On every test</h3>
            <ul>
              <li>Same-day submission to CARB</li>
              <li>On-site proof of testing</li>
              <li>Free retest after repairs when booked with us</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="soft">
  <div class="wrap">
    <div class="section-head">
      <h2>The morning corridor, named correctly</h2>
      <p>Mobile Clean Truck Check around the Oakland hub: I-880 through Hayward, and I-80 / I-580 through Richmond. Broader Bay coverage stays on the Bay Area page.</p>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h2>Where we roll</h2>
        <p><strong>Oakland.</strong> Offices, yards, construction sites, warehouses, and port-adjacent staging. Port of Oakland drayage is a priority on the main Bay page; this lander is the local morning loop.</p>
        <p><strong>Hayward and south I-880.</strong> Warehouse and fleet rows, including the Industrial Boulevard corridor. The long I-880 write-up is <a href="/clean-truck-check-hayward">Hayward</a> (Union City, Fremont, Newark, San Leandro, Castro Valley).</p>
        <p><strong>Richmond and the north East Bay.</strong> Richmond is on I-80 / I-580, not I-880. Keep Richmond on this lander — just do not file it under “along I-880.”</p>
        <p>Need San Francisco, the Peninsula, or San Jose from the same hub? See <a href="${BAY_PATH}">Bay Area mobile CARB</a>.</p>
      </div>
      <div class="card">
        <h2>Who we test</h2>
        <p>East Bay distribution and construction fleets, port-adjacent and I-880 drayage, municipal and contractor rows, and diesel motorhomes parked in Oakland, Hayward, or Richmond. In-zone travel is $0 on this Bay book. Every test includes on-site proof, same-day submission to CARB, and a free retest after repairs when that follow-up is booked with us.</p>
        <p>Oakland industries on this loop are practical, not decorative. Drayage and port-adjacent tractors stage here because the port is here. Construction and utility contractors stage here because the jobsites are here. Warehouse rows feed I-880 south toward Hayward and I-80 north toward Richmond.</p>
        <p>If a customer asks for a shop address, the answer is the FAQ: there is not one. Sacramento and Stockton are reach from the hub and have their own pages — they are not Oakland neighborhoods.</p>
        <p>Same public number: <a href="${PUBLIC_PHONE.href}">${PUBLIC_PHONE.display}</a>.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <h2>How an Oakland visit works</h2>
      <p>Call or book. We come to you. Paperwork the same day.</p>
    </div>
    <div class="grid grid-3">
      <div class="step"><div class="num">1</div><h3>Book in minutes</h3><p>Call ${PUBLIC_PHONE.display} or use the <a href="/contact">contact intake</a>. City, truck count, test type.</p></div>
      <div class="step"><div class="num">2</div><h3>We come to you</h3><p>Next-day is the default. Same-day when the Oakland route still has a window.</p></div>
      <div class="step"><div class="num">3</div><h3>Pass &amp; paperwork</h3><p>On-site proof plus same-day submission to CARB. Free retest after repairs when booked with us.</p></div>
    </div>
  </div>
</section>

${priceBand({
    heading: 'Oakland pricing',
    intro: 'OVI first for older and non-OBD engines, then HD-OBD. Same NorCal rates. Motorhome stays on the shared card.',
    leadWith: 'ovi',
    afterHtml: `<p>Fleet of 3 or more trucks? Call for fleet rates: <a href="${PUBLIC_PHONE.href}">${PUBLIC_PHONE.display}</a></p>
    <p class="center" style="margin-top:22px"><a href="${VIN_CHECK_URL}" rel="noopener">VIN check — which test do I need?</a> · <a href="/pricing">Full pricing</a> · <a href="/blog/obd-vs-ovi-clean-truck-check-fleets">OBD vs OVI for fleets</a></p>`,
  })}

<section>
  <div class="wrap">
    <div class="grid grid-2">
      <div class="card">
        <h2>Local crew, Oakland hub</h2>
        <p>We know the yards from Oakland through Hayward and up to Richmond. One listing, one phone, we come to you — not a second shop.</p>
        <p>Wider Bay Area, Port of Oakland priority, and Hwy 101 live on <a href="${BAY_PATH}">the Bay Area page</a>.</p>
      </div>
      ${faqBlock({ heading: 'Oakland FAQ', items: OAKLAND_FAQ })}
    </div>
  </div>
</section>

  ${mapReviewsSection()}

  <section aria-labelledby="related-field-notes">
    <div class="wrap">
      <h2 id="related-field-notes">Related field notes</h2>
      <ul>
        <li><a href="/blog/jobsite-clean-truck-check-near-me-oakland">Oakland and Bay Area jobsite fleets</a></li>
        <li><a href="/clean-truck-check-blog/oakland-clean-truck-checks-san-leandro">Oakland Clean Truck Checks, San Leandro</a></li>
        <li><a href="/clean-truck-check-blog/oakland-carb-compliance-at-active-job-sites-keeping-east-bay-municipal-utility-district-projects-moving">Oakland CARB compliance at active job sites</a></li>
        <li><a href="${BAY_PATH}">Bay Area mobile CARB testing</a></li>
        <li><a href="/clean-truck-check-hayward">Hayward corridor page</a></li>
        <li><a href="/carb-mobile-test-near-me">CARB mobile test near me</a></li>
        <li><a href="/blog/obd-vs-ovi-clean-truck-check-fleets">OBD vs OVI for fleets</a></li>
        <li><a href="${VIN_CHECK_URL}" rel="noopener">Clean Truck Check VIN tool</a></li>
      </ul>
    </div>
  </section>

${ctaBand({
    heading: 'Need a test in Oakland, Hayward, or Richmond?',
    lede: 'Call now or send the intake. Next-day is standard; same-day when the route is open.',
    callFirst: true,
  })}`;

  return documentShell({
    title: 'Oakland Mobile CARB Test | Hayward & Richmond | NorCal CARB Mobile',
    description: `Based in Oakland. Next-day and often same-day Clean Truck Check for Oakland, Hayward, and Richmond. OVI ${dollar(NORCAL_PRICES.ovi)} · OBD ${dollar(NORCAL_PRICES.obd)}. Call ${PUBLIC_PHONE.display}.`,
    canonicalPath: OAKLAND_PATH,
    ogTitle: 'Oakland Mobile CARB Test | Hayward & Richmond',
    schema,
    openBar: 'Oakland hub · Hayward · Richmond · next-day, often same-day',
    mainHtml,
  });
}
