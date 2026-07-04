import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

const OUT = 'dist';
const cssPath = join(OUT, 'css');
const postsPath = join(OUT, 'posts');
const aboutPath = join(OUT, 'about');
mkdirSync(cssPath, { recursive: true });
mkdirSync(postsPath, { recursive: true });
mkdirSync(aboutPath, { recursive: true });

// ── CSS (GitHub Blog dark theme — matches svg153.github.io) ──
const css = `
:root {
  --color-fg: #c9d1d9;
  --color-fg-muted: #8b949e;
  --color-fg-base: #f0f6fc;
  --color-border: #30363d;
  --color-bg: #0d1117;
  --color-bg-subtle: #161b22;
  --color-accent: #58a6ff;
  --color-purple: #bc8cff;
  --color-pink: #f778ba;
  --color-orange: #d29922;
  --color-green: #3fb950;
  --color-blue: #58a6ff;
  --color-red: #f85149;
  --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  --font-stack-code: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  --max-width: 1100px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font-stack); background: var(--color-bg); color: var(--color-fg); line-height: 1.6; -webkit-font-smoothing: antialiased; }
a { color: var(--color-accent); text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: var(--font-stack-code); background: var(--color-bg-subtle); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }

/* Header */
.header { border-bottom: 1px solid var(--color-border); position: sticky; top: 0; background: var(--color-bg); z-index: 10; }
.header-inner { max-width: var(--max-width); margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
.header-logo { color: var(--color-fg); font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.header-logo svg { fill: var(--color-fg); }
.header-nav { display: flex; gap: 20px; }
.header-nav a { color: var(--color-fg-muted); font-size: 13px; transition: color 0.15s; }
.header-nav a:hover { color: var(--color-fg); text-decoration: none; }

/* Hero */
.hero { max-width: var(--max-width); margin: 0 auto; padding: 64px 24px 40px; }
.hero h1 { font-size: 40px; font-weight: 700; color: var(--color-fg-base); margin-bottom: 16px; line-height: 1.2; }
.hero p { font-size: 18px; color: var(--color-fg-muted); max-width: 680px; }

/* Featured */
.featured { max-width: var(--max-width); margin: 0 auto; padding: 0 24px 48px; }
.featured-card { background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; display: grid; grid-template-columns: 280px 1fr; }
.featured-image { background: linear-gradient(135deg, var(--color-purple), var(--color-pink)); display: flex; align-items: center; justify-content: center; font-size: 64px; min-height: 200px; }
.featured-content { padding: 24px; }
.featured-content h2 { font-size: 20px; font-weight: 600; color: var(--color-fg-base); margin: 8px 0; }
.featured-content p { color: var(--color-fg-muted); font-size: 14px; margin-top: 8px; line-height: 1.5; }

/* Tags */
.featured-tag { display: inline-block; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 20px; border: 1px solid; }
.tag-ai { color: var(--color-pink); border-color: rgba(247,120,186,0.3); }
.tag-devops { color: var(--color-blue); border-color: rgba(88,166,255,0.3); }
.tag-general { color: var(--color-fg-muted); border-color: rgba(139,148,158,0.3); }
.tag-platform { color: var(--color-purple); border-color: rgba(188,140,255,0.3); }
.tag-security { color: var(--color-red); border-color: rgba(248,81,73,0.3); }
.tag-tool { color: var(--color-orange); border-color: rgba(210,153,34,0.3); }
.tag-career { color: var(--color-green); border-color: rgba(63,185,80,0.3); }

/* Meta */
.meta { display: flex; gap: 8px; font-size: 13px; color: var(--color-fg-muted); margin-top: 12px; align-items: center; }
.meta-dot { width: 3px; height: 3px; background: var(--color-fg-muted); border-radius: 50%; display: inline-block; }

/* Posts */
.posts-section { max-width: var(--max-width); margin: 0 auto; padding: 0 24px 48px; }
.posts-header h2 { font-size: 24px; font-weight: 600; color: var(--color-fg-base); margin-bottom: 20px; }
.posts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.post-card { background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: 8px; padding: 20px; transition: border-color 0.15s; }
.post-card:hover { border-color: var(--color-fg-muted); }
.post-card h3 { font-size: 16px; font-weight: 600; color: var(--color-fg-base); margin: 8px 0; }
.post-card p { color: var(--color-fg-muted); font-size: 14px; line-height: 1.5; margin-top: 8px; }

/* Newsletter */
.newsletter { max-width: var(--max-width); margin: 0 auto; padding: 0 24px 48px; }
.newsletter-box { background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: 8px; padding: 32px; text-align: center; }
.newsletter-box h2 { font-size: 20px; font-weight: 600; color: var(--color-fg-base); margin-bottom: 8px; }
.newsletter-box p { color: var(--color-fg-muted); font-size: 14px; margin-bottom: 20px; }
.newsletter-form { display: flex; gap: 12px; max-width: 400px; margin: 0 auto; }
.newsletter-form input { flex: 1; padding: 10px 14px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-fg); font-size: 14px; }
.newsletter-form input::placeholder { color: var(--color-fg-muted); }
.newsletter-form input:focus { outline: none; border-color: var(--color-accent); }
.newsletter-form button { padding: 10px 20px; background: var(--color-accent); color: #000; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
.newsletter-form button:hover { opacity: 0.9; }

/* Footer */
.footer { border-top: 1px solid var(--color-border); padding: 40px 24px; text-align: center; }
.footer-links { display: flex; justify-content: center; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; }
.footer-links a { color: var(--color-fg-muted); font-size: 13px; }
.footer-copy { color: var(--color-fg-muted); font-size: 12px; }

/* Post page */
.post-header { border-bottom: 1px solid var(--color-border); padding: 16px 24px; }
.back-link { color: var(--color-fg-muted); font-size: 14px; }
.back-link:hover { color: var(--color-accent); text-decoration: none; }
.post-main { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
.post-header-content h1 { font-size: 32px; font-weight: 700; color: var(--color-fg-base); margin: 16px 0 8px; }
.article-body { font-size: 16px; line-height: 1.7; color: var(--color-fg); }
.article-body h1, .article-body h2, .article-body h3 { color: var(--color-fg-base); margin: 24px 0 12px; }
.article-body h1 { font-size: 28px; }
.article-body h2 { font-size: 22px; }
.article-body h3 { font-size: 18px; }
.article-body p { margin-bottom: 16px; }
.article-body pre { background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: 6px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
.article-body code { background: transparent; padding: 0; }
.article-body pre code { background: transparent; padding: 0; }
.article-body ul, .article-body ol { margin: 0 0 16px 24px; }
.article-body li { margin-bottom: 4px; }
.article-body blockquote { border-left: 3px solid var(--color-accent); padding-left: 16px; margin: 16px 0; color: var(--color-fg-muted); }
.article-body img { max-width: 100%; border-radius: 6px; }
.article-body a { color: var(--color-accent); }
.article-tags { display: flex; gap: 8px; margin-top: 8px; }
.article-tags a { font-size: 12px; color: var(--color-fg-muted); }
.post-footer { border-top: 1px solid var(--color-border); padding: 24px; text-align: center; }
.post-footer a { color: var(--color-fg-muted); font-size: 14px; }

/* Responsive */
@media (max-width: 768px) {
  .hero h1 { font-size: 32px; }
  .hero p { font-size: 16px; }
  .featured-card { grid-template-columns: 1fr; }
  .featured-image { min-height: 160px; }
  .posts-grid { grid-template-columns: 1fr; }
  .header-inner { padding: 12px 16px; }
  .hero, .featured, .posts-section, .newsletter { padding-left: 16px; padding-right: 16px; }
  .header-nav { gap: 12px; }
  .newsletter-form { flex-direction: column; }
}
`.trim();

