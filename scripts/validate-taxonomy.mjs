import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tagSlug } from '../src/lib/taxonomy.mjs';

const BASE = '/blog/';
const ORIGIN = 'https://svg153.github.io';

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'iu'));
  return match?.[1];
};

const openingTags = (html, tagName) => [
  ...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'giu')),
].map((match) => match[0]);

const dataValues = (html, tagName, attrName) =>
  openingTags(html, tagName)
    .map((tag) => getAttr(tag, attrName))
    .filter(Boolean);

assert.equal(tagSlug('  ÁI   Agents '), 'ai-agents');
assert.equal(tagSlug('CI/CD'), 'ci-cd');
assert.equal(tagSlug('C++'), 'c-plus-plus');
assert.equal(tagSlug('R&D'), 'r-and-d');

const postsDir = join('dist', 'posts');
const postSlugs = readdirSync(postsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.ok(postSlugs.length > 0, 'Expected generated article pages');

const expectedTags = new Map();
const postDates = new Map();

for (const postSlugValue of postSlugs) {
  const path = join(postsDir, postSlugValue, 'index.html');
  const html = readFileSync(path, 'utf8');

  const timeTag = openingTags(html, 'time').find((tag) => getAttr(tag, 'datetime'));
  const date = timeTag && getAttr(timeTag, 'datetime');
  assert.ok(date, `${postSlugValue}: missing article datetime for archive validation`);
  postDates.set(postSlugValue, date);

  const tagAnchors = openingTags(html, 'a').filter((tag) => getAttr(tag, 'data-tag-slug'));
  assert.ok(tagAnchors.length > 0, `${postSlugValue}: expected linked tags`);

  const seen = new Set();
  for (const anchor of tagAnchors) {
    const slug = getAttr(anchor, 'data-tag-slug');
    const href = getAttr(anchor, 'href');
    assert.ok(slug, `${postSlugValue}: tag link without slug`);
    assert.equal(href, `${BASE}tags/${slug}/`, `${postSlugValue}: unstable tag href for ${slug}`);
    assert.ok(!seen.has(slug), `${postSlugValue}: duplicate normalized tag ${slug}`);
    seen.add(slug);

    const members = expectedTags.get(slug) ?? new Set();
    members.add(postSlugValue);
    expectedTags.set(slug, members);
  }
}

const tagsIndexPath = join('dist', 'tags', 'index.html');
assert.ok(existsSync(tagsIndexPath), 'Missing /tags/ index');
const tagsIndexHtml = readFileSync(tagsIndexPath, 'utf8');
const indexAnchors = openingTags(tagsIndexHtml, 'a').filter((tag) => getAttr(tag, 'data-tag-index-slug'));
const indexSlugs = indexAnchors.map((tag) => getAttr(tag, 'data-tag-index-slug')).sort();
assert.deepEqual(indexSlugs, [...expectedTags.keys()].sort(), '/tags/ must contain each normalized tag exactly once');

for (const anchor of indexAnchors) {
  const slug = getAttr(anchor, 'data-tag-index-slug');
  const count = Number(getAttr(anchor, 'data-count'));
  const href = getAttr(anchor, 'href');
  assert.equal(count, expectedTags.get(slug)?.size, `${slug}: tag index count mismatch`);
  assert.equal(href, `${BASE}tags/${slug}/`, `${slug}: tag index href mismatch`);
}

for (const [slug, expectedMembers] of expectedTags) {
  const path = join('dist', 'tags', slug, 'index.html');
  assert.ok(existsSync(path), `Missing generated tag page: ${slug}`);
  const html = readFileSync(path, 'utf8');
  assert.deepEqual(
    dataValues(html, 'article', 'data-post-slug').sort(),
    [...expectedMembers].sort(),
    `${slug}: tag page membership mismatch`,
  );
}

const homeHtml = readFileSync(join('dist', 'index.html'), 'utf8');
const homeTagCounts = new Map();
for (const slug of dataValues(homeHtml, 'a', 'data-tag-slug')) {
  homeTagCounts.set(slug, (homeTagCounts.get(slug) ?? 0) + 1);
}
for (const [slug, members] of expectedTags) {
  assert.equal(homeTagCounts.get(slug), members.size, `${slug}: home tag-link count mismatch`);
}

const archivePath = join('dist', 'archive', 'index.html');
assert.ok(existsSync(archivePath), 'Missing /archive/ page');
const archiveHtml = readFileSync(archivePath, 'utf8');
const archiveOrder = dataValues(archiveHtml, 'li', 'data-archive-post');
const expectedArchiveOrder = [...postSlugs].sort((left, right) => {
  const byDate = new Date(postDates.get(right)).getTime() - new Date(postDates.get(left)).getTime();
  return byDate || left.localeCompare(right, 'es');
});
assert.deepEqual(archiveOrder, expectedArchiveOrder, 'Archive posts must be complete and newest-first');

const expectedYears = [...new Set(expectedArchiveOrder.map((slug) => postDates.get(slug).slice(0, 4)))];
assert.deepEqual(
  dataValues(archiveHtml, 'section', 'data-archive-year'),
  expectedYears,
  'Archive year groups must follow newest-first post order',
);

const sitemap = readFileSync(join('dist', 'sitemap-0.xml'), 'utf8');
const requiredSitemapUrls = [
  `${ORIGIN}${BASE}tags/`,
  `${ORIGIN}${BASE}archive/`,
  ...[...expectedTags.keys()].map((slug) => `${ORIGIN}${BASE}tags/${slug}/`),
];
for (const url of requiredSitemapUrls) {
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Sitemap missing taxonomy/archive URL: ${url}`);
}

console.log(
  `Taxonomy validation passed for ${postSlugs.length} article(s), ${expectedTags.size} normalized tag(s), and archive ordering.`,
);
