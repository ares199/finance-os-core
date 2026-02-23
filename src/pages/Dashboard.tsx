import { useEffect, useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { eventBus, Events } from "@/core/events/bus";
import { getDashboardMetrics, syncDashboardPerformance } from "@/core/dashboard/metrics";
import { usePlatform } from "@/core/plugin/PlatformContext";

type MetricWidgetTemplate = {
  title: string;
  icon: typeof DollarSign;
  span: string;
  isRisk?: boolean;
};

type MetricWidget = MetricWidgetTemplate & {
  value: string;
  change: string;
  positive: boolean;
};

const layoutStorageKey = "dashboard:metric-widget-order:v1";

const widgetTemplates: MetricWidgetTemplate[] = [
  { title: "Net Worth", icon: DollarSign, span: "col-span-1" },
  { title: "Cash Balance", icon: Wallet, span: "col-span-1" },
  { title: "Portfolio P&L", icon: BarChart3, span: "col-span-1" },
  { title: "Risk Score", icon: Shield, span: "col-span-1", isRisk: true },
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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const signedCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
  maximumFractionDigits: 0,
});

const signedPercentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 1,
});

const moveItem = (items: string[], fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);

  if (!moved) {
    return items;
  }

  next.splice(toIndex, 0, moved);
  return next;
};

const readStoredOrder = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(layoutStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) {
      return null;
    }

    return parsed as string[];
  } catch {
    return null;
  }
};

const buildWidgetOrder = (storedOrder: string[] | null) => {
  const availableTitles = widgetTemplates.map((widget) => widget.title);

  if (!storedOrder) {
    return availableTitles;
  }

  const validStored = storedOrder.filter((title) => availableTitles.includes(title));
  const missingTitles = availableTitles.filter((title) => !validStored.includes(title));

  return [...validStored, ...missingTitles];
};

function toMetricWidgets(): MetricWidget[] {
  const values = getDashboardMetrics();

  const byTitle: Record<string, Omit<MetricWidget, "icon" | "span" | "isRisk">> = {
    "Net Worth": {
      title: "Net Worth",
      value: values.netWorth > 0 ? currencyFormatter.format(values.netWorth) : "--",
      change: signedPercentFormatter.format(values.netWorthChangePct / 100),
      positive: values.netWorthChangePct >= 0,
    },
    "Cash Balance": {
      title: "Cash Balance",
      value: values.cashBalance > 0 ? currencyFormatter.format(values.cashBalance) : "--",
      change: signedCurrencyFormatter.format(values.cashBalanceDelta),
      positive: values.cashBalanceDelta >= 0,
    },
    "Portfolio P&L": {
      title: "Portfolio P&L",
      value: signedCurrencyFormatter.format(values.portfolioPnl),
      change: `${signedPercentFormatter.format(values.portfolioPnlPct / 100)} since baseline`,
      positive: values.portfolioPnl >= 0,
    },
    "Risk Score": {
      title: "Risk Score",
      value: values.riskLabel,
      change: `Score: ${values.riskScore}/100`,
      positive: values.riskScore < 70,
    },
  };

  return widgetTemplates.map((template) => ({
    ...template,
    ...byTitle[template.title],
  }));
}

export default function Dashboard() {
  const { platform } = usePlatform();
  const moduleWidgets = platform.widgets;

  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => buildWidgetOrder(readStoredOrder()));
  const [activeWidgetTitles, setActiveWidgetTitles] = useState<string[]>(widgetOrder);
  const [metricWidgetsState, setMetricWidgetsState] = useState<MetricWidget[]>(() => toMetricWidgets());

  useEffect(() => {
    syncDashboardPerformance();
    setMetricWidgetsState(toMetricWidgets());

    const updateMetrics = () => {
      syncDashboardPerformance();
      setMetricWidgetsState(toMetricWidgets());
    };

    eventBus.on(Events.DATAHUB_UPDATED, updateMetrics);
    eventBus.on(Events.POLICY_UPDATED, updateMetrics);

    return () => {
      eventBus.off(Events.DATAHUB_UPDATED, updateMetrics);
      eventBus.off(Events.POLICY_UPDATED, updateMetrics);
    };
  }, []);

  const metricWidgetsByTitle = useMemo(() => {
    return new Map(metricWidgetsState.map((widget) => [widget.title, widget]));
  }, [metricWidgetsState]);

  const metricWidgets = useMemo(() => {
    return activeWidgetTitles
      .map((title) => metricWidgetsByTitle.get(title))
      .filter((widget): widget is MetricWidget => Boolean(widget));
  }, [activeWidgetTitles, metricWidgetsByTitle]);

  const hiddenWidgetTitles = widgetOrder.filter((title) => !activeWidgetTitles.includes(title));

  const handleMoveWidget = (title: string, direction: "left" | "right") => {
    const currentIndex = activeWidgetTitles.indexOf(title);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    const nextActiveTitles = moveItem(activeWidgetTitles, currentIndex, nextIndex);

    if (nextActiveTitles === activeWidgetTitles) {
      return;
    }

    setActiveWidgetTitles(nextActiveTitles);

    const nextOrder = [
      ...nextActiveTitles,
      ...widgetOrder.filter((widgetTitle) => !nextActiveTitles.includes(widgetTitle)),
    ];

    setWidgetOrder(nextOrder);
  };

  const handleRemoveWidget = (title: string) => {
    if (activeWidgetTitles.length === 1) {
      toast.error("At least one widget must stay on the dashboard.");
      return;
    }

    setActiveWidgetTitles((current) => current.filter((widgetTitle) => widgetTitle !== title));
    toast.success(`${title} was removed from the layout.`);
  };

  const handleAddWidget = () => {
    const firstHiddenTitle = hiddenWidgetTitles[0];

    if (!firstHiddenTitle) {
      toast.info("All available widgets are already on the dashboard.");
      return;
    }

    setActiveWidgetTitles((current) => [...current, firstHiddenTitle]);
    toast.success(`${firstHiddenTitle} was added to the dashboard.`);
  };

  const handleSaveLayout = () => {
    const nextOrder = [
      ...activeWidgetTitles,
      ...widgetOrder.filter((title) => !activeWidgetTitles.includes(title)),
    ];

    setWidgetOrder(nextOrder);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(layoutStorageKey, JSON.stringify(nextOrder));
    }

    setIsEditingLayout(false);
    toast.success("Dashboard layout saved.");
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your financial command center</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setIsEditingLayout((current) => !current)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {isEditingLayout ? "Finish Editing" : "Edit Layout"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSaveLayout}>
            <Save className="h-3.5 w-3.5" /> Save Preset
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddWidget}
          >
            <Plus className="h-3.5 w-3.5" /> Add Widget
          </Button>
        </div>
      </div>

      {isEditingLayout && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          Edit mode is active: move cards left/right, remove cards, then click <span className="font-semibold">Save Preset</span>.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricWidgets.map((w, index) => (
          <motion.div key={w.title} variants={item} className="finance-card group cursor-grab">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{w.title}</span>
              <div className="flex items-center gap-1">
                {isEditingLayout && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMoveWidget(w.title, "left")}
                      disabled={index === 0}
                      aria-label={`Move ${w.title} left`}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMoveWidget(w.title, "right")}
                      disabled={index === metricWidgets.length - 1}
                      aria-label={`Move ${w.title} right`}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveWidget(w.title)}
                      aria-label={`Remove ${w.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Grip className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <w.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mono">{w.value}</div>
            <div
              className={`text-xs mt-1 flex items-center gap-1 ${
                w.isRisk ? "text-warning" : w.positive ? "text-success" : "text-destructive"
              }`}
            >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
