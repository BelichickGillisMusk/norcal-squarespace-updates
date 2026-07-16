#!/usr/bin/env node
/**
 * Camila Ops — internal cold-send app
 *
 * Nightly: Places discover (18 URLs) → MX → queue for today
 * Hourly: send up to 3 (respects 5 per metro, 20–25/day cap)
 * Always: append send-log.jsonl + daily CSV
 *
 * Usage:
 *   node run.js status
 *   node run.js discover --industry cranes --dry-run
 *   node run.js discover --industry cranes
 *   node run.js hourly --dry-run
 *   node run.js hourly
 *   node run.js seed-demo
 *   node run.js import-csv --file tow-list.csv --industry tow_trucks
 *   node run.js discover --industry tow_trucks   # Places pool → skim 20 MX-ok
 *   node federal-skim.js --with-email --limit 500  # FMCSA census ≤150mi Sac+Oak
 *
 * Funnel: Places/CSV/federal (~1000 candidates) → website+MX → queue 20/day (5×4 metros)
 *
 * Live: GOOGLE_PLACES_API_KEY (Hermes) + CAMILA_SERVICE_ACCOUNT_JSON + COLD_OUTREACH_LIVE=true
 */

import fs from 'fs';
import path from 'path';
import { parseArgs } from 'node:util';
import { searchPlaces, hasPlacesKey } from './lib/places.js';
import { guessEmail, hasMx } from './lib/mx.js';
import { renderCraneEmail } from './lib/templates.js';
import { sendEmail, canSendLive } from './lib/send.js';
import {
  todayPt,
  loadQueue,
  saveQueue,
  appendSendLog,
  countSentToday,
  writeDailyCsv,
  loadSuppressionEmails,
} from './lib/store.js';

const CONFIG = JSON.parse(
  fs.readFileSync(
    path.resolve(import.meta.dirname, '../../config/camila-ops-rotation.json'),
    'utf8'
  )
);

function activeIndustry(preferred) {
  if (preferred) {
    return CONFIG.industry_rotation.find((i) => i.id === preferred) || null;
  }
  const active = CONFIG.industry_rotation.filter((i) => i.active);
  active.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  return active[0] || CONFIG.industry_rotation[0];
}

function urlsForIndustry(industryId) {
  return CONFIG.places_search_urls.filter((u) => u.industry === industryId);
}

function poolPath(industryId) {
  return path.resolve(import.meta.dirname, `data/pool-${industryId}.jsonl`);
}

function appendPool(industryId, rows) {
  const p = poolPath(industryId);
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const row of rows) {
    fs.appendFileSync(p, JSON.stringify(row) + '\n');
  }
}

function inferMetro(city) {
  const c = String(city || '').toLowerCase();
  for (const [metro, cfg] of Object.entries(CONFIG.metros)) {
    if (cfg.cities.some((x) => c.includes(x.toLowerCase()) || x.toLowerCase().includes(c))) {
      return metro;
    }
  }
  if (c.includes('oakland') || c.includes('hayward') || c.includes('bay') || c.includes('fremont') || c.includes('concord')) {
    return 'Bay';
  }
  if (c.includes('jose') || c.includes('clara') || c.includes('milpitas')) return 'San Jose';
  if (c.includes('stockton') || c.includes('modesto') || c.includes('tracy') || c.includes('lodi')) {
    return 'Stockton';
  }
  if (c.includes('sacramento') || c.includes('roseville') || c.includes('elk grove')) {
    return 'Sacramento';
  }
  return 'Sacramento';
}

function readiness() {
  const checks = {
    places_key_hermes: hasPlacesKey(),
    camila_sa_json: Boolean(process.env.CAMILA_SERVICE_ACCOUNT_JSON),
    cold_live: process.env.COLD_OUTREACH_LIVE === 'true',
    can_send_live: canSendLive(),
    standing_approval: Boolean(CONFIG.standing_bryan_approval?.date),
    places_urls: CONFIG.places_search_urls.length >= 12,
    tow_trucks_urls: urlsForIndustry('tow_trucks').length >= 8,
  };
  const ready = checks.places_key_hermes && checks.camila_sa_json && checks.cold_live;
  return { ready, checks };
}

