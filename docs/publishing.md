# Publishing and syndication

Markdown in `src/content/blog/` remains the canonical article source. This pipeline exports or explicitly publishes from that source; it does not create channel-specific copies of articles in the repository.

## Safety model

The default command is a dry-run:

```bash
npm run publish -- --slug use-contribute-fork-build
```

Reviewable exports are also network-free:

```bash
npm run publish -- --slug use-contribute-fork-build --export-dir publication-exports
npm run publish -- --slug use-contribute-fork-build --channel linkedin --export-dir publication-exports
```

Network mutation requires both an API-backed channel and the explicit `--publish` flag:

```bash
npm run publish -- --slug use-contribute-fork-build --channel dev --publish
npm run publish -- --slug use-contribute-fork-build --channel linkedin --publish
```

There is deliberately no `--publish --channel all`, no publish-on-merge workflow, and no force flag that bypasses provenance checks.

## Canonical payload and overrides

Every run derives one provider-neutral canonical object from the Markdown source: slug, source path, canonical blog URL, title, description, dates, tags and body Markdown.

Channel copy can be overridden in frontmatter without storing credentials or external publication state:

```yaml
publishing:
  dev:
    title: "Optional DEV-specific title"
    description: "Optional DEV-specific description"
    tags: ["github", "ai"]
    series: "Optional DEV series"
  linkedin:
    commentary: |
      Optional LinkedIn-specific post copy.
      https://svg153.github.io/blog/posts/example/
  newsletter:
    subject: "Optional subject"
    previewText: "Optional preview text"
    bodyMarkdown: |
      Optional newsletter-specific Markdown.
```

Defaults remain deterministic when overrides are absent. DEV tags are normalized to lowercase alphanumeric values, deduplicated and limited to the API maximum of four.

## DEV / Forem

Provider capability: **supported API**.

The adapter uses the current Forem v1 article endpoint:

- `POST https://dev.to/api/articles`
- `Accept: application/vnd.forem.api-v1+json`
- runtime `api-key` header
- canonical URL is sent as `canonical_url`
- `published: true` is explicit

Required runtime environment:

```text
DEV_API_KEY
```

Reference:
- https://developers.forem.com/api
- https://developers.forem.com/api/v1

## LinkedIn

Provider capability: **official Posts API when configured; manual-ready payload otherwise**.

The adapter uses:

- `POST https://api.linkedin.com/rest/posts`
- OAuth bearer token
- `X-Restli-Protocol-Version: 2.0.0`
- required `Linkedin-Version` header
- text-only organic post payload on the main feed

Required runtime environment for API mutation:

```text
LINKEDIN_ACCESS_TOKEN
LINKEDIN_AUTHOR_URN
LINKEDIN_VERSION
```

As of September 18, 2026, LinkedIn documents `202608` as the latest Marketing API version. The version is runtime configuration rather than a hard-coded publishing decision so future sunsets are explicit.

The authenticated member needs the relevant social posting permission; member posting uses `w_member_social`. Organization posting additionally depends on organization permissions/roles.

If API configuration is missing, the dry-run/export still produces the exact commentary and canonical URL needed for manual posting. There is no browser scraping, cookie/session reuse, or unofficial fallback.

References:
- https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api
- https://learn.microsoft.com/linkedin/marketing/versioning
- https://learn.microsoft.com/linkedin/marketing/integrations/migrations

## Newsletter

Provider capability: **provider-neutral export only**.

The export contains subject, preview text, Markdown body, canonical URL and tags. No newsletter vendor is embedded in the repository yet. A future adapter must use a documented supported API/connector and preserve this provider-neutral contract.

## Provenance and idempotency

Successful API publication appends a credential-free record to `data/publication-provenance.json`:

- channel;
- canonical slug;
- deterministic payload fingerprint;
- external ID/URL when returned;
- publication timestamp.

A second publication attempt for the same channel + slug is blocked if a provenance record already exists. The command does not provide a force bypass. If an external publication must be deliberately replaced, reconcile the external state and provenance explicitly in a reviewed change.

The provenance file is versioned so the duplicate guard works across machines. It must never contain API keys, OAuth tokens, cookies or passwords.

## Credentials and logs

Credentials are read only from process environment at mutation time. Dry-run/export descriptors contain placeholders such as `[runtime:DEV_API_KEY]`, never secret values.

CLI error output redacts known runtime secret values. Frontmatter is validated so obvious credential fields are rejected by the publication gate.

## Validation

`npm run build` includes `scripts/validate-publishing.mjs`, which exercises:

- deterministic payload/fingerprint generation;
- channel-specific overrides;
- DEV v1 and LinkedIn request construction using fake in-memory HTTP responses only;
- credential redaction;
- provenance duplicate blocking;
- absence of publishing commands from GitHub Actions;
- committed dry-run golden output once generated.

No validation step performs external network mutation.
