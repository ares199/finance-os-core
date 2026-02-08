import type { ActionRequest } from "@/core/actions/types";
import type { PolicyState } from "@/core/policy/types";

export interface PolicyDecision {
  status: "ok" | "deny";
  requiresUserApproval: boolean;
  reason?: string;
}

export function evaluatePolicy(policy: PolicyState, actionRequest: ActionRequest): PolicyDecision {
  if (policy.killSwitch) {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: "Kill switch is active.",
    };
  }

  if (actionRequest.trade?.leverage && !policy.allowLeverage) {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: "Leverage is disabled by policy.",
    };
  }

  if (policy.autonomyMode === "readonly") {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: "Autonomy mode is read-only.",
    };
  }

  if (policy.autonomyMode === "auto") {
    return {
      status: "ok",
      requiresUserApproval: false,
    };
  }

  if (policy.autonomyMode === "confirm" || policy.autonomyMode === "suggest") {
    return {
      status: "ok",
      requiresUserApproval: true,
      reason: "User approval required by autonomy mode.",
    };
  }

  return {
    status: "ok",
    requiresUserApproval: true,
  };
}
