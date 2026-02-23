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

  const projectedDailyLossPct = actionRequest.risk?.projectedDailyLossPct;
  if (typeof projectedDailyLossPct === "number" && projectedDailyLossPct > policy.maxDailyLossPct) {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: `Projected daily loss (${projectedDailyLossPct}%) exceeds max daily loss policy (${policy.maxDailyLossPct}%).`,
    };
  }

  const projectedPositionSizePct = actionRequest.risk?.projectedPositionSizePct;
  if (typeof projectedPositionSizePct === "number" && projectedPositionSizePct > policy.maxPositionSizePct) {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: `Projected position size (${projectedPositionSizePct}%) exceeds max position size policy (${policy.maxPositionSizePct}%).`,
    };
  }

  const projectedCryptoAllocationPct = actionRequest.risk?.projectedCryptoAllocationPct;
  if (typeof projectedCryptoAllocationPct === "number" && projectedCryptoAllocationPct > policy.maxCryptoAllocationPct) {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: `Projected crypto allocation (${projectedCryptoAllocationPct}%) exceeds max crypto allocation policy (${policy.maxCryptoAllocationPct}%).`,
    };
  }

  if (policy.autonomyMode === "readonly") {
    return {
      status: "deny",
      requiresUserApproval: false,
      reason: "Autonomy mode is read-only.",
    };
  }

  if (policy.autonomyMode === "suggest") {
    return {
      status: "ok",
      requiresUserApproval: true,
      reason: "Suggestion created. User decides whether to execute.",
    };
  }

  if (policy.autonomyMode === "confirm") {
    return {
      status: "ok",
      requiresUserApproval: true,
      reason: "User approval required before execution.",
    };
  }

  if (policy.autonomyMode === "auto") {
    return {
      status: "ok",
      requiresUserApproval: false,
      reason: "Auto mode allowed execution within risk policy.",
    };
  }

  return {
    status: "ok",
    requiresUserApproval: true,
  };
}
