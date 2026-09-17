import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { isValidIsoCalendarDate } from './lib/content-lifecycle.mjs';
const isoDate = z.string().refine(isValidIsoCalendarDate, 'Expected a valid YYYY-MM-DD calendar date');
const seriesSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Series id must be a lowercase URL-safe slug'),
  name: z.string().trim().min(1),
  order: z.number().int().positive(),
});
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(), description: z.string().optional(), date: isoDate, updatedDate: isoDate.optional(),
    draft: z.boolean().optional().default(false), tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false), series: seriesSchema.optional(),
  }).superRefine((data, ctx) => {
    if (data.updatedDate && data.updatedDate < data.date) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['updatedDate'], message: 'updatedDate must be the publication date or later' });
  }),
});
export const collections = { blog };
