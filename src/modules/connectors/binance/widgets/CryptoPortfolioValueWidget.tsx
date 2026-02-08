import { useEffect, useMemo, useState } from "react";
import { Coins, RefreshCw } from "lucide-react";
import { eventBus, Events } from "@/core/events/bus";
import { getConnectorHoldings, getConnectorMetrics, getConnectorState } from "@/core/dataHub/store";
import { BINANCE_CONNECTOR_ID } from "@/modules/connectors/binance/service";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRelativeTime(ts?: number) {
  if (!ts) {
    return "Never";
  }
  const diffMs = Date.now() - ts;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function CryptoPortfolioValueWidget() {
  const [metrics, setMetrics] = useState(() => getConnectorMetrics(BINANCE_CONNECTOR_ID));
  const [holdings, setHoldings] = useState(() => getConnectorHoldings(BINANCE_CONNECTOR_ID));
  const [connectorState, setConnectorState] = useState(() => getConnectorState(BINANCE_CONNECTOR_ID));

  useEffect(() => {
    const handleUpdate = () => {
      setMetrics(getConnectorMetrics(BINANCE_CONNECTOR_ID));
      setHoldings(getConnectorHoldings(BINANCE_CONNECTOR_ID));
      setConnectorState(getConnectorState(BINANCE_CONNECTOR_ID));
    };
    eventBus.on(Events.DATAHUB_UPDATED, handleUpdate);
    return () => eventBus.off(Events.DATAHUB_UPDATED, handleUpdate);
  }, []);

  const totalValue = metrics?.totalValueUSDT ?? 0;

  const topHoldings = useMemo(() => {
    return [...holdings]
      .filter((holding) => (holding.usdtValue ?? 0) > 0)
      .sort((a, b) => (b.usdtValue ?? 0) - (a.usdtValue ?? 0))
      .slice(0, 5);
  }, [holdings]);

  return (
    <div className="finance-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Crypto Portfolio Value
          </span>
        </div>
        {connectorState?.status === "syncing" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="text-2xl font-bold text-foreground mono">
        {totalValue > 0 ? formatCurrency(totalValue) : "--"}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Last sync: <span className="text-foreground/70 mono">{formatRelativeTime(connectorState?.lastSyncTs)}</span>
      </div>
      {topHoldings.length > 0 ? (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground">Top Holdings</div>
          <div className="space-y-1">
            {topHoldings.map((holding) => (
              <div key={holding.asset} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{holding.asset}</span>
                <span className="text-muted-foreground mono">
                  {formatCurrency(holding.usdtValue ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-muted-foreground">
          Connect and sync Binance to see portfolio holdings.
        </div>
      )}
    </div>
  );
}
