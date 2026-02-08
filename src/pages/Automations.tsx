import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Plus,
  FlaskConical,
  Zap,
  ArrowRight,
  Filter,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const workflows = [
  {
    name: "Auto-Rebalance Portfolio",
    trigger: "Monthly on 1st",
    status: "enabled" as const,
    lastRun: "Jan 1, 2026",
    actions: 3,
  },
  {
    name: "Stop-Loss on Crypto",
    trigger: "Price drop > 5%",
    status: "enabled" as const,
    lastRun: "Feb 5, 2026",
    actions: 2,
  },
  {
    name: "Dividend Reinvestment",
    trigger: "On dividend received",
    status: "paused" as const,
    lastRun: "Dec 15, 2025",
    actions: 1,
  },
  {
    name: "Tax Harvesting Alert",
    trigger: "Loss threshold reached",
    status: "enabled" as const,
    lastRun: "Jan 28, 2026",
    actions: 2,
  },
];

const builderSteps = [
  { label: "Trigger", icon: Zap, desc: "When this happens…" },
  { label: "Conditions", icon: Filter, desc: "If these are true…" },
  { label: "Actions", icon: Play, desc: "Do this…" },
  { label: "Notify", icon: Bell, desc: "Then alert via…" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Automations() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground">Build and manage automated workflows</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Create Workflow
        </Button>
      </div>

      {/* Workflow List */}
      <div className="space-y-3">
        {workflows.map((w) => (
          <motion.div key={w.name} variants={item} className="finance-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{w.name}</span>
                <Badge
                  variant={w.status === "enabled" ? "default" : "secondary"}
                  className={w.status === "enabled" ? "bg-success/15 text-success border-0 text-[10px]" : "text-[10px]"}
                >
                  {w.status === "enabled" ? "Enabled" : "Paused"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Trigger: {w.trigger} · {w.actions} action{w.actions > 1 ? "s" : ""} · Last run: {w.lastRun}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <FlaskConical className="h-3 w-3" /> Simulate
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Play className="h-3 w-3" /> Run Test
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                {w.status === "enabled" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workflow Builder Preview */}
      <motion.div variants={item} className="finance-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Workflow Builder</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {builderSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 flex-1">
              <div className="flex-1 rounded-lg border border-dashed border-border p-4 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <step.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium text-foreground">{step.label}</div>
                <div className="text-[10px] text-muted-foreground">{step.desc}</div>
              </div>
              {i < builderSteps.length - 1 && (
                <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
