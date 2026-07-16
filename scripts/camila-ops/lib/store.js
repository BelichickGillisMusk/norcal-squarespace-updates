#!/usr/bin/env node
/** Local queue + send log (durable under data/; CI uploads as artifacts) */

import fs from 'fs';
import path from 'path';

const DATA = path.resolve(import.meta.dirname, '../data');

function ensureData() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

export function todayPt() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

export function queuePath(date = todayPt()) {
  return path.join(DATA, `queue-${date}.json`);
}

export function logPath() {
  return path.join(DATA, 'send-log.jsonl');
}

export function dailySummaryPath(date = todayPt()) {
  return path.join(DATA, `sent-${date}.csv`);
}

export function loadQueue(date = todayPt()) {
  ensureData();
  const p = queuePath(date);
  if (!fs.existsSync(p)) return { date, industry: null, leads: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function saveQueue(queue) {
  ensureData();
  fs.writeFileSync(queuePath(queue.date), JSON.stringify(queue, null, 2) + '\n');
}

export function appendSendLog(entry) {
  ensureData();
  fs.appendFileSync(logPath(), JSON.stringify(entry) + '\n');
}

export function countSentToday(date = todayPt()) {
  ensureData();
  const p = logPath();
  if (!fs.existsSync(p)) return { total: 0, byMetro: {} };
  const byMetro = {};
  let total = 0;
  for (const line of fs.readFileSync(p, 'utf8').split('\n').filter(Boolean)) {
    try {
      const row = JSON.parse(line);
      if (row.date !== date || row.status !== 'sent') continue;
      total++;
      byMetro[row.metro] = (byMetro[row.metro] || 0) + 1;
    } catch {
      /* skip */
    }
  }
  return { total, byMetro };
}

export function writeDailyCsv(date = todayPt()) {
  ensureData();
  const p = logPath();
  const rows = [['email', 'company', 'metro', 'city', 'industry', 'status', 'sent_at', 'notes']];
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n').filter(Boolean)) {
      try {
        const r = JSON.parse(line);
        if (r.date !== date) continue;
        rows.push([
          r.email,
          r.company,
          r.metro,
          r.city,
          r.industry,
          r.status,
          r.sent_at || '',
          r.notes || '',
        ]);
      } catch {
        /* skip */
      }
    }
  }
  const csv = rows
    .map((cols) =>
      cols
        .map((c) => {
          const s = String(c ?? '');
          return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');
  fs.writeFileSync(dailySummaryPath(date), csv + '\n');
  return dailySummaryPath(date);
}

export function loadSuppressionEmails() {
  const candidates = [
    path.resolve(import.meta.dirname, '../../cold-outreach/suppression-template.csv'),
    path.join(DATA, 'suppression.csv'),
  ];
  const set = new Set();
  for (const f of candidates) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const email = line.split(',')[0]?.trim().toLowerCase();
      if (email && email.includes('@') && email !== 'email') set.add(email);
    }
  }
  return set;
}
