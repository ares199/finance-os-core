import { Store } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import ModuleStore from "@/pages/ModuleStore";

export const storeModule: ModuleManifest = {
  id: "core.store",
  name: "Module Store",
  version: "1.0.0",
  risk: "low",
  description: "Browse and manage installable modules.",
  requestedPermissions: ["read"],
  capabilities: ["modules"],
  routes: [
    {
      path: "/modules",
      label: "Module Store",
      icon: Store,
      element: <ModuleStore />,
    },
  ],
};
