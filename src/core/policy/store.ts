import { eventBus, Events } from "@/core/events/bus";
import type { PolicyState } from "@/core/policy/types";

const POLICY_KEY = "financeos.policy.v1";

const defaultPolicy: PolicyState = {
  autonomyMode: "suggest",
  maxDailyLossPct: 5,
  maxPositionSizePct: 10,
  maxCryptoAllocationPct: 30,
  allowLeverage: false,
  killSwitch: false,
};

export function loadPolicy(): PolicyState {
  const raw = localStorage.getItem(POLICY_KEY);
  if (!raw) {
    return defaultPolicy;
  }

  try {
    return { ...defaultPolicy, ...(JSON.parse(raw) as PolicyState) };
  } catch {
    return defaultPolicy;
  }
}

export function savePolicy(policy: PolicyState) {
  localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
  eventBus.emit(Events.POLICY_UPDATED, policy);
}

export function getDefaultPolicy() {
  return defaultPolicy;
}
