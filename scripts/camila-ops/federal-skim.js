#!/usr/bin/env node
/**
 * Federal DB skim — FMCSA Company Census within 150 mi of Sacramento + Oakland
 *
 * Recreates the Grok skim that hit a non-tabular data.gov endpoint
 * ("Non-tabular datasets do not support rows requests"). Correct source:
 *   data.transportation.gov dataset az4n-8mr2 (Company Census File)
 *
 * Usage:
 *   node federal-skim.js --dry-run
 *   node federal-skim.js --with-email --limit 500
 *   node federal-skim.js --with-email --min-power-units 2 --out leads/federal-150mi.csv
 *   node federal-skim.js --with-email --import-queue   # MX-check + write today's queue
 *
 * Hubs (hardcoded):
 *   Sacramento 38.5816, -121.4944
 *   Oakland    37.8044, -122.2712
 * Keep row if min(mi_sac, mi_oak) <= --radius (default 150).
 *
 * No API key required for the public SODA endpoint.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATASET = 'az4n-8mr2';
const SODA_BASE = `https://data.transportation.gov/resource/${DATASET}.json`;
const PAGE = 1000;

const HUBS = {
  Sacramento: { lat: 38.5816, lng: -121.4944 },
  Oakland: { lat: 37.8044, lng: -122.2712 },
};

const EARTH_MI = 3958.8;

function haversineMi(a, b) {
  const toR = (d) => (d * Math.PI) / 180;
  const lat1 = toR(a.lat);
  const lat2 = toR(b.lat);
  const dLat = lat2 - lat1;
  const dLng = toR(b.lng) - toR(a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.sqrt(h));
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'NorCalCARB-FederalSkim/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`SODA HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function loadZipCentroids() {
  const p = path.join(__dirname, 'lib/ca-zips-150mi-sac-oak.csv');
  const text = fs.readFileSync(p, 'utf8').trim().split('\n');
  const map = new Map();
  const prefixes = new Set();
  for (let i = 1; i < text.length; i++) {
    const [zip, lat, lng, miSac, miOak, miNearest] = text[i].split(',');
    const z = String(zip).padStart(5, '0').slice(0, 5);
    map.set(z, {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      mi_sac: parseFloat(miSac),
      mi_oak: parseFloat(miOak),
      mi_nearest: parseFloat(miNearest),
    });
    prefixes.add(z.slice(0, 3));
  }
  return { map, prefixes: [...prefixes].sort() };
}

function zip5(raw) {
  const m = String(raw || '').match(/\d{5}/);
  return m ? m[0] : '';
}

function buildWhere({ withEmail, prefixes }) {
  // power_units is text in SODA — filter minPowerUnits client-side
  const ors = prefixes.map((p) => `starts_with(phy_zip,'${p}')`).join(' OR ');
  const parts = [
    "phy_state='CA'",
    "status_code='A'",
    `(${ors})`,
  ];
  if (withEmail) parts.push('email_address IS NOT NULL');
  return parts.join(' AND ');
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(file, rows, columns) {
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(row[c])).join(','));
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function inferMetro(city, miSac, miOak) {
  const c = String(city || '').toLowerCase();
  if (
    /oakland|hayward|fremont|berkeley|richmond|concord|walnut|san leandro|alameda|union city|san rafael|vallejo|fairfield|vacaville|napa|santa rosa|san francisco|daly|san mateo|redwood|palo alto|sunnyvale|santa clara|milpitas|livermore|pleasanton|dublin|antioch|pittsburg/.test(
      c
    )
  ) {
    return 'Bay';
  }
  if (/san jose|campbell|cupertino|gilroy|morgan hill/.test(c)) return 'San Jose';
  if (/stockton|modesto|tracy|lodi|manteca|turlock|merced|patterson/.test(c)) {
    return 'Stockton';
  }
  if (/sacramento|roseville|elk grove|folsom|citrus|rancho cordova|davis|woodland|auburn|rocklin|lincoln/.test(c)) {
    return 'Sacramento';
  }
  return miSac <= miOak ? 'Sacramento' : 'Bay';
}

async function skim(opts) {
  const { map: zipMap, prefixes } = loadZipCentroids();
  const where = buildWhere({
    withEmail: opts.withEmail,
    prefixes,
  });

  console.log('\n🚛 Federal skim — FMCSA Company Census (az4n-8mr2)');
  console.log(`   Hubs: Sacramento + Oakland | radius ≤ ${opts.radius} mi`);
  console.log(`   with-email=${opts.withEmail} min-power-units=${opts.minPowerUnits}`);
  console.log(`   ZIP prefixes in radius set: ${prefixes.length} (${prefixes.slice(0, 8).join(',')}…)`);
  console.log(`   Exact ZIPs in radius set: ${zipMap.size}`);

  if (opts.dryRun) {
    const countUrl =
      `${SODA_BASE}?$select=${encodeURIComponent('count(*)')}` +
      `&$where=${encodeURIComponent(where)}`;
    const count = await httpsGetJson(countUrl);
    console.log(`\n[dry-run] SODA prefilter count (zip3 + filters): ${count[0]?.count || '?'}`);
    console.log('[dry-run] Would page SODA, keep only ZIPs in lib/ca-zips-150mi-sac-oak.csv, write CSV.');
    console.log('Run without --dry-run, e.g.: node federal-skim.js --with-email --limit 500\n');
    return { rows: [], outPath: null };
  }

  const select = [
    'dot_number',
    'legal_name',
    'dba_name',
    'phy_street',
    'phy_city',
    'phy_state',
    'phy_zip',
    'phone',
    'cell_phone',
    'email_address',
    'power_units',
    'truck_units',
    'carrier_operation',
    'classdef',
  ].join(',');

  const kept = [];
  let offset = 0;
  let fetched = 0;
  let skippedZip = 0;
  let skippedRadius = 0;
  let skippedPower = 0;

  while (true) {
    if (opts.limit && kept.length >= opts.limit) break;

    const url =
      `${SODA_BASE}?$select=${encodeURIComponent(select)}` +
      `&$where=${encodeURIComponent(where)}` +
      `&$order=${encodeURIComponent('dot_number')}` +
      `&$limit=${PAGE}&$offset=${offset}`;

    process.stdout.write(`   … offset ${offset} (kept ${kept.length})\r`);
    let page;
    try {
      page = await httpsGetJson(url);
    } catch (err) {
      console.error(`\nSODA error at offset ${offset}: ${err.message}`);
      break;
    }
    if (!page.length) break;
    fetched += page.length;

    for (const raw of page) {
      if (opts.limit && kept.length >= opts.limit) break;
      const z = zip5(raw.phy_zip);
      const geo = zipMap.get(z);
      if (!geo) {
        skippedZip++;
        continue;
      }
      if (geo.mi_nearest > opts.radius) {
        skippedRadius++;
        continue;
      }
      const power = parseInt(String(raw.power_units || '0').replace(/[^\d]/g, ''), 10) || 0;
      if (power < opts.minPowerUnits) {
        skippedPower++;
        continue;
      }

      // Census sometimes has spaces inside addresses (e.g. "foo@bar .com")
      const email = String(raw.email_address || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
      if (opts.withEmail && (!email || !email.includes('@') || !email.includes('.'))) {
        continue;
      }
      const company = (raw.dba_name || raw.legal_name || '').trim();
      const city = String(raw.phy_city || '').trim();
      const miSac = geo.mi_sac;
      const miOak = geo.mi_oak;
      const nearestHub = miSac <= miOak ? 'Sacramento' : 'Oakland';

      kept.push({
        company,
        legal_name: raw.legal_name || '',
        dba_name: raw.dba_name || '',
        email,
        phone: raw.phone || raw.cell_phone || '',
        city,
        state: raw.phy_state || 'CA',
        zip: z,
        address: raw.phy_street || '',
        usdot: raw.dot_number || '',
        power_units: raw.power_units || '',
        truck_units: raw.truck_units || '',
        carrier_operation: raw.carrier_operation || '',
        classdef: raw.classdef || '',
        lat: geo.lat,
        lng: geo.lng,
        mi_sac: miSac.toFixed(1),
        mi_oak: miOak.toFixed(1),
        mi_nearest: geo.mi_nearest.toFixed(1),
        nearest_hub: nearestHub,
        metro: inferMetro(city, miSac, miOak),
        safer_url: raw.dot_number
          ? `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${raw.dot_number}`
          : '',
        source: 'fmcsa_census_az4n-8mr2',
      });
    }

    offset += page.length;
    if (page.length < PAGE) break;
    // be polite to SODA
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(
    `\n📊 Fetched ${fetched} | kept ${kept.length} | skip zip ${skippedZip} | skip >${opts.radius}mi ${skippedRadius} | skip power ${skippedPower}`
  );

  const outPath = path.resolve(
    opts.out || path.join(__dirname, 'leads/federal-150mi-sac-oak.csv')
  );
  const columns = [
    'company',
    'legal_name',
    'dba_name',
    'email',
    'phone',
    'city',
    'state',
    'zip',
    'address',
    'usdot',
    'power_units',
    'truck_units',
    'metro',
    'nearest_hub',
    'mi_nearest',
    'mi_sac',
    'mi_oak',
    'lat',
    'lng',
    'carrier_operation',
    'classdef',
    'safer_url',
    'source',
  ];
  writeCsv(outPath, kept, columns);
  console.log(`✅ Wrote ${kept.length} rows → ${outPath}`);

  const withEmail = kept.filter((r) => r.email).length;
  const byMetro = {};
  for (const r of kept) byMetro[r.metro] = (byMetro[r.metro] || 0) + 1;
  console.log(`   With email: ${withEmail}`);
  console.log(`   By metro: ${JSON.stringify(byMetro)}`);
  console.log('');

  return { rows: kept, outPath };
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      'with-email': { type: 'boolean', default: false },
      'min-power-units': { type: 'string', default: '1' },
      radius: { type: 'string', default: '150' },
      limit: { type: 'string' },
      out: { type: 'string' },
      'import-queue': { type: 'boolean', default: false },
    },
    strict: false,
  });

  const opts = {
    dryRun: Boolean(values['dry-run']),
    withEmail: Boolean(values['with-email']),
    minPowerUnits: parseInt(values['min-power-units'] || '1', 10),
    radius: parseFloat(values.radius || '150'),
    limit: values.limit ? parseInt(values.limit, 10) : 0,
    out: values.out || null,
    importQueue: Boolean(values['import-queue']),
  };

  // Default to with-email for outreach usefulness unless explicitly all phones
  if (!process.argv.includes('--with-email') && !process.argv.includes('--all')) {
    opts.withEmail = true;
  }
  if (process.argv.includes('--all')) opts.withEmail = false;

  const { rows, outPath } = await skim(opts);

  if (opts.importQueue && rows.length && !opts.dryRun) {
    // Lazy import so federal-skim can run without pulling the whole ops stack
    const { pathToFileURL } = await import('node:url');
    const runPath = pathToFileURL(path.join(__dirname, 'run.js')).href;
    console.log(
      `To queue for Camila Ops, run:\n  node run.js import-csv --file ${outPath} --industry cranes\n`
    );
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
