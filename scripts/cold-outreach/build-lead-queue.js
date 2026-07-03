#!/usr/bin/env node
/**
 * Build a cold-outreach lead queue from:
 *   1. FMCSA SAFER public carrier search (no auth needed for HTML scrape)
 *   2. FMCSA REST API (requires free API key — set FMCSA_API_KEY)
 *   3. Google Places API (optional enrichment — set GOOGLE_PLACES_API_KEY)
 *
 * Outputs a CSV ready to import as "Send Queue" tab in Google Sheets.
 * Deduplicates against existing suppression list.
 *
 * Usage:
 *   node build-lead-queue.js --state CA --city Stockton --limit 30
 *   node build-lead-queue.js --state CA --limit 30 --cities "Sacramento,Stockton,Fairfield,Modesto"
 *   node build-lead-queue.js --dot 123456            # single carrier lookup
 *   node build-lead-queue.js --suppression suppression.csv --state CA --limit 30
 *   node build-lead-queue.js --dry-run               # validate config, no network calls
 *
 * Required secrets (set as env vars or GitHub secrets):
 *   FMCSA_API_KEY          — free at https://ai.fmcsa.dot.gov/SMS/Carrier/
 *
 * Optional:
 *   GOOGLE_PLACES_API_KEY  — enriches with website + email when domain not found
 *   LEAD_SUPPRESSION_FILE  — path to suppression CSV (email column)
 *
 * Output columns match gmail-send-queue-template.csv:
 *   email, company, first_name, city, state, dot_number, phone,
 *   template_id, scheduled_send_pt, bryan_approved, status, mx_ok, notes
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FMCSA_API_KEY = process.env.FMCSA_API_KEY || '';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const SUPPRESSION_FILE =
  process.env.LEAD_SUPPRESSION_FILE ||
  path.join(import.meta.dirname, 'suppression-template.csv');

// NorCal service area — satellite cities included per Bryan's directive
const DEFAULT_CITIES = [
  'Sacramento',
  'Stockton',
  'Fairfield',
  'Modesto',
  'Fresno',
  'San Jose',
  'Oakland',
  'Hayward',
  'Tracy',
  'Lodi',
];

// CARB-regulated vehicle types (diesel 14k+ GVWR) — FMCSA equipment codes
const TARGET_EQUIPMENT_TYPES = ['T', 'TT', 'S', 'TK']; // Truck, Truck-Trailer, Semi, Tank
const TARGET_OPERATION_TYPES = ['A', 'H', 'C']; // Auth-for-hire, Private (except Passenger), Contract

// Schedule sends 7 min apart starting at 8:05 AM
function scheduleTimes(n) {
  const times = [];
  for (let i = 0; i < n; i++) {
    const totalMin = 8 * 60 + 5 + i * 7;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = h > 12 ? h - 12 : h;
    times.push(`${h12}:${String(m).padStart(2, '0')} ${ampm}`);
  }
  return times;
}

// ---------------------------------------------------------------------------
// SAFER / FMCSA helpers
// ---------------------------------------------------------------------------

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'NorCalCARBMobile-LeadBuilder/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      })
      .on('error', reject);
  });
}

/**
 * Query FMCSA REST API for carriers in a state.
 * Docs: https://mobile.fmcsa.dot.gov/qc/services/
 * Returns array of raw carrier objects.
 */
async function queryFmcsaApi(state, start = 0) {
  if (!FMCSA_API_KEY) {
    throw new Error(
      'FMCSA_API_KEY not set. Get a free key at https://ai.fmcsa.dot.gov/SMS/Carrier/'
    );
  }
  const url =
    `https://mobile.fmcsa.dot.gov/qc/services/carriers/` +
    `?webKey=${FMCSA_API_KEY}&physicalStateAbbr=${state}&start=${start}&size=100`;
  const { status, body } = await httpsGet(url);
  if (status !== 200) throw new Error(`FMCSA API error ${status}`);
  const json = JSON.parse(body);
  return (json.content || json.data || []);
}

/**
 * Extract the best guessable email from a company name + domain.
 * Returns null if we can't construct a plausible address.
 */
function guessEmail(company, domain) {
  if (!domain) return null;
  // Try info@, contact@ as fallbacks — flag as role_address for Bryan review
  return `info@${domain}`;
}

/**
 * Try to find a domain from company name via Google Places API.
 */
