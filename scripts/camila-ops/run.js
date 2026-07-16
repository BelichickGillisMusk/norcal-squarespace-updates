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
 *   node run.js seed-demo          # local demo queue without Places key
 *
 * Live send requires:
 *   GOOGLE_PLACES_API_KEY   (Hermes GCP)
 *   CAMILA_SERVICE_ACCOUNT_JSON
 *   COLD_OUTREACH_LIVE=true
 *
 * Bryan standing approval 2026-07-16: cranes then concrete, 5×4 metros.
 */

import fs from 'fs';
import path from 'path';
import { parseArgs } from 'node:util';
import { searchPlaces, hasPlacesKey } from './lib/places.js';
import { guessEmail } from './lib/mx.js';
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
  return CONFIG.industry_rotation.find((i) => i.active) || CONFIG.industry_rotation[0];
}

function urlsForIndustry(industryId) {
  return CONFIG.places_search_urls.filter((u) => u.industry === industryId);
}

function readiness() {
  const checks = {
    places_key_hermes: hasPlacesKey(),
    camila_sa_json: Boolean(process.env.CAMILA_SERVICE_ACCOUNT_JSON),
    cold_live: process.env.COLD_OUTREACH_LIVE === 'true',
    can_send_live: canSendLive(),
    standing_approval: Boolean(CONFIG.standing_bryan_approval?.date),
    rotation_config: CONFIG.places_search_urls.length === 18,
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
  const industry = activeIndustry(industryId);
  if (!industry) {
    console.error('Unknown industry');
    process.exit(1);
  }

  const date = todayPt();
  const urls = urlsForIndustry(industry.id);
  console.log(`\n🔍 Discover — ${industry.label} (${urls.length} Places URLs)`);
  console.log(`   Date: ${date} | Dry-run: ${dryRun}`);

  if (dryRun && !hasPlacesKey()) {
    console.log('[dry-run] No Places key — would query:');
    for (const u of urls) {
      console.log(`   #${u.id} [${u.metro}] ${u.query}`);
    }
    console.log(`\nSet GOOGLE_PLACES_API_KEY from Hermes GCP to run live discover.`);
    return;
  }

  const suppressed = loadSuppressionEmails();
  const already = new Set();
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
        max: 6,
      });
    } catch (err) {
      console.error(`     Places error: ${err.message}`);
      continue;
    }

    for (const p of places) {
      if (!p.domain) {
        console.log(`     ⏭ ${p.name} — no website/domain`);
        continue;
      }
      const guessed = guessEmail(p.domain);
      if (!guessed.email || !guessed.mx_ok) {
        console.log(`     ❌ ${p.name} — no MX for ${p.domain}`);
        continue;
      }
      if (suppressed.has(guessed.email) || already.has(guessed.email)) {
        console.log(`     ⏭ ${guessed.email} — suppressed/dup`);
        continue;
      }
      already.add(guessed.email);

      const metroQuota = CONFIG.metros[u.metro]?.quota || 5;
      const metroCount = leads.filter((l) => l.metro === u.metro).length;
      if (metroCount >= metroQuota + 3) {
        // keep a few extras as buffer beyond daily quota
        continue;
      }

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
      console.log(`     ✅ ${guessed.email} — ${p.name} (${u.metro})`);
    }
  }

  // Trim to fill 5 per metro (plus small buffer already limited)
  const trimmed = [];
  const metroCounts = {};
  for (const lead of leads) {
    metroCounts[lead.metro] = metroCounts[lead.metro] || 0;
    if (metroCounts[lead.metro] >= CONFIG.per_city_quota + 2) continue;
    metroCounts[lead.metro]++;
    trimmed.push(lead);
  }

  const queue = {
    date,
    industry: industry.id,
    built_at: new Date().toISOString(),
    leads: trimmed,
  };

  if (!dryRun) {
    saveQueue(queue);
    console.log(`\n✅ Queue saved: ${trimmed.length} leads → data/queue-${date}.json`);
  } else {
    console.log(`\n[dry-run] Would save ${trimmed.length} leads`);
  }

  for (const metro of Object.keys(CONFIG.metros)) {
    const n = trimmed.filter((l) => l.metro === metro).length;
    console.log(`   ${metro}: ${n}`);
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
    console.log('⚠️  No queue for today. Run: node run.js discover --industry cranes');
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
      await cmdDiscover({ industryId: values.industry || 'cranes', dryRun });
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
      console.error('Commands: status | discover | hourly | seed-demo');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
