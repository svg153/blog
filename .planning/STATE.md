# State — v2.1 Publishing platform foundation

## Current position
- **Phase:** 10 — Renovate dependency and Actions automation
- **Status:** Phase 09 implementation and failure-mode proof complete; final PR CI + merge/Pages verification pending before Phase 10 starts
- **Next branch:** `ci/renovate-automation`

## Baseline evidence
- Astro 7 static build deploys successfully to GitHub Pages.
- PR CI runs clean install, security audit, real Astro build and the completed validation chain.
- Five canonical published Markdown articles currently render through the public dynamic route.
- RSS/sitemap, SEO metadata, deterministic social cards, taxonomy/archive, TOC/series, lifecycle, related content and general content quality are validated before merge.
- The content-quality gate inspects the generated site for internal link/anchor and local-asset integrity.

## Locked decisions
- Markdown Content Collections remain the canonical article source.
- No committed generated site output.
- Astro build remains the source of truth for typed frontmatter and Mermaid processing.
- `scripts/validate-content-quality.mjs` adds objective structural/generated-site checks; it must not become prose/style scoring.
- Markdown article H1 belongs to the shared layout, not article source.
- Internal link targets, hash anchors and local assets must resolve in generated `dist/`.
- Completed-phase generated outputs are smoke-tested in the normal PR build.
- Mermaid fences must continue through the normal Astro + `astro-mermaid` path.
- Lifecycle, taxonomy, series and related-content contracts remain centralized in their shared helpers.
- Static GitHub Pages remains the runtime model.
- External publishing remains explicit and canonical-URL preserving.

## Progress
- Requirements complete: 44/65
- Phases verified: 9/12
- Planning artifacts: PROJECT, ROADMAP, REQUIREMENTS, STATE

## Phase 01-08 evidence
- CORE-01..05, FEED-01..04, SEO-01..05, OG-01..04, TAX-01..05, UX-01..05, LIFE-01..06 and REL-01..04 are complete.
- Pages #47-#53 deployed all completed phases through deterministic related posts successfully.

## Phase 09 evidence
- QUAL-01..06 are complete in PR #29.
- `scripts/validate-content-quality.mjs` runs immediately after `astro build` inside the existing `npm run build` PR-CI path.
- Baseline CI validated 5 Markdown files, 23 generated HTML pages, 312 internal links, 51 local asset references and 2 Mermaid articles with zero audit findings.
- The structural source contract checks frontmatter delimiters, exactly one title/date, non-empty body, no Markdown H1 and balanced fenced code blocks.
- Generated HTML validation resolves internal routes and hash anchors against actual `dist/` output and checks local image/script/stylesheet/icon/preload/source files.
- Completed outputs currently smoke-tested include home, about, archive, tags, series, RSS, sitemap files, default social card and absence of the development preview tree.
- A conditional Pagefind smoke check is already present for the later search phase if `dist/pagefind/` appears.
- Source files containing Mermaid fences must produce Mermaid-marked generated article HTML, while Mermaid transformation itself stays on the real Astro/Sätteri build path.
- A temporary proof workflow demonstrated the expected failure for an invalid date/frontmatter fixture, broken internal route, missing local asset, Markdown H1, unclosed fence and removed RSS output.
- The same proof workflow demonstrated that a valid temporary Mermaid article succeeds through the complete build and produces Mermaid output.
- The temporary proof workflow removed itself after all tests succeeded.

## Known debt entering phase 10
- npm and GitHub Actions updates are still manual.
- There is no Renovate configuration defining conservative grouping or major-update policy.
- Repository CI exists and is suitable as the required validation gate for dependency PRs, but auto-merge policy has not been defined.

## Handoff
After PR #29 final CI and Pages are green, start Phase 10 from latest `main`. Add Renovate coverage for npm and GitHub Actions, group patch/minor updates conservatively, keep security updates visible, never auto-merge majors, and allow any auto-merge only where repository CI is required and the change class is intentionally low risk.
