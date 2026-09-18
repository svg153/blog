# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 08 — Deterministic related posts
- **Status:** Phase 07 implementation and end-to-end leak validation complete; final PR CI + merge/Pages verification pending before Phase 08 starts
- **Next branch:** `feat/related-posts`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, zero-tolerance current audit/build validation and all completed-phase validators.
- Five canonical published Markdown articles currently render through the public dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive, TOC/series and content lifecycle are build-validated.
- Draft/future publication eligibility is shared across every public content-derived surface.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- No committed generated site output.
- `src/lib/content-lifecycle.mjs` is the only public publication predicate/reading-time implementation.
- Publication dates are calendar dates evaluated against `Europe/Madrid`, independent of GitHub runner UTC.
- `draft` defaults to false; draft/future posts cannot affect routes, listings, feeds, cards, taxonomy, archive or series.
- Development-only unpublished preview uses `/preview/<slug>/`; production generates no preview route.
- Reading time is derived from `CollectionEntry.body`, never frontmatter.
- Astro heading metadata/IDs remain the TOC source of truth.
- Series and taxonomy continue to derive only from the already-filtered published set.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit and canonical-URL preserving.

## Progress
- Requirements complete: 34/65
- Phases verified: 7/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-06 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05 and UX-01..05 are complete.
- Pages #47-#51 deployed discovery, SEO, social cards, taxonomy/archive and article UX successfully.

## Phase 07 evidence
- LIFE-01..06 are complete in PR #27.
- Schema validates real `YYYY-MM-DD` publish/update dates; `updatedDate` cannot precede publication and `draft` safely defaults false.
- `getPublishedPosts()` is applied before generating public article routes, home, RSS, social cards, taxonomy/tag pages, archive and series.
- Public eligibility compares against the calendar day in `Europe/Madrid`; a regression fixture verifies the UTC→Madrid day boundary.
- `/preview/<slug>/` is available only in development and displays an explicit preview banner.
- Reading time is calculated from canonical Markdown body with fenced code removed from the prose estimate; all manual `readingTime` metadata was removed from the five current articles.
- Existing public slugs and publication dates were preserved.
- Normal PR CI #26 passed with zero audit findings and all validators green.
- A temporary Actions test injected one draft and one year-2099 article with unique tags and a shared series while running the real production build.
- That production build generated no route, social card, tag page, series page, preview tree, RSS/sitemap reference or HTML marker for either unpublished fixture.
- The same injected fixtures both rendered successfully through development `/preview/<slug>/`.
- The temporary workflow removed itself after success; its bot cleanup commit did not execute normal PR CI, so a final user-authored documentation commit is used to obtain the definitive final-head CI check.

## Known debt entering phase 08
- Article pages do not yet surface related content.
- Related scoring/order is not implemented.
- Related recommendations must consume only the already-filtered published set and exclude the current article.

## Handoff
After PR #27 final CI and Pages are green, start Phase 08 from latest `main`. Build a deterministic related-post helper over the published set with priority: same series, then shared normalized tags, then recency; bound the result set, exclude the current article, and validate draft/future exclusion plus deterministic tie-breaking.
