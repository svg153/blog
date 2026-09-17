import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  layoutTitle,
  renderSocialCard,
} from '../src/lib/social-card.mjs';

const ORIGIN = 'https://svg153.github.io';
const BASE = '/blog/';
const OG_DIR = join('dist', 'og');

const pngDimensions = (path) => {
  const png = readFileSync(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(png.subarray(0, 8), signature, `${path}: invalid PNG signature`);
  assert.equal(png.subarray(12, 16).toString('ascii'), 'IHDR', `${path}: missing PNG IHDR`);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    bytes: png.length,
  };
};

const getTags = (html, tagName) => [
  ...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'giu')),
].map((match) => match[0]);

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'iu'));
  return match?.[1];
};

const metaValue = (html, attrName, attrValue) =>
  getTags(html, 'meta')
    .filter((tag) => getAttr(tag, attrName) === attrValue)
    .map((tag) => getAttr(tag, 'content'))
    .filter(Boolean)[0];

const jsonLd = (html) => {
  const match = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/iu);
  return match ? JSON.parse(match[1]) : undefined;
};

assert.ok(existsSync(OG_DIR), 'Missing generated dist/og directory');

const postFiles = readdirSync('src/content/blog').filter((file) => extname(file) === '.md');
const expectedFiles = new Set(['default.png', ...postFiles.map((file) => `${basename(file, '.md')}.png`)]);
const generatedFiles = readdirSync(OG_DIR).filter((file) => file.endsWith('.png'));

for (const file of expectedFiles) {
  const path = join(OG_DIR, file);
  assert.ok(existsSync(path), `Missing generated social card: ${path}`);
  const { width, height, bytes } = pngDimensions(path);
  assert.equal(width, CARD_WIDTH, `${file}: expected ${CARD_WIDTH}px width`);
  assert.equal(height, CARD_HEIGHT, `${file}: expected ${CARD_HEIGHT}px height`);
  assert.ok(bytes > 5000, `${file}: PNG looks unexpectedly small (${bytes} bytes)`);
}

assert.deepEqual(
  new Set(generatedFiles),
  expectedFiles,
  'Generated social-card set must match the canonical Markdown article set plus default.png',
);

for (const file of postFiles) {
  const slug = basename(file, '.md');
  const htmlPath = join('dist', 'posts', slug, 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const expectedImage = `${ORIGIN}${BASE}og/${slug}.png`;

  assert.equal(metaValue(html, 'property', 'og:image'), expectedImage, `${slug}: wrong og:image`);
  assert.equal(metaValue(html, 'name', 'twitter:image'), expectedImage, `${slug}: wrong twitter:image`);
  assert.equal(metaValue(html, 'name', 'twitter:card'), 'summary_large_image', `${slug}: wrong twitter card type`);
  assert.equal(jsonLd(html)?.image, expectedImage, `${slug}: JSON-LD image must match social card`);
}

for (const htmlPath of [join('dist', 'index.html'), join('dist', 'about', 'index.html')]) {
  const html = readFileSync(htmlPath, 'utf8');
  const expectedImage = `${ORIGIN}${BASE}og/default.png`;
  assert.equal(metaValue(html, 'property', 'og:image'), expectedImage, `${htmlPath}: wrong fallback og:image`);
  assert.equal(metaValue(html, 'name', 'twitter:image'), expectedImage, `${htmlPath}: wrong fallback twitter:image`);
  assert.equal(metaValue(html, 'name', 'twitter:card'), 'summary_large_image', `${htmlPath}: wrong fallback twitter card type`);
}

const stressInput = {
  title: '¿Skills & MCP <Agentes>? "Diseño" técnico para España — ñ, á, ü y una arquitectura deliberadamente muy larga que debe envolver el texto sin romper la tarjeta ni escapar mal los caracteres especiales',
  tags: ['IA & agentes', 'C++', 'DevSecOps', 'GitHub'],
  date: '2026-09-18',
  variant: 'article',
};

const stressLayout = layoutTitle(stressInput.title);
assert.ok(stressLayout.lines.length >= 2 && stressLayout.lines.length <= 4, 'Stress title must wrap to 2-4 lines');
assert.ok(stressLayout.truncated, 'Stress title should exercise deterministic truncation');

const first = renderSocialCard(stressInput);
const second = renderSocialCard(stressInput);
assert.deepEqual(first, second, 'Rendering the same social-card input must be byte-deterministic');

const stressPath = join(OG_DIR, 'default.png');
const stressDimensions = pngDimensions(stressPath);
assert.equal(stressDimensions.width, CARD_WIDTH);
assert.equal(stressDimensions.height, CARD_HEIGHT);

console.log(`Social card validation passed for ${postFiles.length} article card(s) plus fallback; deterministic stress render passed.`);
