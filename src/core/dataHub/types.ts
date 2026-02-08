export type ConnectorSyncStatus = "connected" | "disconnected" | "syncing" | "error";

export interface ConnectorState {
  status: ConnectorSyncStatus;
  lastSyncTs?: number;
  error?: string;
}

export interface Holding {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdtValue?: number;
}

export interface ConnectorMetrics {
  totalValueUSDT: number;
}

export interface DataHubState {
  connectors: Record<string, ConnectorState>;
  holdings: Record<string, Holding[]>;
  metrics: Record<string, ConnectorMetrics>;
}
