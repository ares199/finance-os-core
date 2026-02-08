import { useState } from "react";
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

const connectors = [
  {
    name: "Binance",
    type: "Exchange",
    status: "connected" as const,
    permissions: ["Read", "Trade"],
    lastSync: "2 min ago",
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
];

const statusConfig = {
  connected: { label: "Connected", class: "status-connected" },
  disconnected: { label: "Disconnected", class: "status-disconnected" },
  syncing: { label: "Syncing", class: "status-syncing" },
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

export default function Connectors() {
  const [open, setOpen] = useState(false);

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
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Settings className="h-3 w-3" /> Manage
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
