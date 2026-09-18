import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { generatedPostSlugs } from './lib/generated-posts.mjs';

const DIST = 'dist';
const BASE = '/blog/';
const pagefindDir = join(DIST, 'pagefind');
const requiredBundleFiles = [
  'pagefind.js',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
];

for (const file of requiredBundleFiles) {
  assert.ok(
    existsSync(join(pagefindDir, file)),
    `Missing generated Pagefind asset: ${file}`,
  );
}

const searchPath = join(DIST, 'search', 'index.html');
assert.ok(existsSync(searchPath), 'Missing /search/ page');
const searchHtml = readFileSync(searchPath, 'utf8');

for (const expected of [
  'base-url="/blog/"',
  'bundle-path="/blog/pagefind/"',
  '<pagefind-input',
  'filter="tag"',
  'filter="year"',
  '<pagefind-summary',
  '<pagefind-results',
  'meta.title',
  'meta.description',
  'meta.tags',
  'meta.year',
  '/blog/tags/',
  '/blog/archive/',
]) {
  assert.ok(searchHtml.includes(expected), `Search page missing contract marker: ${expected}`);
}

for (const asset of [
  '/blog/pagefind/pagefind-component-ui.css',
  '/blog/pagefind/pagefind-component-ui.js',
]) {
  assert.ok(searchHtml.includes(asset), `Search page must load Pagefind asset from /blog: ${asset}`);
}

const publicSlugs = generatedPostSlugs();
assert.ok(publicSlugs.length > 0, 'Expected public article pages for Pagefind');

for (const slug of publicSlugs) {
  const html = readFileSync(join(DIST, 'posts', slug, 'index.html'), 'utf8');
  assert.ok(html.includes('data-pagefind-body'), `${slug}: public article is not marked for Pagefind`);
  assert.ok(html.includes('data-pagefind-meta="title"'), `${slug}: missing search title metadata`);
  assert.ok(html.includes('data-pagefind-meta="description"'), `${slug}: missing search description metadata`);
  assert.ok(html.includes('data-pagefind-meta="tags"'), `${slug}: missing search tags metadata`);
  assert.ok(html.includes('data-pagefind-meta="year"'), `${slug}: missing search year metadata`);
  assert.ok(html.includes('data-pagefind-filter="tag"'), `${slug}: missing tag filter metadata`);
  assert.ok(html.includes('data-pagefind-filter="year"'), `${slug}: missing year filter metadata`);
  assert.ok(html.includes('data-pagefind-sort="date"'), `${slug}: missing date sort metadata`);
}

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
};
walk(DIST);

const markedPages = htmlFiles.filter((path) =>
  readFileSync(path, 'utf8').includes('data-pagefind-body'),
);
assert.deepEqual(
  markedPages.map((path) => path.replaceAll('\\', '/')).sort(),
  publicSlugs
    .map((slug) => join(DIST, 'posts', slug, 'index.html').replaceAll('\\', '/'))
    .sort(),
  'Only generated public article pages may opt into Pagefind indexing',
);

const entryPath = join(pagefindDir, 'pagefind-entry.json');
assert.ok(existsSync(entryPath), 'Missing Pagefind entry manifest');
const entry = JSON.parse(readFileSync(entryPath, 'utf8'));
const indexedPageCount = Object.values(entry.languages ?? {})
  .reduce((total, language) => total + Number(language.page_count ?? 0), 0);
assert.equal(
  indexedPageCount,
  publicSlugs.length,
  'Generated Pagefind manifest page count must equal generated public article count',
);

assert.ok(!existsSync(join(DIST, 'preview')), 'Development preview must not enter production search output');

console.log(
  `Search validation passed: ${publicSlugs.length} public article(s), Pagefind manifest + /blog base path + tag/year filters verified.`,
);
