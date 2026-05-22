import { z } from "zod";
import { dressCodePreferences, experienceLevels } from "../../models/user.model.js";

export const updateMeBodySchema = z.object({
  profile: z
    .object({
      name: z.string().trim().min(1).max(120).optional(),
      targetRole: z.string().trim().max(120).optional(),
      experienceLevel: z.enum(experienceLevels).optional(),
      targetCompanies: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
      preferredLanguage: z.string().trim().min(2).max(12).optional(),
      timezone: z.string().trim().min(1).max(80).optional(),
      dressCodePreference: z.enum(dressCodePreferences).optional(),
      photoUrl: z.string().trim().url().optional().or(z.literal(""))
    })
    .optional(),
  privacyConsents: z
    .object({
      recordingStorage: z.boolean().optional(),
      leaderboardVisible: z.boolean().optional(),
      marketingEmails: z.boolean().optional()
    })
    .optional()
});

export const deleteMeBodySchema = z.object({
  confirmationText: z.literal("DELETE MY ACCOUNT")
});

export type UpdateMeInput = z.infer<typeof updateMeBodySchema>;

