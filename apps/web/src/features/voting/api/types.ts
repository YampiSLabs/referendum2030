import { z } from "zod";
import { TokenResponseSchema, VotePayloadSchema, VoteResponseSchema } from "./schemas";

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type VotePayload = z.infer<typeof VotePayloadSchema>;
export type VoteResponse = z.infer<typeof VoteResponseSchema>;
