import type { ModuleManifest, ModuleRoute, ModuleWidget } from "@/core/plugin/types";
import {
  loadInstalledModules,
  saveInstalledModules,
  type InstalledModule,
} from "@/core/permissions/store";

export interface PlatformModule {
  manifest: ModuleManifest;
  installed: InstalledModule | null;
  isCore: boolean;
}

export interface PlatformLoadResult {
  modules: PlatformModule[];
  routes: ModuleRoute[];
  widgets: ModuleWidget[];
}

const isCoreModule = (manifest: ModuleManifest) => manifest.id.startsWith("core.");

function ensureCoreModulesInstalled(catalog: ModuleManifest[]) {
  const installed = loadInstalledModules();
  let changed = false;

  catalog.forEach((manifest) => {
    if (!isCoreModule(manifest)) {
      return;
    }
    if (!installed[manifest.id]) {
      installed[manifest.id] = {
        id: manifest.id,
        enabled: true,
        grantedPermissions: manifest.requestedPermissions,
        installedAt: Date.now(),
      };
      changed = true;
    }
  });

  if (changed) {
    saveInstalledModules(installed);
  }

  return installed;
}

export function loadPlatform(catalog: ModuleManifest[]): PlatformLoadResult {
  const installed = ensureCoreModulesInstalled(catalog);

  const modules: PlatformModule[] = catalog.map((manifest) => {
    const installedModule = installed[manifest.id] ?? null;
    return {
      manifest,
      installed: installedModule,
      isCore: isCoreModule(manifest),
    };
  });

  const routes = modules
    .filter((module) => module.installed?.enabled)
    .flatMap((module) => module.manifest.routes ?? []);

  const widgets = modules
    .filter((module) => module.installed?.enabled)
    .flatMap((module) => module.manifest.widgets ?? []);

  return { modules, routes, widgets };
}
