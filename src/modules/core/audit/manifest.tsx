import { ScrollText } from "lucide-react";
import type { ModuleManifest } from "@/core/plugin/types";
import AuditLog from "@/pages/AuditLog";

export const auditModule: ModuleManifest = {
  id: "core.audit",
  name: "Audit Log",
  version: "1.0.0",
  risk: "low",
  description: "Review platform decisions and activity.",
  requestedPermissions: ["read"],
  capabilities: ["audit"],
  routes: [
    {
      path: "/audit",
      label: "Audit Log",
      icon: ScrollText,
      element: <AuditLog />,
    },
  ],
};
