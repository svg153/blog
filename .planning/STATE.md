# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 06 — TOC, heading anchors and ordered series
- **Status:** Phase 05 implementation and PR validation complete; merge + Pages verification pending before Phase 06 starts
- **Next branch:** `feat/toc-series`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`; the current audit is clean.
- Five Markdown articles are rendered through one dynamic article route.
- RSS and sitemap are generated from canonical content/routes and validated during every build.
- Shared canonical/OpenGraph/Twitter/BlogPosting metadata is build-validated.
- Deterministic 1200x630 article/fallback social cards are generated during Astro prerendering.
- Frontmatter tags now drive stable taxonomy routes and a chronological archive.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output, including social-card PNGs.
- Generic article routing is the only article route model.
- Static GitHub Pages remains the runtime model.
- Tag URLs are derived only through `src/lib/taxonomy.mjs`; there is no duplicate tag registry or hand-authored slug list.
- Reusable post/tag presentation lives in shared components rather than copied page markup.
- RSS/sitemap, SEO metadata, social cards and taxonomy derive from canonical routes/content.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 23/65
- Phases verified: 5/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01 evidence
- CORE-01..05 complete: Markdown is canonical, one article route, legacy generated/build artifacts removed and docs aligned.

## Phase 02 evidence
- FEED-01..04 complete: RSS/sitemap use canonical `/blog/` URLs, generated XML is validated and Pages #47 deployed successfully.

## Phase 03 evidence
- SEO-01..05 complete: canonical/OG/Twitter metadata is centralized, articles emit publication/tag metadata and parseable `BlogPosting` JSON-LD, and Pages #48 deployed successfully.

## Phase 04 evidence
- OG-01..04 complete: five article cards plus fallback are deterministic 1200x630 PNGs generated from canonical metadata; Pages #49 deployed successfully.
- Phase 04 restored the full dependency audit to zero findings after a newly surfaced moderate transitive advisory.

## Phase 05 evidence
- TAX-01..05 are complete in PR #25.
- One Unicode-aware normalization helper generates stable lowercase tag slugs, with explicit regression coverage for accents, whitespace and common technical symbols.
- Article and home tags are real links; `PostCard.astro` and `TagLink.astro` prevent duplicated list/tag rendering logic.
- `/tags/` contains the 13 normalized current tags with counts derived from the Content Collection.
- One static `/tags/<slug>/` page is generated per normalized tag and contains exactly the expected posts.
- `/archive/` groups all current posts by year and orders them newest-first.
- The taxonomy validator reconstructs membership from rendered article HTML, validates the home/index/tag pages and archive, and requires all taxonomy/archive URLs in the sitemap.
- PR #25 CI #22 completed with zero audit findings; discovery, social-card, SEO and taxonomy validators all passed.

## Known debt entering phase 06
- Article headings are not yet exposed as a deliberate copyable deep-link/TOC contract.
- Long articles do not render a heading-derived table of contents.
- Frontmatter has no series identifier/name/order model and there is no series navigation/page.

## Handoff
After PR #25 merges and Pages is green, start Phase 06 from latest `main`. Reuse Astro's rendered heading metadata where possible instead of reparsing Markdown, add accessible heading anchors/TOC, extend the content schema with optional ordered series metadata, then add deterministic series pages and previous/next navigation with build validation.
