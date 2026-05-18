import { z } from "zod";
import { OptionSchema, QuestionSchema, ReferendumSchema } from "./schemas";

export type Option = z.infer<typeof OptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Referendum = z.infer<typeof ReferendumSchema>;
