import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export type ProviderType = "google" | "openai" | "anthropic";

const PROVIDERS = {
  google: () => google("gemini-2.0-flash"),
  openai: () => openai("gpt-4o-mini"),
  anthropic: () => anthropic("claude-3-haiku-20240307"),
} as const;

/**
 * Get the AI model based on the AI_PROVIDER environment variable.
 * Defaults to Google (Gemini) if not specified.
 */
export function getAIModel() {
  const provider = (process.env.AI_PROVIDER || "google") as ProviderType;
  const providerFn = PROVIDERS[provider];

  if (!providerFn) {
    console.warn(`Unknown AI provider: ${provider}, falling back to Google`);
    return PROVIDERS.google();
  }

  return providerFn();
}

/**
 * Shared model configuration for consistent behavior across providers.
 */
export const MODEL_CONFIG = {
  maxTokens: 500,
  temperature: 0.7,
} as const;
