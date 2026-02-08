export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export interface LLMClient {
  chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<{ text: string }>;
}
