# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 03 — Canonical SEO and BlogPosting metadata
- **Status:** Phase 02 implementation and PR validation complete; ready to start Phase 03 after merge
- **Next branch:** `feat/seo-structured-metadata`

## Baseline evidence
- Astro 7.3.2 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`.
- `npm audit` is clean.
- Mermaid is integrated centrally through `astro-mermaid` with Mermaid 11.17.2 pinned.
- Five Markdown articles exist in `src/content/blog/` and are rendered by one dynamic route.
- `/blog/rss.xml` is generated from the canonical content collection with absolute article URLs.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` with the `/blog` base path.
- `npm run build` validates discovery artifacts and checks every Markdown article is present in both RSS and sitemap.
- Phase 02 temporary validation parsed RSS and both sitemap XML files successfully using Python's XML parser.
- `marked` was removed after Phase 01 because no active code path uses the legacy Markdown parser.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output.
- Generic article routing is the only article route model.
- Static GitHub Pages remains the runtime model.
- RSS and sitemap are build-generated from canonical routes/content, never maintained as duplicate registries.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is the intended local search implementation for this milestone, introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 9/65
- Phases verified: 2/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01 evidence
- CORE-01..05 are complete.
- Existing public article slugs remain generated from the Markdown collection.
- Adding a Markdown article no longer requires adding a `.astro` article page.
- README and AGENTS document the actual Astro 7 architecture and CI/deploy contract.
- Static source assets remain in `public/`; generated output is not versioned.

## Phase 02 evidence
- FEED-01..04 are complete.
- `@astrojs/rss@4.0.19` and `@astrojs/sitemap@3.7.4` are pinned.
- RSS contains all five current article canonical URLs under `/blog/posts/`.
- Sitemap index points to the `/blog/sitemap-0.xml` canonical URL and the sitemap contains all five article URLs.
- Layout discovery links for RSS and sitemap derive from Astro `BASE_URL`.
- Missing discovery artifacts, missing article URLs or accidental root `/posts/` URLs fail `npm run build`.
- PR #22 validation confirmed clean install, zero audit findings, successful Astro build and well-formed generated XML.

## Known debt entering phase 03
- Pages do not yet emit absolute canonical URLs.
- `og:url` and full Twitter metadata are incomplete.
- Article publish time/tags are not yet represented in social metadata.
- No `BlogPosting` JSON-LD is emitted yet.
- Social images still rely on the existing default path; deterministic per-article cards belong to Phase 04.

## Handoff
Start Phase 03 from the latest `main`. Centralize canonical/social metadata in the shared layout, add article-specific publication/tag metadata and valid `BlogPosting` JSON-LD, preserve the `/blog` base path, validate generated home/about/article HTML, then record PR/deploy evidence before Phase 04.
