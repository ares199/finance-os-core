import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type RiskLevel = "low" | "medium" | "high";

export type Permission = "read" | "suggest" | "trade" | "move_funds";

export interface ModuleRoute {
  path: string;
  label: string;
  icon?: LucideIcon;
  element: ReactNode;
}

export interface ModuleWidget {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  defaultSize?: {
    w: number;
    h: number;
  };
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  risk: RiskLevel;
  description?: string;
  requestedPermissions: Permission[];
  capabilities: string[];
  routes?: ModuleRoute[];
  widgets?: ModuleWidget[];
  subscribesTo?: string[];
}
