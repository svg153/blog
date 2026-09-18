import assert from 'node:assert/strict';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';

const DIST = 'dist';
const CONTENT_DIR = join('src', 'content', 'blog');
const BASE = '/blog/';
const ORIGIN = 'https://svg153.github.io';

const walk = (root) => {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
};

const decodeHtmlAttribute = (value) =>
  String(value ?? '')
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'");

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'iu'));
  return match ? decodeHtmlAttribute(match[1]) : undefined;
};

const tags = (html, tagName) =>
  [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'giu'))].map((match) => match[0]);

const publicPathForHtml = (path) => {
  const rel = relative(DIST, path).split(sep).join('/');
  if (rel === 'index.html') return BASE;
  if (rel.endsWith('/index.html')) {
    return `${BASE}${rel.slice(0, -'index.html'.length)}`;
  }
  return `${BASE}${rel}`;
};

const distTarget = (pathname) => {
  const normalizedPath = pathname === '/blog' ? BASE : pathname;
  if (!normalizedPath.startsWith(BASE)) return undefined;

  let rel;
  try {
    rel = decodeURIComponent(normalizedPath.slice(BASE.length));
  } catch {
    return undefined;
  }

  const distRoot = resolve(DIST);
  const direct = resolve(DIST, rel);
  if (direct !== distRoot && !direct.startsWith(`${distRoot}${sep}`)) return undefined;

  if (!rel) return join(DIST, 'index.html');
  if (normalizedPath.endsWith('/')) return join(DIST, rel, 'index.html');
  if (existsSync(direct)) return direct;

  const routeIndex = join(direct, 'index.html');
  return existsSync(routeIndex) ? routeIndex : direct;
};

const resolveInternalReference = (raw, currentPublicPath) => {
  const value = decodeHtmlAttribute(raw).trim();
  if (!value || /^(?:mailto|tel|data|javascript):/iu.test(value) || value.startsWith('//')) {
    return undefined;
  }

  let url;
  try {
    url = new URL(value, `${ORIGIN}${currentPublicPath}`);
  } catch {
    return { error: `invalid URL: ${value}` };
  }

  if (url.origin !== ORIGIN) return undefined;
  if (!(url.pathname === '/blog' || url.pathname.startsWith(BASE))) return undefined;

  const target = distTarget(url.pathname);
  return {
    url,
    target,
    fragment: url.hash ? decodeURIComponent(url.hash.slice(1)) : '',
  };
};

const htmlIds = new Map();
const readIds = (path) => {
  if (!path?.endsWith('.html') || !existsSync(path)) return new Set();
  if (htmlIds.has(path)) return htmlIds.get(path);

  const html = readFileSync(path, 'utf8');
  const ids = new Set(
    tags(html, '[A-Za-z][A-Za-z0-9:-]*')
      .map((tag) => getAttr(tag, 'id'))
      .filter(Boolean),
  );
  htmlIds.set(path, ids);
  return ids;
};

const sourceFiles = walk(CONTENT_DIR).filter((path) => path.endsWith('.md'));
assert.ok(sourceFiles.length > 0, 'Expected Markdown content files');

let mermaidSourceFiles = 0;

for (const path of sourceFiles) {
  const source = readFileSync(path, 'utf8').replace(/^\uFEFF/u, '');
  const lines = source.split(/\r?\n/u);

  assert.equal(lines[0], '---', `${path}: content must start with frontmatter delimiter`);
  const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  assert.ok(frontmatterEnd > 1, `${path}: missing closing frontmatter delimiter`);

  const frontmatter = lines.slice(1, frontmatterEnd).join('\n');
  assert.equal((frontmatter.match(/^title\s*:/gmu) ?? []).length, 1, `${path}: expected exactly one title field`);
  assert.equal((frontmatter.match(/^date\s*:/gmu) ?? []).length, 1, `${path}: expected exactly one date field`);

  const bodyLines = lines.slice(frontmatterEnd + 1);
  assert.ok(bodyLines.join('\n').trim().length > 0, `${path}: article body must not be empty`);

  let fence;
  let mermaidFences = 0;

  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u);

    if (match) {
      const marker = match[1];
      const char = marker[0];

      if (!fence) {
        fence = { char, length: marker.length, line: index + frontmatterEnd + 2 };
        if (/^\s*mermaid(?:\s|$)/iu.test(match[2])) mermaidFences += 1;
      } else if (char === fence.char && marker.length >= fence.length && !match[2].trim()) {
        fence = undefined;
      }
      continue;
    }

    if (!fence) {
      assert.ok(
        !/^ {0,3}#\s+\S/u.test(line),
        `${path}:${index + frontmatterEnd + 2}: do not add Markdown H1; the article layout owns the page H1`,
      );
    }
  }

  assert.ok(!fence, `${path}: unclosed fenced code block opened at line ${fence?.line}`);

  if (mermaidFences > 0) {
    mermaidSourceFiles += 1;
    const slug = path.split(/[\\/]/u).at(-1).replace(/\.md$/u, '');
    const htmlPath = join(DIST, 'posts', slug, 'index.html');
    assert.ok(existsSync(htmlPath), `${path}: Mermaid article did not generate a public page`);
    const html = readFileSync(htmlPath, 'utf8');
    assert.match(
      html,
      /class=["'][^"']*\bmermaid\b[^"']*["']/iu,
      `${path}: Mermaid fence was not transformed by the Astro build`,
    );
  }
}

