import { auditStore } from "@/core/audit/auditStore";
import { eventBus, Events } from "@/core/events/bus";
import { evaluatePolicy } from "@/core/policy/engine";
import { loadPolicy } from "@/core/policy/store";
import type { ActionRequest } from "@/core/actions/types";

export type ActionDispatchStatus = "denied" | "needs_approval" | "executed";

export interface ActionDispatchResult {
  status: ActionDispatchStatus;
  reason?: string;
}

export function dispatchAction(actionRequest: ActionRequest): ActionDispatchResult {
  eventBus.emit(Events.ACTION_REQUESTED, actionRequest);

  const policy = loadPolicy();
  const decision = evaluatePolicy(policy, actionRequest);

  if (decision.status === "deny") {
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "warning",
      title: "Action denied",
      description: decision.reason ?? "Policy denied the action request.",
      actor: "Policy Engine",
      moduleId: actionRequest.moduleId,
      data: {
        actionId: actionRequest.id,
        kind: actionRequest.kind,
        summary: actionRequest.summary,
      },
    });
    eventBus.emit(Events.ACTION_COMPLETED, { actionRequest, status: "denied" });
    return { status: "denied", reason: decision.reason };
  }

  if (decision.requiresUserApproval) {
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "info",
      title: "Action awaiting approval",
      description: decision.reason ?? "Waiting for user approval.",
      actor: "Policy Engine",
      moduleId: actionRequest.moduleId,
      data: {
        actionId: actionRequest.id,
        kind: actionRequest.kind,
        summary: actionRequest.summary,
      },
    });
    eventBus.emit(Events.ACTION_COMPLETED, { actionRequest, status: "needs_approval" });
    return { status: "needs_approval", reason: decision.reason };
  }

  auditStore.append({
    id: crypto.randomUUID(),
    ts: Date.now(),
    level: "info",
    title: "Action executed",
    description: "Execution simulated successfully.",
    actor: "Automation Runtime",
    moduleId: actionRequest.moduleId,
    data: {
      actionId: actionRequest.id,
      kind: actionRequest.kind,
      summary: actionRequest.summary,
    },
  });

  eventBus.emit(Events.ACTION_COMPLETED, { actionRequest, status: "executed" });
  return { status: "executed" };
}
