import { getConnectorHoldings, getConnectorMetrics, getConnectorState } from "@/core/dataHub/store";
import { BINANCE_CONNECTOR_ID } from "@/modules/connectors/binance/service";

export type BinanceSnapshot = {
  ts: string;
  lastSyncTs: string | null;
  totalValueUSDT: number | null;
  holdings: Array<{ asset: string; total: number; usdtValue?: number | null }>;
  topHoldings: Array<{ asset: string; total: number; usdtValue?: number | null }>;
  unpricedAssets: string[];
  stats: {
    holdingsCount: number;
    pricedCount: number;
    unpricedCount: number;
  };
};

export function getBinanceSnapshotSanitized(): BinanceSnapshot {
  const holdings = getConnectorHoldings(BINANCE_CONNECTOR_ID);
  const metrics = getConnectorMetrics(BINANCE_CONNECTOR_ID);
  const connectorState = getConnectorState(BINANCE_CONNECTOR_ID);

  const sanitizedHoldings = holdings.map((holding) => ({
    asset: holding.asset,
    total: holding.total,
    usdtValue: holding.usdtValue ?? null,
  }));

  const pricedHoldings = sanitizedHoldings.filter((holding) => (holding.usdtValue ?? 0) > 0);
  const topHoldings = [...pricedHoldings]
    .sort((a, b) => (b.usdtValue ?? 0) - (a.usdtValue ?? 0))
    .slice(0, 15);

  const unpricedAssets = sanitizedHoldings
    .filter((holding) => !holding.usdtValue)
    .map((holding) => holding.asset);

  const pricedCount = pricedHoldings.length;
  const unpricedCount = sanitizedHoldings.length - pricedCount;

  return {
    ts: new Date().toISOString(),
    lastSyncTs: connectorState?.lastSyncTs ? new Date(connectorState.lastSyncTs).toISOString() : null,
    totalValueUSDT: metrics?.totalValueUSDT ?? null,
    holdings: sanitizedHoldings,
    topHoldings,
    unpricedAssets,
    stats: {
      holdingsCount: sanitizedHoldings.length,
      pricedCount,
      unpricedCount,
    },
  };
}
