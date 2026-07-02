#!/usr/bin/env node
/**
 * Syndication script — publishes blog posts to dev.to, LinkedIn, and Substack
 * 
 * Usage:
 *   node scripts/syndicate.js                    # syndicate all new posts
 *   node scripts/syndicate.js --post hello-world # syndicate specific post
 *   node scripts/syndicate.js --dry-run           # preview without publishing
 *   node scripts/syndicate.js --devto             # only dev.to
 *   node scripts/syndicate.js --linkedin          # only LinkedIn
 *   node scripts/syndicate.js --substack          # only Substack
 *
 * Requires env vars:
 *   DEVTO_API_KEY     — dev.to API key (https://dev.to/settings/extensions)
 *   LINKEDIN_TOKEN    — LinkedIn bearer token (optional, for LinkedIn publishing)
 *   SUBSTACK_API_KEY  — Substack API key (optional, for newsletter)
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = 'src/content/blog';
const SYNTH_DIR = '.synth'; // tracks what's been syndicated

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const specificPost = args.find(a => a.startsWith('--post='))?.split('=')[1] || args.find(a => a === '--post' && args[args.indexOf(a) + 1]);
const onlyDevto = args.includes('--devto');
const onlyLinkedin = args.includes('--linkedin');
const onlySubstack = args.includes('--substack');
const allPlatforms = !onlyDevto && !onlyLinkedin && !onlySubstack;

const platforms = [];
if (allPlatforms || onlyDevto) platforms.push('devto');
if (allPlatforms || onlyLinkedin) platforms.push('linkedin');
if (allPlatforms || onlySubstack) platforms.push('substack');

console.log(`\n📡 Syndication tool`);
console.log(`   Platforms: ${platforms.join(', ')}`);
console.log(`   Mode: ${dryRun ? 'DRY RUN (no publishing)' : 'LIVE'}`);
console.log(`   ${specificPost ? `Post: ${specificPost}` : 'All new posts'}\n`);

// Read all blog posts
const postFiles = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  return {
    title: fm.match(/title:\s*"([^"]+)"/)?.[1] || 'Untitled',
    description: fm.match(/description:\s*"([^"]+)"/)?.[1] || '',
    date: fm.match(/date:\s*"([^"]+)"/)?.[1] || '',
    tags: fm.match(/tags:\s*\[([^\]]+)\]/)?.[1]?.split(',').map(t => t.trim().replace(/"/g, '')) || [],
    readingTime: fm.match(/readingTime:\s*"([^"]+)"/)?.[1] || '',
    featured: fm.match(/featured:\s*(true|false)/)?.[1] === 'true',
  };
}

function stripMarkdown(html) {
  // Convert markdown to HTML-like content for dev.to
  return html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function getBodyMarkdown(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

async function publishToDevto(post, slug, body) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.log(`   ⏭️  dev.to: SKIPPED (no DEVTO_API_KEY)`);
    return { success: false, error: 'No API key' };
  }

  const title = post.title;
  const description = post.description;
  const tags = post.tags.map(t => t.toLowerCase());
  const published = !dryRun;

  const payload = {
    article: {
      title,
      description,
      body_markdown: body,
      tags,
      published,
      main_image: `https://svg153.github.io/blog/images/${slug}.png`,
    },
  };

  if (dryRun) {
    console.log(`   📋 dev.to (DRY RUN): Would publish "${title}"`);
    console.log(`      Tags: ${tags.join(', ')}`);
    console.log(`      Published: ${published}`);
    return { success: true, url: null };
  }

  try {
    const res = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`   ❌ dev.to: ${res.status} — ${err}`);
      return { success: false, error: err };
    }

    const data = await res.json();
    console.log(`   ✅ dev.to: Published! ${data.url}`);
    return { success: true, url: data.url };
  } catch (e) {
    console.log(`   ❌ dev.to: ${e.message}`);
    return { success: false, error: e.message };
  }
}

async function publishToLinkedIn(post, slug, body) {
  const token = process.env.LINKEDIN_TOKEN;
  if (!token) {
    console.log(`   ⏭️  LinkedIn: SKIPPED (no LINKEDIN_TOKEN)`);
    return { success: false, error: 'No token' };
  }

  if (dryRun) {
    console.log(`   📋 LinkedIn (DRY RUN): Would share "${post.title}"`);
    console.log(`      Preview: "${post.description?.substring(0, 120)}..."`);
    return { success: true, url: null };
  }

  try {
    // LinkedIn uses a two-step process: create UGC post, then add media/content
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: 'urn:li:person:LINKEDIN_PERSON_ID', // Replace with your LinkedIn person URN
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: `${post.title}\n\n${post.description}\n\n📖 Read the full article: https://svg153.github.io/blog/posts/${slug}/`,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`   ❌ LinkedIn: ${res.status} — ${err}`);
      return { success: false, error: err };
    }

    console.log(`   ✅ LinkedIn: Shared! "${post.title}"`);
    return { success: true, url: null };
  } catch (e) {
    console.log(`   ❌ LinkedIn: ${e.message}`);
    return { success: false, error: e.message };
  }
}

async function publishToSubstack(post, slug, body) {
  const apiKey = process.env.SUBSTACK_API_KEY;
  if (!apiKey) {
    console.log(`   ⏭️  Substack: SKIPPED (no SUBSTACK_API_KEY)`);
    return { success: false, error: 'No API key' };
  }

  if (dryRun) {
    console.log(`   📋 Substack (DRY RUN): Would add to newsletter "${post.title}"`);
    return { success: true, url: null };
  }

  try {
    const res = await fetch('https://api.substack.com/rest/newsletters/YOUR_NEWSLETTER_SLUG/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        title: post.title,
        body_html: stripMarkdown(body),
        status: 'draft', // 'published' or 'draft'
        post_type: 'free',
        note: `Syndicated from https://svg153.github.io/blog/posts/${slug}/`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`   ❌ Substack: ${res.status} — ${err}`);
      return { success: false, error: err };
    }

    const data = await res.json();
    console.log(`   ✅ Substack: Added to newsletter!`);
    return { success: true, url: data?.url || null };
  } catch (e) {
    console.log(`   ❌ Substack: ${e.message}`);
    return { success: false, error: e.message };
  }
}

// Main
async function main() {
  const posts = postFiles.map(f => {
    const content = readFileSync(join(BLOG_DIR, f), 'utf-8');
    const post = parseFrontmatter(content);
    return { ...post, slug: f.replace('.md', ''), body: getBodyMarkdown(content), raw: content };
  });

  if (specificPost) {
    const filtered = posts.filter(p => p.slug === specificPost);
    if (filtered.length === 0) {
      console.log(`   ❌ Post "${specificPost}" not found`);
      process.exit(1);
    }
    posts.length = 0;
    posts.push(filtered[0]);
  }

  if (posts.length === 0) {
    console.log('   No posts to syndicate.');
    return;
  }

  // Load syndication state
  let synthState = {};
  try {
    synthState = JSON.parse(readFileSync(join(SYNTH_DIR, 'state.json'), 'utf-8'));
  } catch {
    // no state yet
  }

  let totalPublished = 0;

  for (const post of posts) {
    console.log(`\n📝 ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Date: ${post.date}`);

    const alreadySyndicated = synthState[post.slug];
    if (alreadySyndicated) {
      console.log(`   ⏭️  Already syndicated to: ${alreadySyndicated.join(', ')}`);
      // Still allow re-syndication if platforms changed
    }

    const results = {};
    for (const platform of platforms) {
      let result;
      switch (platform) {
        case 'devto':
          result = await publishToDevto(post, post.slug, post.body);
          break;
        case 'linkedin':
          result = await publishToLinkedIn(post, post.slug, post.body);
          break;
        case 'substack':
          result = await publishToSubstack(post, post.slug, post.body);
          break;
      }
      results[platform] = result;
      if (result.success) totalPublished++;
    }

    // Update state
    synthState[post.slug] = platforms.filter(p => results[p]?.success);
  }

  // Save state
  if (!dryRun) {
    writeFileSync(join(SYNTH_DIR, 'state.json'), JSON.stringify(synthState, null, 2));
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`   Done! ${totalPublished} platform(s) updated.`);
  if (dryRun) {
    console.log(`   (No changes were made — use without --dry-run to publish)`);
  }
  console.log();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
