import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export type AIProvider = {
  name: string;
  client: OpenAI;
  model: string;
};

/**
 * Build a prioritized list of OpenAI-compatible AI providers from env.
 * Groq is first (fastest), then OpenRouter (widest model support),
 * then Mistral, then OpenAI, then Anthropic, etc.
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  if (env.GROQ_API_KEY) {
    providers.push({
      name: "Groq",
      client: new OpenAI({
        apiKey: env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
      }),
      model: env.GROQ_MODEL
    });
  }

  if (env.OPENROUTER_API_KEY) {
    providers.push({
      name: "OpenRouter",
      client: new OpenAI({
        apiKey: env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1"
      }),
      model: env.OPENROUTER_MODEL
    });
  }

  if (env.MISTRAL_API_KEY) {
    providers.push({
      name: "Mistral",
      client: new OpenAI({
        apiKey: env.MISTRAL_API_KEY,
        baseURL: "https://api.mistral.ai/v1"
      }),
      model: env.MISTRAL_MODEL ?? "mistral-large-latest"
    });
  }

  if (env.CEREBRAS_API_KEY) {
    providers.push({
      name: "Cerebras",
      client: new OpenAI({
        apiKey: env.CEREBRAS_API_KEY,
        baseURL: "https://api.cerebras.ai/v1"
      }),
      model: env.CEREBRAS_MODEL ?? "llama-3.3-70b"
    });
  }

  if (env.SAMBANOVA_API_KEY) {
    providers.push({
      name: "SambaNova",
      client: new OpenAI({
        apiKey: env.SAMBANOVA_API_KEY,
        baseURL: "https://api.sambanova.ai/v1"
      }),
      model: env.SAMBANOVA_MODEL ?? "Meta-Llama-3.3-70B-Instruct"
    });
  }

  if (env.XAI_API_KEY) {
    providers.push({
      name: "xAI",
      client: new OpenAI({
        apiKey: env.XAI_API_KEY,
        baseURL: "https://api.x.ai/v1"
      }),
      model: env.XAI_MODEL ?? "grok-3"
    });
  }

  if (env.OPENAI_API_KEY) {
    providers.push({
      name: "OpenAI",
      client: new OpenAI({
        apiKey: env.OPENAI_API_KEY
      }),
      model: env.OPENAI_MODEL ?? "gpt-4o-mini"
    });
  }

  return providers;
}

/**
 * Call the AI with automatic provider failover.
 * Tries each provider in priority order; on failure, moves to the next.
 */
export async function callAI(opts: {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    logger.warn("No AI providers configured. Falling back to mock data.");
    return null;
  }

  for (const provider of providers) {
    try {
      logger.info(`Trying AI provider: ${provider.name} (model: ${provider.model})`);

      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "user", content: opts.userMessage }
        ],
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1000
      });

      const content = response.choices?.[0]?.message?.content;

      if (content) {
        logger.info(`AI response received from ${provider.name}`);
        return content;
      }

      logger.warn(`Empty response from ${provider.name}, trying next...`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Provider ${provider.name} failed: ${errMsg}. Trying next...`);
    }
  }

  logger.error("All AI providers failed. Falling back to mock data.");
  return null;
}
