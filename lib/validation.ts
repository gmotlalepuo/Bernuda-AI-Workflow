import { z } from "zod";

export const builderRequestSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  department: z.string().min(2, "Department is required."),
  objective: z.string().min(20, "Describe the business objective in more detail."),
  mode: z.enum(["designer", "business", "executive", "testing"])
});

export type BuilderRequest = z.infer<typeof builderRequestSchema>;
