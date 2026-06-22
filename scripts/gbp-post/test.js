import assert from 'node:assert/strict';
import { postsInWeek, summarizeWeek, isApproved } from './lib/posts.js';
import { computeStatus, computeRating, buildActions } from './lib/rating.js';
import { buildReport } from './run.js';

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('gbp-post tests\n');

test('isApproved accepts YES and approved status', () => {
  assert.equal(isApproved({ bryan_approved: 'YES' }), true);
  assert.equal(isApproved({ status: 'approved' }), true);
  assert.equal(isApproved({ bryan_approved: '' }), false);
});

test('postsInWeek filters to Pacific week window', () => {
  const posts = [
    { publish_date: '2026-06-17', status: 'published' },
    { publish_date: '2026-06-20', status: 'draft' },
    { publish_date: '2026-06-27', status: 'draft' }
  ];
  const inWeek = postsInWeek(posts, '2026-06-20');
  assert.equal(inWeek.length, 2);
});

test('summarizeWeek counts published vs pending', () => {
  const posts = [
    { publish_date: '2026-06-17', status: 'published', bryan_approved: 'YES' },
    { publish_date: '2026-06-20', status: 'draft', post_title: 'Tools hub' }
  ];
  const found = summarizeWeek(posts, '2026-06-20');
  assert.equal(found.posts_scheduled_this_week, 2);
  assert.equal(found.posts_published_this_week, 1);
  assert.equal(found.posts_pending_approval, 1);
});

test('computeStatus marks errors as FAIL', () => {
  assert.equal(computeStatus([{ result: 'ok' }]), 'PASS');
  assert.equal(computeStatus([{ result: 'error' }]), 'FAIL');
  assert.equal(computeStatus([{ result: 'degraded' }]), 'PARTIAL');
});

test('computeRating gives A+ for two published posts', () => {
  const found = {
    posts_scheduled_this_week: 2,
    posts_published_this_week: 2,
    posts_pending_approval: 0,
    posts_approved_unpublished: 0
  };
  assert.equal(computeRating({ status: 'PASS', found, dateStr: '2026-06-20' }), 'A+');
});

test('buildActions surfaces approve_gbp_post for unapproved draft', () => {
  const found = summarizeWeek(
    [{ publish_date: '2026-06-20', status: 'draft', post_title: 'Tools hub' }],
    '2026-06-20'
  );
  const actions = buildActions({ found, dateStr: '2026-06-20' });
  assert.ok(actions.some((a) => a.kind === 'approve_gbp_post'));
});

test('fixture report matches SAMANTHA_STATUS contract keys', async () => {
  const report = await buildReport({
    fixtures: 'fixtures/sample-week.json',
    date: '2026-06-20'
  });
  assert.equal(report.agent, 'Samantha');
  assert.equal(report.cron, 'gbp-post');
  assert.equal(report.date, '2026-06-20');
  assert.ok(['PASS', 'PARTIAL', 'FAIL'].includes(report.status));
  assert.ok(['A+', 'A', 'B', 'C'].includes(report.rating));
  assert.ok(typeof report.found.posts_scheduled_this_week === 'number');
  assert.ok(Array.isArray(report.actions_needed));
  assert.ok(report.generated_at);
  assert.equal(report.found._rows, undefined);
});

console.log(`\n${passed} passed`);
