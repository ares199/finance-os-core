export class LLMError extends Error {
  userMessage: string;

  constructor(message: string, userMessage?: string) {
    super(message);
    this.name = "LLMError";
    this.userMessage = userMessage ?? message;
  }
}

export function getLlmErrorMessage(error: unknown) {
  if (error instanceof LLMError) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error.";
}
