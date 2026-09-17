import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
export const generatedPostSlugs = (dist = 'dist') => {
  const dir = join(dist, 'posts');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
};
