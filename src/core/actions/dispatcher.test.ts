import { beforeEach, describe, expect, it } from "vitest";
import { dispatchAction } from "@/core/actions/dispatcher";
import { savePolicy } from "@/core/policy/store";
import { installModule } from "@/core/plugin/registry";
import { auditStore } from "@/core/audit/auditStore";
import type { ActionRequest } from "@/core/actions/types";

function makeAction(overrides: Partial<ActionRequest> = {}): ActionRequest {
  return {
    id: "action-1",
    ts: Date.now(),
    moduleId: "test.module",
    kind: "trade.market",
    summary: "Buy BTC",
    trade: { symbol: "BTCUSDT", side: "buy", amount: 100 },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  auditStore.clear();
});

describe("dispatchAction", () => {
  it("returns suggested in suggest mode", () => {
    installModule("test.module", ["trade", "suggest"]);
    savePolicy({
      autonomyMode: "suggest",
      maxDailyLossPct: 10,
      maxPositionSizePct: 50,
      maxCryptoAllocationPct: 80,
      allowLeverage: false,
      killSwitch: false,
    });

    const result = dispatchAction(makeAction());
    expect(result.status).toBe("suggested");
  });

  it("returns needs_approval in confirm mode", () => {
    installModule("test.module", ["trade", "suggest"]);
    savePolicy({
      autonomyMode: "confirm",
      maxDailyLossPct: 10,
      maxPositionSizePct: 50,
      maxCryptoAllocationPct: 80,
      allowLeverage: false,
      killSwitch: false,
    });

    const result = dispatchAction(makeAction());
    expect(result.status).toBe("needs_approval");
  });

  it("returns executed in auto mode", () => {
    installModule("test.module", ["trade", "suggest"]);
    savePolicy({
      autonomyMode: "auto",
      maxDailyLossPct: 10,
      maxPositionSizePct: 50,
      maxCryptoAllocationPct: 80,
      allowLeverage: false,
      killSwitch: false,
    });

    const result = dispatchAction(makeAction());
    expect(result.status).toBe("executed");
  });

  it("denies when required permission is missing", () => {
    installModule("test.module", ["suggest"]);
    savePolicy({
      autonomyMode: "auto",
      maxDailyLossPct: 10,
      maxPositionSizePct: 50,
      maxCryptoAllocationPct: 80,
      allowLeverage: false,
      killSwitch: false,
    });

    const result = dispatchAction(makeAction());
    expect(result.status).toBe("denied");
    expect(result.reason).toContain("missing required permissions");
  });
});
