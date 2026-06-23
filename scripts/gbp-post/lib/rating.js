/**
 * Status + rating for gbp-post weekly check.
 * Target cadence: 2 posts/week (Tue + Fri per Camila playbook).
 */

export function computeStatus(steps) {
  if (steps.some((s) => s.result === 'error')) return 'FAIL';
  if (steps.some((s) => s.result === 'degraded')) return 'PARTIAL';
  return 'PASS';
}

export function computeRating({ status, found, dateStr }) {
  if (status === 'FAIL') return 'C';

  const published = found.posts_published_this_week ?? 0;
  const pending = found.posts_pending_approval ?? 0;
  const approvedUnpub = found.posts_approved_unpublished ?? 0;
  const scheduled = found.posts_scheduled_this_week ?? 0;

  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short'
  }).format(new Date(`${dateStr}T20:00:00Z`));

  const isLateInWeek = ['Thu', 'Fri', 'Sat', 'Sun'].includes(day);
  const behind = isLateInWeek && published === 0 && scheduled > 0;

  if (status === 'PARTIAL') return published > 0 ? 'B' : 'C';
  if (published >= 2) return 'A+';
  if (published === 1 && pending === 0) return 'A';
  if (published === 1 || (approvedUnpub > 0 && pending === 0)) return 'B';
  if (behind || pending > 0) return 'C';
  if (scheduled === 0) return 'B';
  return 'A';
}

export function buildActions({ found, dateStr }) {
  const actions = [];
  const { pendingApproval, approvedNotPublished, inWeek } = found._rows || {};

  for (const row of pendingApproval || []) {
    actions.push({
      kind: 'approve_gbp_post',
      priority: 'high',
      message: `GBP post "${row.post_title || row.title || 'untitled'}" scheduled ${row.publish_date || row.date} needs Bryan approval. Reply "approved gbp post" to publish.`,
      publish_date: row.publish_date || row.date,
      post_title: row.post_title || row.title || null
    });
  }

  for (const row of approvedNotPublished || []) {
    actions.push({
      kind: 'publish_gbp_post',
      priority: 'high',
      message: `GBP post "${row.post_title || row.title || 'untitled'}" is approved but not published. Camila can publish via GBP API.`,
      publish_date: row.publish_date || row.date,
      post_title: row.post_title || row.title || null
    });
  }

  if ((inWeek || []).length === 0) {
    actions.push({
      kind: 'queue_gbp_post',
      priority: 'medium',
      message: `No GBP post queued for week of ${dateStr}. Add a row to the GBP Posts sheet — target 2×/week (deadline season, tools hub).`
    });
  } else if (found.posts_published_this_week === 0) {
    const day = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short'
    }).format(new Date(`${dateStr}T20:00:00Z`));
    if (['Thu', 'Fri', 'Sat'].includes(day)) {
      actions.push({
        kind: 'gbp_post_overdue',
        priority: 'high',
        message: `Zero GBP posts published this week as of ${dateStr}. Queue or publish before weekend.`
      });
    }
  }

  return actions;
}
