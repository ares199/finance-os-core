export interface TradeIntent {
  symbol?: string;
  side?: "buy" | "sell";
  amount?: number;
  leverage?: boolean;
}

export interface NotificationIntent {
  channel?: "email" | "sms" | "push";
  message?: string;
}

export interface ActionRequest {
  id: string;
  ts: number;
  moduleId: string;
  kind: string;
  summary: string;
  trade?: TradeIntent;
  notify?: NotificationIntent;
}

export function createActionRequest(input: Omit<ActionRequest, "id" | "ts">): ActionRequest {
  return {
    ...input,
    id: crypto.randomUUID(),
    ts: Date.now(),
  };
}
