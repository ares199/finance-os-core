import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const modules = [
  {
    name: "DCA Bot",
    desc: "Automated dollar-cost averaging for any asset",
    risk: "Low" as const,
    installed: true,
    permissions: ["Read holdings", "Read prices"],
  },
  {
    name: "Options Tracker",
    desc: "Track options positions and greeks in real-time",
    risk: "Low" as const,
    installed: false,
    permissions: ["Read holdings", "Read prices"],
  },
  {
    name: "Leverage Manager",
    desc: "Manage margin and leveraged positions across brokers",
    risk: "High" as const,
    installed: false,
    permissions: ["Read holdings", "Read prices", "Trade access"],
  },
  {
    name: "Tax Optimizer",
    desc: "Automated tax-loss harvesting and gain deferral",
    risk: "Medium" as const,
    installed: false,
    permissions: ["Read holdings", "Read prices", "Trade access (optional)"],
  },
  {
    name: "Sentiment Scanner",
    desc: "AI-powered market sentiment from news and social media",
    risk: "Low" as const,
    installed: true,
    permissions: ["Read prices"],
  },
  {
    name: "Arbitrage Spotter",
    desc: "Cross-exchange arbitrage opportunity detection",
    risk: "Medium" as const,
    installed: false,
    permissions: ["Read holdings", "Read prices"],
  },
];

const riskConfig = {
  Low: { color: "bg-success/15 text-success", icon: ShieldCheck },
  Medium: { color: "bg-warning/15 text-warning", icon: AlertTriangle },
  High: { color: "bg-destructive/15 text-destructive", icon: ShieldAlert },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ModuleStore() {
  const [permDialog, setPermDialog] = useState<typeof modules[0] | null>(null);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Module Store</h1>
        <p className="text-sm text-muted-foreground">Extend FinanceOS with installable modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((m) => {
          const rc = riskConfig[m.risk];
          const RiskIcon = rc.icon;
          return (
            <motion.div key={m.name} variants={item} className="finance-card flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold text-foreground">{m.name}</div>
                <Badge className={`${rc.color} border-0 text-[10px] gap-1`}>
                  <RiskIcon className="h-3 w-3" /> {m.risk}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4 flex-1">{m.desc}</p>
              {m.installed ? (
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" /> Uninstall
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setPermDialog(m)}
                >
                  <Download className="h-3 w-3" /> Install
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!permDialog} onOpenChange={() => setPermDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Permission Request</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{permDialog?.name}</strong> requests the following permissions:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-2">
            {permDialog?.permissions.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{p}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPermDialog(null)}>Deny</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setPermDialog(null)}>
              Allow & Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
