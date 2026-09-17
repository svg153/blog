import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import astroMermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://svg153.github.io',
  base: '/blog',
  integrations: [
    sitemap(),
    astroMermaid({
      theme: 'dark',
      autoTheme: false,
      enableLog: false,
      mermaidConfig: {
        securityLevel: 'strict',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@layouts': '/src/layouts',
        '@config': '/src/config.ts',
      },
    },
  },
});
