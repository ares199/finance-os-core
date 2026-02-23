import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "@/core/policy/engine";
import type { ActionRequest } from "@/core/actions/types";
import type { PolicyState } from "@/core/policy/types";

function makePolicy(overrides: Partial<PolicyState> = {}): PolicyState {
  return {
    autonomyMode: "suggest",
    maxDailyLossPct: 5,
    maxPositionSizePct: 10,
    maxCryptoAllocationPct: 30,
    allowLeverage: false,
    killSwitch: false,
    ...overrides,
  };
}

function makeAction(overrides: Partial<ActionRequest> = {}): ActionRequest {
  return {
    id: "action-1",
    ts: Date.now(),
    moduleId: "brain.ceo",
    kind: "trade.rebalance",
    summary: "rebalance",
    ...overrides,
  };
}

describe("evaluatePolicy", () => {
  it("denies when kill switch is active", () => {
    const result = evaluatePolicy(makePolicy({ killSwitch: true }), makeAction());
    expect(result.status).toBe("deny");
    expect(result.reason).toContain("Kill switch");
  });

  it("denies leveraged trades when leverage is disabled", () => {
    const result = evaluatePolicy(
      makePolicy({ allowLeverage: false }),
      makeAction({ trade: { leverage: true } })
    );
    expect(result.status).toBe("deny");
    expect(result.reason).toContain("Leverage is disabled");
  });

  it("denies actions that exceed risk projections", () => {
    const result = evaluatePolicy(
      makePolicy({ maxDailyLossPct: 5 }),
      makeAction({ risk: { projectedDailyLossPct: 8 } })
    );
    expect(result.status).toBe("deny");
    expect(result.reason).toContain("Projected daily loss");
  });

  it("returns suggested path for suggest mode", () => {
    const result = evaluatePolicy(makePolicy({ autonomyMode: "suggest" }), makeAction());
    expect(result.status).toBe("ok");
    expect(result.requiresUserApproval).toBe(true);
    expect(result.reason).toContain("Suggestion");
  });

  it("returns approval path for confirm mode", () => {
    const result = evaluatePolicy(makePolicy({ autonomyMode: "confirm" }), makeAction());
    expect(result.status).toBe("ok");
    expect(result.requiresUserApproval).toBe(true);
    expect(result.reason).toContain("approval");
  });

  it("returns execution path for auto mode", () => {
    const result = evaluatePolicy(makePolicy({ autonomyMode: "auto" }), makeAction());
    expect(result.status).toBe("ok");
    expect(result.requiresUserApproval).toBe(false);
  });
});
