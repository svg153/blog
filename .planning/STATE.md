# State — v2.1 Publishing platform foundation

## Current position
- **Internal implementation:** complete through Phase 12; PR #35 final merge + Pages verification pending
- **Only open milestone dependency:** Phase 10 — hosted Renovate activation, DEP-01
- **Phase 10 status:** repository policy/extraction complete; waiting for actual Renovate dependency PR activity
- **Next internal implementation branch:** none

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, zero-vulnerability audit, Astro build, Pagefind generation and every completed validation gate.
- Five canonical published Markdown articles render through the public dynamic route.
- RSS/sitemap, SEO, social cards, taxonomy/archive, TOC/series, lifecycle, related content, content quality and Pagefind search are production-verified.
- The publishing pipeline derives reviewable deterministic payloads from canonical Markdown and is safe-by-default: dry-run/export has no network mutation; publishing is explicit per API-backed channel.
- Renovate repository policy is build-validated, but hosted GitHub App activation remains an external prerequisite.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- Generated site/search/social-card output is never committed.
- External publication does not create provider-specific canonical source copies.
- `scripts/publish.mjs` defaults to dry-run; export remains network-free.
- Network mutation requires explicit `--publish` and exactly one API-backed channel; there is no publish-all or provenance bypass.
- DEV uses the supported Forem v1 article API and preserves the canonical blog URL.
- LinkedIn uses the supported Posts API only with explicit runtime token/author/version configuration; manual-ready export is the fallback and browser/session scraping is prohibited.
- Newsletter remains provider-neutral until a documented supported provider API/connector is deliberately selected.
- Credentials are runtime-only and must never enter content, provenance, golden fixtures or request descriptors.
- Versioned `data/publication-provenance.json` blocks repeated publication for the same channel + slug.
- Permanent GitHub Actions workflows must never invoke the publishing CLI.
- Renovate covers only npm and GitHub Actions; auto-merge remains disabled while `main` has no enforced required status checks.
- A valid `renovate.json` alone does not complete DEP-01; actual hosted update PR activity is required.

## Progress
- Requirements complete: 64/65
- Phases with internal implementation complete: 11/12
- Phase 10 requirements: 4/5 complete; DEP-01 pending external activation
- Phase 12 requirements: 10/10 complete in PR #35; production deploy verification pending
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-09 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05, LIFE-01..06, REL-01..04 and QUAL-01..06 are complete.
- Pages #47-#54 deployed those completed phases successfully.

## Phase 10 repository evidence
- Operational issue: #30; repository policy PR: #33.
- DEP-02..05 are complete at repository level.
- `renovate.json` and `scripts/validate-renovate-config.mjs` enforce npm + GitHub Actions coverage, conservative grouping and disabled auto-merge.
- DEP-01 remains open until the hosted Renovate GitHub App creates real npm update PR activity for `svg153/blog`.

## Phase 11 evidence
- Operational issue #31 / PR #34 are complete.
- SEARCH-01..06 complete: Pagefind 1.5.2 indexes only public article HTML under `/blog/`, with tag/year filters, custom results and no-JS Tags/Archive navigation.
- CI leak proof injected a draft and a 2099 article: 7 source entries still produced exactly 5 indexed public articles with no draft/future routes/cards/tags/preview/search leakage.
- Pages #56 deployed Phase 11 successfully.

## Phase 12 evidence
- Operational issue: #32; implementation PR: #35.
- PUB-01..10 are complete in the implementation branch.
- Pinned `yaml@2.9.1` parses canonical article frontmatter/body for the publishing CLI instead of maintaining a partial YAML parser.
- The provider-neutral plan carries canonical URL, title, description/body, dates, tags and deterministic channel payloads/fingerprints.
- Frontmatter supports strict optional DEV/LinkedIn/newsletter copy overrides without credentials or external publication state.
- CLI defaults to dry-run; `--export-dir` is network-free; mutation requires explicit `--publish --channel dev|linkedin`.
- DEV request contract uses Forem v1 with canonical URL semantics and at most four normalized tags.
- LinkedIn request contract uses the Posts API with runtime OAuth/author/version configuration and exposes manual-ready fallback copy when configuration is absent.
- Newsletter output is provider-neutral/export-only.
- Versioned credential-free provenance blocks a second publication of the same channel + slug and there is no force bypass.
- Provider mutation tests use fake in-memory HTTP responses only; validation performs no real external publication.
- A committed golden dry-run was generated by the real CLI. The temporary generator deleted itself before the safety gate; the final branch contains only CI and deploy workflows.
- Real CLI subprocess validation proves dry-run == golden, export creates all channel artefacts, LinkedIn missing configuration fails closed with manual fallback, and publish-all is rejected.
- PR CI #53 on the CLI-safety head passed with 0 vulnerabilities and all repository validators green.

## Milestone handoff
Merge PR #35 only after the final documentation-state CI is green, then verify GitHub Pages. After that, all repository-controlled v2.1 work is complete. Keep parent milestone/Phase 10 open solely for DEP-01 until actual hosted Renovate dependency PR activity is observed; do not mark the milestone 65/65 based only on configuration.
