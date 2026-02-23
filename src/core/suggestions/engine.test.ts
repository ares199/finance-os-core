import { describe, expect, it } from "vitest";
import { generateDashboardSuggestions } from "@/core/suggestions/engine";
import type { DashboardMetrics } from "@/core/dashboard/metrics";
import type { PolicyState } from "@/core/policy/types";

function makeMetrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return {
    netWorth: 100_000,
    netWorthChangePct: 0,
    cashBalance: 15_000,
    cashBalanceDelta: 0,
    portfolioPnl: 0,
    portfolioPnlPct: 0,
    riskScore: 40,
    riskLabel: "Medium",
    ...overrides,
  };
}

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

describe("generateDashboardSuggestions", () => {
  it("includes suggest-mode and no-trade-module guidance", () => {
    const suggestions = generateDashboardSuggestions({
      metrics: makeMetrics(),
      policy: makePolicy({ autonomyMode: "suggest" }),
      hasTradeEnabledModule: false,
    });

    expect(suggestions.some((item) => item.includes("Suggest mode is active"))).toBe(true);
    expect(suggestions.some((item) => item.includes("No trade-enabled module"))).toBe(true);
  });

  it("includes high-risk guidance when score is elevated", () => {
    const suggestions = generateDashboardSuggestions({
      metrics: makeMetrics({ riskScore: 81, riskLabel: "High" }),
      policy: makePolicy(),
      hasTradeEnabledModule: true,
    });

    expect(suggestions.some((item) => item.includes("Risk score is 81/100"))).toBe(true);
  });

  it("includes cash buffer guidance when liquidity is low", () => {
    const suggestions = generateDashboardSuggestions({
      metrics: makeMetrics({ netWorth: 100_000, cashBalance: 3_000 }),
      policy: makePolicy(),
      hasTradeEnabledModule: true,
    });

    expect(suggestions.some((item) => item.includes("Cash buffer is low"))).toBe(true);
  });
});
