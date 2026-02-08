import type { Permission } from "@/core/plugin/types";

export const INSTALLED_MODULES_KEY = "financeos.installedModules.v1";

export interface InstalledModule {
  id: string;
  enabled: boolean;
  grantedPermissions: Permission[];
  installedAt: number;
}

export type InstalledModuleMap = Record<string, InstalledModule>;

export function loadInstalledModules(): InstalledModuleMap {
  const raw = localStorage.getItem(INSTALLED_MODULES_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as InstalledModuleMap;
  } catch {
    return {};
  }
}

export function saveInstalledModules(map: InstalledModuleMap) {
  localStorage.setItem(INSTALLED_MODULES_KEY, JSON.stringify(map));
}
