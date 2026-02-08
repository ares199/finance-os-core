import { ShieldAlert } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import RulesRisk from "@/pages/RulesRisk";

export const riskModule: ModuleManifest = {
  id: "core.risk",
  name: "Rules & Risk",
  version: "1.0.0",
  risk: "low",
  description: "Configure autonomy, risk parameters, and safeguards.",
  requestedPermissions: ["read"],
  capabilities: ["policy"],
  routes: [
    {
      path: "/rules",
      label: "Rules & Risk",
      icon: ShieldAlert,
      element: <RulesRisk />,
    },
  ],
};
