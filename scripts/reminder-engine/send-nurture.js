#!/usr/bin/env node
/**
 * NorCal CARB Mobile — welcome + blast nurture emails
 * APPROVED FOR DEPLOYMENT — do not edit without Bryan's approval.
 *
 * Usage:
 *   node send-nurture.js --welcome --dry-run
 *   node send-nurture.js --welcome
 *   node send-nurture.js --blast --campaign-id tools-launch-v1 --dry-run
 *   node send-nurture.js --blast --campaign-id tools-launch-v1   # requires BLAST_APPROVED=true
 */

import {
  loadTemplate, render, baseEmailVars, sendEmail, requireEnv
} from './lib/email.js';
import { getRows, updateCell } from './lib/sheets.js';

const BLAST_COPY = {
  'tools-launch-v1': {
    subject: 'New free tools — Clean Truck Check on your phone',
    headline: 'Free CARB tools — right on your phone',
    body: 'We just launched a tools hub so you can check deadlines, know your test type, and stay compliant without calling CARB. Add any tool to your home screen — works like an app.',
    featured_tool_url_key: 'tools_hub_url',
    featured_tool_cta: 'Open the tools hub'
  },
  'when-is-my-test-due-v1': {
    subject: 'When is your Clean Truck Check due?',
    headline: 'Free deadline calculator + reminders',
    body: 'Enter your registration info once — we\'ll show your next four deadlines and email you at 90, 60, and 30 days. No CARB phone calls required.',
    featured_tool_path: '/tools/when-is-my-test-due',
    featured_tool_cta: 'Calculate my deadline'
  },
  'managed-care-v1': {
    subject: 'Never talk to CARB again — Full Care $40/year',
    headline: 'We handle setup, monitoring, and testing',
    body: 'Tired of CTC-VIS and deadline math? NorCal Family Full Care covers portal setup, monitoring, reminders, and mobile testing — for CARB\'s annual compliance fee plus just $40/year to us.',
    featured_tool_url_key: 'managed_care_url',
    featured_tool_cta: 'Learn about Full Care'
  }
};

function parseArgs(argv) {
  const args = {
    dryRun: false,
    welcome: false,
    blast: false,
    campaignId: null
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    if (argv[i] === '--welcome') args.welcome = true;
    if (argv[i] === '--blast') args.blast = true;
    if (argv[i] === '--campaign-id') args.campaignId = argv[++i];
  }
  return args;
}

function welcomeTemplateFor(audienceType) {
  const t = (audienceType || 'NEW_LEAD').toUpperCase();
  if (t === 'EXISTING_CUSTOMER') return 'welcome-existing-customer.html';
  return 'welcome-new-lead.html';
}

function welcomeSubject(audienceType) {
  const t = (audienceType || 'NEW_LEAD').toUpperCase();
  if (t === 'EXISTING_CUSTOMER') return 'Welcome back — free CARB tools on your phone';
  return 'Welcome to the NorCal family — free tools + Full Care option';
}

async function sendWelcome(args) {
  const { rows } = await getRows();
  let sent = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const row of rows) {
    if (!row.email) continue;
    if (String(row.marketing_opt_in).toUpperCase() !== 'TRUE') continue;
    if (row.welcome_sent) continue;

    const template = welcomeTemplateFor(row.audience_type);
    const html = render(loadTemplate(template), baseEmailVars(row));
    const subject = welcomeSubject(row.audience_type);

    if (args.dryRun) {
      console.log(`[dry-run] welcome → ${row.email} (${row.audience_type || 'NEW_LEAD'})`);
      sent++;
      continue;
    }

    await sendEmail({ to: row.email, subject, html });
    await updateCell(row._rowIndex, 'welcome_sent', today);
    console.log('Welcome sent to', row.email);
    sent++;
  }

  console.log(args.dryRun ? `Welcome dry run: ${sent} would send` : `Welcome done: ${sent} sent`);
}

async function sendBlast(args) {
  if (!args.campaignId) throw new Error('--campaign-id required for blast');
  if (!BLAST_COPY[args.campaignId]) {
    throw new Error(`Unknown campaign-id. Approved: ${Object.keys(BLAST_COPY).join(', ')}`);
  }
  if (!args.dryRun && process.env.BLAST_APPROVED !== 'true') {
    throw new Error('Set BLAST_APPROVED=true after Bryan approves this blast');
  }

  const copy = BLAST_COPY[args.campaignId];
  const { rows } = await getRows();
  let sent = 0;
  const base = requireEnv('SITE_BASE_URL').replace(/\/$/, '');

  for (const row of rows) {
    if (!row.email) continue;
    if (String(row.marketing_opt_in).toUpperCase() !== 'TRUE') continue;
    if (row.last_blast_campaign === args.campaignId) continue;

    const vars = {
      ...baseEmailVars(row),
      blast_subject: copy.subject,
      blast_headline: copy.headline,
      blast_body: copy.body,
      featured_tool_cta: copy.featured_tool_cta,
      featured_tool_url: copy.featured_tool_path
        ? `${base}${copy.featured_tool_path}`
        : baseEmailVars(row)[copy.featured_tool_url_key]
    };

    const html = render(loadTemplate('blast-new-tool.html'), vars);

    if (args.dryRun) {
      console.log(`[dry-run] blast ${args.campaignId} → ${row.email}`);
      sent++;
      continue;
    }

    await sendEmail({ to: row.email, subject: copy.subject, html });
    await updateCell(row._rowIndex, 'last_blast_campaign', args.campaignId);
    console.log('Blast sent to', row.email);
    sent++;
  }

  console.log(args.dryRun ? `Blast dry run: ${sent} would send` : `Blast done: ${sent} sent`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.welcome && !args.blast) {
    throw new Error('Pass --welcome and/or --blast');
  }
  if (args.welcome) await sendWelcome(args);
  if (args.blast) await sendBlast(args);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
