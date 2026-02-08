import type { LLMChatOptions, LLMClient, LLMMessage } from "@/core/llm/types";
import { LLMError } from "@/core/llm/errors";

const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-5-mini";

type OpenAIResponsesOutputContent = {
  type?: string;
  text?: string;
};

type OpenAIResponsesOutputItem = {
  type?: string;
  role?: string;
  content?: OpenAIResponsesOutputContent[];
  text?: string;
};

type OpenAIResponsesResponse = {
  output_text?: string;
  output?: OpenAIResponsesOutputItem[];
  error?: {
    message?: string;
  };
};

const DEFAULT_MAX_OUTPUT_TOKENS = 1200;
const DEFAULT_TEMPERATURE = 0.4;

const toInputMessage = (message: LLMMessage) => ({
  role: message.role,
  content: [{ type: "text", text: message.content }],
});

const extractResponseText = (parsed: OpenAIResponsesResponse) => {
  const chunks: string[] = [];

  if (typeof parsed.output_text === "string" && parsed.output_text.trim()) {
    chunks.push(parsed.output_text.trim());
  }

  if (Array.isArray(parsed.output)) {
    parsed.output.forEach((item) => {
      if (typeof item.text === "string" && item.text.trim()) {
        chunks.push(item.text.trim());
      }
      if (Array.isArray(item.content)) {
        item.content.forEach((content) => {
          if (typeof content.text === "string" && content.text.trim()) {
            chunks.push(content.text.trim());
          }
        });
      }
    });
  }

  const combined = chunks.filter(Boolean).join("\n").trim();
  return combined.length > 0 ? combined : null;
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
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        input: messages.map(toInputMessage),
        temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
        max_output_tokens: options?.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      let message = text || response.statusText || "OpenAI request failed.";
      try {
        const parsed = JSON.parse(text) as OpenAIResponsesResponse;
        message = parsed.error?.message ?? message;
      } catch {
        // ignore parse errors
      }
      throw new LLMError(`OpenAI API error ${response.status}: ${message}`);
    }

    let parsed: OpenAIResponsesResponse;
    try {
      parsed = JSON.parse(text) as OpenAIResponsesResponse;
    } catch (error) {
      throw new LLMError("Failed to parse OpenAI response.");
    }

    const content = extractResponseText(parsed);
    if (!content) {
      throw new LLMError("Failed to extract text from OpenAI response. Unexpected response shape.");
    }

    return { text: content };
  }
}
