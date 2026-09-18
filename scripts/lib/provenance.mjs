import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const PROVENANCE_PATH = 'data/publication-provenance.json';

export const emptyProvenance = () => ({
  schemaVersion: 1,
  records: [],
});

export const loadProvenance = (path = PROVENANCE_PATH) => {
  if (!existsSync(path)) return emptyProvenance();
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) {
    throw new Error(`${path}: unsupported provenance format`);
  }
  return parsed;
};

export const findPublicationRecord = (provenance, { channel, slug }) =>
  provenance.records.find((record) => record.channel === channel && record.slug === slug);

export const assertNotPublished = (provenance, { channel, slug }) => {
  const existing = findPublicationRecord(provenance, { channel, slug });
  if (existing) {
    throw new Error(
      `Publication blocked: ${slug} already has a ${channel} provenance record (${existing.externalId ?? existing.fingerprint})`,
    );
  }
};

export const recordPublication = (
  provenance,
  {
    channel,
    slug,
    fingerprint,
    externalId,
    externalUrl,
    publishedAt = new Date().toISOString(),
  },
) => ({
  ...provenance,
  records: [
    ...provenance.records,
    {
      channel,
      slug,
      fingerprint,
      externalId: externalId ?? null,
      externalUrl: externalUrl ?? null,
      publishedAt,
    },
  ],
});

export const writeProvenance = (provenance, path = PROVENANCE_PATH) => {
  writeFileSync(path, JSON.stringify(provenance, null, 2) + '\n');
};
