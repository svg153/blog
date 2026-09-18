#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSourceArticle } from './lib/source-article.mjs';
import {
  buildPublicationPlan,
  redactText,
  runtimeSecretValues,
  stableStringify,
} from './lib/publishing-core.mjs';
import {
  describeDevRequest,
  describeLinkedInRequest,
  describeNewsletterExport,
  linkedInManualPayload,
  publishDev,
  publishLinkedIn,
} from './lib/publishing-providers.mjs';
import {
  assertNotPublished,
  loadProvenance,
  recordPublication,
  writeProvenance,
} from './lib/provenance.mjs';

const CHANNELS = ['dev', 'linkedin', 'newsletter'];

const parseArgs = (argv) => {
  const options = {
    channel: 'all',
    dryRun: false,
    publish: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--slug') options.slug = argv[++index];
    else if (arg === '--channel') options.channel = argv[++index];
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--publish') options.publish = true;
    else if (arg === '--export-dir') options.exportDir = argv[++index];
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
};

const help = `Usage:
  npm run publish -- --slug <slug> [--channel dev|linkedin|newsletter|all] [--dry-run]
  npm run publish -- --slug <slug> [--channel ...] --export-dir <directory>
  npm run publish -- --slug <slug> --channel dev|linkedin --publish

Safe defaults:
  With no mode flag, the command performs a dry-run.
  Network mutation requires --publish and exactly one API-backed channel.
  There is no publish-all mode and no idempotency bypass flag.
`;

const describeChannel = (channel, channelPlan) => {
  if (channel === 'dev') {
    return {
      channel,
      capability: 'supported-api',
      fingerprint: channelPlan.fingerprint,
      request: describeDevRequest(channelPlan),
    };
  }
  if (channel === 'linkedin') {
    return {
      channel,
      capability: 'supported-api-when-configured',
      fingerprint: channelPlan.fingerprint,
      apiRequest: describeLinkedInRequest(channelPlan),
      manual: linkedInManualPayload(channelPlan),
    };
  }
  return {
    channel,
    capability: 'provider-neutral-export',
    fingerprint: channelPlan.fingerprint,
    export: describeNewsletterExport(channelPlan),
  };
};

const selectChannels = (plan, requested) => {
  const names = requested === 'all' ? CHANNELS : [requested];
  for (const name of names) {
    if (!CHANNELS.includes(name)) throw new Error(`Unknown channel: ${name}`);
  }
  return names.map((name) => describeChannel(name, plan.channels[name]));
};

const exportChannels = (slug, channels, directory) => {
  mkdirSync(directory, { recursive: true });
  for (const channel of channels) {
    writeFileSync(
      join(directory, `${slug}.${channel.channel}.json`),
      stableStringify(channel) + '\n',
    );
    if (channel.channel === 'newsletter') {
      writeFileSync(
        join(directory, `${slug}.newsletter.md`),
        channel.export.payload.bodyMarkdown,
      );
    }
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(help);
    return;
  }
  if (!options.slug) throw new Error('--slug is required');
  if (options.publish && options.dryRun) throw new Error('--publish and --dry-run are mutually exclusive');
  if (options.publish && options.exportDir) throw new Error('--publish and --export-dir are mutually exclusive');

  const article = loadSourceArticle(options.slug);
  const plan = buildPublicationPlan(article);
  const channels = selectChannels(plan, options.channel);

  if (options.exportDir) {
    exportChannels(article.slug, channels, options.exportDir);
    process.stdout.write(stableStringify({
      mode: 'export',
      slug: article.slug,
      directory: options.exportDir,
      channels: channels.map((entry) => entry.channel),
    }) + '\n');
    return;
  }

  if (!options.publish) {
    process.stdout.write(stableStringify({
      mode: 'dry-run',
      schemaVersion: plan.schemaVersion,
      canonical: plan.canonical,
      channels,
    }) + '\n');
    return;
  }

  if (options.channel === 'all' || options.channel === 'newsletter') {
    throw new Error('--publish requires exactly one API-backed channel: dev or linkedin');
  }

  const channelPlan = plan.channels[options.channel];
  const provenance = loadProvenance();
  assertNotPublished(provenance, {
    channel: options.channel,
    slug: article.slug,
  });

  let result;
  if (options.channel === 'dev') {
    result = await publishDev(channelPlan);
  } else {
    try {
      result = await publishLinkedIn(channelPlan);
    } catch (error) {
      if (/Missing runtime credential\/configuration/u.test(error.message)) {
        process.stderr.write(stableStringify({
          error: error.message,
          fallback: linkedInManualPayload(channelPlan),
        }) + '\n');
      }
      throw error;
    }
  }

  const next = recordPublication(provenance, {
    channel: options.channel,
    slug: article.slug,
    fingerprint: channelPlan.fingerprint,
    externalId: result.externalId,
    externalUrl: result.externalUrl,
  });
  writeProvenance(next);

  process.stdout.write(stableStringify({
    mode: 'published',
    channel: options.channel,
    slug: article.slug,
    fingerprint: channelPlan.fingerprint,
    result,
    provenance: 'data/publication-provenance.json updated locally; review and commit it',
  }) + '\n');
};

main().catch((error) => {
  const safe = redactText(error?.stack ?? error?.message ?? String(error), runtimeSecretValues());
  process.stderr.write(`${safe}\n`);
  process.exitCode = 1;
});
