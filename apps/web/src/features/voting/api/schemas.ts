import { z } from "zod";

export const TokenResponseSchema = z.object({
  token: z.string(),
  valid: z.boolean(),
});

export const VotePayloadSchema = z.object({
  token: z.string().min(12, "El token ha de tenir com a mínim 12 caràcters."),
  option_id: z.number(),
});

export const VoteResponseSchema = z.object({
  success: z.boolean(),
  receipt_code: z.string(),
  registered_at: z.string(),
});
