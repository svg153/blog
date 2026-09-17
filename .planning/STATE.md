# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 05 — Tags and chronological archive
- **Status:** Phase 04 implementation and branch validation complete; merge + Pages verification pending before Phase 05 starts
- **Next branch:** `feat/tags-archive`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`.
- Mermaid is integrated centrally through `astro-mermaid` with Mermaid 11.17.2 pinned.
- Five Markdown articles are rendered through one dynamic route.
- RSS and sitemap are generated from canonical content/routes and validated during every build.
- Shared `Layout.astro` owns canonical, OpenGraph, Twitter and JSON-LD metadata.
- Static social preview cards are generated during Astro prerendering from the canonical content collection.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output, including social-card PNGs.
- Generic article routing is the only article route model.
- Static GitHub Pages remains the runtime model.
- RSS/sitemap, SEO metadata and social cards derive from canonical routes/content rather than duplicate registries.
- Social cards are local build artifacts: no hosted OG-image service or runtime network dependency.
- Social-card rasterization uses pinned `@resvg/resvg-js@2.6.2` plus bundled `@fontsource/inter@5.3.0`; system fonts are disabled for reproducibility.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 18/65
- Phases verified: 4/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01 evidence
- CORE-01..05 complete: Markdown is canonical, one article route, legacy generated/build artifacts removed and docs aligned.

## Phase 02 evidence
- FEED-01..04 complete: RSS/sitemap use canonical `/blog/` URLs, XML was parsed successfully and Pages #47 deployed successfully.

## Phase 03 evidence
- SEO-01..05 complete: canonical/OG/Twitter metadata is centralized, articles emit publication/tag metadata and parseable `BlogPosting` JSON-LD, and Pages #48 deployed successfully.

## Phase 04 evidence
- OG-01..04 are complete in PR #24.
- Astro prerenders `/og/<slug>.png` for all five current articles and `/og/default.png` for non-article pages.
- Every generated card is exactly 1200x630 PNG and is referenced consistently by OpenGraph, Twitter and article JSON-LD metadata.
- Twitter cards use `summary_large_image`.
- Long/special-character Spanish title handling is exercised with an explicit stress input containing accents, ñ, punctuation and XML-sensitive characters.
- The stress input is rendered twice and must produce byte-identical PNG output.
- Card fonts come from the pinned Fontsource package with system fonts disabled.
- A newly surfaced moderate `devalue` advisory was remediated in the lockfile; the Phase 04 remediation workflow required zero npm audit findings and a full successful build before committing the lockfile.
- The initial Phase 04 CI correctly caught a stale `twitter:card=summary` value; it was fixed rather than weakening the validator.

## Known debt entering phase 05
- Tags are still display-only spans and are not normalized/linkable.
- No `/tags/`, `/tags/<slug>/` or `/archive/` routes exist yet.
- Tag case/spacing variants do not yet share a stable URL identity.

## Handoff
After PR #24 merges and Pages is green, start Phase 05 from latest `main`. Introduce one shared tag-normalization helper, link article/home tags to stable `/tags/<slug>/` routes, add a tag index with counts and a chronological archive, then validate route coverage and URL stability before merge.
