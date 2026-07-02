# Newsletter Configuration

## Substack

**URL**: `https://svg153.substack.com`

### Setup

1. Create account at https://substack.com/signup
2. Verify email
3. Configure newsletter:
   - Name: "Sergio Valverde — Platform Engineering & DevOps"
   - Description: "Tips, technical guides, and best practices on Platform Engineering, DevOps, and Agentic Development."
   - Tags: platform-engineering, devops, ai, automation

### Integration with blog

The blog homepage has a newsletter subscription box that links to:
```
https://svg153.substack.com/subscribe
```

### Syndication flow

```
Blog post (markdown) 
  → scripts/syndicate.js 
    → Substack (newsletter draft)
    → dev.to (published article)
    → LinkedIn (excerpt + link)
    → X/Twitter (thread)
```

### Weekly digest automation

Create a cron job that:
1. Finds all posts published in the last 7 days
2. Generates a newsletter HTML with summaries
3. Publishes to Substack

```bash
# Weekly newsletter (every Sunday at 10am)
node scripts/newsletter.js --week
```

## Superstack

Superstack is a newer platform (superstack.sh) that combines:
- Newsletter (Substack competitor)
- Community (Discourse competitor)
- Memberships

**URL**: `https://superstack.sh`

If you create an account, the newsletter link would update to:
```
https://yourname.superstack.com/subscribe
```

## Content tiers

| Tier | Platform | Effort | Content |
|------|----------|--------|---------|
| Tier 1 | Blog (svg153.github.io/blog) | 2-4h | Deep technical articles |
| Tier 2 | dev.to | 30-60min | Cross-post from blog |
| Tier 3 | LinkedIn | 5-15min | Excerpt + link to blog |
| Tier 4 | X/Twitter | 5-10min | Thread summarizing key points |
| Weekly | Newsletter | 15min | Digest of weekly posts |
