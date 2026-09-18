# Requirements — v2.1.0 Publishing platform foundation

## Canonical Astro source
- [x] **CORE-01** — `src/content/blog/*.md` is the only canonical article content source.
- [x] **CORE-02** — One generic Astro route renders all published article entries.
- [x] **CORE-03** — Generated build output and legacy generated HTML are not versioned.
- [x] **CORE-04** — Obsolete custom build/generation/test scripts are removed or replaced by current, documented tooling.
- [x] **CORE-05** — README and AGENTS describe the actual Astro architecture and contribution flow.

## Feed and discovery endpoints
- [x] **FEED-01** — `/blog/rss.xml` contains published posts with canonical absolute URLs.
- [x] **FEED-02** — RSS metadata is derived from the content collection, not duplicated manually.
- [x] **FEED-03** — A sitemap is generated for public routes with the configured `/blog` base path.
- [x] **FEED-04** — CI/build verification detects missing feed/sitemap outputs.

## SEO and structured metadata
- [x] **SEO-01** — Every page emits an absolute canonical URL.
- [x] **SEO-02** — OpenGraph metadata includes URL, title, description, image, locale and correct page/article type.
- [x] **SEO-03** — Twitter card metadata mirrors canonical social metadata without duplicated sources of truth.
- [x] **SEO-04** — Articles expose publish/update time and tags in relevant meta properties.
- [x] **SEO-05** — Articles emit valid `BlogPosting` JSON-LD with canonical URL and author/site identity.

## Social cards
- [x] **OG-01** — Each article resolves a deterministic 1200x630 social card from its metadata.
- [x] **OG-02** — Cards are generated at build time or committed as source assets, never by an external runtime image service.
- [x] **OG-03** — Long/special-character Spanish technical titles remain readable and safely escaped.
- [x] **OG-04** — A default fallback card exists for non-article pages or generation failure.

## Taxonomy and archive
- [x] **TAX-01** — Tags are normalized to stable URL slugs while preserving display labels.
- [x] **TAX-02** — Every article tag links to `/tags/<slug>/`.
- [x] **TAX-03** — `/tags/` lists normalized tags with published-post counts.
- [x] **TAX-04** — Tag pages list only published posts matching the normalized tag.
- [x] **TAX-05** — `/archive/` groups published posts chronologically with stable links.

## Article UX and series
- [x] **UX-01** — Rendered headings have stable, linkable IDs.
- [x] **UX-02** — Long articles can render a heading-derived table of contents usable on desktop and mobile.
- [x] **UX-03** — Heading deep links are copyable without requiring a framework runtime.
- [x] **UX-04** — Frontmatter supports an optional series identifier/name and explicit order.
- [x] **UX-05** — Series navigation/pages expose ordered previous/next entries while excluding unpublished content.

## Content lifecycle
- [x] **LIFE-01** — Frontmatter supports `draft` with a safe default.
- [x] **LIFE-02** — Frontmatter models publication and optional update dates with validated date types.
- [x] **LIFE-03** — Production routes/listings/feeds/search exclude drafts and future-dated posts.
- [x] **LIFE-04** — Development has an explicit way to preview draft content without weakening production filtering.
- [x] **LIFE-05** — Reading time is calculated from article source/content, not manually maintained.
- [x] **LIFE-06** — Existing articles migrate without losing their public URLs or publication dates.

## Related content
- [x] **REL-01** — Article pages can show a bounded related-post set.
- [x] **REL-02** — Related scoring prefers same series, then shared normalized tags, then recency.
- [x] **REL-03** — Current article, drafts and future content are never recommended.
- [x] **REL-04** — Related results are deterministic for a fixed content collection.

## Quality gates
- [x] **QUAL-01** — PR CI validates content/frontmatter in addition to `npm ci`, audit and Astro build.
- [x] **QUAL-02** — Broken internal links are detected before merge.
- [x] **QUAL-03** — Missing local image/static-asset references are detected before merge.
- [x] **QUAL-04** — Markdown checks catch useful structural problems without enforcing noisy prose/style opinions.
- [x] **QUAL-05** — Generated RSS/sitemap/search outputs required by completed phases are smoke-tested in CI.
- [x] **QUAL-06** — Mermaid article rendering remains covered by the normal Astro build path.

## Dependency automation
- [ ] **DEP-01** — Renovate opens dependency update PRs for npm dependencies.
- [ ] **DEP-02** — Renovate covers GitHub Actions versions.
- [ ] **DEP-03** — Update grouping keeps reviewable risk boundaries (patch/minor vs major/security).
- [ ] **DEP-04** — Major updates never auto-merge.
- [ ] **DEP-05** — Any permitted auto-merge requires repository CI success and conservative policy.

## Search and filtering
- [ ] **SEARCH-01** — Pagefind indexes only public/published site content after the Astro build.
- [ ] **SEARCH-02** — Search works under the `/blog` GitHub Pages base path.
- [ ] **SEARCH-03** — Search UI is keyboard-accessible, mobile-usable and progressively enhanced.
- [ ] **SEARCH-04** — Search results expose useful title/description/tag context.
- [ ] **SEARCH-05** — Tag/year filters compose with browsing/search without an external service.
- [ ] **SEARCH-06** — Search index generation is validated by CI and excluded from source control.

## Publishing pipeline
- [ ] **PUB-01** — Markdown/frontmatter remains canonical; external publication state is explicit metadata/provenance rather than copied article files.
- [ ] **PUB-02** — A provider-neutral payload contract represents canonical URL, title, excerpt/body, tags and channel-specific overrides.
- [ ] **PUB-03** — A dry-run/export command produces reviewable payloads without credentials or network mutation.
- [ ] **PUB-04** — DEV Community publication uses its supported API and sets canonical URL semantics correctly.
- [ ] **PUB-05** — LinkedIn publication uses a supported API when explicitly configured, otherwise produces a manual-ready payload with no scraping fallback.
- [ ] **PUB-06** — Newsletter delivery is provider-neutral first; concrete adapters require a documented supported API/connector.
- [ ] **PUB-07** — Channel-specific copy can be explicitly overridden while deterministic defaults remain available.
- [ ] **PUB-08** — Credentials are runtime-only, redacted from logs and never stored in content/repository files.
- [ ] **PUB-09** — Idempotency/provenance prevents accidental duplicate publication attempts.
- [ ] **PUB-10** — Merge/deploy does not automatically cross-post by default; mutation requires explicit invocation/review.

## Traceability
| Phase | Requirements |
| --- | --- |
| 01 | CORE-01, CORE-02, CORE-03, CORE-04, CORE-05 |
| 02 | FEED-01, FEED-02, FEED-03, FEED-04 |
| 03 | SEO-01, SEO-02, SEO-03, SEO-04, SEO-05 |
| 04 | OG-01, OG-02, OG-03, OG-04 |
| 05 | TAX-01, TAX-02, TAX-03, TAX-04, TAX-05 |
| 06 | UX-01, UX-02, UX-03, UX-04, UX-05 |
| 07 | LIFE-01, LIFE-02, LIFE-03, LIFE-04, LIFE-05, LIFE-06 |
| 08 | REL-01, REL-02, REL-03, REL-04 |
| 09 | QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06 |
| 10 | DEP-01, DEP-02, DEP-03, DEP-04, DEP-05 |
| 11 | SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04, SEARCH-05, SEARCH-06 |
| 12 | PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, PUB-07, PUB-08, PUB-09, PUB-10 |
