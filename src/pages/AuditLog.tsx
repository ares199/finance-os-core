import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Bot, User, ShieldCheck, AlertTriangle, X } from "lucide-react";

const logs = [
  {
    id: 1,
    time: "14:32:05",
    date: "Feb 7, 2026",
    actor: "AI Agent",
    action: "Executed stop-loss on BTC position",
    type: "auto" as const,
    detail: {
      summary: "Sold 0.5 BTC at $42,100 due to 5.2% price drop trigger",
      reason: "Stop-loss rule #3 activated: Crypto price drop > 5%",
      policy: "Approved — within auto-execute rules (max loss 5%)",
      outcome: "Position closed. Realized loss: -$2,210",
    },
  },
  {
    id: 2,
    time: "11:15:22",
    date: "Feb 7, 2026",
    actor: "You",
    action: "Approved portfolio rebalance suggestion",
    type: "manual" as const,
    detail: {
      summary: "Rebalanced portfolio to target allocation",
      reason: "Monthly rebalance suggested by AI agent",
      policy: "User-approved action",
      outcome: "3 trades executed. Portfolio aligned to target.",
    },
  },
  {
    id: 3,
    time: "09:00:00",
    date: "Feb 7, 2026",
    actor: "System",
    action: "Daily risk assessment completed",
    type: "system" as const,
    detail: {
      summary: "All positions within risk parameters",
      reason: "Scheduled daily check",
      policy: "No action required",
      outcome: "Risk score: 62/100 (Medium)",
    },
  },
  {
    id: 4,
    time: "22:45:11",
    date: "Feb 6, 2026",
    actor: "AI Agent",
    action: "Suggested tax-loss harvesting on TSLA",
    type: "suggestion" as const,
    detail: {
      summary: "TSLA position down 12% — harvesting opportunity",
      reason: "Unrealized loss of $4,800 detected",
      policy: "Suggest mode — awaiting user approval",
      outcome: "Pending user action",
    },
  },
  {
    id: 5,
    time: "18:30:00",
    date: "Feb 6, 2026",
    actor: "System",
    action: "Connector sync completed: Binance",
    type: "system" as const,
    detail: {
      summary: "Successfully synced 14 positions from Binance",
      reason: "Scheduled sync every 5 minutes",
      policy: "Read-only access",
      outcome: "All data up to date",
    },
  },
];

const typeConfig = {
  auto: { color: "text-primary", icon: Bot },
  manual: { color: "text-success", icon: User },
  system: { color: "text-muted-foreground", icon: ShieldCheck },
  suggestion: { color: "text-warning", icon: AlertTriangle },
};

export default function AuditLog() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = logs.find((l) => l.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Complete timeline of actions and decisions</p>
      </div>

      <div className="flex gap-4">
        {/* Timeline */}
        <div className="flex-1 space-y-1">
          {logs.map((log) => {
            const config = typeConfig[log.type];
            const Icon = config.icon;
            return (
              <button
                key={log.id}
                onClick={() => setSelectedId(log.id)}
                className={`w-full finance-card text-left flex items-start gap-3 transition-all ${
                  selectedId === log.id ? "border-primary/30" : ""
                }`}
              >
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{log.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.actor} · {log.date} {log.time}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 380 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="hidden lg:block shrink-0"
            >
              <div className="finance-card sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Detail</h3>
                  <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  {Object.entries(selected.detail).map(([key, val]) => (
                    <div key={key}>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {key}
                      </div>
                      <div className="text-foreground/80">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
