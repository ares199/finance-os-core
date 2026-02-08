import type { Permission } from "@/core/plugin/types";
import { loadInstalledModules } from "@/core/permissions/store";

export function isPermissionGranted(moduleId: string, permission: Permission): boolean {
  const installed = loadInstalledModules();
  const module = installed[moduleId];
  if (!module || !module.enabled) {
    return false;
  }

  return module.grantedPermissions.includes(permission);
}
