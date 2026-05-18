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
  status: z.enum(["open", "closed"]).default("open"),
  starts_at: z.string().default("2030-05-12T09:00:00Z"),
  ends_at: z.string().default("2030-05-18T20:00:00Z"),
  total_voters_census: z.number().default(630000),
  question: QuestionSchema,
});