writeFileSync(join(OUT, 'css', 'blog.css'), css);
console.log('  → css/blog.css');

// ── Tag helpers ──
const tagColors = {
  'ai': { cls: 'tag-ai', label: 'AI & Agents' },
  'agents': { cls: 'tag-ai', label: 'AI & Agents' },
  'devops': { cls: 'tag-devops', label: 'DevOps' },
  'platform': { cls: 'tag-platform', label: 'Platform Engineering' },
  'security': { cls: 'tag-security', label: 'Security' },
  'general': { cls: 'tag-general', label: 'General' },
  'tool': { cls: 'tag-tool', label: 'Tools' },
  'career': { cls: 'tag-career', label: 'Career' },
};

function getTag(tag) {
  const key = (tag || 'general').toLowerCase();
  return tagColors[key] || tagColors['general'];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Load posts ──
const blogDir = 'src/content/blog';
const posts = readdirSync(blogDir).filter(f => f.endsWith('.md')).map(f => {
  const content = readFileSync(join(blogDir, f), 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  return {
    slug: f.replace('.md', ''),
    title: fm.match(/title:\s*"([^"]+)"/)?.[1] || 'Untitled',
    description: fm.match(/description:\s*"([^"]+)"/)?.[1] || '',
    date: fm.match(/date:\s*"([^"]+)"/)?.[1] || '',
    tags: (fm.match(/tags:\s*\[([^\]]+)\]/)?.[1] || '').split(',').map(t => t.trim().replace(/"/g, '')),
    readingTime: fm.match(/readingTime:\s*"([^"]+)"/)?.[1] || '',
    featured: fm.match(/featured:\s*(true|false)/)?.[1] === 'true',
    body: content.replace(/^---\n[\s\S]*?\n---\n?/, ''),
  };
}).filter(Boolean);

