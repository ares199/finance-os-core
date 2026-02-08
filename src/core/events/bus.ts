export const Events = {
  CONNECTOR_SYNCED: "connector.synced",
  POLICY_UPDATED: "policy.updated",
  ACTION_REQUESTED: "action.requested",
  ACTION_COMPLETED: "action.completed",
  AUDIT_APPENDED: "audit.appended",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
export type EventHandler<T = unknown> = (payload: T) => void;

class EventBus {
  private listeners = new Map<EventName, Set<EventHandler>>();

  on<T = unknown>(event: EventName, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.listeners.set(event, handlers);
  }

  off<T = unknown>(event: EventName, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    handlers.delete(handler as EventHandler);
  }

  emit<T = unknown>(event: EventName, payload: T) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    handlers.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
