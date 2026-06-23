/**
 * GBP post queue helpers — week window + status classification.
 */

export function weekBoundsPacific(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 20, 0, 0));
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short'
  }).format(noonUtc);

  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayIdx = dayMap[weekday] ?? 0;
  const weekStart = new Date(noonUtc);
  weekStart.setUTCDate(weekStart.getUTCDate() - dayIdx);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  return { weekStart, weekEnd };
}

export function parsePacificDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 20, 0, 0));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

export function isApproved(row) {
  const approval = String(row.bryan_approved || row.approved || '').trim().toUpperCase();
  return approval === 'YES' || normalizeStatus(row.status) === 'approved';
}

export function postsInWeek(posts, dateStr) {
  const { weekStart, weekEnd } = weekBoundsPacific(dateStr);
  return posts.filter((row) => {
    const when = parsePacificDate(row.publish_date || row.date);
    return when && when >= weekStart && when < weekEnd;
  });
}

export function summarizeWeek(posts, dateStr) {
  const inWeek = postsInWeek(posts, dateStr);
  const published = inWeek.filter((p) => normalizeStatus(p.status) === 'published');
  const pendingApproval = inWeek.filter((p) => {
    const status = normalizeStatus(p.status);
    return status !== 'published' && !isApproved(p);
  });
  const approvedNotPublished = inWeek.filter((p) => {
    const status = normalizeStatus(p.status);
    return status !== 'published' && isApproved(p);
  });

  const future = posts
    .map((p) => ({
      row: p,
      when: parsePacificDate(p.publish_date || p.date)
    }))
    .filter((p) => p.when && p.when >= weekBoundsPacific(dateStr).weekEnd)
    .sort((a, b) => a.when - b.when);

  const nextScheduled = future[0]?.row?.publish_date || future[0]?.row?.date || null;

  return {
    posts_scheduled_this_week: inWeek.length,
    posts_published_this_week: published.length,
    posts_pending_approval: pendingApproval.length,
    posts_approved_unpublished: approvedNotPublished.length,
    next_scheduled_date: nextScheduled,
    _rows: { inWeek, published, pendingApproval, approvedNotPublished }
  };
}
