# State — v2.1 Publishing platform foundation

## Current position
- **Active implementation:** Phase 11 — Pagefind static search and filters
- **Open external dependency:** Phase 10 — Renovate activation, DEP-01
- **Phase 10 status:** Repository policy/extraction complete; waiting for actual hosted Renovate PR activity after merge
- **Next branch:** `feat/pagefind-search`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, security audit, real Astro build and all completed validation gates.
- Five canonical published Markdown articles currently render through the public dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive, TOC/series, lifecycle, related content and content quality are validated before merge.
- Renovate repository policy is now build-validated, but hosted GitHub App activation remains an external prerequisite.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- No committed generated site output.
- Renovate covers only npm and GitHub Actions for this repository.
- Renovate routine patch/minor updates are grouped separately by manager; majors stay manual.
- Routine dependency updates have a 3-day minimum release age and bounded PR concurrency.
- `automerge` and `platformAutomerge` remain disabled while GitHub reports `main` as `protected: false` with no enforced status checks.
- A valid `renovate.json` is not enough to complete DEP-01: actual hosted Renovate update PR activity must be observed.
- Phase 11 may proceed because its roadmap dependencies are Phase 05/06, not Phase 10.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit and canonical-URL preserving.

## Progress
- Requirements complete: 48/65
- Phases fully verified: 9/12
- Phase 10 requirements: 4/5 complete; DEP-01 pending external activation
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-09 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05, LIFE-01..06, REL-01..04 and QUAL-01..06 are complete.
- Pages #47-#54 deployed all fully completed phases through content-quality gates successfully.

## Phase 10 repository evidence
- Operational issue: #30; repository policy PR: #33.
- DEP-02..05 are complete at repository level.
- `renovate.json` extends `config:recommended`, enables exactly `npm` and `github-actions`, enables Dependency Dashboard, uses `Europe/Madrid`, applies a 3-day minimum release age and caps update PR concurrency.
- npm patch/minor and GitHub Actions patch/minor updates have separate groups; major updates are explicitly manual and labeled.
- GitHub reports `main` as unprotected with status-check enforcement off, so all forms of Renovate auto-merge are explicitly disabled.
- `scripts/validate-renovate-config.mjs` is part of normal `npm run build` and rejects policy drift including any package rule enabling auto-merge.
- Renovate 44.93.0 `renovate-config-validator --strict` validated the repository configuration.
- A real Renovate local extract dry-run on its supported Node 24.11 runtime found:
  - npm: 1 package file / 8 dependencies;
  - github-actions: 3 workflow files / 15 dependencies during the temporary proof;
  - 23 dependencies total;
  - explicit detection of `actions/checkout` and `actions/setup-node`.
- The temporary third workflow was the proof workflow itself and removed itself after success.
- DEP-01 remains open until the hosted Renovate GitHub App creates real dependency update activity for `svg153/blog`.

## Known debt entering phase 11
- No static search index exists.
- No search UI exists under the `/blog` base path.
- Search metadata/filter composition for tags/year is not implemented.
- Search must consume only generated public production pages and never draft/future preview content.

## Handoff
After PR #33 final CI/merge, check immediately for Renovate Dependency Dashboard/update PR activity. Keep #30 open if none appears. Independently start Phase 11 from latest `main`: add Pagefind after Astro/validation build output, expose progressive-enhancement search under `/blog`, index title/description/tags/year metadata, compose filters without breaking no-JS taxonomy/archive navigation, and prove draft/future content cannot enter the index.
