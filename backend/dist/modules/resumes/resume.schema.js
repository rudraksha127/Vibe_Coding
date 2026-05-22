import { z } from "zod";
import { objectIdSchema, paginationSchema } from "../../utils/validation.js";
export const createResumeBodySchema = z.object({
    title: z.string().trim().min(1).max(120).default("Primary resume"),
    extractedText: z.string().trim().max(50_000).default(""),
    targetRole: z.string().trim().max(120).optional(),
    isPrimary: z.coerce.boolean().default(false)
});
export const updateResumeBodySchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
    extractedText: z.string().trim().max(50_000).optional(),
    isPrimary: z.boolean().optional()
});
export const resumeParamsSchema = z.object({
    id: objectIdSchema
});
export const listResumeQuerySchema = paginationSchema(20, 50);
