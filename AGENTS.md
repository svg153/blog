## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Content and diagrams

Blog posts are authored as Markdown in the Astro content collection. Mermaid diagrams are supported with standard fenced code blocks:

````markdown
```mermaid
flowchart LR
  Idea --> Draft
  Draft --> Review
  Review --> Publish
```
````

Use Mermaid when a diagram communicates structure, flow, state, architecture, sequence, or relationships more clearly than prose. Do not turn simple lists or short explanations into diagrams just for decoration.

Preferred diagram types include `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, `gitGraph`, and `timeline`. Keep diagrams small enough to remain readable on mobile; split very large diagrams instead of shrinking them excessively.

Accessibility and content rules:

- Always explain the important conclusion of a diagram in nearby prose. A diagram must not be the only place where essential information appears.
- Use meaningful node labels and avoid relying only on color to communicate meaning.
- Avoid raw HTML or JavaScript in Mermaid labels. Rendering uses Mermaid with `securityLevel: 'strict'`.
- Keep the Mermaid source in the Markdown article; do not commit generated SVGs for diagrams that can be expressed cleanly in Mermaid.
- Do not add per-post Mermaid scripts, CDN imports, or custom renderers. Mermaid is integrated centrally through `astro-mermaid` in `astro.config.mjs`.
- Mermaid is rendered client-side only on pages that contain Mermaid blocks; normal Markdown/code fences continue through Astro's standard pipeline.
- Keep `astro-mermaid` and `mermaid` compatible. `astro-mermaid@2.1.0` declares Mermaid 10/11 support, so Mermaid is intentionally pinned to `11.17.2`. Do not upgrade to Mermaid 12+ until the integration declares/supports it and existing diagrams have been validated.
- Dependency changes must keep `package-lock.json` in sync and preserve the existing `npm ci` deployment contract.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- [Mermaid syntax and diagram types](https://mermaid.js.org/intro/)
- [astro-mermaid integration](https://github.com/joesaby/astro-mermaid)
