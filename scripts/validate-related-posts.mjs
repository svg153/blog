import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { relatedPostsFor } from '../src/lib/related-posts.mjs';
import { generatedPostSlugs } from './lib/generated-posts.mjs';

const post = ({
  id,
  date,
  tags = [],
  series,
  draft = false,
}) => ({
  id,
  data: {
    title: id,
    date,
    tags,
    series,
    draft,
  },
});

const now = new Date('2026-09-18T12:00:00Z');
const current = post({
  id: 'current',
  date: '2026-09-10',
  tags: ['GitHub', 'AI Agents'],
  series: { id: 'serie-a', name: 'Serie A', order: 1 },
});

const fixtures = [
  post({
    id: 'same-series-old',
    date: '2025-01-01',
    tags: [],
    series: { id: 'serie-a', name: 'Serie A', order: 2 },
  }),
  post({
    id: 'two-tags',
    date: '2026-09-17',
    tags: ['github', 'AI   Agents'],
  }),
  post({
    id: 'one-tag-new',
    date: '2026-09-18',
    tags: ['GitHub'],
  }),
  post({
    id: 'one-tag-old',
    date: '2026-09-01',
    tags: ['GitHub'],
  }),
  post({
    id: 'no-match-new',
    date: '2026-09-18',
    tags: ['Other'],
  }),
  post({
    id: 'draft-would-win',
    date: '2026-09-18',
    tags: ['GitHub', 'AI Agents'],
    series: { id: 'serie-a', name: 'Serie A', order: 3 },
    draft: true,
  }),
  post({
    id: 'future-would-win',
    date: '2099-01-01',
    tags: ['GitHub', 'AI Agents'],
    series: { id: 'serie-a', name: 'Serie A', order: 4 },
  }),
  current,
];

const ranked = relatedPostsFor(current, fixtures, {
  limit: 5,
  publicationOptions: { now },
});

assert.deepEqual(
  ranked.map((entry) => entry.post.id),
  ['same-series-old', 'two-tags', 'one-tag-new', 'one-tag-old', 'no-match-new'],
  'Ranking must be same series > shared normalized tag count > recency',
);
assert.equal(ranked[0].sameSeries, true);
assert.equal(ranked[1].sharedTagCount, 2);
assert.ok(!ranked.some((entry) => entry.post.id === 'current'));
assert.ok(!ranked.some((entry) => entry.post.id === 'draft-would-win'));
assert.ok(!ranked.some((entry) => entry.post.id === 'future-would-win'));

const limited = relatedPostsFor(current, fixtures, {
  limit: 2,
  publicationOptions: { now },
});
assert.equal(limited.length, 2);
assert.throws(
  () => relatedPostsFor(current, fixtures, { limit: -1 }),
  /non-negative integer/u,
);

const tieA = post({ id: 'a-slug', date: '2026-09-18', tags: ['GitHub'] });
const tieB = post({ id: 'b-slug', date: '2026-09-18', tags: ['GitHub'] });
const tieResult = relatedPostsFor(current, [tieB, tieA, current], {
  publicationOptions: { now },
});
assert.deepEqual(
  tieResult.map((entry) => entry.post.id),
  ['a-slug', 'b-slug'],
  'Slug must be the final deterministic tie-breaker',
);
assert.deepEqual(
  relatedPostsFor(current, fixtures, { limit: 5, publicationOptions: { now } })
    .map((entry) => entry.post.id),
  ranked.map((entry) => entry.post.id),
  'Fixed inputs must always produce the same related ordering',
);

const publicSlugs = new Set(generatedPostSlugs());
assert.ok(publicSlugs.size > 1, 'Expected multiple generated public posts');

for (const slug of publicSlugs) {
  const path = join('dist', 'posts', slug, 'index.html');
  assert.ok(existsSync(path), `Missing article page: ${slug}`);
  const html = readFileSync(path, 'utf8');

  const related = [...html.matchAll(
    /<article\b[^>]*data-related-post=["']([^"']+)["'][^>]*data-related-same-series=["']([^"']+)["'][^>]*data-related-shared-tags=["']([^"']+)["'][^>]*>/giu,
  )].map((match) => ({
    slug: match[1],
    sameSeries: match[2],
    sharedTags: Number(match[3]),
  }));

  assert.ok(related.length > 0, `${slug}: expected at least one related post`);
  assert.ok(related.length <= 3, `${slug}: related list must stay bounded to 3`);
  assert.equal(
    new Set(related.map((entry) => entry.slug)).size,
    related.length,
    `${slug}: related entries must be unique`,
  );

  for (const entry of related) {
    assert.notEqual(entry.slug, slug, `${slug}: current article must not recommend itself`);
    assert.ok(publicSlugs.has(entry.slug), `${slug}: related target ${entry.slug} must be a public generated article`);
    assert.ok(entry.sameSeries === 'true' || entry.sameSeries === 'false');
    assert.ok(Number.isInteger(entry.sharedTags) && entry.sharedTags >= 0);
  }
}

console.log(
  `Related-post validation passed for ${publicSlugs.size} public article(s) plus deterministic ranking fixtures.`,
);
