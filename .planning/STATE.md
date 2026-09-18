# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 09 — Content quality gates in PR CI
- **Status:** Phase 08 implementation and PR validation complete; final CI + merge/Pages verification pending before Phase 09 starts
- **Next branch:** `ci/content-quality-gates`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, security audit and the completed-phase build-validation chain.
- Five canonical published Markdown articles render through the public dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive, TOC/series, content lifecycle and related content are build-validated.
- Draft/future publication eligibility is shared across every public content-derived surface.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- No committed generated site output.
- `src/lib/content-lifecycle.mjs` is the only public publication predicate/reading-time implementation.
- Publication dates use the `Europe/Madrid` calendar day.
- Astro heading metadata/IDs remain the TOC source of truth and article-heading validation is scoped to the Markdown body.
- Taxonomy uses `tagSlug()`; related-post shared-tag matching reuses that normalization.
- Related-post ranking is lexicographic: same series > shared normalized tag count > recency > slug.
- Related candidates are always filtered published content and never the current article.
- Default related output is bounded to three entries.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit and canonical-URL preserving.

## Progress
- Requirements complete: 38/65
- Phases verified: 8/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-07 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05 and LIFE-01..06 are complete.
- Pages #47-#52 deployed all completed phases through content lifecycle successfully.

## Phase 08 evidence
- REL-01..04 are complete in PR #28.
- `src/lib/related-posts.mjs` ranks a fixed published candidate set deterministically without external services or embeddings.
- Ranking order is same series first, then number of shared normalized tags, then newer publication date, then slug.
- The helper defensively applies the lifecycle publication filter even though the public article route already supplies published posts.
- Current article, drafts and future-dated posts are excluded.
- Default article output is capped at three unique recommendations.
- `RelatedPosts.astro` exposes a compact reader-facing reason such as same series, shared tag count or recency without changing the ranking.
- Synthetic fixtures prove series priority over newer/tag-related content, normalized tag matching, draft/future exclusion, stable slug tie-breaking, repeatability and limit behavior.
- Generated-page validation proves each recommendation targets an existing public article, never self-references, remains unique and stays bounded.
- The first Phase 08 CI exposed an overly broad Phase 06 validator that scanned UI h2/h3 elements outside Markdown content. The validator was corrected to inspect only the `data-post-body` region rather than adding artificial IDs to UI headings.
- PR #28 CI #31 passed with zero audit findings and lifecycle, discovery, social-card, SEO, taxonomy, Article UX and related-post validators all green.

## Known debt entering phase 09
- PR CI has strong feature-specific validators but no unified structural content gate.
- Internal links are not checked comprehensively across source/generated output.
- Missing local Markdown/static asset references are not intentionally detected as a quality contract.
- Markdown structural checks need a low-noise policy instead of prose/style linting.
- Completed generated outputs need one durable smoke-test layer that can evolve with later Pagefind output.

## Handoff
After PR #28 final CI and Pages are green, start Phase 09 from latest `main`. Add pragmatic source/content invariants, internal-link and local-asset checks, smoke-test completed generated outputs, keep Mermaid covered through the real Astro build, and prove each failure mode with temporary fixtures without introducing subjective prose-style rules.
