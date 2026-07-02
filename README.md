# Blog Syndication

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
│   ├── about.astro   ← About page
│   └── posts/        ← Generated post pages (auto-created by build)
├── content.config.ts ← Content collection schema
├── scripts/
│   ├── generate-posts.mjs ← Generates .astro pages from markdown
│   └── syndicate.js      ← Publish to dev.to, LinkedIn, Substack
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
npm run dev        # starts dev server on :4321
npm run build      # generates static site to dist/
```

## Syndication

Publish to multiple platforms from one markdown file:

```bash
# Preview what would be published (no changes)
node scripts/syndicate.js --dry-run

# Publish all new posts to all platforms
node scripts/syndicate.js

# Publish a specific post
node scripts/syndicate.js --post=hello-world

# Only publish to dev.to
node scripts/syndicate.js --devto

# Only publish to LinkedIn
node scripts/syndicate.js --linkedin

# Only publish to Substack newsletter
node scripts/syndicate.js --substack
```

### Required environment variables

| Variable | Source |
|----------|--------|
| `DEVTO_API_KEY` | https://dev.to/settings/extensions |
| `LINKEDIN_TOKEN` | LinkedIn OAuth 2.0 bearer token |
| `SUBSTACK_API_KEY` | Substack API key (Settings → Advanced) |

### Content strategy

- **Blog (primary)** — Full articles, deep dives, technical guides
- **dev.to** — Cross-post from blog (same content, different formatting)
- **LinkedIn** — Excerpt with link to full article
- **Substack** — Newsletter digest of recent posts
- **X/Twitter** — Thread summarizing key points + link

## GitHub Pages

Deployed automatically via GitHub Actions on push to `main`.
