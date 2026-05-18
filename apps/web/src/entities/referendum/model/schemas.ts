import { z } from "zod";

export const OptionSchema = z.object({
  id: z.number(),
  label: z.string(),
  order: z.number(),
});

export const QuestionSchema = z.object({
  id: z.number().default(1),
  text: z.string(),
  options: z.array(OptionSchema),
});

export const ReferendumSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.enum(["open", "closed"]),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  total_voters_census: z.number().default(630000),
  question: QuestionSchema,
});
