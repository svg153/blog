# Blog publishing platform

## Project identity

A personal technical blog built with Astro and GitHub Pages. The v2.1 milestone turns the repository from a Markdown renderer into a maintainable publishing platform: one canonical content source, strong discovery/SEO, navigable taxonomy, automated quality gates, search and a safe syndication pipeline.

## Core value

Write a technical article once in Markdown, publish it reliably on the canonical blog, make it easy to discover and navigate, and prepare safe reusable derivatives for external channels without duplicating article source or losing provenance.

## Current milestone

- **Version:** v2.1.0
- **Name:** Publishing platform foundation
- **Mode:** brownfield / standard
- **Planning contract:** GitHub Issues own operational status; `.planning/` owns requirements, dependency order, decisions, task packets and verification evidence.

## Target journey

1. Author one Markdown article in `src/content/blog/`.
2. Validate metadata, links, security and the Astro build in PR CI.
3. Render every article through one dynamic route and shared post layout.
4. Publish RSS and sitemap discovery surfaces.
5. Emit canonical, OpenGraph, Twitter and structured article metadata.
6. Generate consistent social-preview assets from article metadata.
7. Navigate by tags, series, archive, related posts and table of contents.
8. Keep drafts/future content out of production and derive reading time automatically.
9. Search the static site locally with Pagefind once the content surface warrants it.
10. Produce explicit, reviewable syndication payloads for DEV Community, LinkedIn, newsletter providers and future adapters while the blog remains canonical.

## Locked architecture decisions

1. `src/content/blog/*.md` is the canonical article source.
2. Generated build output is never committed.
3. Article routing is generic; adding an article must not require creating a matching `.astro` page.
4. Publication remains static on GitHub Pages; avoid server/runtime dependencies unless a later requirement explicitly justifies them.
5. The blog URL is canonical. Syndication must preserve canonical URLs and never silently become a second source of truth.
6. External publication is explicit and reviewable. No auto-posting to third parties merely because a commit merged.
7. Provider credentials are runtime-only GitHub secrets or local environment variables; never content/frontmatter or repository files.
8. Unsupported provider APIs must degrade to export/manual handoff rather than scraping/browser-session workarounds.
9. Accessibility and mobile readability are acceptance criteria for navigation, diagrams, search and generated social assets.
10. Dependency/security automation must preserve the existing `npm ci` contract and PR CI gate.

## Planning contract

- GitHub Issues are the operational backlog and delivery discussion.
- `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md` own phase order and traceability.
- `.planning/STATE.md` records the currently verified baseline and next phase.
- Each implementation phase uses an isolated branch and PR based on the latest `main`.
- A phase is complete only when CI passes, the diff has been reviewed against its issue/requirements, the PR is merged and the production deployment remains healthy when applicable.
- Plans are intentionally detailed enough that a fresh agent can execute them without this conversation.

## Constraints

- Node.js 22+.
- Astro 7.x and GitHub Pages static hosting.
- Mermaid 11 remains pinned while `astro-mermaid@2.1.0` supports Mermaid 10/11 only.
- Keep client JavaScript proportional to the feature; normal article pages should remain mostly static.
- Do not add an external database or hosted search service for this milestone.

## Out of scope

- A CMS with authenticated editing UI.
- Server-side comments/accounts.
- Scraping LinkedIn, X or newsletter platforms to bypass APIs.
- Fully autonomous cross-posting without human review.
- Analytics/advertising stacks that add tracking solely for vanity metrics.
