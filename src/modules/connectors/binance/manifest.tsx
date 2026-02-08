import type { ModuleManifest } from "@/core/plugin/types";
import CryptoPortfolioValueWidget from "@/modules/connectors/binance/widgets/CryptoPortfolioValueWidget";

export const binanceConnectorModule: ModuleManifest = {
  id: "connector.binance",
  name: "Binance Connector",
  version: "0.1.0",
  risk: "low",
  description: "Read-only Binance spot balances and portfolio widgets.",
  requestedPermissions: ["read"],
  capabilities: ["CONNECTOR", "WIDGETS"],
  widgets: [
    {
      id: "binance.cryptoPortfolioValue",
      title: "Crypto Portfolio Value",
      description: "Approximate total value from Binance spot balances.",
      component: <CryptoPortfolioValueWidget />,
      defaultSize: { w: 1, h: 1 },
    },
  ],
};
