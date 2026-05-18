import { z } from "zod";
import { AuditEventSchema } from "./schemas";

export type AuditEvent = z.infer<typeof AuditEventSchema>;
