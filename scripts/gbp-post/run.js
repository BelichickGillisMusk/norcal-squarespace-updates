#!/usr/bin/env node
/**
 * gbp-post — weekly GBP post queue status for Samantha
 *
 * Emits SAMANTHA_STATUS_gbp-post_YYYY-MM-DD.json:
 *
 *   {
 *     "agent": "Samantha",
 *     "cron": "gbp-post",
 *     "date": "YYYY-MM-DD",
 *     "status": "PASS|PARTIAL|FAIL",
 *     "rating": "A+|A|B|C",
 *     "found": { ... },
 *     "actions_needed": [ ... ],
 *     "generated_at": "ISO-timestamp"
 *   }
 */

import fs from 'fs';
import path from 'path';
import { summarizeWeek } from './lib/posts.js';
import { computeStatus, computeRating, buildActions } from './lib/rating.js';

const CRON_NAME = 'gbp-post';
const AGENT_NAME = 'Samantha';

function parseArgs(argv) {
  const args = { fixtures: null, date: null, pretty: false, out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixtures') args.fixtures = argv[++i];
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--pretty') args.pretty = true;
    else if (a === '--out') args.out = argv[++i];
  }
  return args;
}

function todayPacific() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function defaultOutPath(dateStr) {
  return `SAMANTHA_STATUS_gbp-post_${dateStr}.json`;
}

async function loadPosts({ fixtures }) {
  const steps = [];

  if (fixtures) {
    const raw = fs.readFileSync(path.resolve(fixtures), 'utf8');
    const fx = JSON.parse(raw);
    steps.push({ name: 'load_fixtures', result: 'ok', detail: fixtures });
    return { posts: fx.posts || [], steps };
  }

  try {
    const { readGbpPostsTab } = await import('./lib/sheets.js');
    const { posts, degraded, detail } = await readGbpPostsTab();
    steps.push({
      name: 'read_gbp_posts_tab',
      result: degraded ? 'degraded' : 'ok',
      detail
    });
    return { posts, steps };
  } catch (err) {
    steps.push({
      name: 'read_gbp_posts_tab',
      result: 'error',
      detail: String(err.message || err)
    });
    return { posts: [], steps };
  }
}

function stripInternalRows(found) {
  const { _rows, ...publicFound } = found;
  return publicFound;
}

export async function buildReport({ fixtures = null, date = null } = {}) {
  const dateStr = date || todayPacific();
  const { posts, steps } = await loadPosts({ fixtures });
  const found = summarizeWeek(posts, dateStr);
  const status = computeStatus(steps);
  const rating = computeRating({ status, found, dateStr });
  const actions_needed = buildActions({ found, dateStr });

  const report = {
    agent: AGENT_NAME,
    cron: CRON_NAME,
    date: dateStr,
    status,
    rating,
    found: stripInternalRows(found),
    actions_needed,
    generated_at: new Date().toISOString(),
    _steps: steps
  };

  return report;
}

async function main() {
  const args = parseArgs(process.argv);
  const dateStr = args.date || todayPacific();
  const report = await buildReport({ fixtures: args.fixtures, date: dateStr });

  const { _steps, ...publicReport } = report;
  const space = args.pretty ? 2 : 0;
  const json = JSON.stringify(publicReport, null, space);

  process.stdout.write(json + '\n');

  const outPath = args.out || defaultOutPath(dateStr);
  const outDir = path.dirname(outPath);
  if (outDir && outDir !== '.') fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, json + '\n', 'utf8');

  if (report.status === 'FAIL') process.exit(2);
  if (report.actions_needed.length > 0) process.exit(1);
  process.exit(0);
}

const isMain =
  import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('run.js');
if (isMain) {
  main().catch((err) => {
    const dateStr = todayPacific();
    const fail = {
      agent: AGENT_NAME,
      cron: CRON_NAME,
      date: dateStr,
      status: 'FAIL',
      rating: 'C',
      found: {
        posts_scheduled_this_week: 0,
        posts_published_this_week: 0,
        posts_pending_approval: 0,
        posts_approved_unpublished: 0,
        next_scheduled_date: null
      },
      actions_needed: [
        {
          kind: 'cron_failure',
          priority: 'high',
          message: String(err.message || err)
        }
      ],
      generated_at: new Date().toISOString()
    };
    process.stdout.write(JSON.stringify(fail, null, 2) + '\n');
    process.exit(2);
  });
}
