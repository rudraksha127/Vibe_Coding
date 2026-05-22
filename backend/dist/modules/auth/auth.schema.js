import { z } from "zod";
import { dressCodePreferences, experienceLevels } from "../../models/user.model.js";
const profileSchema = z.object({
    name: z.string().trim().min(1).max(120),
    targetRole: z.string().trim().min(1).max(120).optional(),
    experienceLevel: z.enum(experienceLevels).optional(),
    targetCompanies: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
    preferredLanguage: z.string().trim().min(2).max(12).optional(),
    timezone: z.string().trim().min(1).max(80).optional(),
    dressCodePreference: z.enum(dressCodePreferences).optional()
});
export const registerBodySchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    profile: profileSchema
});
export const loginBodySchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(128)
});
export const sessionParamsSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid session id")
});
