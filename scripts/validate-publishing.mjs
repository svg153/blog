import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSourceArticle, parseSourceArticle } from './lib/source-article.mjs';
import {
  buildPublicationPlan,
  payloadFingerprint,
  redactText,
  stableStringify,
} from './lib/publishing-core.mjs';
import {
  DEV_ENDPOINT,
  LINKEDIN_CURRENT_VERSION,
  LINKEDIN_ENDPOINT,
  describeDevRequest,
  describeLinkedInRequest,
  describeNewsletterExport,
  linkedInManualPayload,
  publishDev,
  publishLinkedIn,
} from './lib/publishing-providers.mjs';
import {
  assertNotPublished,
  emptyProvenance,
  recordPublication,
} from './lib/provenance.mjs';

const article = loadSourceArticle('use-contribute-fork-build');
const first = buildPublicationPlan(article);
const second = buildPublicationPlan(article);
assert.deepEqual(first, second, 'Publishing plans must be deterministic');

assert.equal(first.schemaVersion, 1);
assert.equal(
  first.canonical.canonicalUrl,
  'https://svg153.github.io/blog/posts/use-contribute-fork-build/',
);
assert.equal(first.channels.dev.payload.article.canonical_url, first.canonical.canonicalUrl);
assert.equal(first.channels.dev.payload.article.published, true);
assert.ok(
  first.channels.dev.payload.article.tags.split(',').filter(Boolean).length <= 4,
  'DEV must receive at most four tags',
);
assert.ok(first.channels.linkedin.payload.commentary.includes(first.canonical.canonicalUrl));
assert.equal(first.channels.linkedin.payload.canonicalUrl, first.canonical.canonicalUrl);
assert.equal(first.channels.newsletter.payload.canonicalUrl, first.canonical.canonicalUrl);

for (const [channel, entry] of Object.entries(first.channels)) {
  assert.equal(
    entry.fingerprint,
    payloadFingerprint(channel, entry.payload),
    `${channel}: fingerprint mismatch`,
  );
}

const overrideSource = `---
title: "Override fixture"
description: "Default description"
date: "2026-01-01"
tags: ["GitHub", "AI Agents", "Open Source", "DevOps", "Tool"]
publishing:
  dev:
    title: "DEV title"
    description: "DEV description"
    tags: ["One", "Two"]
  linkedin:
    commentary: "LinkedIn override copy"
  newsletter:
    subject: "Newsletter subject"
    previewText: "Newsletter preview"
---
Body fixture.
`;
const overridden = buildPublicationPlan(parseSourceArticle(overrideSource, {
  slug: 'override-fixture',
  sourcePath: 'fixture.md',
}));
assert.equal(overridden.channels.dev.payload.article.title, 'DEV title');
assert.equal(overridden.channels.dev.payload.article.description, 'DEV description');
assert.equal(overridden.channels.dev.payload.article.tags, 'one,two');
assert.equal(overridden.channels.linkedin.payload.commentary, 'LinkedIn override copy');
assert.equal(overridden.channels.newsletter.payload.subject, 'Newsletter subject');
assert.equal(overridden.channels.newsletter.payload.previewText, 'Newsletter preview');

const devDescriptor = describeDevRequest(first.channels.dev);
const linkedinDescriptor = describeLinkedInRequest(first.channels.linkedin);
const descriptors = stableStringify({ devDescriptor, linkedinDescriptor });
assert.ok(!descriptors.includes('real-dev-secret'));
assert.ok(devDescriptor.headers['api-key'].includes('[runtime:'));
assert.ok(linkedinDescriptor.headers.Authorization.includes('[runtime:'));
assert.equal(devDescriptor.url, DEV_ENDPOINT);
assert.equal(linkedinDescriptor.url, LINKEDIN_ENDPOINT);
assert.equal(LINKEDIN_CURRENT_VERSION, '202608');
assert.equal(linkedInManualPayload(first.channels.linkedin).mode, 'manual-ready');

const secret = 'super-secret-value';
assert.equal(redactText(`before ${secret} after`, [secret]), 'before [REDACTED] after');

