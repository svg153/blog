import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_TIME_ZONE, calendarDateInTimeZone, getPublishedPosts, isPublished, isValidIsoCalendarDate, readingTimeMinutes } from '../src/lib/content-lifecycle.mjs';
import { generatedPostSlugs } from './lib/generated-posts.mjs';
const now = new Date('2026-09-17T22:30:00Z');
assert.equal(calendarDateInTimeZone(now, BLOG_TIME_ZONE), '2026-09-18');
const fixture = (date, draft = false) => ({ data: { date, draft } });
assert.equal(isPublished(fixture('2026-09-18'), { now }), true);
assert.equal(isPublished(fixture('2026-09-19'), { now }), false);
assert.equal(isPublished(fixture('2026-09-17', true), { now }), false);
assert.deepEqual(getPublishedPosts([{ id: 'published', ...fixture('2026-09-18') }, { id: 'future', ...fixture('2026-09-19') }, { id: 'draft', ...fixture('2026-09-17', true) }], { now }).map((p) => p.id), ['published']);
for (const value of ['2026-09-18','2024-02-29']) assert.equal(isValidIsoCalendarDate(value), true);
for (const value of ['2026-02-29','2026-13-01','18-09-2026','']) assert.equal(isValidIsoCalendarDate(value), false);
assert.equal(readingTimeMinutes('Una prueba corta.'), 1);
assert.equal(readingTimeMinutes(Array.from({ length: 221 }, (_, i) => 'palabra' + i).join(' ')), 2);
assert.equal(readingTimeMinutes('texto '.repeat(220) + '\n```js\n' + 'codigo '.repeat(500) + '\n```'), 1);
for (const file of readdirSync('src/content/blog').filter((f) => f.endsWith('.md'))) {
  assert.ok(!/^readingTime\s*:/mu.test(readFileSync(join('src/content/blog', file), 'utf8')), file + ': manual readingTime must be removed');
}
const slugs = generatedPostSlugs();
for (const slug of slugs) {
  const html = readFileSync(join('dist','posts',slug,'index.html'),'utf8');
  const match = html.match(/<span[^>]*>(\d+) min lectura<\/span>/iu);
  assert.ok(match && Number(match[1]) >= 1, slug + ': automatic reading time missing');
}
console.log('Lifecycle validation passed for ' + slugs.length + ' public article(s).');
