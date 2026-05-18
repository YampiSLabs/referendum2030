import { z } from "zod";

export const ResultOptionSchema = z.object({
  option_id: z.number(),
  label: z.string(),
  votes: z.number(),
});

export const ResultsSchema = z.object({
  referendum: z.string(),
  slug: z.string(),
  total_votes: z.number(),
  tokens_issued: z.number(),
  last_updated: z.string(),
  options: z.array(ResultOptionSchema),
});