const fetchCalls = [];
const devResult = await publishDev(first.channels.dev, {
  env: { DEV_API_KEY: 'real-dev-secret' },
  fetchImpl: async (url, options) => {
    fetchCalls.push({ provider: 'dev', url, options });
    return new Response(JSON.stringify({ id: 123, url: 'https://dev.to/svg153/example' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },
});
assert.equal(devResult.externalId, '123');
assert.equal(fetchCalls[0].options.headers['api-key'], 'real-dev-secret');
assert.equal(fetchCalls[0].options.headers.Accept, 'application/vnd.forem.api-v1+json');

const linkedinResult = await publishLinkedIn(first.channels.linkedin, {
  env: {
    LINKEDIN_ACCESS_TOKEN: 'real-linkedin-secret',
    LINKEDIN_AUTHOR_URN: 'urn:li:person:test-user',
    LINKEDIN_VERSION: '202608',
  },
  fetchImpl: async (url, options) => {
    fetchCalls.push({ provider: 'linkedin', url, options });
    return new Response('', {
      status: 201,
      headers: { 'x-restli-id': 'urn:li:share:123' },
    });
  },
});
assert.equal(linkedinResult.externalId, 'urn:li:share:123');
assert.equal(fetchCalls[1].options.headers.Authorization, 'Bearer real-linkedin-secret');
assert.equal(fetchCalls[1].options.headers['Linkedin-Version'], '202608');
assert.equal(fetchCalls[1].options.headers['X-Restli-Protocol-Version'], '2.0.0');

const initial = emptyProvenance();
const recorded = recordPublication(initial, {
  channel: 'dev',
  slug: article.slug,
  fingerprint: first.channels.dev.fingerprint,
  externalId: '123',
  externalUrl: 'https://dev.to/svg153/example',
  publishedAt: '2026-09-18T00:00:00.000Z',
});
assert.equal(recorded.records.length, 1);
assert.throws(
  () => assertNotPublished(recorded, { channel: 'dev', slug: article.slug }),
  /already has a dev provenance record/u,
);
assert.doesNotThrow(
  () => assertNotPublished(recorded, { channel: 'linkedin', slug: article.slug }),
);

const frontmatterSecretPattern = /^\s*(?:api[_-]?key|access[_-]?token|password|secret)\s*:/imu;
for (const file of readdirSync(join('src', 'content', 'blog')).filter((name) => name.endsWith('.md'))) {
  const source = readFileSync(join('src', 'content', 'blog', file), 'utf8');
  const end = source.indexOf('\n---', 4);
  const frontmatter = end >= 0 ? source.slice(0, end) : source;
  assert.ok(!frontmatterSecretPattern.test(frontmatter), `${file}: credentials must never be stored in frontmatter`);
}

for (const workflow of readdirSync(join('.github', 'workflows')).filter((name) => /\.ya?ml$/u.test(name))) {
  const source = readFileSync(join('.github', 'workflows', workflow), 'utf8');
  assert.ok(!/scripts\/publish\.mjs|npm\s+run\s+publish/u.test(source), `${workflow}: publishing must not run automatically in GitHub Actions`);
}

assert.ok(existsSync('docs/publishing.md'), 'Provider capability documentation is required');
assert.ok(existsSync('data/publication-provenance.json'), 'Versioned publication provenance file is required');

const goldenPath = 'scripts/fixtures/publishing/use-contribute-fork-build.dry-run.json';
assert.ok(existsSync(goldenPath), 'Committed dry-run golden output is required');
{
  const golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
  const current = {
    mode: 'dry-run',
    schemaVersion: first.schemaVersion,
    canonical: first.canonical,
    channels: [
      {
        channel: 'dev',
        capability: 'supported-api',
        fingerprint: first.channels.dev.fingerprint,
        request: describeDevRequest(first.channels.dev),
      },
      {
        channel: 'linkedin',
        capability: 'supported-api-when-configured',
        fingerprint: first.channels.linkedin.fingerprint,
        apiRequest: describeLinkedInRequest(first.channels.linkedin),
        manual: linkedInManualPayload(first.channels.linkedin),
      },
      {
        channel: 'newsletter',
        capability: 'provider-neutral-export',
        fingerprint: first.channels.newsletter.fingerprint,
        export: describeNewsletterExport(first.channels.newsletter),
      },
    ],
  };
  assert.deepEqual(current, golden, 'Dry-run golden output changed; regenerate and review intentionally');
}

const cliEnv = { ...process.env };
for (const key of [
  'DEV_API_KEY',
  'LINKEDIN_ACCESS_TOKEN',
  'LINKEDIN_AUTHOR_URN',
  'LINKEDIN_VERSION',
]) {
  delete cliEnv[key];
}

const runCli = (args) =>
  spawnSync(process.execPath, ['scripts/publish.mjs', ...args], {
    cwd: process.cwd(),
    env: cliEnv,
    encoding: 'utf8',
  });

const cliDryRun = runCli(['--slug', article.slug, '--dry-run']);
assert.equal(cliDryRun.status, 0, `CLI dry-run failed: ${cliDryRun.stderr}`);
assert.deepEqual(
  JSON.parse(cliDryRun.stdout),
  JSON.parse(readFileSync(goldenPath, 'utf8')),
  'Actual CLI dry-run must exactly match committed golden output',
);

const exportDir = mkdtempSync(join(tmpdir(), 'svg153-publishing-'));
try {
  const exported = runCli([
    '--slug',
    article.slug,
    '--export-dir',
    exportDir,
  ]);
  assert.equal(exported.status, 0, `CLI export failed: ${exported.stderr}`);
  for (const file of [
    `${article.slug}.dev.json`,
    `${article.slug}.linkedin.json`,
    `${article.slug}.newsletter.json`,
    `${article.slug}.newsletter.md`,
  ]) {
    assert.ok(existsSync(join(exportDir, file)), `CLI export missing ${file}`);
  }
} finally {
  rmSync(exportDir, { recursive: true, force: true });
}

const missingLinkedIn = runCli([
  '--slug',
  article.slug,
  '--channel',
  'linkedin',
  '--publish',
]);
assert.notEqual(missingLinkedIn.status, 0, 'LinkedIn publish without runtime configuration must fail closed');
assert.match(missingLinkedIn.stderr, /Missing runtime credential\/configuration: LINKEDIN_ACCESS_TOKEN/u);
assert.match(missingLinkedIn.stderr, /manual-ready/u, 'Missing LinkedIn config must still expose the manual-ready fallback');
assert.ok(!missingLinkedIn.stderr.includes('real-linkedin-secret'));

const publishAll = runCli([
  '--slug',
  article.slug,
  '--channel',
  'all',
  '--publish',
]);
assert.notEqual(publishAll.status, 0, 'Publish-all must be rejected');
assert.match(publishAll.stderr, /exactly one API-backed channel/u);

console.log('Publishing validation passed: deterministic/golden dry-run, export, overrides, provider requests, redaction, idempotency, manual fallback and workflow isolation verified.');
