import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://svg153.github.io',
  base: '/blog',
  vite: {
    resolve: {
      alias: {
        '@layouts': '/src/layouts',
        '@config': '/src/config.ts',
      },
    },
  },
});
