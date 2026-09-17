import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const ORIGIN = 'https://svg153.github.io';
const BASE = '/blog/';
const FALLBACK_IMAGE = `${ORIGIN}${BASE}favicon.svg`;

const getTags = (html, tagName) => [
  ...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'giu')),
].map((match) => match[0]);

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'iu'));
  return match?.[1];
};

const metaValues = (html, attrName, attrValue) =>
  getTags(html, 'meta')
    .filter((tag) => getAttr(tag, attrName) === attrValue)
    .map((tag) => getAttr(tag, 'content'))
    .filter(Boolean);

const canonicalValues = (html) =>
  getTags(html, 'link')
    .filter((tag) => getAttr(tag, 'rel') === 'canonical')
    .map((tag) => getAttr(tag, 'href'))
    .filter(Boolean);

const jsonLdValues = (html) =>
  [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)]
    .map((match) => match[1]);

const validateCommon = (html, expectedCanonical, expectedType) => {
  const canonicals = canonicalValues(html);
  assert.equal(canonicals.length, 1, `${expectedCanonical}: expected exactly one canonical link`);
  assert.equal(canonicals[0], expectedCanonical, `${expectedCanonical}: canonical URL mismatch`);
  assert.ok(expectedCanonical.startsWith(`${ORIGIN}${BASE}`), `${expectedCanonical}: missing /blog base path`);

  const requiredOg = ['title', 'description', 'type', 'url', 'image', 'image:alt', 'site_name', 'locale'];
  for (const property of requiredOg) {
    assert.equal(metaValues(html, 'property', `og:${property}`).length, 1, `${expectedCanonical}: og:${property} missing or duplicated`);
  }
  assert.equal(metaValues(html, 'property', 'og:url')[0], expectedCanonical, `${expectedCanonical}: og:url mismatch`);
  assert.equal(metaValues(html, 'property', 'og:type')[0], expectedType, `${expectedCanonical}: og:type mismatch`);
  assert.match(metaValues(html, 'property', 'og:image')[0], /^https:\/\//u, `${expectedCanonical}: og:image must be absolute`);

  const requiredTwitter = ['card', 'site', 'creator', 'title', 'description', 'image', 'image:alt'];
  for (const name of requiredTwitter) {
    assert.equal(metaValues(html, 'name', `twitter:${name}`).length, 1, `${expectedCanonical}: twitter:${name} missing or duplicated`);
  }
  assert.match(metaValues(html, 'name', 'twitter:image')[0], /^https:\/\//u, `${expectedCanonical}: twitter:image must be absolute`);
};

const pages = [
  { path: join('dist', 'index.html'), canonical: `${ORIGIN}${BASE}`, type: 'website' },
  { path: join('dist', 'about', 'index.html'), canonical: `${ORIGIN}${BASE}about/`, type: 'website' },
];

for (const page of pages) {
  assert.ok(existsSync(page.path), `Missing generated page: ${page.path}`);
  const html = readFileSync(page.path, 'utf8');
  validateCommon(html, page.canonical, page.type);
  assert.equal(jsonLdValues(html).length, 0, `${page.canonical}: non-article page must not emit BlogPosting JSON-LD`);
}

const postFiles = readdirSync('src/content/blog').filter((file) => extname(file) === '.md');
assert.ok(postFiles.length > 0, 'Expected at least one Markdown article');

for (const file of postFiles) {
  const slug = basename(file, '.md');
  const path = join('dist', 'posts', slug, 'index.html');
  const canonical = `${ORIGIN}${BASE}posts/${slug}/`;
  assert.ok(existsSync(path), `Missing generated article page: ${path}`);

  const html = readFileSync(path, 'utf8');
  validateCommon(html, canonical, 'article');

  assert.equal(metaValues(html, 'property', 'article:published_time').length, 1, `${canonical}: article:published_time missing or duplicated`);
  assert.equal(metaValues(html, 'property', 'article:modified_time').length, 1, `${canonical}: article:modified_time missing or duplicated`);
  assert.ok(metaValues(html, 'property', 'article:tag').length > 0, `${canonical}: expected article tags`);

  const jsonScripts = jsonLdValues(html);
  assert.equal(jsonScripts.length, 1, `${canonical}: expected exactly one JSON-LD block`);
  const structured = JSON.parse(jsonScripts[0]);
  assert.equal(structured['@context'], 'https://schema.org', `${canonical}: JSON-LD context mismatch`);
  assert.equal(structured['@type'], 'BlogPosting', `${canonical}: JSON-LD type mismatch`);
  assert.equal(structured.url, canonical, `${canonical}: JSON-LD url mismatch`);
  assert.equal(structured.mainEntityOfPage, canonical, `${canonical}: JSON-LD mainEntityOfPage mismatch`);
  assert.equal(structured.author?.name, 'Sergio Valverde', `${canonical}: JSON-LD author mismatch`);
  assert.ok(structured.datePublished, `${canonical}: JSON-LD datePublished missing`);
  assert.ok(structured.dateModified, `${canonical}: JSON-LD dateModified missing`);
  assert.ok(Array.isArray(structured.keywords) && structured.keywords.length > 0, `${canonical}: JSON-LD keywords missing`);
  assert.match(structured.image, /^https:\/\//u, `${canonical}: JSON-LD image must be absolute`);
}

const rootHtml = readFileSync(join('dist', 'index.html'), 'utf8');
assert.equal(metaValues(rootHtml, 'property', 'og:image')[0], FALLBACK_IMAGE, 'Fallback OG image must resolve to a real base-path asset');
assert.ok(existsSync(join('dist', 'favicon.svg')), 'Fallback OG image asset must exist in dist');

console.log(`SEO validation passed for ${pages.length} site page(s) and ${postFiles.length} article(s).`);
