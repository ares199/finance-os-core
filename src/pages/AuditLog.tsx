import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, X } from "lucide-react";
import { auditStore } from "@/core/audit/auditStore";
import type { AuditEntry } from "@/core/audit/types";
import { eventBus, Events } from "@/core/events/bus";

const levelConfig = {
  info: { color: "text-primary", icon: ShieldCheck },
  warning: { color: "text-warning", icon: AlertTriangle },
  error: { color: "text-destructive", icon: X },
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>(() => auditStore.list());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleAppend = () => {
      setEntries(auditStore.list());
    };
    eventBus.on(Events.AUDIT_APPENDED, handleAppend);
    return () => {
      eventBus.off(Events.AUDIT_APPENDED, handleAppend);
    };
  }, []);

  const selected = entries.find((entry) => entry.id === selectedId) ?? null;

  const selectedDetails = useMemo(() => {
    if (!selected) {
      return [];
    }

    const detailEntries: Array<{ label: string; value: string }> = [
      { label: "Summary", value: selected.title },
      { label: "Actor", value: selected.actor },
    ];

    if (selected.description) {
      detailEntries.push({ label: "Details", value: selected.description });
    }

    if (selected.moduleId) {
      detailEntries.push({ label: "Module", value: selected.moduleId });
    }

    if (selected.data && Object.keys(selected.data).length > 0) {
      detailEntries.push({ label: "Data", value: JSON.stringify(selected.data, null, 2) });
    }

    return detailEntries;
  }, [selected]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Complete timeline of actions and decisions</p>
      </div>

      <div className="flex gap-4">
        {/* Timeline */}
        <div className="flex-1 space-y-1">
          {entries.length === 0 ? (
            <div className="finance-card text-center text-sm text-muted-foreground">No audit entries yet.</div>
          ) : (
            entries.map((log) => {
            const config = levelConfig[log.level];
            const Icon = config.icon;
            const date = new Date(log.ts);
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
                  <div className="text-sm font-medium text-foreground truncate">{log.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.actor} · {date.toLocaleDateString()} {date.toLocaleTimeString()}
                  </div>
                </div>
              </button>
            );
          })
          )}
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
                  {selectedDetails.map((detail) => (
                    <div key={detail.label}>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {detail.label}
                      </div>
                      <div className="text-foreground/80 whitespace-pre-wrap">{detail.value}</div>
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
