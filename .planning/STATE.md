# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 07 — Content lifecycle and automatic reading time
- **Status:** Phase 06 implementation and PR validation complete; merge + Pages verification pending before Phase 07 starts
- **Next branch:** `feat/content-lifecycle`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, security audit and the repository build-validation chain.
- Five canonical Markdown articles render through one dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive and article UX are build-validated.
- All five current long-form articles expose Astro-derived TOCs whose links match the generated h2/h3 IDs.

## Locked decisions
- Markdown Content Collections are the canonical article source.
- No committed generated site output.
- Astro's rendered heading metadata and IDs are the only article-heading/TOC source of truth.
- Heading permalinks are progressively enhanced with lightweight vanilla JS, not a framework runtime.
- Optional series metadata is `{ id, name, order }`; ordering/navigation comes only from `src/lib/series.mjs`.
- Tags use the single normalization contract in `src/lib/taxonomy.mjs`.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit, reviewable and canonical-URL preserving.

## Progress
- Requirements complete: 28/65
- Phases verified: 6/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-05 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04 and TAX-01..05 are complete.
- Pages #47-#50 deployed the completed discovery, SEO, social-card and taxonomy/archive phases successfully.

## Phase 06 evidence
- UX-01..05 are complete in PR #26.
- Astro `render(entry).headings` drives TOC content directly; Markdown is not reparsed.
- Astro-generated h2/h3 IDs remain the stable deep-link IDs.
- All five current articles meet the long-form threshold and render collapsible TOCs that match heading IDs/order exactly.
- A small vanilla-JS enhancer adds standard `#heading-id` permalink anchors without a framework runtime; TOC/deep links still exist without it.
- The content schema accepts optional URL-safe series id, display name and positive explicit order.
- `src/lib/series.mjs` rejects duplicate order and inconsistent naming, sorts deterministically and computes previous/next context.
- `/series/` is generated now; `/series/<id>/` routes appear automatically when canonical published content declares a series.
- No editorial series was invented for existing posts. Synthetic build fixtures verify 3-post ordering and failure modes.
- PR #26 CI #24 completed with zero audit findings; all prior validators plus Article UX passed.

## Known debt entering phase 07
- Publication dates are still strings rather than a lifecycle model.
- There is no `draft` flag or production filtering for draft/future-dated content.
- Development has no explicit draft-preview path.
- Reading time remains manually maintained in frontmatter.

## Handoff
After PR #26 merges and Pages is green, start Phase 07 from latest `main`. Introduce one shared publication predicate used by routes/listings/RSS/taxonomy/series/social cards, validate publication/update dates, add explicit development-only draft preview, calculate reading time from source content, migrate existing articles without changing public URLs/dates, and verify draft/future content never leaks into production outputs.
