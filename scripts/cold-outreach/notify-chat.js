#!/usr/bin/env node
/**
 * Google Chat webhook notifier — sends structured cards to Bryan's space
 *
 * Usage (standalone):
 *   node notify-chat.js --text "Batch ready: 28 emails for 2026-07-01. Reply 'approved batch 2026-07-01'"
 *   node notify-chat.js --event draft_ready --count 28 --date 2026-07-01
 *   node notify-chat.js --event first_draft_sent --to "Joe Smith <joe@fleet.com>"
 *
 * Required env:
 *   GOOGLE_CHAT_WEBHOOK_URL  — from Chat space → Manage webhooks
 *
 * Optional env:
 *   CHAT_DRY_RUN=true  — print payload, do not POST
 */

import { parseArgs } from 'node:util';

const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL || '';
const DRY_RUN =
  process.env.CHAT_DRY_RUN === 'true' || process.env.CHAT_DRY_RUN === '1';

const ICON_MAP = {
  draft_ready: '📬',
  first_draft_sent: '✉️',
  batch_approved: '✅',
  bounce_alert: '⚠️',
  opt_out: '🛑',
  error: '❌',
  info: 'ℹ️',
};

/**
 * Build a Google Chat card payload for a structured event.
 * Falls back to a plain text message for freeform --text sends.
 */
function buildPayload({ text, event, count, date, to, notes }) {
  if (text) {
    return { text };
  }

  const icon = ICON_MAP[event] || 'ℹ️';
  const ts = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  switch (event) {
    case 'draft_ready': {
      const batchDate = date || new Date().toISOString().slice(0, 10);
      return {
        cards: [
          {
            header: {
              title: `${icon} Cold batch ready — ${batchDate}`,
              subtitle: `Camila · NorCal CARB Mobile · ${ts} PT`,
            },
            sections: [
              {
                widgets: [
                  {
                    keyValue: {
                      topLabel: 'Emails queued',
                      content: String(count ?? '?'),
                    },
                  },
                  {
                    keyValue: {
                      topLabel: 'MX-verified',
                      content: 'See Send Queue sheet',
                    },
                  },
                  {
                    textParagraph: {
                      text: `To approve: reply <b>approved batch ${batchDate}</b> — or set <b>bryan_approved = YES</b> in the sheet for each row.\n\n${notes || ''}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
    }

    case 'first_draft_sent': {
      return {
        cards: [
          {
            header: {
              title: `${icon} First cold draft sent — ${date || new Date().toISOString().slice(0, 10)}`,
              subtitle: `Camila · NorCal CARB Mobile · ${ts} PT`,
            },
            sections: [
              {
                widgets: [
                  {
                    keyValue: {
                      topLabel: 'Sent to',
                      content: to || '(unknown)',
                    },
                  },
                  {
                    textParagraph: {
                      text: notes || 'First email of the cold batch was scheduled in Gmail.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
    }

    case 'bounce_alert': {
      return {
        cards: [
          {
            header: {
              title: `${icon} Bounce alert — action required`,
              subtitle: `Camila · ${ts} PT`,
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `Bounce rate may be elevated. ${notes || 'Check Cold Sends sheet → filter status=bounced. Pause if >3%.'}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
    }

    default: {
      return {
        text: `${icon} [Camila – ${event}] ${notes || ''} (${ts} PT)`,
      };
    }
  }
}

/**
 * POST payload to the Google Chat webhook.
 * Throws on non-2xx.
 */
async function postToChat(payload) {
  if (!WEBHOOK_URL) {
    throw new Error(
      'GOOGLE_CHAT_WEBHOOK_URL is not set. ' +
        'Add it in GitHub secrets (Settings → Secrets → Actions).'
    );
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Chat webhook returned ${res.status}: ${body}`);
  }

  return res;
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      text: { type: 'string' },
      event: { type: 'string' },
      count: { type: 'string' },
      date: { type: 'string' },
      to: { type: 'string' },
      notes: { type: 'string' },
    },
    strict: false,
  });

  const payload = buildPayload({
    text: values.text,
    event: values.event,
    count: values.count ? parseInt(values.count, 10) : undefined,
    date: values.date,
    to: values.to,
    notes: values.notes,
  });

  if (DRY_RUN) {
    console.log('[dry-run] Chat payload:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await postToChat(payload);
  console.log('✅ Chat notification sent.');
}

// Export for use as a module from workflow scripts
export { buildPayload, postToChat };

// Only run as CLI when invoked directly (not when imported as a module)
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch((err) => {
    console.error('❌', err.message);
    process.exit(1);
  });
}
