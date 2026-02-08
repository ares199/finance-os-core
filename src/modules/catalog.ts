import type { ModuleManifest } from "@/core/plugin/types";
import { auditModule } from "@/modules/core/audit/manifest";
import { automationsModule } from "@/modules/core/automations/manifest";
import { connectorsModule } from "@/modules/core/connectors/manifest";
import { dashboardModule } from "@/modules/core/dashboard/manifest";
import { riskModule } from "@/modules/core/risk/manifest";
import { settingsModule } from "@/modules/core/settings/manifest";
import { storeModule } from "@/modules/core/store/manifest";

export const moduleCatalog: ModuleManifest[] = [
  dashboardModule,
  connectorsModule,
  riskModule,
  automationsModule,
  auditModule,
  storeModule,
  settingsModule,
  {
    id: "market.dca",
    name: "DCA Bot",
    version: "0.9.0",
    risk: "low",
    description: "Automated dollar-cost averaging for any asset.",
    requestedPermissions: ["read", "suggest"],
    capabilities: ["automation", "dca"],
  },
  {
    id: "options.tracker",
    name: "Options Tracker",
    version: "0.4.0",
    risk: "low",
    description: "Track options positions and greeks in real-time.",
    requestedPermissions: ["read"],
    capabilities: ["options", "analytics"],
  },
  {
    id: "risk.leverage",
    name: "Leverage Manager",
    version: "0.3.0",
    risk: "high",
    description: "Manage margin and leveraged positions across brokers.",
    requestedPermissions: ["read", "trade"],
    capabilities: ["leverage", "risk"],
  },
  {
    id: "tax.optimizer",
    name: "Tax Optimizer",
    version: "0.5.1",
    risk: "medium",
    description: "Automated tax-loss harvesting and gain deferral.",
    requestedPermissions: ["read", "suggest"],
    capabilities: ["tax", "optimization"],
  },
  {
    id: "sentiment.scanner",
    name: "Sentiment Scanner",
    version: "0.6.2",
    risk: "low",
    description: "AI-powered market sentiment from news and social media.",
    requestedPermissions: ["read"],
    capabilities: ["sentiment", "signals"],
  },
  {
    id: "arbitrage.spotter",
    name: "Arbitrage Spotter",
    version: "0.7.0",
    risk: "medium",
    description: "Cross-exchange arbitrage opportunity detection.",
    requestedPermissions: ["read", "suggest"],
    capabilities: ["arbitrage", "signals"],
  },
];
