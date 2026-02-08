import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { loadPlatform, type PlatformLoadResult } from "@/core/plugin/loader";
import { moduleCatalog } from "@/modules/catalog";

interface PlatformContextValue {
  platform: PlatformLoadResult;
  refresh: () => void;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<PlatformLoadResult>(() => loadPlatform(moduleCatalog));

  const refresh = useCallback(() => {
    setPlatform(loadPlatform(moduleCatalog));
  }, []);

  const value = useMemo(() => ({ platform, refresh }), [platform, refresh]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider.");
  }
  return context;
}
