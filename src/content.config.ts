import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const termsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/terms" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().or(z.string().transform(str => new Date(str))),
    tags: z.array(z.string()).optional(),
  })
});

export const collections = {
  'terms': termsCollection,
};
