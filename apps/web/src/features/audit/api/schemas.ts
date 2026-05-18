import { z } from "zod";

export const AuditEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  public_message: z.string(),
  created_at: z.string(),
  verified: z.boolean(),
});
