import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import assert from 'node:assert/strict';

const DIST = 'dist';
const ORIGIN = 'https://svg153.github.io';
const BASE = '/blog/';
const RSS_PATH = join(DIST, 'rss.xml');
const SITEMAP_INDEX_PATH = join(DIST, 'sitemap-index.xml');
const SITEMAP_PATH = join(DIST, 'sitemap-0.xml');

for (const path of [RSS_PATH, SITEMAP_INDEX_PATH, SITEMAP_PATH]) {
  assert.ok(existsSync(path), `Expected generated discovery artifact: ${path}`);
}

const rss = readFileSync(RSS_PATH, 'utf8');
const sitemapIndex = readFileSync(SITEMAP_INDEX_PATH, 'utf8');
const sitemap = readFileSync(SITEMAP_PATH, 'utf8');

assert.match(rss, /<rss\b[^>]*version=["']2\.0["']/u, 'RSS output is not an RSS 2.0 document');
assert.match(sitemapIndex, /<sitemapindex\b/u, 'Sitemap index is missing <sitemapindex>');
assert.match(sitemap, /<urlset\b/u, 'Sitemap is missing <urlset>');

const canonicalSitemap = `${ORIGIN}${BASE}sitemap-0.xml`;
assert.ok(
  sitemapIndex.includes(`<loc>${canonicalSitemap}</loc>`),
  `Sitemap index must reference ${canonicalSitemap}`,
);

const postFiles = readdirSync('src/content/blog').filter((file) => extname(file) === '.md');
assert.ok(postFiles.length > 0, 'Expected at least one Markdown article');

for (const file of postFiles) {
  const slug = basename(file, '.md');
  const canonicalUrl = `${ORIGIN}${BASE}posts/${slug}/`;
  assert.ok(rss.includes(`<link>${canonicalUrl}</link>`), `RSS missing ${canonicalUrl}`);
  assert.ok(sitemap.includes(`<loc>${canonicalUrl}</loc>`), `Sitemap missing ${canonicalUrl}`);
}

assert.ok(!rss.includes(`${ORIGIN}/posts/`), 'RSS contains a post URL without the /blog base path');
assert.ok(!sitemap.includes(`${ORIGIN}/posts/`), 'Sitemap contains a post URL without the /blog base path');

console.log(`Discovery validation passed for ${postFiles.length} article(s).`);
