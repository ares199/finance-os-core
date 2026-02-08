import { Plug } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import Connectors from "@/pages/Connectors";

export const connectorsModule: ModuleManifest = {
  id: "core.connectors",
  name: "Connectors",
  version: "1.0.0",
  risk: "low",
  description: "Manage data connections and brokers.",
  requestedPermissions: ["read"],
  capabilities: ["connectors"],
  routes: [
    {
      path: "/connectors",
      label: "Connectors",
      icon: Plug,
      element: <Connectors />,
    },
  ],
};
