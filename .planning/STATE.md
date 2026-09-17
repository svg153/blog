# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 02 — RSS and sitemap discovery
- **Status:** Phase 01 implementation and PR validation complete; ready to start Phase 02 after merge
- **Next branch:** `feat/rss-sitemap`

## Baseline evidence
- Astro 7.3.2 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`.
- `npm audit` is clean.
- Mermaid is integrated centrally through `astro-mermaid` with Mermaid 11.17.2 pinned.
- Five Markdown articles exist in `src/content/blog/`.
- One dynamic route, `src/pages/posts/[slug].astro`, renders all five articles through `PostLayout.astro`.
- PR #21 CI run #4 generated all five existing article routes and transformed Mermaid blocks successfully.
- Generated `dist/`, root/public generated HTML/CSS and obsolete build/generate/test scripts have been removed from source control.
- The previous syndication script was removed because its placeholder/unsupported provider logic is not the v2.1 publishing contract; Phase 12 will rebuild publication from the canonical content source.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output.
- Generic article routing is the only article route model.
- Static GitHub Pages remains the runtime model.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is the intended local search implementation for this milestone, introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 5/65
- Phases verified: 1/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01 evidence
- CORE-01..05 are complete.
- Existing public article slugs remain generated from the Markdown collection.
- Adding a Markdown article no longer requires adding a `.astro` article page.
- README and AGENTS now document the actual Astro 7 architecture and CI/deploy contract.
- Static source assets remain in `public/`; generated output is not versioned.

## Known debt entering phase 02
- `Layout.astro` advertises `/blog/rss.xml`, but no Astro RSS route exists yet.
- No sitemap integration/output is currently generated.
- Feed/sitemap smoke assertions are not yet part of CI.

## Handoff
Start Phase 02 from the latest `main`. Add RSS and sitemap outputs from the canonical content collection, preserve the `/blog` base path and absolute canonical article URLs, add build/CI smoke assertions, then record PR/deploy evidence before moving to Phase 03.