async function cmdStatus() {
  const date = todayPt();
  const sent = countSentToday(date);
  const queue = loadQueue(date);
  const { ready, checks } = readiness();

  console.log(`\n🏗️  Camila Ops status — ${date} PT`);
  console.log(`   Ready to LIVE send: ${ready ? 'YES' : 'NO'}`);
  for (const [k, v] of Object.entries(checks)) {
    console.log(`   ${v ? '✅' : '❌'} ${k}`);
  }
  console.log(`\n   Sent today: ${sent.total} / ${CONFIG.target_per_day} (cap ${CONFIG.daily_cap})`);
  for (const metro of Object.keys(CONFIG.metros)) {
    const n = sent.byMetro[metro] || 0;
    const q = CONFIG.metros[metro].quota;
    console.log(`   ${metro}: ${n}/${q}`);
  }
  console.log(`\n   Queue: ${queue.leads?.length || 0} leads (industry=${queue.industry || '—'})`);
  const pending = (queue.leads || []).filter((l) => l.status === 'pending').length;
  console.log(`   Pending in queue: ${pending}`);
  console.log(`\n   Next: ${ready ? 'npm run hourly' : 'set Hermes Places key + CAMILA_SERVICE_ACCOUNT_JSON + COLD_OUTREACH_LIVE=true'}`);
  console.log('');
}

