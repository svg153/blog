# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 04 — Deterministic social preview cards
- **Status:** Phase 03 implementation and PR validation complete; ready to start Phase 04 after merge
- **Next branch:** `feat/social-preview-cards`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`; `npm audit` is clean.
- Mermaid is integrated centrally through `astro-mermaid` with Mermaid 11.17.2 pinned.
- Five Markdown articles are rendered through one dynamic route.
- RSS and sitemap are generated from canonical content/routes and validated during every build.
- GitHub Pages deployment #47 for Phase 02 completed successfully.
- Shared `Layout.astro` now owns canonical, OpenGraph, Twitter and JSON-LD metadata.
- `npm run build` validates canonical/social metadata and parses every article's `BlogPosting` JSON-LD.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output.
- Generic article routing is the only article route model.
- Static GitHub Pages remains the runtime model.
- RSS/sitemap and SEO metadata are derived from canonical routes/content, never duplicate registries.
- The current favicon-based social image is intentionally temporary; Phase 04 replaces it with deterministic 1200x630 cards.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 14/65
- Phases verified: 3/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01 evidence
- CORE-01..05 complete: Markdown is canonical, one article route, legacy generated/build artifacts removed and docs aligned.

## Phase 02 evidence
- FEED-01..04 complete: RSS/sitemap use canonical `/blog/` URLs, XML was parsed successfully and Pages #47 deployed successfully.

## Phase 03 evidence
- SEO-01..05 are complete.
- Home, about and all five article pages emit exactly one absolute canonical URL under `/blog/`.
- OpenGraph and Twitter metadata are centralized in `Layout.astro`; `og:url` matches canonical and social image URLs are absolute.
- Articles emit `article:published_time`, `article:modified_time` and repeated `article:tag` values.
- `updatedDate` is supported as an optional metadata source; unchanged articles use publication time as their current modification time until lifecycle work in Phase 07.
- Every article emits one parseable `BlogPosting` JSON-LD object with canonical URL, author identity, dates, tags and image.
- JSON-LD serialization escapes `<` and line-separator characters before `set:html`.
- PR #23 CI run #15 completed with zero audit findings; discovery validation passed for five articles and SEO validation passed for two site pages plus five articles.

## Known debt entering phase 04
- Social images are valid absolute URLs but currently use the favicon fallback and `twitter:card=summary`.
- No deterministic article-specific 1200x630 card exists yet.
- Long Spanish technical titles have not yet been exercised against card wrapping/escaping.

## Handoff
After Phase 03 merges and Pages is green, start Phase 04 from latest `main`. Generate deterministic static 1200x630 social cards for every article plus a fallback, wire their absolute URLs into the existing shared SEO contract, switch to `summary_large_image`, and validate dimensions/output paths and metadata references before merge.
