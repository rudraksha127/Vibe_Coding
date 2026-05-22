import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default("/api/v1"),
  VITE_SOCKET_URL: z.string().default("/")
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid frontend environment: ${JSON.stringify(z.treeifyError(parsed.error))}`);
}

export const env = parsed.data;

