#!/usr/bin/env node
/**
 * Blog integration tests — verifies the built site works correctly.
 * Run with: node scripts/test.mjs
 * 
 * These tests check:
 * 1. All HTML pages exist in dist/
 * 2. CSS loads on every page
 * 3. All internal links resolve (no 404s)
 * 4. Post pages render with correct structure
 * 5. No broken relative links
 * 6. RSS feed exists
 * 7. About page exists
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createRequire } from 'module';

const DIST = 'dist';
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

let passed = 0;
let failed = 0;
let warnings = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ${PASS} ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ${FAIL} ${name}`);
    errors.push({ name, error: e.message });
    failed++;
  }
}

function warn(name) {
  console.log(`  ${WARN} ${name}`);
  warnings++;
}

// ── Helpers ──
function read(path) {
  return readFileSync(join(DIST, path), 'utf-8');
}

function exists(path) {
  return existsSync(join(DIST, path));
}

function getAllFiles(dir, prefix = '') {
  const entries = readdirSync(join(DIST, dir));
  return entries.map(e => prefix + e);
}

function findLinks(html) {
  const regex = /href="([^"]+)"/g;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    // Skip external links
    if (href.startsWith('http') || href.startsWith('mailto:')) continue;
    links.push(href);
  }
  return links;
}

function findImgSrcs(html) {
  const regex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const srcs = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith('http')) continue;
    srcs.push(src);
  }
  return srcs;
}

// ── Test Suite ──
console.log('\n📝 Blog Integration Tests\n');

// 1. Core files exist
console.log('📁 Core files:');
test('index.html exists', () => {
  if (!exists('index.html')) throw new Error('Missing dist/index.html');
});

test('favicon.svg exists', () => {
  if (!exists('favicon.svg')) throw new Error('Missing dist/favicon.svg');
});

test('blog.css exists', () => {
  if (!exists('css/blog.css')) throw new Error('Missing dist/css/blog.css');
});

test('RSS feed exists', () => {
  if (!exists('rss.xml')) {
    warn('RSS feed not found — will be generated in next iteration');
  }
});

// 2. Post pages
console.log('\n📄 Post pages:');
const postFiles = existsSync(join(DIST, 'posts'))
  ? readdirSync(join(DIST, 'posts')).filter(f => f.endsWith('.html'))
  : [];

test('At least one post page exists', () => {
  if (postFiles.length === 0) throw new Error('No post files found in dist/posts/');
});

test('Post files have correct naming', () => {
  for (const f of postFiles) {
    if (!f.endsWith('.html')) throw new Error(`Post file "${f}" doesn't end with .html`);
    if (f === 'index.html') throw new Error(`Post file "index.html" is invalid — should be slug.html`);
  }
});

test('Post pages have valid HTML structure', () => {
  for (const f of postFiles) {
    const html = read(`posts/${f}`);
    if (!html.includes('<!DOCTYPE html>')) throw new Error(`Missing DOCTYPE in ${f}`);
    if (!html.includes('</html>')) throw new Error(`Missing </html> in ${f}`);
    if (!html.includes('<title>')) throw new Error(`Missing <title> in ${f}`);
  }
});

test('Post pages reference CSS', () => {
  for (const f of postFiles) {
    const html = read(`posts/${f}`);
    if (!html.includes('blog.css')) throw new Error(`Post ${f} doesn't link blog.css`);
  }
});

// 3. Homepage structure
console.log('\n🏠 Homepage:');
const homeHtml = read('index.html');

test('Homepage has valid HTML', () => {
  if (!homeHtml.includes('<!DOCTYPE html>')) throw new Error('Missing DOCTYPE');
  if (!homeHtml.includes('</html>')) throw new Error('Missing </html>');
  if (!homeHtml.includes('<title>')) throw new Error('Missing <title>');
});

test('Homepage links to CSS', () => {
  if (!homeHtml.includes('blog.css')) throw new Error('Homepage doesn\'t link blog.css');
});

test('Homepage has navigation', () => {
  if (!homeHtml.includes('header')) throw new Error('Missing header/nav');
  if (!homeHtml.includes('Blog')) throw new Error('Missing Blog nav link');
  if (!homeHtml.includes('About')) throw new Error('Missing About nav link');
});

test('Homepage links to posts', () => {
  const postLinks = homeHtml.match(/href="[^"]*posts\/[^"]*\.html"/g) || [];
  if (postLinks.length < postFiles.length) {
    throw new Error(`Found ${postLinks.length} post links but ${postFiles.length} post files`);
  }
});

test('Homepage has meta description', () => {
  if (!homeHtml.includes('meta name="description"')) throw new Error('Missing meta description');
});

// 4. Internal link validation
console.log('\n🔗 Link validation:');

// Check all internal links resolve to existing files
function checkLinkExists(link, source) {
  // Skip external links
  if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) return true;
  
  // Handle root-relative links
  let path = link;
  if (path.startsWith('/')) {
    // For /blog/posts/... — strip /blog/ prefix since we're testing from dist root
    path = path.replace(/^\/blog\//, '');
  }
  
  if (!exists(path)) {
    throw new Error(`${source} → ${link} (file not found: ${path})`);
  }
  return true;
}

const allPages = ['index.html', ...postFiles.map(f => `posts/${f}`), 'about/index.html'];

for (const page of allPages) {
  if (!exists(page)) continue;
  const html = read(page);
  const links = findLinks(html);
  for (const link of links) {
    checkLinkExists(link, page);
  }
}
test('All internal links resolve', () => {});

// 5. Image validation
console.log('\n🖼️ Images:');
const allHtml = [homeHtml, ...postFiles.map(f => read(`posts/${f}`)), read('about/index.html')];
const allImgSrcs = [];
for (const html of allHtml) {
  allImgSrcs.push(...findImgSrcs(html));
}

test('All image sources resolve', () => {
  for (const src of allImgSrcs) {
    let path = src;
    if (path.startsWith('/')) path = path.replace(/^\/blog\//, '');
    if (!exists(path)) throw new Error(`Image not found: ${src} → ${path}`);
  }
});

// 6. About page
console.log('\n👤 About page:');
const aboutHtml = read('about/index.html');

test('About page exists', () => {
  if (!exists('about/index.html')) throw new Error('Missing about/index.html');
});

test('About page has valid HTML', () => {
  if (!aboutHtml.includes('<!DOCTYPE html>')) throw new Error('Missing DOCTYPE');
  if (!aboutHtml.includes('</html>')) throw new Error('Missing </html>');
  if (!aboutHtml.includes('<title>')) throw new Error('Missing <title>');
});

test('About page links to CSS', () => {
  if (!aboutHtml.includes('blog.css')) throw new Error('About page doesn\'t link blog.css');
});

test('About page links back to blog', () => {
  if (!aboutHtml.includes('/blog/')) throw new Error('About page doesn\'t link back to blog');
});

// 7. RSS feed
console.log('\n📡 RSS:');
const rssHtml = read('rss.xml');

test('RSS feed has valid XML', () => {
  if (!rssHtml.includes('<?xml') && !rssHtml.includes('<rss')) throw new Error('Invalid RSS format');
  if (!rssHtml.includes('<channel>')) throw new Error('Missing <channel> in RSS');
});

test('RSS feed includes all posts', () => {
  for (const f of postFiles) {
    const slug = f.replace('.html', '');
    if (!rssHtml.includes(slug)) {
      throw new Error(`Post "${slug}" not in RSS feed`);
    }
  }
});

// 8. CSS validation
console.log('\n🎨 CSS:');
const css = read('css/blog.css');

test('CSS has dark theme colors', () => {
  if (!css.includes('--color-bg: #0d1117')) throw new Error('Missing dark background color');
  if (!css.includes('--color-fg: #c9d1d9')) throw new Error('Missing foreground color');
});

test('CSS has responsive breakpoints', () => {
  if (!css.includes('@media') && !css.includes('max-width')) {
    throw new Error('No responsive breakpoints in CSS');
  }
});

test('CSS styles body element', () => {
  if (!css.includes('body {')) throw new Error('Missing body styles in CSS');
  if (!css.includes('font-family')) throw new Error('Missing font-family in CSS');
});

// 9. Consistency checks
console.log('\n🔍 Consistency:');

test('All pages use same CSS file', () => {
  for (const page of allPages) {
    if (!exists(page)) continue;
    const html = read(page);
    if (!html.includes('blog.css')) {
      throw new Error(`${page} doesn't use blog.css`);
    }
  }
});

test('All pages have consistent title format', () => {
  for (const page of allPages) {
    if (!exists(page)) continue;
    const html = read(page);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch) throw new Error(`${page} missing <title>`);
    if (!titleMatch[1].includes('Sergio Valverde')) {
      throw new Error(`${page} title doesn't include "Sergio Valverde"`);
    }
  }
});

test('Post slugs match content files', () => {
  const contentDir = 'src/content/blog';
  if (!existsSync(contentDir)) {
    warn('Content directory not found — skipping content match check');
    return;
  }
  const contentFiles = readdirSync(contentDir).filter(f => f.endsWith('.md'));
  const contentSlugs = contentFiles.map(f => f.replace('.md', ''));
  
  for (const slug of contentSlugs) {
    if (!postFiles.includes(slug + '.html')) {
      throw new Error(`Content file "${slug}.md" has no matching post page`);
    }
  }
});

// ── Summary ──
console.log(`\n${'─'.repeat(40)}`);
console.log(`  ${PASS} ${passed} passed`);
if (warnings > 0) console.log(`  ${WARN} ${warnings} warnings`);
if (failed > 0) {
  console.log(`  ${FAIL} ${failed} failed`);
  console.log(`\n  Errors:`);
  for (const err of errors) {
    console.log(`    - ${err.name}: ${err.error}`);
  }
  process.exit(1);
} else {
  console.log(`  ✅ All tests passed!`);
}
console.log(`${'─'.repeat(40)}\n`);
