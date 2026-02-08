import { loadInstalledModules, saveInstalledModules, type InstalledModuleMap } from "@/core/permissions/store";
import type { Permission } from "@/core/plugin/types";

export function installModule(moduleId: string, grantedPermissions: Permission[]) {
  const installed = loadInstalledModules();
  installed[moduleId] = {
    id: moduleId,
    enabled: true,
    grantedPermissions,
    installedAt: Date.now(),
  };
  saveInstalledModules(installed);
}

export function uninstallModule(moduleId: string) {
  const installed = loadInstalledModules();
  delete installed[moduleId];
  saveInstalledModules(installed);
}

export function setModuleEnabled(moduleId: string, enabled: boolean) {
  const installed = loadInstalledModules();
  const current = installed[moduleId];
  if (!current) {
    return;
  }
  installed[moduleId] = { ...current, enabled };
  saveInstalledModules(installed);
}

export function getInstalledMap(): InstalledModuleMap {
  return loadInstalledModules();
}
