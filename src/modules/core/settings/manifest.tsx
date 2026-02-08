import { Settings } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import SettingsPage from "@/pages/Settings";

export const settingsModule: ModuleManifest = {
  id: "core.settings",
  name: "Settings",
  version: "1.0.0",
  risk: "low",
  description: "Configure account and platform preferences.",
  requestedPermissions: ["read"],
  capabilities: ["settings"],
  routes: [
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
      element: <SettingsPage />,
    },
  ],
};