const htmlFiles = walk(DIST).filter((path) => path.endsWith('.html'));
assert.ok(htmlFiles.length > 0, 'Expected generated HTML files');

let internalLinks = 0;
let localAssets = 0;

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, 'utf8');
  const currentPublicPath = publicPathForHtml(htmlPath);

  for (const tag of tags(html, 'a')) {
    const href = getAttr(tag, 'href');
    if (!href) continue;

    const resolved = resolveInternalReference(href, currentPublicPath);
    if (!resolved) continue;
    if (resolved.error) assert.fail(`${htmlPath}: ${resolved.error}`);

    internalLinks += 1;
    assert.ok(
      resolved.target && existsSync(resolved.target),
      `${htmlPath}: broken internal link ${href} -> ${resolved.target ?? 'unresolved'}`,
    );

    if (resolved.fragment && resolved.target.endsWith('.html')) {
      assert.ok(
        readIds(resolved.target).has(resolved.fragment),
        `${htmlPath}: missing anchor #${resolved.fragment} for internal link ${href}`,
      );
    }
  }

  const assetRefs = [];

  for (const tag of tags(html, 'img')) {
    if (getAttr(tag, 'src')) assetRefs.push(getAttr(tag, 'src'));
  }
  for (const tag of tags(html, 'script')) {
    if (getAttr(tag, 'src')) assetRefs.push(getAttr(tag, 'src'));
  }
  for (const tag of tags(html, 'source')) {
    if (getAttr(tag, 'src')) assetRefs.push(getAttr(tag, 'src'));
    const srcset = getAttr(tag, 'srcset');
    if (srcset) {
      for (const item of srcset.split(',')) {
        const candidate = item.trim().split(/\s+/u)[0];
        if (candidate) assetRefs.push(candidate);
      }
    }
  }
  for (const tag of tags(html, 'link')) {
    const rel = (getAttr(tag, 'rel') ?? '').toLowerCase();
    if (/\b(?:stylesheet|icon|preload|modulepreload)\b/u.test(rel) && getAttr(tag, 'href')) {
      assetRefs.push(getAttr(tag, 'href'));
    }
  }

  for (const ref of assetRefs) {
    const resolved = resolveInternalReference(ref, currentPublicPath);
    if (!resolved) continue;
    if (resolved.error) assert.fail(`${htmlPath}: ${resolved.error}`);

    localAssets += 1;
    assert.ok(
      resolved.target && existsSync(resolved.target) && statSync(resolved.target).isFile(),
      `${htmlPath}: missing local asset ${ref} -> ${resolved.target ?? 'unresolved'}`,
    );
  }
}

const requiredOutputs = [
  join(DIST, 'index.html'),
  join(DIST, 'about', 'index.html'),
  join(DIST, 'archive', 'index.html'),
  join(DIST, 'tags', 'index.html'),
  join(DIST, 'series', 'index.html'),
  join(DIST, 'rss.xml'),
  join(DIST, 'sitemap-index.xml'),
  join(DIST, 'sitemap-0.xml'),
  join(DIST, 'og', 'default.png'),
];

for (const path of requiredOutputs) {
  assert.ok(existsSync(path), `Missing completed-phase output: ${path}`);
}

assert.ok(!existsSync(join(DIST, 'preview')), 'Development preview routes must not exist in production output');

const pagefindDir = join(DIST, 'pagefind');
if (existsSync(pagefindDir)) {
  for (const file of [
    'pagefind.js',
    'pagefind-component-ui.js',
    'pagefind-component-ui.css',
  ]) {
    assert.ok(
      existsSync(join(pagefindDir, file)),
      `Pagefind directory exists but ${file} is missing`,
    );
  }
  assert.ok(
    existsSync(join(DIST, 'search', 'index.html')),
    'Pagefind output exists but the search page is missing',
  );
}

console.log(
  `Content quality passed for ${sourceFiles.length} Markdown file(s), ${htmlFiles.length} HTML page(s), ${internalLinks} internal link(s), ${localAssets} local asset reference(s), and ${mermaidSourceFiles} Mermaid article(s).`,
);
