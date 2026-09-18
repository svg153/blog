import { createHash } from 'node:crypto';
import { tagSlug } from '../../src/lib/taxonomy.mjs';

export const PUBLICATION_SCHEMA_VERSION = 1;
export const BLOG_ORIGIN = 'https://svg153.github.io';
export const BLOG_BASE = '/blog/';

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
};

export const stableStringify = (value, space = 2) =>
  JSON.stringify(canonicalize(value), null, space);

export const payloadFingerprint = (channel, payload) =>
  createHash('sha256')
    .update(stableStringify({ schemaVersion: PUBLICATION_SCHEMA_VERSION, channel, payload }))
    .digest('hex');

const normalizeDevTag = (value) =>
  tagSlug(value)
    .replace(/-/gu, '')
    .toLowerCase();

export const devTags = (tags) =>
  [...new Set((tags ?? []).map(normalizeDevTag).filter(Boolean))].slice(0, 4);

const linkedInHashtag = (value) => {
  const normalized = tagSlug(value).replace(/-/gu, '');
  return normalized ? `#${normalized}` : undefined;
};

const compact = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined && child !== null && child !== ''));

const canonicalPayload = (article) => ({
  schemaVersion: PUBLICATION_SCHEMA_VERSION,
  source: {
    slug: article.slug,
    path: article.sourcePath,
  },
  canonicalUrl: `${BLOG_ORIGIN}${BLOG_BASE}posts/${article.slug}/`,
  title: article.data.title,
  description: article.data.description ?? '',
  publishedDate: article.data.date,
  updatedDate: article.data.updatedDate ?? null,
  tags: article.data.tags ?? [],
  bodyMarkdown: article.bodyMarkdown,
});

const buildDevPayload = (article, canonical) => {
  const override = article.data.publishing?.dev ?? {};
  const tags = devTags(override.tags ?? canonical.tags);
  return {
    article: compact({
      title: override.title ?? canonical.title,
      body_markdown: canonical.bodyMarkdown,
      published: true,
      series: override.series ?? article.data.series?.name,
      canonical_url: canonical.canonicalUrl,
      description: override.description ?? canonical.description,
      tags: tags.join(','),
    }),
  };
};

const defaultLinkedInCommentary = (canonical) => {
  const hashtags = canonical.tags
    .map(linkedInHashtag)
    .filter(Boolean)
    .slice(0, 4)
    .join(' ');

  return [
    canonical.title,
    '',
    canonical.description,
    '',
    canonical.canonicalUrl,
    hashtags ? `\n${hashtags}` : '',
  ].join('\n').trim();
};

const buildLinkedInPayload = (article, canonical) => ({
  commentary: article.data.publishing?.linkedin?.commentary ?? defaultLinkedInCommentary(canonical),
  canonicalUrl: canonical.canonicalUrl,
});

const buildNewsletterPayload = (article, canonical) => {
  const override = article.data.publishing?.newsletter ?? {};
  return {
    subject: override.subject ?? canonical.title,
    previewText: override.previewText ?? canonical.description,
    bodyMarkdown: override.bodyMarkdown ?? canonical.bodyMarkdown,
    canonicalUrl: canonical.canonicalUrl,
    tags: canonical.tags,
  };
};

export const buildPublicationPlan = (article) => {
  const canonical = canonicalPayload(article);
  const payloads = {
    dev: buildDevPayload(article, canonical),
    linkedin: buildLinkedInPayload(article, canonical),
    newsletter: buildNewsletterPayload(article, canonical),
  };

  return {
    schemaVersion: PUBLICATION_SCHEMA_VERSION,
    canonical,
    channels: Object.fromEntries(
      Object.entries(payloads).map(([channel, payload]) => [
        channel,
        {
          payload,
          fingerprint: payloadFingerprint(channel, payload),
        },
      ]),
    ),
  };
};

export const redactText = (value, secrets = []) =>
  secrets
    .filter((secret) => typeof secret === 'string' && secret.length >= 4)
    .reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), String(value ?? ''));

export const runtimeSecretValues = (env = process.env) => [
  env.DEV_API_KEY,
  env.LINKEDIN_ACCESS_TOKEN,
].filter(Boolean);
