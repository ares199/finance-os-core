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
  response?: {
    output_text?: string;
  };
};

const DEFAULT_MAX_OUTPUT_TOKENS = 1200;

const toInputMessage = (message: LLMMessage) => ({
  role: message.role,
  content: [{ type: "input_text", text: message.content }],
});

const extractResponseText = (data: any): string => {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const collectFromOutput = (output: OpenAIResponsesOutputItem[]) => {
    const parts: string[] = [];

    for (const item of output) {
      if (!Array.isArray(item?.content)) {
        if (typeof item?.text === "string" && item.text.trim()) {
          parts.push(item.text.trim());
        }
        continue;
      }

      for (const block of item.content) {
        if (typeof block?.text !== "string") {
          continue;
        }
        const blockType = block.type ?? "output_text";
        if (["output_text", "summary_text", "refusal", "reasoning", "text"].includes(blockType)) {
          parts.push(block.text.trim());
        }
      }
    }

    return parts;
  };

  if (Array.isArray(data?.output)) {
    const parts = collectFromOutput(data.output);
    if (parts.length > 0) {
      return parts.join("\n\n");
    }
  }

  if (typeof data?.response?.output_text === "string") {
    return data.response.output_text;
  }

  if (Array.isArray(data?.response?.output)) {
    const parts = collectFromOutput(data.response.output);
    if (parts.length > 0) {
      return parts.join("\n\n");
    }
  }

  throw new Error(
    `Unable to parse OpenAI response: ${JSON.stringify(data, null, 2)}`
  );
};

const getResponsePreview = (responseText: string) =>
  import.meta.env.DEV && responseText
    ? ` Response preview: ${responseText.slice(0, 500)}`
    : "";

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
    const model = options?.model ?? this.model;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: messages.map(toInputMessage),
        max_output_tokens: options?.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      }),
    });

    const responseText = await response.clone().text().catch(() => "");
    let data: OpenAIResponsesResponse;

    try {
      data = (await response.json()) as OpenAIResponsesResponse;
    } catch (error) {
      const preview = getResponsePreview(responseText);
      throw new LLMError(`Failed to parse OpenAI response.${preview}`);
    }

    if (!response.ok) {
      const message =
        data?.error?.message ||
        responseText ||
        response.statusText ||
        "OpenAI request failed.";
      const preview = getResponsePreview(responseText);
      throw new LLMError(`OpenAI API error ${response.status}: ${message}${preview}`);
    }

    try {
      return { text: extractResponseText(data) };
    } catch (error) {
      const preview = getResponsePreview(responseText);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to extract text from OpenAI response.";
      throw new LLMError(`${message}${preview}`);
    }
  }
}
