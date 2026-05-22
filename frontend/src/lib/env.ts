import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url().default("http://localhost:4000/api/v1"),
  VITE_SOCKET_URL: z.url().default("http://localhost:4000")
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid frontend environment: ${JSON.stringify(z.treeifyError(parsed.error))}`);
}

export const env = parsed.data;

