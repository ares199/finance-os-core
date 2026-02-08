import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { eventBus, Events } from "@/core/events/bus";
import { getDataHubState } from "@/core/dataHub/store";
import type { ConnectorSyncStatus } from "@/core/dataHub/types";
import { usePlatform } from "@/core/plugin/PlatformContext";
import BinanceManageDialog from "@/modules/connectors/binance/ui/BinanceManageDialog";
import { BINANCE_CONNECTOR_ID, isBinanceConnected } from "@/modules/connectors/binance/service";

const statusConfig = {
  connected: { label: "Connected", class: "status-connected" },
  disconnected: { label: "Disconnected", class: "status-disconnected" },
  syncing: { label: "Syncing", class: "status-syncing" },
  error: { label: "Error", class: "status-disconnected" },
};

const availableConnectors = [
  { name: "Kraken", type: "Exchange" },
  { name: "Fidelity", type: "Broker" },
  { name: "Bank of America", type: "Bank" },
  { name: "MetaMask", type: "Wallet" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

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

export default function Connectors() {
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [dataHubState, setDataHubState] = useState(getDataHubState());
  const { platform } = usePlatform();

  useEffect(() => {
    const handleUpdate = () => setDataHubState(getDataHubState());
    eventBus.on(Events.DATAHUB_UPDATED, handleUpdate);
    return () => eventBus.off(Events.DATAHUB_UPDATED, handleUpdate);
  }, []);

  const binanceModule = platform.modules.find((module) => module.manifest.id === BINANCE_CONNECTOR_ID);
  const binanceEnabled = Boolean(binanceModule?.installed?.enabled);
  const binanceState = dataHubState.connectors[BINANCE_CONNECTOR_ID];
  const binanceStatus: ConnectorSyncStatus =
    binanceState?.status ?? (isBinanceConnected() ? "connected" : "disconnected");
  const binanceLastSync = formatRelativeTime(binanceState?.lastSyncTs);

  const connectors = useMemo(
    () => [
      {
        name: "Binance",
        type: "Exchange",
        status: binanceStatus,
        permissions: ["Read"],
        lastSync: binanceLastSync,
        error: binanceState?.error,
      },
      {
        name: "Chase Bank",
        type: "Bank",
        status: "connected" as const,
        permissions: ["Read"],
        lastSync: "1 hour ago",
      },
      {
        name: "Interactive Brokers",
        type: "Broker",
        status: "syncing" as const,
        permissions: ["Read", "Trade"],
        lastSync: "Syncing…",
      },
      {
        name: "Coinbase",
        type: "Exchange",
        status: "disconnected" as const,
        permissions: ["Read"],
        lastSync: "3 days ago",
      },
      {
        name: "Revolut",
        type: "Bank",
        status: "connected" as const,
        permissions: ["Read"],
        lastSync: "30 min ago",
      },
    ],
    [binanceLastSync, binanceState?.error, binanceStatus]
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Connectors</h1>
          <p className="text-sm text-muted-foreground">Manage your financial data sources</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Add Connector
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add Connector</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {availableConnectors.map((c) => (
                <button
                  key={c.name}
                  className="finance-card text-left hover:border-primary/30 transition-colors"
                >
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.type}</div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground mt-2" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <motion.div key={c.name} variants={item} className="finance-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.type}</div>
              </div>
              <span className={`status-pill ${statusConfig[c.status].class}`}>
                {c.status === "syncing" && <RefreshCw className="h-3 w-3 animate-spin" />}
                {statusConfig[c.status].label}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Permissions:</span>
                <div className="flex gap-1">
                  {c.permissions.map((p) => (
                    <span key={p} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last sync: <span className="text-foreground/70 mono">{c.lastSync}</span>
              </div>
            </div>
            {c.name === "Binance" ? (
              <div className="space-y-2">
                <BinanceManageDialog open={manageOpen} onOpenChange={setManageOpen} disabled={!binanceEnabled} />
                {!binanceEnabled && (
                  <div className="text-[11px] text-muted-foreground">
                    Install the Binance module from the Module Store to enable syncing.
                  </div>
                )}
                {c.error && (
                  <div className="text-[11px] text-destructive">
                    Last error: {c.error}
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Settings className="h-3 w-3" /> Manage
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