const sorted = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
const featured = sorted.find(p => p.featured);
const otherPosts = sorted.filter(p => !p.featured);

// ── Build homepage ──
function buildHome() {
  const featuredHtml = featured ? `
  <div class="featured">
    <div class="featured-card">
      <div class="featured-image">🤖</div>
      <div class="featured-content">
        <span class="featured-tag ${getTag(featured.tags[0]).cls}">${getTag(featured.tags[0]).label}</span>
        <h2><a href="/posts/${featured.slug}.html">${featured.title}</a></h2>
        <p>${featured.description}</p>
        <div class="meta">
          <span>Sergio Valverde</span><span class="meta-dot"></span>
          <span>${formatDate(featured.date)}</span><span class="meta-dot"></span>
          <span>${featured.readingTime} min read</span>
        </div>
      </div>
    </div>
  </div>` : '';

  const postsHtml = otherPosts.map(p => `
  <div class="post-card">
    <span class="featured-tag ${getTag(p.tags[0]).cls}">${getTag(p.tags[0]).label}</span>
    <h3><a href="/posts/${p.slug}.html">${p.title}</a></h3>
    <p>${p.description}</p>
    <div class="meta">
      <span>Sergio Valverde</span><span class="meta-dot"></span>
      <span>${formatDate(p.date)}</span><span class="meta-dot"></span>
      <span>${p.readingTime} min read</span>
    </div>
  </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sergio Valverde — Blog sobre Platform Engineering, DevOps, y Agentic Development. Artículos sobre GitHub Actions, Docker, Kubernetes, CI/CD y desarrollo de software.">
  <title>Sergio Valverde — Blog</title>
  <link rel="icon" type="image/svg+xml" href="/blog/favicon.svg">
  <link rel="stylesheet" href="/blog/css/blog.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/blog/" class="header-logo">
        <svg height="32" viewBox="0 0 16 16" width="32" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        Sergio Valverde
      </a>
      <nav class="header-nav">
        <a href="/blog/">Blog</a>
        <a href="/blog/about/">About</a>
        <a href="https://github.com/svg153" target="_blank" rel="noopener">GitHub</a>
        <a href="https://linkedin.com/in/svg153" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://twitter.com/svg153" target="_blank" rel="noopener">X</a>
        <a href="https://www.tiktok.com/@svg153dev" target="_blank" rel="noopener">TikTok</a>
      </nav>
    </div>
  </header>
  <section class="hero">
    <h1>Thoughts on Platform Engineering, DevOps & Agentic Development</h1>
    <p>Hi, I'm Sergio. Platform Engineer, DevOps enthusiast, and GitHub Community Spain Organizer. I write about the tools, patterns, and ideas that shape how we build software.</p>
  </section>
  ${featuredHtml}
  <section class="posts-section">
    <div class="posts-header"><h2>Latest</h2></div>
    <div class="posts-grid">${postsHtml}</div>
  </section>
  <section class="newsletter">
    <div class="newsletter-box">
      <h2>We do newsletters, too</h2>
      <p>Get tips, technical guides, and best practices. Delivered to your inbox.</p>
      <div class="newsletter-form">
        <input type="email" placeholder="Your email address">
        <button type="button" onclick="window.open('https://svg153.substack.com/subscribe', '_blank')">Subscribe →</button>
      </div>
    </div>
  </section>
  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/svg153" target="_blank" rel="noopener">GitHub</a>
      <a href="https://linkedin.com/in/svg153" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://twitter.com/svg153" target="_blank" rel="noopener">X / Twitter</a>
      <a href="https://www.tiktok.com/@svg153dev" target="_blank" rel="noopener">TikTok</a>
      <a href="https://www.youtube.com/@svg153" target="_blank" rel="noopener">YouTube</a>
      <a href="/blog/rss.xml">RSS</a>
    </div>
    <p class="footer-copy">© 2025 Sergio Valverde. Static site. Hosted on GitHub Pages.</p>
  </footer>
</body>
</html>`;

  writeFileSync(join(OUT, 'index.html'), html);
  console.log('  → index.html');
}

// ── Build post pages ──
function buildPost(post) {
  const htmlBody = marked.parse(post.body) || '';
  const tag = getTag(post.tags[0]);
  const tagsHtml = post.tags.length > 0
    ? `<div class="article-tags">${post.tags.map(t => `<a href="/posts/${t.toLowerCase()}.html">${t}</a>`).join('')}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${post.description}">
  <title>${post.title} — Sergio Valverde</title>
  <link rel="stylesheet" href="/blog/css/blog.css">
</head>
<body>
  <header class="post-header">
    <a href="/blog/" class="back-link">← Back to all posts</a>
  </header>
  <main class="post-main">
    <article>
      <header class="post-header-content">
        <span class="featured-tag ${tag.cls}">${tag.label}</span>
        <h1>${post.title}</h1>
        <div class="meta">
          <span>Sergio Valverde</span><span class="meta-dot"></span>
          <span>${formatDate(post.date)}</span>
          ${post.readingTime ? `<span class="meta-dot"></span><span>${post.readingTime} min read</span>` : ''}
        </div>
        ${tagsHtml}
      </header>
      <div class="article-body">${htmlBody}</div>
    </article>
  </main>
  <footer class="post-footer">
    <a href="/blog/">← Back to all posts</a>
  </footer>
</body>
</html>`;

  writeFileSync(join(OUT, 'posts', post.slug + '.html'), html);
  console.log('  → posts/' + post.slug + '.html');
}

// ── Build about page ──
function buildAbout() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sergio Valverde — Platform Engineer, DevOps enthusiast, and GitHub Community Spain Organizer based in Barcelona.">
  <title>About — Sergio Valverde</title>
  <link rel="stylesheet" href="/blog/css/blog.css">
</head>
<body>
  <header class="post-header">
    <a href="/blog/" class="back-link">← Back to blog</a>
  </header>
  <main class="post-main">
    <article>
      <h1>About</h1>
      <p>Hi, I'm <strong>Sergio Valverde</strong>. I'm a Platform Engineer based in Barcelona, passionate about DevOps, GitHub Actions, and building developer tooling.</p>
      <p>I organize <a href="https://github.com/GitHub-Community-Spain">GitHub Community Spain</a> and write about the tools, patterns, and ideas that shape how we build software.</p>
      <h2>Connect</h2>
      <ul>
        <li><a href="https://github.com/svg153">GitHub</a></li>
        <li><a href="https://linkedin.com/in/svg153">LinkedIn</a></li>
        <li><a href="https://twitter.com/svg153">X / Twitter</a></li>
        <li><a href="https://www.tiktok.com/@svg153dev">TikTok</a></li>
        <li><a href="https://www.youtube.com/@svg153">YouTube</a></li>
      </ul>
    </article>
  </main>
  <footer class="post-footer">
    <a href="/blog/">← Back to blog</a>
  </footer>
</body>
</html>`;

  mkdirSync(join(OUT, 'about'), { recursive: true });
  writeFileSync(join(OUT, 'about', 'index.html'), html);
  console.log('  → about/index.html');
}

// ── Run ──
console.log('Building static blog...\n');
mkdirSync(join(OUT, 'posts'), { recursive: true });
buildHome();
sorted.forEach(buildPost);
buildAbout();
console.log('\nDone!');