async function cmdDiscover({ industryId, dryRun }) {
  const industry = activeIndustry(industryId || 'tow_trucks');
  if (!industry) {
    console.error('Unknown industry');
    process.exit(1);
  }

  const date = todayPt();
  const urls = urlsForIndustry(industry.id);
  const maxPerQuery = CONFIG.funnel?.places_max_per_query || 60;
  console.log(`\n🔍 Discover — ${industry.label} (${urls.length} Places URLs, up to ${maxPerQuery}/query)`);
  console.log(`   Funnel goal: ~1000 candidates → skim ${CONFIG.target_per_day} MX-ok`);
  console.log(`   Date: ${date} | Dry-run: ${dryRun}`);

  if (dryRun && !hasPlacesKey()) {
    console.log('[dry-run] No Places key — would query:');
    for (const u of urls) {
      console.log(`   #${u.id} [${u.metro}] ${u.query}`);
    }
    console.log(`\nSet GOOGLE_PLACES_API_KEY from Hermes GCP to run live discover.`);
    console.log('Or drop a list: node run.js import-csv --file tow-list.csv --industry tow_trucks');
    return;
  }

  const suppressed = loadSuppressionEmails();
  const already = new Set();
  const funnel = { places: 0, with_website: 0, mx_ok: 0, suppressed: 0, queued: 0 };
  const poolRows = [];
  const leads = [];

  for (const u of urls) {
    console.log(`   → #${u.id} ${u.query}`);
    let places = [];
    try {
      places = await searchPlaces({
        query: u.query,
        metro: u.metro,
        industry: industry.id,
        city: u.city,
        max: maxPerQuery,
      });
    } catch (err) {
      console.error(`     Places error: ${err.message}`);
      continue;
    }

    funnel.places += places.length;

    for (const p of places) {
      const poolRow = {
        scraped_at: new Date().toISOString(),
        industry: industry.id,
        metro: u.metro,
        city: u.city,
        company: p.name,
        phone: p.phone || '',
        website: p.website || '',
        domain: p.domain || '',
        place_id: p.place_id || '',
        query_id: u.id,
        mx_ok: false,
        email: null,
      };

      if (!p.domain) {
        poolRows.push(poolRow);
        continue;
      }
      funnel.with_website++;

      const guessed = guessEmail(p.domain);
      poolRow.email = guessed.email;
      poolRow.mx_ok = Boolean(guessed.mx_ok);
      poolRows.push(poolRow);

      if (!guessed.email || !guessed.mx_ok) continue;
      funnel.mx_ok++;

      if (suppressed.has(guessed.email) || already.has(guessed.email)) {
        funnel.suppressed++;
        continue;
      }
      already.add(guessed.email);

      const metroCount = leads.filter((l) => l.metro === u.metro).length;
      if (metroCount >= CONFIG.per_city_quota + 5) continue; // buffer in pool→queue

      leads.push({
        email: guessed.email,
        company: p.name,
        first_name: 'there',
        city: u.city,
        metro: u.metro,
        industry: industry.id,
        phone: p.phone || '',
        website: p.website || '',
        domain: p.domain,
        place_id: p.place_id,
        template_id: CONFIG.template_id,
        mx_ok: true,
        email_guessed: true,
        status: 'pending',
        industry_hook: industry.email_hook,
        query_id: u.id,
        notes: `Places #${u.id}; enrich later`,
      });
    }
  }

  // Skim to daily shape: 5 per metro (+2 buffer)
  const trimmed = [];
  const metroCounts = {};
  for (const lead of leads) {
    metroCounts[lead.metro] = metroCounts[lead.metro] || 0;
    if (metroCounts[lead.metro] >= CONFIG.per_city_quota + 2) continue;
    metroCounts[lead.metro]++;
    trimmed.push(lead);
  }
  funnel.queued = trimmed.length;

  const queue = {
    date,
    industry: industry.id,
    built_at: new Date().toISOString(),
    funnel,
    leads: trimmed,
  };

  if (!dryRun) {
    if (CONFIG.funnel?.keep_pool !== false && poolRows.length) {
      appendPool(industry.id, poolRows);
      console.log(`\n📦 Pool appended: ${poolRows.length} → data/pool-${industry.id}.jsonl`);
    }
    saveQueue(queue);
    console.log(`✅ Queue saved: ${trimmed.length} MX-ok → data/queue-${date}.json`);
  } else {
    console.log(`\n[dry-run] Would pool ${poolRows.length}, queue ${trimmed.length}`);
  }

  console.log(`\n📊 Funnel: places=${funnel.places} → website=${funnel.with_website} → mx_ok=${funnel.mx_ok} → queued=${funnel.queued} (suppressed=${funnel.suppressed})`);
  for (const metro of Object.keys(CONFIG.metros)) {
    const n = trimmed.filter((l) => l.metro === metro).length;
    console.log(`   ${metro}: ${n}/${CONFIG.metros[metro].quota}`);
  }
}

/**
 * Import a tow/crane/concrete CSV list (phone+company OK; email optional).
 * Columns: email,company,city,phone,website,metro (header row)
 * MX-checks emails / guesses from website domain → fills today's queue.
 */
