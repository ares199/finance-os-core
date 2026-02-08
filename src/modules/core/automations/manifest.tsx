import { Workflow } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import Automations from "@/pages/Automations";

export const automationsModule: ModuleManifest = {
  id: "core.automations",
  name: "Automations",
  version: "1.0.0",
  risk: "low",
  description: "Build and monitor automation workflows.",
  requestedPermissions: ["read"],
  capabilities: ["automations"],
  routes: [
    {
      path: "/automations",
      label: "Automations",
      icon: Workflow,
      element: <Automations />,
    },
  ],
};
