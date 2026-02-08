import type { LLMChatOptions, LLMClient, LLMMessage } from "@/core/llm/types";
import { LLMError } from "@/core/llm/errors";

const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export class OpenAIClient implements LLMClient {
  private apiKey: string;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    const key = options?.apiKey ?? envKey;
    if (!key) {
      throw new LLMError("OpenAI API key missing. Set VITE_OPENAI_API_KEY in .env.local");
    }
    this.apiKey = key;
    this.model = options?.model ?? DEFAULT_MODEL;
  }

  async chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<{ text: string }> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 800,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = text || "OpenAI request failed.";
      try {
        const parsed = JSON.parse(text) as OpenAIChatResponse;
        message = parsed.error?.message ?? message;
      } catch {
        // ignore parse errors
      }
      throw new LLMError(message, "OpenAI request failed. Please try again.");
    }

    let parsed: OpenAIChatResponse;
    try {
      parsed = JSON.parse(text) as OpenAIChatResponse;
    } catch (error) {
      throw new LLMError("Failed to parse OpenAI response.");
    }

    const content = parsed.choices?.[0]?.message?.content;
    if (!content) {
      throw new LLMError("OpenAI response was empty.");
    }

    return { text: content };
  }
}
