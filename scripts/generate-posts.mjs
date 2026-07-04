import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

const blogDir = 'src/content/blog';
const publicDir = 'public/posts';

mkdirSync(publicDir, { recursive: true });

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

const posts = readdirSync(blogDir).filter(f => f.endsWith('.md'));

posts.forEach(postFile => {
  const postPath = join(blogDir, postFile);
  const content = readFileSync(postPath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return;

  const fm = fmMatch[1];
  const title = fm.match(/title:\s*"([^"]+)"/)?.[1] || 'Untitled';
  const description = fm.match(/description:\s*"([^"]+)"/)?.[1] || '';
  const date = fm.match(/date:\s*"([^"]+)"/)?.[1] || '';
  const tagsMatch = fm.match(/tags:\s*\[([^\]]+)\]/);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];
  const readingTime = fm.match(/readingTime:\s*"([^"]+)"/)?.[1] || '';
  const featured = fm.match(/featured:\s*(true|false)/)?.[1] === 'true';

  const slug = postFile.replace('.md', '');
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const htmlBody = marked.parse(bodyContent) || '';

  const primaryTag = (tags[0] || 'general').toLowerCase();
  const tc = tagColors[primaryTag] || tagColors['general'];

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const tagsHtml = tags.length > 0
    ? `<div class="article-tags">
${tags.map(t => `      <a href="/posts/${t.toLowerCase()}">${t}</a>`).join('\n')}
    </div>`
    : '';

  // Read the layout HTML from a template
  const layoutContent = readFileSync('src/layouts/post.html', 'utf-8');
  const html = layoutContent
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESCRIPTION}}', description)
    .replaceAll('{{BODY}}', htmlBody)
    .replaceAll('{{TAG_LABEL}}', tc.label)
    .replaceAll('{{TAG_CLS}}', tc.cls)
    .replaceAll('{{DATE}}', formattedDate)
    .replaceAll('{{READING_TIME}}', readingTime)
    .replaceAll('{{TAGS}}', tagsHtml);

  const outPath = join(publicDir, slug + '.html');
  writeFileSync(outPath, html);
  console.log('  → posts/' + slug + '.html');
});

// Copy static homepage from public/index.html to dist/index.html
// This overrides the Astro-generated home to avoid CDN cache issues
const staticHomeSrc = 'public/index.html';
const staticHomeDst = 'dist/index.html';
if (existsSync(staticHomeSrc)) {
  copyFileSync(staticHomeSrc, staticHomeDst);
  console.log('  → index.html (static homepage)');
}

console.log('Generated ' + posts.length + ' post pages from ' + blogDir + '/');
