import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { isPublished } from '../../src/lib/content-lifecycle.mjs';

const CONTENT_DIR = join('src', 'content', 'blog');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const parseSourceArticle = (source, { slug, sourcePath }) => {
  const normalized = String(source ?? '').replace(/^\uFEFF/u, '');
  const lines = normalized.split(/\r?\n/u);
  if (lines[0]?.trim() !== '---') {
    throw new Error(`${sourcePath}: missing opening frontmatter delimiter`);
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end < 0) {
    throw new Error(`${sourcePath}: missing closing frontmatter delimiter`);
  }

  const data = parse(lines.slice(1, end).join('\n')) ?? {};
  const bodyMarkdown = lines.slice(end + 1).join('\n').replace(/^\n/u, '').trimEnd() + '\n';

  if (!data.title || !data.date || !bodyMarkdown.trim()) {
    throw new Error(`${sourcePath}: title, date and article body are required`);
  }

  return {
    slug,
    sourcePath,
    data: {
      ...data,
      draft: data.draft ?? false,
      tags: data.tags ?? [],
    },
    bodyMarkdown,
  };
};

export const loadSourceArticle = (
  slug,
  { allowUnpublished = false, now = new Date() } = {},
) => {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid article slug: ${slug}`);
  }

  const sourcePath = join(CONTENT_DIR, `${slug}.md`);
  const article = parseSourceArticle(readFileSync(sourcePath, 'utf8'), {
    slug,
    sourcePath,
  });

  if (!allowUnpublished && !isPublished(article, { now })) {
    throw new Error(`Article "${slug}" is draft or future-dated and cannot be published externally`);
  }

  return article;
};
