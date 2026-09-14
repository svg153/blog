import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://svg153.github.io',
  base: '/blog',
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      // Mermaid code fences are rendered as diagrams by Layout.astro.
      // Keep Astro's default exclusion for math as well.
      excludeLangs: ['math', 'mermaid'],
    },
  },
  vite: {
    resolve: {
      alias: {
        '@layouts': '/src/layouts',
        '@config': '/src/config.ts',
      },
    },
  },
});
