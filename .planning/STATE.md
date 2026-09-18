# State — v2.1 Publishing platform foundation

## Current position
- **Repository-controlled implementation:** complete through Phase 12 and production-verified.
- **Only open milestone dependency:** Phase 10 — hosted Renovate activation, DEP-01.
- **Phase 10 status:** repository policy/extraction complete; waiting for an actual hosted Renovate npm update PR.
- **Next internal implementation branch:** none.

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, zero-vulnerability audit, Astro build, Pagefind generation and every completed validation gate.
- Five canonical published Markdown articles render through the public dynamic route.
- RSS/sitemap, SEO, social cards, taxonomy/archive, TOC/series, lifecycle, related content, content quality and Pagefind search are production-verified.
- The publishing pipeline derives reviewable deterministic payloads from canonical Markdown and is safe-by-default: dry-run/export has no network mutation; publishing is explicit per API-backed channel.
- Phase 12 merged as PR #35 and GitHub Pages #57 deployed successfully.
- Renovate repository policy is build-validated, but hosted GitHub App activity remains the only external prerequisite before closing v2.1.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- Generated site/search/social-card output is never committed.
- External publication does not create provider-specific canonical source copies.
- `scripts/publish.mjs` defaults to dry-run; export remains network-free.
- Network mutation requires explicit `--publish` and exactly one API-backed channel; there is no publish-all or provenance bypass.
- DEV uses the supported Forem v1 article API and preserves the canonical blog URL.
- LinkedIn uses the supported Posts API only with explicit runtime token/author/version configuration; manual-ready export is the fallback and browser/session scraping is prohibited.
- LinkedIn API guidance is current to `Linkedin-Version: 202609` as verified during the final Phase 12 review.
- Newsletter remains provider-neutral until a documented supported provider API/connector is deliberately selected.
- Credentials are runtime-only and must never enter content, provenance, golden fixtures or request descriptors.
- Versioned `data/publication-provenance.json` blocks repeated publication for the same channel + slug.
- Permanent GitHub Actions workflows must never invoke the publishing CLI.
- Renovate covers only npm and GitHub Actions; auto-merge remains disabled while `main` has no enforced required status checks.
- A valid `renovate.json` alone does not complete DEP-01; an actual hosted Renovate npm dependency PR is required.

## Progress
- Requirements complete: **64/65**.
- Repository implementation complete: **12/12 phases**.
- Fully closed phases: **11/12**; Phase 10 remains open only for DEP-01.
- Phase 10 requirements: **4/5 complete**; DEP-01 pending external activation.
- Phase 12 requirements: **10/10 complete**, merged and deployed.
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE.

## Phase 01-09 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05, LIFE-01..06, REL-01..04 and QUAL-01..06 are complete.
- Pages #47-#54 deployed those completed phases successfully.

## Phase 10 repository evidence
- Operational issue: #30; repository policy PR: #33.
- DEP-02..05 are complete at repository level.
- `renovate.json` and `scripts/validate-renovate-config.mjs` enforce npm + GitHub Actions coverage, conservative grouping and disabled auto-merge.
- Renovate CLI validation and local extraction proved the repository configuration recognizes both npm and GitHub Actions dependencies.
- Issue #30 remains open.
- No hosted Renovate npm update PR or Dependency Dashboard activity has been observed yet.
- DEP-01 remains open until real hosted npm update activity appears for `svg153/blog`.

## Phase 11 evidence
- Operational issue #31 / PR #34 are complete.
- SEARCH-01..06 complete: Pagefind 1.5.2 indexes only public article HTML under `/blog/`, with tag/year filters, custom results and no-JS Tags/Archive navigation.
- CI leak proof injected a draft and a 2099 article: seven source entries still produced exactly five indexed public articles with no draft/future routes/cards/tags/preview/search leakage.
- Pages #56 deployed Phase 11 successfully.

## Phase 12 evidence
- Operational issue #32 / PR #35 are complete.
- PUB-01..10 are complete and deployed.
- Pinned `yaml@2.9.1` parses canonical article frontmatter/body for the publishing CLI.
- The provider-neutral plan carries canonical URL, title, description/body, dates, tags and deterministic channel payloads/fingerprints.
- Frontmatter supports strict optional DEV/LinkedIn/newsletter copy overrides without credentials or external publication state.
- CLI defaults to dry-run; `--export-dir` is network-free; mutation requires explicit `--publish --channel dev|linkedin`.
- DEV uses the Forem v1 article API with canonical URL semantics and at most four normalized tags.
- LinkedIn uses the Posts API with runtime OAuth/author/version configuration; current guidance was refreshed to version `202609` before merge.
- Newsletter output is provider-neutral/export-only.
- Versioned credential-free provenance blocks a second publication of the same channel + slug and there is no force bypass.
- Provider mutation tests use fake in-memory HTTP responses only; validation performs no real external publication.
- Final PR CI #56 passed with zero vulnerabilities and all repository validators green.
- Pages #57 deployed merge commit `d4e8b1319ad1bb45c2b8eece7ec867a18404611f` successfully.

## Milestone handoff
All repository-controlled v2.1 work is complete and production-verified. Keep parent issue #11 and Phase 10 issue #30 open solely for DEP-01. When the hosted Renovate GitHub App opens a real npm dependency update PR for `svg153/blog`, validate that PR uses the expected policy/CI, mark DEP-01 complete, update Phase 10 to complete, move the milestone to 65/65, and close #30 and #11.