async function cmdImportCsv({ file, industryId, dryRun }) {
  if (!file || !fs.existsSync(file)) {
    console.error('Usage: node run.js import-csv --file path/to/list.csv --industry tow_trucks');
    process.exit(1);
  }
  const industry = activeIndustry(industryId || 'tow_trucks');
  const date = todayPt();
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  if (!lines.length) {
    console.error('Empty CSV');
    process.exit(1);
  }

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
  const idx = (name) => header.indexOf(name);
  const suppressed = loadSuppressionEmails();
  const already = new Set();
  const poolRows = [];
  const leads = [];
  const funnel = { rows: 0, mx_ok: 0, queued: 0 };

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    funnel.rows++;
    const company = cols[idx('company')] || cols[1] || '';
    const city = cols[idx('city')] || cols[2] || '';
    const phone = cols[idx('phone')] || '';
    const website = cols[idx('website')] || '';
    let email = (cols[idx('email')] || cols[0] || '').toLowerCase();
    let metro = cols[idx('metro')] || inferMetro(city);
    let domain = null;

    if (website) {
      try {
        domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace(/^www\./, '');
      } catch {
        domain = null;
      }
    }
    if ((!email || !email.includes('@')) && domain) {
      const g = guessEmail(domain);
      email = g.email || '';
    }

    const poolRow = {
      scraped_at: new Date().toISOString(),
      source: 'csv_import',
      industry: industry.id,
      metro,
      city,
      company,
      phone,
      website,
      domain: domain || '',
      email: email || null,
      mx_ok: false,
    };

    if (!email || !email.includes('@')) {
      poolRows.push(poolRow);
      continue;
    }

    const domainFromEmail = email.split('@')[1];
    const mxOk = hasMx(domainFromEmail);
    poolRow.mx_ok = mxOk;
    poolRow.email = email;
    poolRows.push(poolRow);

    if (!mxOk) continue;
    funnel.mx_ok++;
    if (suppressed.has(email) || already.has(email)) continue;
    already.add(email);

    const metroCount = leads.filter((l) => l.metro === metro).length;
    if (metroCount >= CONFIG.per_city_quota + 2) continue;

    leads.push({
      email,
      company: company || email,
      first_name: 'there',
      city: city || metro,
      metro,
      industry: industry.id,
      phone,
      website,
      domain: domainFromEmail,
      template_id: CONFIG.template_id,
      mx_ok: true,
      email_guessed: !cols[idx('email')],
      status: 'pending',
      industry_hook: industry.email_hook,
      notes: 'csv_import; enrich later',
    });
  }

  funnel.queued = leads.length;
  const queue = { date, industry: industry.id, built_at: new Date().toISOString(), funnel, leads };

  console.log(`\n📥 CSV import — ${file}`);
  console.log(`   rows=${funnel.rows} → mx_ok=${funnel.mx_ok} → queued=${funnel.queued}`);

  if (!dryRun) {
    appendPool(industry.id, poolRows);
    saveQueue(queue);
    console.log(`✅ Pool + queue saved for ${date} (${industry.id})`);
  } else {
    console.log('[dry-run] No files written');
  }
}

async function cmdHourly({ dryRun, chunk }) {
  const date = todayPt();
  const queue = loadQueue(date);
  const sent = countSentToday(date);
  const chunkSize = chunk || CONFIG.hourly_chunk_size || 3;

  console.log(`\n✉️  Hourly send — ${date} PT`);
  console.log(`   Already sent: ${sent.total} | Chunk: ${chunkSize} | Dry-run: ${dryRun}`);

  if (sent.total >= CONFIG.daily_cap) {
    console.log('⏸ Daily cap reached — stop.');
    writeDailyCsv(date);
    return;
  }

  if (!queue.leads?.length) {
    console.log('⚠️  No queue for today. Run: node run.js discover --industry tow_trucks');
    return;
  }

  const industry = activeIndustry(queue.industry);
  const toSend = [];

  for (const lead of queue.leads) {
    if (toSend.length >= chunkSize) break;
    if (lead.status !== 'pending') continue;
    if (!lead.mx_ok) continue;

    const metroSent = sent.byMetro[lead.metro] || 0;
    const metroQueued = toSend.filter((l) => l.metro === lead.metro).length;
    const quota = CONFIG.metros[lead.metro]?.quota || 5;
    if (metroSent + metroQueued >= quota) continue;
    if (sent.total + toSend.length >= CONFIG.target_per_day) break;

    toSend.push(lead);
  }

  if (!toSend.length) {
    console.log('⏸ Nothing to send (quotas full or queue exhausted).');
    writeDailyCsv(date);
    return;
  }

  for (const lead of toSend) {
    const { subject, body } = renderCraneEmail({
      company: lead.company,
      city: lead.city,
      industry_hook: lead.industry_hook || industry?.email_hook,
    });

    console.log(`   → ${lead.email} (${lead.metro}) ${lead.company}`);

    try {
      const result = await sendEmail({
        to: lead.email,
        subject,
        body,
        dryRun,
      });

      const entry = {
        date,
        email: lead.email,
        company: lead.company,
        metro: lead.metro,
        city: lead.city,
        industry: lead.industry || queue.industry,
        status: dryRun ? 'dry_run' : 'sent',
        sent_at: new Date().toISOString(),
        gmail_id: result.id,
        subject,
        notes: lead.notes || '',
      };
      appendSendLog(entry);

      if (!dryRun) {
        lead.status = 'sent';
        lead.sent_at = entry.sent_at;
        sent.total++;
        sent.byMetro[lead.metro] = (sent.byMetro[lead.metro] || 0) + 1;
      } else {
        lead.status = 'dry_run';
      }
    } catch (err) {
      console.error(`     ❌ ${err.message}`);
      appendSendLog({
        date,
        email: lead.email,
        company: lead.company,
        metro: lead.metro,
        city: lead.city,
        industry: lead.industry,
        status: 'error',
        sent_at: new Date().toISOString(),
        notes: err.message,
      });
    }
  }

  saveQueue(queue);
  const csv = writeDailyCsv(date);
  console.log(`\n✅ Chunk done. Log: data/send-log.jsonl | CSV: ${path.basename(csv)}`);
  console.log(`   Day total (sent): ${countSentToday(date).total}`);
}

