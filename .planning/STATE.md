# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 01 — Canonical Astro source
- **Status:** Planning baseline created; implementation not yet verified
- **Next branch:** `refactor/canonical-astro-content`

## Baseline evidence
- Astro 7.3.2 static build deploys successfully to GitHub Pages.
- PR CI runs `npm ci`, high/critical audit and `npm run build`.
- `npm audit` is currently clean.
- Mermaid is integrated centrally through `astro-mermaid` with Mermaid 11.17.2 pinned.
- Five Markdown articles exist in `src/content/blog/`.
- Five article-specific `.astro` pages still exist in `src/pages/posts/`, so adding content is not yet generic.
- Legacy generated/build artifacts and scripts remain versioned despite Astro now owning the production build.
- Layout advertises `/blog/rss.xml`, but no current Astro RSS route exists.

## Locked decisions
- Markdown content collection is the canonical article source.
- No committed generated site output.
- Generic article routing before feed/taxonomy/search work.
- Static GitHub Pages remains the runtime model.
- External publishing is explicit, reviewable and canonical-URL preserving.
- No browser scraping/session reuse as a provider fallback.
- Pagefind is the intended local search implementation for this milestone, introduced only after taxonomy/article UX are stable.

## Progress
- Requirements complete: 0/65
- Phases verified: 0/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Known debt entering phase 01
- `dist/` is still tracked even though `.gitignore` excludes it.
- Root/public generated HTML from the previous build system remains.
- `scripts/build.mjs`, `scripts/generate-posts.mjs` and `scripts/test.mjs` predate the current Astro pipeline.
- `scripts/syndicate.js` represents an older publication approach and is not trusted as the final v2.1 publishing contract; preserve only if phase 01 analysis finds reusable provider-neutral logic.
- README claims Tailwind even though the current dependency graph does not include Tailwind, and documents outdated per-post generation/syndication behavior.

## Handoff
Start phase 01 from the latest `main`. Replace article-specific routes with one content-collection route, verify all existing public URLs still build, remove obsolete generated artifacts/scripts, update docs, run CI, then record PR/deploy evidence here before moving to phase 02.
