# Sergio Valverde Blog

Personal technical blog built with Astro and deployed as a static site to GitHub Pages.

## Architecture

- **Astro 7** builds the static site.
- **Astro Content Collections** load and validate articles from `src/content/blog/*.md`.
- **One dynamic route** (`src/pages/posts/[slug].astro`) renders every article. Adding a post does not require a new `.astro` page.
- **@astrojs/rss** generates `/blog/rss.xml` directly from the canonical content collection.
- **@astrojs/sitemap** generates sitemap discovery output from the built Astro routes.
- **astro-mermaid** renders Mermaid fences in Markdown; Mermaid is pinned to a compatible v11 release.
- **GitHub Actions** validates pull requests and deploys `main` to GitHub Pages.

Markdown is the canonical article source. Generated output such as `dist/` is never committed.

## Structure

```text
src/
├── content/blog/         # Canonical Markdown articles
├── content.config.ts     # Content collection schema
├── layouts/
│   ├── Layout.astro      # Site shell and global styles
│   └── PostLayout.astro  # Shared article presentation
└── pages/
    ├── index.astro
    ├── about.astro
    ├── rss.xml.js
    └── posts/[slug].astro

scripts/
└── validate-discovery.mjs # Build smoke checks for RSS/sitemap

.github/workflows/
├── ci.yml                # PR validation
└── deploy.yml            # GitHub Pages deployment from main
```

## Writing an article

Create `src/content/blog/<slug>.md` with frontmatter such as:

```yaml
---
title: "My Post Title"
description: "Short description"
date: "2026-09-17"
tags: ["AI", "GitHub"]
featured: false
readingTime: "5"
---
```

Then write the article directly in Markdown. Do not add a page under `src/pages/posts/`; the dynamic route creates `/blog/posts/<slug>/` during the Astro build. The same content collection drives the RSS feed, while the generated route is discovered automatically by the sitemap integration.

Mermaid diagrams use normal fenced blocks:

````markdown
```mermaid
flowchart LR
  Idea --> Review --> Publish
```
````

## Local development

Node.js 22.12 or newer is required.

```bash
npm ci
npm run dev
npm run build
npm audit --audit-level=high
```

`npm run build` also verifies that RSS/sitemap artifacts exist and that every Markdown article resolves to canonical `/blog/posts/<slug>/` URLs in both outputs. The production build is written to ignored `dist/` output.

## Pull requests and deployment

Pull requests to `main` run CI with:

1. `npm ci`
2. `npm audit --audit-level=high`
3. `npm run build`

A push to `main` builds and deploys the generated `dist/` directory through GitHub Pages Actions.

## Publishing roadmap

The canonical source remains this blog. External syndication/export is intentionally not implemented by ad-hoc scripts; the v2.1 roadmap in `.planning/` will introduce a reviewable, provider-aware publishing pipeline in Phase 12.
