# State — v2.1 Publishing platform foundation

## Current position
- **Active implementation:** Phase 12 — canonical-content publishing and syndication pipeline
- **Open external dependency:** Phase 10 — Renovate activation, DEP-01
- **Phase 10 status:** Repository policy/extraction complete; waiting for actual hosted Renovate PR activity
- **Next branch:** `feat/publishing-pipeline`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, security audit, real Astro build, Pagefind generation and all completed validation gates.
- Five canonical published Markdown articles currently render through the public dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive, TOC/series, lifecycle, related content, content quality and static search are validated before merge.
- Pagefind indexes only generated public article HTML and exposes tag/year filters under the GitHub Pages `/blog` base path.
- Renovate repository policy is build-validated, but hosted GitHub App activation remains an external prerequisite.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- No committed generated site output, including Pagefind indexes.
- Pagefind runs after the Astro production build and indexes only pages that deliberately opt in with `data-pagefind-body`.
- Search metadata/filter values are derived from canonical article metadata; no separate search registry exists.
- Search is mounted at `/blog/search/`, with explicit `base-url="/blog/"` and `bundle-path="/blog/pagefind/"`.
- Tag/year filters use Pagefind's static filter index; there is no external search service.
- Normal Tags/Archive/article navigation remains plain HTML and usable without the search JavaScript.
- Pagefind remains pinned to 1.5.2 until an update is reviewed through normal dependency policy.
- Renovate covers only npm and GitHub Actions for this repository.
- Renovate auto-merge remains disabled while `main` has no enforced required status checks.
- A valid `renovate.json` is not enough to complete DEP-01: actual hosted Renovate update PR activity must be observed.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit and canonical-URL preserving.

## Progress
- Requirements complete: 54/65
- Phases fully verified: 10/12
- Phase 10 requirements: 4/5 complete; DEP-01 pending external activation
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-09 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05, LIFE-01..06, REL-01..04 and QUAL-01..06 are complete.
- Pages #47-#54 deployed all fully completed phases through content-quality gates successfully.

## Phase 10 repository evidence
- Operational issue: #30; repository policy PR: #33.
- DEP-02..05 are complete at repository level.
- `renovate.json` and `scripts/validate-renovate-config.mjs` enforce the documented npm/GitHub Actions update policy.
- DEP-01 remains open until the hosted Renovate GitHub App creates real dependency update activity for `svg153/blog`.

## Phase 11 evidence
- Operational issue: #31; implementation PR: #34.
- SEARCH-01..06 are complete in the branch and final merge/Pages verification is pending.
- Pinned `pagefind@1.5.2` runs immediately after `astro build` and writes the ignored `dist/pagefind/` static bundle.
- Only public article pages opt into the index with `data-pagefind-body`; other site pages remain outside the search index.
- Article search metadata includes title, description, tags, year and publication date; tag/year are Pagefind filters and date is available as sort metadata.
- `/search/` uses Pagefind Component UI with explicit `/blog/` base/bundle paths, keyboard-capable controls, a custom result template and mobile-safe layout.
- The search page retains ordinary links to Tags and Archive so no-JS browsing remains available.
- `scripts/validate-search.mjs` verifies generated bundle files, search-page configuration, article opt-in markers and the generated Pagefind manifest page count.
- Baseline PR CI #45 passed with 5 indexed public pages, 2 filters and 1 sort.
- A temporary CI proof injected one draft and one 2099 future-dated Markdown article. With 7 source articles present, the full production build remained at exactly 5 Pagefind pages; neither fixture produced a public route, OG card, tag page, preview tree or marker in generated HTML. The temporary proof workflow removed itself after success.

## Known debt entering phase 12
- No provider-neutral publication payload contract exists yet.
- No dry-run/export command exists.
- DEV Community, LinkedIn and newsletter channel capabilities/fallbacks are not represented in code.
- No provenance/idempotency model exists for external publication attempts.
- External mutation must remain explicit and must not run automatically on merge.

## Handoff
After PR #34 final CI/merge and Pages verification, start Phase 12 from latest `main`. Keep Markdown canonical. First define a provider-neutral, credential-free export contract and deterministic defaults/explicit per-channel overrides; then add dry-run fixtures and provenance/idempotency before any network adapter. Implement DEV only through its supported API, LinkedIn through supported API when explicitly configured with a manual-ready fallback otherwise, and newsletter through a provider-neutral adapter contract. Do not scrape browser sessions and do not cross-post automatically on merge.
