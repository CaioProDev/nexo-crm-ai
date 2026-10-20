import { z } from "zod";
import { leadStages } from "@/lib/types";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(8).max(30),
  value: z.number().nonnegative().max(100_000_000),
  stage: z.enum(leadStages),
  source: z.string().trim().min(2).max(60),
  nextAction: z.string().trim().min(3).max(240),
  score: z.number().int().min(0).max(100).optional(),
});

export const leadUpdateSchema = leadSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  { message: "Informe ao menos um campo para atualização." },
);

export const leadIdSchema = z.uuid();

export const analysisRequestSchema = z.object({
  leadId: z.uuid(),
}).strict();

export const analysisResultSchema = z.object({
  summary: z.string().min(1).max(1_200),
  risks: z.array(z.string().min(1).max(500)).max(5),
  recommended_action: z.string().min(1).max(600),
  reasoning: z.string().min(1).max(1_200),
  suggested_message: z.string().min(1).max(1_500),
  missing_information: z.array(z.string().min(1).max(300)).max(8),
}).strict();
