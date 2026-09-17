import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const seriesSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Series id must be a lowercase URL-safe slug'),
  name: z.string().trim().min(1),
  order: z.number().int().positive(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    updatedDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    readingTime: z.string().optional(),
    series: seriesSchema.optional(),
  }),
});

export const collections = { blog };
