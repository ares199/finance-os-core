import type { DashboardMetrics } from "@/core/dashboard/metrics";
import type { PolicyState } from "@/core/policy/types";

interface SuggestionContext {
  metrics: DashboardMetrics;
  policy: PolicyState;
  hasTradeEnabledModule: boolean;
}

function toPct(value: number) {
  return `${Math.round(value)}%`;
}

export function generateDashboardSuggestions(context: SuggestionContext): string[] {
  const { metrics, policy, hasTradeEnabledModule } = context;
  const suggestions: string[] = [];

  if (policy.autonomyMode === "suggest") {
    suggestions.push("Suggest mode is active: FinanceOS will surface ideas continuously, but you remain the final decision maker.");
  }

  if (!hasTradeEnabledModule) {
    suggestions.push("No trade-enabled module is installed, so suggestions remain advisory only and cannot auto-execute trades.");
  }

  if (metrics.riskScore >= 70 || metrics.riskLabel === "High") {
    suggestions.push(
      `Risk score is ${metrics.riskScore}/100 (${metrics.riskLabel}). Consider reducing concentration and crypto exposure before adding new positions.`
    );
  }

  if (metrics.netWorth > 0) {
    const cashRatio = (metrics.cashBalance / metrics.netWorth) * 100;
    if (cashRatio < 10) {
      suggestions.push(`Cash buffer is low at about ${toPct(cashRatio)} of net worth. Keep a higher reserve for volatility and fees.`);
    }
  }

  if (!policy.allowLeverage) {
    suggestions.push("Leverage is disabled by policy, which helps cap downside during volatile sessions.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Portfolio posture looks stable. Continue monitoring risk, liquidity, and connector health.");
  }

  return suggestions.slice(0, 4);
}
