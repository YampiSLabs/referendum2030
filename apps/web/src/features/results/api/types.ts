import { z } from "zod";
import { ResultOptionSchema, ResultsSchema } from "./schemas";

export type ResultOption = z.infer<typeof ResultOptionSchema>;
export type Results = z.infer<typeof ResultsSchema>;