async function cmdSeedDemo() {
  const date = todayPt();
  const demo = {
    date,
    industry: 'cranes',
    built_at: new Date().toISOString(),
    leads: [
      {
        email: 'info@example-crane-sac.test',
        company: 'Demo Crane Sacramento',
        city: 'Sacramento',
        metro: 'Sacramento',
        industry: 'cranes',
        mx_ok: true,
        status: 'pending',
        industry_hook: 'crane trucks and support diesel',
        notes: 'DEMO — not a real address',
      },
      {
        email: 'info@example-crane-bay.test',
        company: 'Demo Crane Bay',
        city: 'Oakland',
        metro: 'Bay',
        industry: 'cranes',
        mx_ok: true,
        status: 'pending',
        industry_hook: 'crane trucks and support diesel',
        notes: 'DEMO',
      },
      {
        email: 'info@example-crane-sj.test',
        company: 'Demo Crane San Jose',
        city: 'San Jose',
        metro: 'San Jose',
        industry: 'cranes',
        mx_ok: true,
        status: 'pending',
        industry_hook: 'crane trucks and support diesel',
        notes: 'DEMO',
      },
      {
        email: 'info@example-crane-stk.test',
        company: 'Demo Crane Stockton',
        city: 'Stockton',
        metro: 'Stockton',
        industry: 'cranes',
        mx_ok: true,
        status: 'pending',
        industry_hook: 'crane trucks and support diesel',
        notes: 'DEMO',
      },
    ],
  };
  saveQueue(demo);
  console.log(`✅ Demo queue written for ${date} (${demo.leads.length} leads)`);
  console.log('   Run: node run.js hourly --dry-run');
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      industry: { type: 'string' },
      file: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      chunk: { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  const cmd = positionals[0] || 'status';
  const dryRun = values['dry-run'] || false;

  switch (cmd) {
    case 'status':
      await cmdStatus();
      break;
    case 'discover':
      await cmdDiscover({ industryId: values.industry || 'tow_trucks', dryRun });
      break;
    case 'import-csv':
      await cmdImportCsv({
        file: values.file,
        industryId: values.industry || 'tow_trucks',
        dryRun,
      });
      break;
    case 'hourly':
      await cmdHourly({
        dryRun,
        chunk: values.chunk ? parseInt(values.chunk, 10) : undefined,
      });
      break;
    case 'seed-demo':
      await cmdSeedDemo();
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.error('Commands: status | discover | import-csv | hourly | seed-demo');
      console.error('Also: node federal-skim.js --with-email  (FMCSA ≤150mi Sac+Oak)');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
