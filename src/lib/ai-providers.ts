import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

// Google Gemini provider
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// Groq provider (OpenAI-compatible)
export const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

// OpenRouter provider (OpenAI-compatible)
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export interface ModelInfo {
  id: string;
  name: string;
  provider: "google" | "groq" | "openrouter";
  description: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Google Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Fast, efficient model for general use",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Advanced model with large context window",
  },
  // Groq (ultra-fast)
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "Ultra-fast 70B model via Groq LPU",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    description: "Instant responses, lightweight model",
  },
  {
    id: "gemma2-9b-it",
    name: "Gemma 2 9B",
    provider: "groq",
    description: "Google's Gemma 2 on Groq",
  },
  // OpenRouter (free models)
  {
    id: "openrouter/meta-llama/llama-3.1-8b-instruct:free",
    name: "Llama 3.1 8B (OpenRouter)",
    provider: "openrouter",
    description: "Free Llama model via OpenRouter",
  },
  {
    id: "openrouter/google/gemma-2-9b-it:free",
    name: "Gemma 2 9B (OpenRouter)",
    provider: "openrouter",
    description: "Free Gemma model via OpenRouter",
  },
  {
    id: "openrouter/mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B (OpenRouter)",
    provider: "openrouter",
    description: "Free Mistral model via OpenRouter",
  },
];

export function getModel(modelId: string) {
  const modelInfo = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!modelInfo) {
    // Default to Gemini Flash
    return google("gemini-2.5-flash");
  }

  switch (modelInfo.provider) {
    case "google":
      return google(modelId);
    case "groq":
      return groq(modelId);
    case "openrouter": {
      // Strip "openrouter/" prefix for the API call
      const routerModelId = modelId.replace("openrouter/", "");
      return openrouter(routerModelId);
    }
    default:
      return google("gemini-2.5-flash");
  }
}
