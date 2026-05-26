import "dotenv/config";
import { z } from "zod";

const isTestEnvironment =
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  typeof process.env.VITEST_POOL_ID === "string" ||
  typeof process.env.VITEST_WORKER_ID === "string";

const requiredInRuntime = (message: string, fallback: string) =>
  isTestEnvironment ? z.string().default(fallback) : z.string().min(1, message);

const jwtSecretInRuntime = (message: string, fallback: string) =>
  isTestEnvironment ? z.string().min(64, message).default(fallback) : z.string().min(64, message);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default(isTestEnvironment ? "test" : "development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_BASE_URL: z.url().default("http://localhost:4000"),
  MONGODB_URI: requiredInRuntime(
    "MONGODB_URI is required",
    "mongodb://127.0.0.1:27017/interviewforge_ai_test"
  ),
  JWT_ACCESS_SECRET: jwtSecretInRuntime(
    "JWT_ACCESS_SECRET must be at least 64 characters",
    "test-access-secret-0000000000000000000000000000000000000000000000000000000000000001"
  ),
  JWT_REFRESH_SECRET: jwtSecretInRuntime(
    "JWT_REFRESH_SECRET must be at least 64 characters",
    "test-refresh-secret-0000000000000000000000000000000000000000000000000000000000000002"
  ),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_COOKIE_NAME: z.string().min(1).default("if_refresh"),
  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/, "ENCRYPTION_KEY must be 32 bytes as 64 hex chars")
    .default("0000000000000000000000000000000000000000000000000000000000000000"),
  CORS_ORIGINS: requiredInRuntime("CORS_ORIGINS is required", "http://localhost:5173"),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().max(25).default(5),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("openrouter/auto"),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_MODEL: z.string().optional(),
  SAMBANOVA_API_KEY: z.string().optional(),
  SAMBANOVA_MODEL: z.string().optional(),
  CEREBRAS_API_KEY: z.string().optional(),
  CEREBRAS_MODEL: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  XAI_MODEL: z.string().optional(),
  HF_TOKEN: z.string().optional(),
  HF_MODEL: z.string().optional(),
  NVIDIA_NIM_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = z.treeifyError(parsed.error);
  if (isTestEnvironment) {
    throw new Error(`Invalid environment configuration (test): ${JSON.stringify(details)}`);
  }
  console.error("Invalid environment configuration", details);
  process.exit(1);
}

if (parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET) {
  const message = "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.";
  if (isTestEnvironment) {
    throw new Error(message);
  }
  console.error(message);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
