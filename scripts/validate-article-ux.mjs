import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildSeries, seriesContextForPost } from '../src/lib/series.mjs';

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'iu'));
  return match?.[1];
};

const headings = (html) =>
  [...html.matchAll(/<h([23])\b([^>]*)>/giu)].map((match) => ({
    depth: Number(match[1]),
    id: attr(match[0], 'id'),
  }));

const tocSlugs = (html) =>
  [...html.matchAll(/<a\b[^>]*data-toc-slug=["']([^"']+)["'][^>]*>/giu)].map((match) => match[1]);

const postDirs = readdirSync(join('dist', 'posts'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let tocArticles = 0;
for (const slug of postDirs) {
  const html = readFileSync(join('dist', 'posts', slug, 'index.html'), 'utf8');
  const articleHeadings = headings(html);

  assert.ok(articleHeadings.length > 0, `${slug}: expected rendered h2/h3 headings`);
  assert.ok(articleHeadings.every((heading) => heading.id), `${slug}: every h2/h3 needs a stable id`);
  assert.equal(
    new Set(articleHeadings.map((heading) => heading.id)).size,
    articleHeadings.length,
    `${slug}: heading ids must be unique`,
  );
  assert.ok(
    html.includes('data-heading-anchor-script'),
    `${slug}: missing lightweight heading permalink enhancer`,
  );

  const expectedToc = articleHeadings.length >= 4;
  const actualToc = html.includes('data-article-toc');
  assert.equal(actualToc, expectedToc, `${slug}: TOC visibility threshold mismatch`);

  if (expectedToc) {
    tocArticles += 1;
    assert.deepEqual(
      tocSlugs(html),
      articleHeadings.map((heading) => heading.id),
      `${slug}: TOC links must exactly mirror Astro heading ids/order`,
    );
  }
}

assert.ok(tocArticles > 0, 'Expected at least one current long-form article to render a TOC');

const fixture = (id, order, name = 'Serie de prueba') => ({
  id,
  data: {
    title: `Post ${id}`,
    date: `2026-01-0${order}`,
    series: { id: 'serie-prueba', name, order },
  },
});

const fixtures = [fixture('tercero', 3), fixture('primero', 1), fixture('segundo', 2)];
const groups = buildSeries(fixtures);
assert.equal(groups.length, 1);
assert.deepEqual(groups[0].posts.map((post) => post.id), ['primero', 'segundo', 'tercero']);

const middle = seriesContextForPost(groups, fixtures[2]);
assert.equal(middle.position, 2);
assert.equal(middle.total, 3);
assert.equal(middle.previous?.slug, 'primero');
assert.equal(middle.next?.slug, 'tercero');

assert.throws(
  () => buildSeries([fixture('a', 1), fixture('b', 1)]),
  /duplicate order/u,
  'Duplicate series order must fail',
);
assert.throws(
  () => buildSeries([fixture('a', 1, 'Nombre A'), fixture('b', 2, 'Nombre B')]),
  /inconsistent names/u,
  'Inconsistent series names must fail',
);

const seriesIndexPath = join('dist', 'series', 'index.html');
assert.ok(existsSync(seriesIndexPath), 'Missing /series/ index');
const seriesIndexHtml = readFileSync(seriesIndexPath, 'utf8');
const countMatch = seriesIndexHtml.match(/data-series-count=["'](\d+)["']/iu);
assert.ok(countMatch, 'Series index must expose its generated series count');

const currentSeriesArticles = postDirs
  .map((slug) => {
    const html = readFileSync(join('dist', 'posts', slug, 'index.html'), 'utf8');
    const nav = html.match(/<nav\b[^>]*data-series-id=["']([^"']+)["'][^>]*data-series-order=["']([^"']+)["'][^>]*>/iu);
    return nav ? { slug, id: nav[1], order: Number(nav[2]) } : undefined;
  })
  .filter(Boolean);

const actualGroupIds = [...new Set(currentSeriesArticles.map((entry) => entry.id))].sort();
assert.equal(Number(countMatch[1]), actualGroupIds.length, 'Series index count must match current published article metadata');

for (const id of actualGroupIds) {
  const path = join('dist', 'series', id, 'index.html');
  assert.ok(existsSync(path), `Missing generated series page: ${id}`);
  const html = readFileSync(path, 'utf8');
  const rendered = [...html.matchAll(/<li\b[^>]*data-series-post=["']([^"']+)["'][^>]*data-series-order=["']([^"']+)["'][^>]*>/giu)]
    .map((match) => ({ slug: match[1], order: Number(match[2]) }));

  const expected = currentSeriesArticles
    .filter((entry) => entry.id === id)
    .sort((a, b) => a.order - b.order);

  assert.deepEqual(rendered, expected, `Series page ${id} must use explicit order`);
}

console.log(
  `Article UX validation passed for ${postDirs.length} article(s), ${tocArticles} TOC article(s), and series ordering fixtures.`,
);
