import { z } from "zod";
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource id");
export function paginationSchema(defaultLimit = 20, maxLimit = 100) {
    return z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit)
    });
}
