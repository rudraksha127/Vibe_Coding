import { z } from "zod";
import { interviewDifficulties, interviewLevels } from "../../models/interviewSession.model.js";
import { objectIdSchema, paginationSchema } from "../../utils/validation.js";

export const createInterviewBodySchema = z.object({
  resumeId: objectIdSchema.optional(),
  targetRole: z.string().trim().min(1).max(120),
  targetCompanies: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  language: z.string().trim().min(2).max(12).default("en"),
  level: z.enum(interviewLevels).default("L1"),
  mode: z.enum(["structured", "free_practice", "company_simulation"]).default("structured"),
  companyPack: z.string().trim().max(80).optional()
});

export const generateQuestionBodySchema = z.object({
  difficulty: z.enum(interviewDifficulties).optional()
});

export const submitAnswerBodySchema = z.object({
  answer: z.string().trim().min(10).max(10_000),
  inputMode: z.enum(["text", "voice", "combined"]).default("text")
});

export const interviewParamsSchema = z.object({
  id: objectIdSchema
});

export const answerParamsSchema = z.object({
  id: objectIdSchema,
  questionId: objectIdSchema
});

export const listInterviewQuerySchema = paginationSchema(20, 100).extend({
  status: z.enum(["draft", "in_progress", "completed", "abandoned"]).optional()
});

export type CreateInterviewInput = z.infer<typeof createInterviewBodySchema>;
export type GenerateQuestionInput = z.infer<typeof generateQuestionBodySchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerBodySchema>;

