import { getDataHubState } from "@/core/dataHub/store";
import type { Holding } from "@/core/dataHub/types";
import { loadPolicy } from "@/core/policy/store";

const performanceStorageKey = "financeos.dashboard.performance.v1";

const stableAssets = new Set(["USD", "USDT", "USDC", "BUSD", "FDUSD", "TUSD", "DAI"]);

type PerformanceState = {
  baselineNetWorth: number;
  previousNetWorth: number;
  currentNetWorth: number;
  previousCashBalance: number;
  currentCashBalance: number;
  updatedAt: number;
};

export type DashboardMetrics = {
  netWorth: number;
  netWorthChangePct: number;
  cashBalance: number;
  cashBalanceDelta: number;
  portfolioPnl: number;
  portfolioPnlPct: number;
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parsePerformanceState(raw: string | null): PerformanceState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PerformanceState>;
    if (
      typeof parsed.baselineNetWorth !== "number" ||
      typeof parsed.previousNetWorth !== "number" ||
      typeof parsed.currentNetWorth !== "number" ||
      typeof parsed.previousCashBalance !== "number" ||
      typeof parsed.currentCashBalance !== "number" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }

    return parsed as PerformanceState;
  } catch {
    return null;
  }
}

function readPerformanceState(): PerformanceState | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parsePerformanceState(window.localStorage.getItem(performanceStorageKey));
}

function writePerformanceState(state: PerformanceState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(performanceStorageKey, JSON.stringify(state));
}

export function syncDashboardPerformance() {
  const dataHub = getDataHubState();
  const holdings = Object.values(dataHub.holdings).flat();
  const totalNetWorth = Object.values(dataHub.metrics).reduce((sum, metrics) => sum + (metrics.totalValueUSDT ?? 0), 0);
  const totalCashBalance = holdings
    .filter((holding) => stableAssets.has(holding.asset.toUpperCase()))
    .reduce((sum, holding) => sum + resolveHoldingValue(holding), 0);

  if (totalNetWorth <= 0) {
    return;
  }

  const existing = readPerformanceState();

  if (!existing) {
    writePerformanceState({
      baselineNetWorth: totalNetWorth,
      previousNetWorth: totalNetWorth,
      currentNetWorth: totalNetWorth,
      previousCashBalance: totalCashBalance,
      currentCashBalance: totalCashBalance,
      updatedAt: Date.now(),
    });
    return;
  }

  if (existing.currentNetWorth === totalNetWorth) {
    return;
  }

  writePerformanceState({
    baselineNetWorth: existing.baselineNetWorth,
    previousNetWorth: existing.currentNetWorth,
    currentNetWorth: totalNetWorth,
    previousCashBalance: existing.currentCashBalance,
    currentCashBalance: totalCashBalance,
    updatedAt: Date.now(),
  });
}

function resolveHoldingValue(holding: Holding) {
  if (typeof holding.usdtValue === "number" && Number.isFinite(holding.usdtValue)) {
    return holding.usdtValue;
  }

  if (stableAssets.has(holding.asset.toUpperCase())) {
    return holding.total;
  }

  return 0;
}

function buildRiskScore(netWorth: number, cashBalance: number, holdings: Holding[]) {
  const policy = loadPolicy();
  if (netWorth <= 0) {
    return { score: 0, label: "Low" as const };
  }

  const pricedHoldings = holdings
    .map((holding) => ({ ...holding, resolvedValue: resolveHoldingValue(holding) }))
    .filter((holding) => holding.resolvedValue > 0)
    .sort((a, b) => b.resolvedValue - a.resolvedValue);

  const top3Value = pricedHoldings.slice(0, 3).reduce((sum, holding) => sum + holding.resolvedValue, 0);
  const concentrationTop3Pct = (top3Value / netWorth) * 100;

  const nonStableValue = pricedHoldings
    .filter((holding) => !stableAssets.has(holding.asset.toUpperCase()))
    .reduce((sum, holding) => sum + holding.resolvedValue, 0);
  const cryptoAllocationPct = (nonStableValue / netWorth) * 100;
  const cashRatio = cashBalance / netWorth;

  const concentrationRisk = concentrationTop3Pct * 0.45;
  const liquidityRisk = (1 - clamp(cashRatio, 0, 1)) * 20;
  const policyPenalty =
    (cryptoAllocationPct > policy.maxCryptoAllocationPct ? 12 : 0) +
    (concentrationTop3Pct > policy.maxPositionSizePct * 3 ? 8 : 0) +
    (policy.allowLeverage ? 10 : 0);

  const score = Math.round(clamp(10 + concentrationRisk + liquidityRisk + policyPenalty, 0, 100));

  if (score < 35) {
    return { score, label: "Low" as const };
  }
  if (score < 70) {
    return { score, label: "Medium" as const };
  }
  return { score, label: "High" as const };
}

export function getDashboardMetrics(): DashboardMetrics {
  const dataHub = getDataHubState();
  const holdings = Object.values(dataHub.holdings).flat();

  const netWorth = Object.values(dataHub.metrics).reduce((sum, metrics) => sum + (metrics.totalValueUSDT ?? 0), 0);

  const cashBalance = holdings
    .filter((holding) => stableAssets.has(holding.asset.toUpperCase()))
    .reduce((sum, holding) => sum + resolveHoldingValue(holding), 0);

  const performance = readPerformanceState();
  const baseline = performance?.baselineNetWorth ?? netWorth;
  const previous = performance?.previousNetWorth ?? netWorth;
  const previousCash = performance?.previousCashBalance ?? cashBalance;

  const portfolioPnl = netWorth - baseline;
  const portfolioPnlPct = baseline > 0 ? (portfolioPnl / baseline) * 100 : 0;
  const cashBalanceDelta = cashBalance - previousCash;
  const netWorthChangePct = previous > 0 ? ((netWorth - previous) / previous) * 100 : 0;

  const risk = buildRiskScore(netWorth, cashBalance, holdings);

  return {
    netWorth,
    netWorthChangePct,
    cashBalance,
    cashBalanceDelta,
    portfolioPnl,
    portfolioPnlPct,
    riskScore: risk.score,
    riskLabel: risk.label,
  };
}
