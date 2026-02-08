import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePlatform } from "@/core/plugin/PlatformContext";
import { installModule, uninstallModule } from "@/core/plugin/registry";
import type { Permission } from "@/core/plugin/types";

const riskConfig = {
  low: { color: "bg-success/15 text-success", icon: ShieldCheck, label: "Low" },
  medium: { color: "bg-warning/15 text-warning", icon: AlertTriangle, label: "Medium" },
  high: { color: "bg-destructive/15 text-destructive", icon: ShieldAlert, label: "High" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ModuleStore() {
  const { platform, refresh } = usePlatform();
  const [permDialogId, setPermDialogId] = useState<string | null>(null);

  const selectedModule = useMemo(
    () => platform.modules.find((module) => module.manifest.id === permDialogId) ?? null,
    [platform.modules, permDialogId]
  );

  const permissionLabels: Record<Permission, string> = {
    read: "Read data",
    suggest: "Suggest actions",
    trade: "Execute trades",
    move_funds: "Move funds",
  };

  const modules = platform.modules;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Module Store</h1>
        <p className="text-sm text-muted-foreground">Extend FinanceOS with installable modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((module) => {
          const { manifest, installed, isCore } = module;
          const rc = riskConfig[manifest.risk];
          const RiskIcon = rc.icon;
          const isInstalled = Boolean(installed);
          return (
            <motion.div key={manifest.id} variants={item} className="finance-card flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold text-foreground">{manifest.name}</div>
                <Badge className={`${rc.color} border-0 text-[10px] gap-1`}>
                  <RiskIcon className="h-3 w-3" /> {rc.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4 flex-1">{manifest.description}</p>
              {isCore ? (
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" disabled>
                  Core Module
                </Button>
              ) : isInstalled ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    uninstallModule(manifest.id);
                    refresh();
                  }}
                >
                  <Trash2 className="h-3 w-3" /> Uninstall
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setPermDialogId(manifest.id)}
                >
                  <Download className="h-3 w-3" /> Install
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!selectedModule} onOpenChange={() => setPermDialogId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Permission Request</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{selectedModule?.manifest.name}</strong> requests the following permissions:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-2">
            {selectedModule?.manifest.requestedPermissions.map((permission) => (
              <div key={permission} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{permissionLabels[permission]}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPermDialogId(null)}>Deny</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (selectedModule) {
                  installModule(selectedModule.manifest.id, selectedModule.manifest.requestedPermissions);
                  refresh();
                }
                setPermDialogId(null);
              }}
            >
              Allow & Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
