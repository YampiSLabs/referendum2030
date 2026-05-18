import { defineCollection, z } from "astro:content";

const faq = defineCollection({
  type: "content",
  schema: z.object({
    question: z.string(),
    category: z.string(),
    order: z.number().optional(),
  }),
});

const transparency = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

const pages = defineCollection({
  type: "content",
  schema: z.object({}),
});

export const collections = { faq, transparency, pages };
