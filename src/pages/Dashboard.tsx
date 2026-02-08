import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BarChart3,
  Shield,
  AlertTriangle,
  Sparkles,
  Plus,
  Grip,
  Save,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/core/plugin/PlatformContext";

const widgets = [
  {
    title: "Net Worth",
    value: "$1,284,320",
    change: "+2.4%",
    positive: true,
    icon: DollarSign,
    span: "col-span-1",
  },
  {
    title: "Cash Balance",
    value: "$342,100",
    change: "+$12,400",
    positive: true,
    icon: Wallet,
    span: "col-span-1",
  },
  {
    title: "Portfolio P&L",
    value: "+$48,230",
    change: "+3.9% MTD",
    positive: true,
    icon: BarChart3,
    span: "col-span-1",
  },
  {
    title: "Risk Score",
    value: "Medium",
    change: "Score: 62/100",
    positive: false,
    icon: Shield,
    span: "col-span-1",
    isRisk: true,
  },
];

const alerts = [
  { text: "BTC dropped 5.2% — Stop-loss triggered on position #412", type: "warning" },
  { text: "Monthly rebalance due in 3 days", type: "info" },
  { text: "New connector available: Interactive Brokers", type: "info" },
];

const aiSuggestions = [
  "Consider reducing crypto allocation from 32% to 25% based on volatility trends",
  "Your EUR/USD hedge is expiring in 48h — review or roll forward",
  "Tax-loss harvesting opportunity detected on TSLA position",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { platform } = usePlatform();
  const moduleWidgets = platform.widgets;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your financial command center</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Edit Layout
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Preset
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Widget
          </Button>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <motion.div key={w.title} variants={item} className="finance-card group cursor-grab">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{w.title}</span>
              <div className="flex items-center gap-1">
                <Grip className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <w.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mono">{w.value}</div>
            <div className={`text-xs mt-1 flex items-center gap-1 ${w.isRisk ? "text-warning" : w.positive ? "text-success" : "text-destructive"}`}>
              {!w.isRisk && (w.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
              {w.change}
            </div>
          </motion.div>
        ))}
      </div>

      {moduleWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {moduleWidgets.map((widget) => (
            <motion.div key={widget.id} variants={item}>
              {widget.component}
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <motion.div variants={item} className="finance-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.type === "warning" ? "bg-warning" : "bg-info"}`} />
                <span className="text-sm text-foreground/80">{a.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div variants={item} className="finance-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
                <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground/80">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
