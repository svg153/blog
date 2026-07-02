# Blog

Sergio Valverde's blog — built with **Astro**, styled like the GitHub Blog.

## Tech stack

- **Astro 7** — static site generator with zero JS by default
- **Tailwind CSS v4** — utility-first CSS
- **GitHub Pages** — hosting
- **Markdown** — content authoring

## Structure

```
src/
├── content/blog/     ← Write posts here as .md files
├── pages/
│   ├── index.astro   ← Homepage with GitHub Blog aesthetic
│   ├── posts/[slug].astro  ← Individual post layout
│   └── about.astro   ← About page
└── content/config.ts ← Content collection schema
public/               ← Static assets (images, favicon)
```

## Writing a post

1. Create `src/content/blog/my-post-title.md`
2. Add frontmatter:

```yaml
---
title: "My Post Title"
description: "Short description for SEO"
date: "2025-07-01"
tags: ["AI", "DevOps", "Platform"]
featured: true
readingTime: "5"
---
```

3. Write your article in Markdown
4. Commit and push — GitHub Actions builds and deploys automatically

## Tags and colors

| Tag | Color |
|-----|-------|
| AI | Pink `#f778ba` |
| DevOps | Blue `#1d9bf0` |
| Platform | Purple `#a371f7` |
| Security | Orange `#d29922` |
| General | Green `#3fb950` |

## Local development

```bash
npm install
npm run dev
```

## Syndication

Posts are written once in Markdown and can be syndicated to:
- **dev.to** (via API)
- **LinkedIn** (excerpt + link)
- **Substack** (newsletter)
