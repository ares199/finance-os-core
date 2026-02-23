import { auditStore } from "@/core/audit/auditStore";
import { eventBus, Events } from "@/core/events/bus";
import { isPermissionGranted } from "@/core/permissions/gate";
import { evaluatePolicy } from "@/core/policy/engine";
import { loadPolicy } from "@/core/policy/store";
import type { Permission } from "@/core/plugin/types";
import type { ActionRequest } from "@/core/actions/types";

export type ActionDispatchStatus = "denied" | "suggested" | "needs_approval" | "executed";

export interface ActionDispatchResult {
  status: ActionDispatchStatus;
  reason?: string;
}

function getRequiredPermissions(actionRequest: ActionRequest): Permission[] {
  const permissions = new Set<Permission>();

  if (actionRequest.kind.startsWith("notify")) {
    permissions.add("suggest");
  }

  if (actionRequest.notify) {
    permissions.add("suggest");
  }

  if (actionRequest.trade) {
    permissions.add("trade");
  }

  return Array.from(permissions);
}

export function dispatchAction(actionRequest: ActionRequest): ActionDispatchResult {
  eventBus.emit(Events.ACTION_REQUESTED, actionRequest);

  const missingPermissions = getRequiredPermissions(actionRequest).filter(
    (permission) => !isPermissionGranted(actionRequest.moduleId, permission)
  );

  if (missingPermissions.length > 0) {
    const reason = `Module is missing required permissions: ${missingPermissions.join(", ")}.`;
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "warning",
      title: "Action denied",
      description: reason,
      actor: "Permission Gate",
      moduleId: actionRequest.moduleId,
      data: {
        actionId: actionRequest.id,
        kind: actionRequest.kind,
        summary: actionRequest.summary,
        missingPermissions,
      },
    });
    eventBus.emit(Events.ACTION_COMPLETED, { actionRequest, status: "denied" });
    return { status: "denied", reason };
  }

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

  if (policy.autonomyMode === "suggest") {
    const reason = decision.reason ?? "Suggestion created. User decides whether to execute.";
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "info",
      title: "Action suggested",
      description: reason,
      actor: "Policy Engine",
      moduleId: actionRequest.moduleId,
      data: {
        actionId: actionRequest.id,
        kind: actionRequest.kind,
        summary: actionRequest.summary,
      },
    });
    eventBus.emit(Events.ACTION_COMPLETED, { actionRequest, status: "suggested" });
    return { status: "suggested", reason };
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
