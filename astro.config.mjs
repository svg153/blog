import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://svg153.github.io/blog',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