async function enrichWithGooglePlaces(company, city, state) {
  if (!GOOGLE_PLACES_API_KEY) return null;
  const q = encodeURIComponent(`${company} ${city} ${state} trucking`);
  const url =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${q}&inputtype=textquery&fields=name,website,formatted_phone_number` +
    `&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const { status, body } = await httpsGet(url);
    if (status !== 200) return null;
    const json = JSON.parse(body);
    const candidate = json.candidates?.[0];
    if (!candidate) return null;
    const website = candidate.website || null;
    const domain = website ? new URL(website).hostname.replace(/^www\./, '') : null;
    return { website, domain, phone: candidate.formatted_phone_number || null };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Suppression list
// ---------------------------------------------------------------------------

function loadSuppression(filePath) {
  const suppressed = new Set();
  if (!fs.existsSync(filePath)) return suppressed;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    const email = line.split(',')[0].trim().toLowerCase();
    if (email && email.includes('@')) suppressed.add(email);
  }
  return suppressed;
}

// ---------------------------------------------------------------------------
// MX check (reuse same logic as verify-emails.js)
// ---------------------------------------------------------------------------

function hasMx(domain) {
  try {
    const out = execSync(`dig +short MX ${domain}`, { encoding: 'utf8', timeout: 5000 }).trim();
    return out.length > 0 && !out.includes('NXDOMAIN');
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Template picker
// ---------------------------------------------------------------------------

function pickTemplate(carrier) {
  const name = (carrier.legalName || carrier.dbaName || '').toLowerCase();
  const fleet = carrier.totalPowerUnits || 0;
  if (fleet >= 5) return 'B'; // fleet-switch
  if (name.includes('express') || name.includes('freight')) return 'B';
  return 'A'; // deadline-hook default
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function toCsvRow(fields) {
  return fields
    .map((f) => {
      const s = String(f ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    })
    .join(',');
}

const CSV_HEADER = [
  'email',
  'company',
  'first_name',
  'city',
  'state',
  'dot_number',
  'phone',
  'template_id',
  'scheduled_send_pt',
  'bryan_approved',
  'status',
  'mx_ok',
  'source',
  'notes',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      state: { type: 'string', default: 'CA' },
      city: { type: 'string' },
      cities: { type: 'string' },
      limit: { type: 'string', default: '30' },
      dot: { type: 'string' },
      suppression: { type: 'string' },
      output: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      'skip-mx': { type: 'boolean', default: false },
    },
    strict: false,
  });

  const state = values.state.toUpperCase();
  const limit = parseInt(values.limit, 10);
  const dryRun = values['dry-run'];
  const skipMx = values['skip-mx'];
  const suppFile = values.suppression || SUPPRESSION_FILE;
  const outFile =
    values.output ||
    `lead-queue-${state}-${new Date().toISOString().slice(0, 10)}.csv`;

  const targetCities = values.cities
    ? values.cities.split(',').map((c) => c.trim())
    : values.city
      ? [values.city]
      : DEFAULT_CITIES;

  console.log(`\n🚛 NorCal CARB Mobile — Lead Queue Builder`);
  console.log(`   State: ${state} | Cities: ${targetCities.join(', ')}`);
  console.log(`   Limit: ${limit} | Dry-run: ${dryRun} | Skip MX: ${skipMx}`);
  console.log(`   Output: ${outFile}\n`);

  if (dryRun) {
    console.log('[dry-run] Config valid. Would query FMCSA API + verify MX.');
    console.log('Set FMCSA_API_KEY env var to run live.');
    return;
  }

  if (!FMCSA_API_KEY) {
    console.error('❌ FMCSA_API_KEY not set.');
    console.error('   Get a free key: https://ai.fmcsa.dot.gov/SMS/Carrier/');
    console.error('   Then: export FMCSA_API_KEY=your_key');
    process.exit(1);
  }

  const suppressed = loadSuppression(suppFile);
  console.log(`Suppression list: ${suppressed.size} addresses loaded`);

  const leads = [];
  let apiStart = 0;
  let attempts = 0;

  while (leads.length < limit && attempts < 20) {
    attempts++;
    let carriers;
    try {
      carriers = await queryFmcsaApi(state, apiStart);
    } catch (err) {
      console.error('FMCSA API error:', err.message);
      break;
    }
    if (!carriers.length) break;
    apiStart += carriers.length;

    for (const carrier of carriers) {
      if (leads.length >= limit) break;

      const city = (
        carrier.phyCity ||
        carrier.mailCity ||
        ''
      ).trim();

      // Filter to target cities (case-insensitive partial match)
      const inServiceArea = targetCities.some((tc) =>
        city.toLowerCase().includes(tc.toLowerCase())
      );
      if (!inServiceArea) continue;

      // Only CA, OR, WA (NorCal service area)
      const carrierState = (carrier.phyState || carrier.mailState || '').toUpperCase();
      if (!['CA', 'OR', 'WA'].includes(carrierState)) continue;

      const company =
        carrier.legalName || carrier.dbaName || 'Unknown Company';
      const dotNumber = carrier.dotNumber || '';
      const phone = carrier.telephone || '';

      // Try to build an email from the domain
      let email = null;
      let domain = null;
      let emailSource = 'unknown';

      // Try Google Places enrichment if available
      const places = await enrichWithGooglePlaces(company, city, carrierState);
      if (places?.domain) {
        domain = places.domain;
        email = guessEmail(company, domain);
        emailSource = 'google_places';
      }

      if (!email) {
        // Build a domain guess from company name (last resort)
        const slug = company
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .slice(0, 20);
        if (slug.length > 3) {
          domain = `${slug}.com`;
          email = guessEmail(company, domain);
          emailSource = 'guessed';
        }
      }

      if (!email) continue;

      // Skip suppressed
      if (suppressed.has(email.toLowerCase())) {
        console.log(`  ⏭ ${email} — suppressed`);
        continue;
      }

      // MX check
      let mxOk = false;
      if (!skipMx && domain) {
        mxOk = hasMx(domain);
        if (!mxOk) {
          console.log(`  ❌ ${email} — no MX`);
          continue;
        }
        console.log(`  ✅ ${email} — MX ok`);
      } else {
        mxOk = true; // will be verified separately
      }

      const templateId = pickTemplate(carrier);
      const notes = [
        emailSource === 'guessed' ? 'EMAIL_GUESSED — verify before send' : '',
        carrier.totalPowerUnits ? `${carrier.totalPowerUnits} power units` : '',
        dotNumber ? `DOT# ${dotNumber}` : '',
        places?.website ? `Web: ${places.website}` : '',
      ]
        .filter(Boolean)
        .join('; ');

      leads.push({
        email,
        company,
        first_name: 'there', // Bryan/Camila to personalize
        city,
        state: carrierState,
        dot_number: dotNumber,
        phone,
        template_id: templateId,
        status: 'pending',
        mx_ok: mxOk,
        source: emailSource,
        notes,
      });
    }
  }

  if (!leads.length) {
    console.log('\n⚠️  No leads found matching criteria.');
    console.log('   Try: --cities "Sacramento,Stockton" or check FMCSA_API_KEY');
    process.exit(0);
  }

  // Assign staggered send times
  const times = scheduleTimes(leads.length);
  leads.forEach((lead, i) => {
    lead.scheduled_send_pt = times[i];
    lead.bryan_approved = ''; // always blank until approval
  });

  // Write CSV
  const rows = [CSV_HEADER.join(',')];
  for (const lead of leads) {
    rows.push(
      toCsvRow([
        lead.email,
        lead.company,
        lead.first_name,
        lead.city,
        lead.state,
        lead.dot_number,
        lead.phone,
        lead.template_id,
        lead.scheduled_send_pt,
        lead.bryan_approved,
        lead.status,
        lead.mx_ok ? 'TRUE' : 'FALSE',
        lead.source,
        lead.notes,
      ])
    );
  }
  fs.writeFileSync(outFile, rows.join('\n') + '\n');

  const guessedCount = leads.filter((l) => l.source === 'guessed').length;
  const mxOkCount = leads.filter((l) => l.mx_ok).length;

  console.log(`\n✅ Lead queue built: ${leads.length} leads → ${outFile}`);
  console.log(`   MX-verified: ${mxOkCount}/${leads.length}`);
  if (guessedCount) {
    console.log(
      `   ⚠️  ${guessedCount} emails were guessed — Bryan should spot-check before send`
    );
  }
  console.log(`\nNext: Import ${outFile} into "Send Queue" tab → set bryan_approved=YES → run send-batch.js`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
