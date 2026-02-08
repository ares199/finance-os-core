import { LayoutDashboard } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import Dashboard from "@/pages/Dashboard";

export const dashboardModule: ModuleManifest = {
  id: "core.dashboard",
  name: "Dashboard",
  version: "1.0.0",
  risk: "low",
  description: "Primary overview of portfolio and insights.",
  requestedPermissions: ["read"],
  capabilities: ["overview"],
  routes: [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      element: <Dashboard />,
    },
  ],
};
