import { defineConfig } from 'astro/config';

export default defineConfig({
  // No site - generates relative paths
  build: {
    assets: '_astro',
  },
});
