import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { auditStore } from "@/core/audit/auditStore";
import { loadPolicy, savePolicy } from "@/core/policy/store";
import type { AutonomyMode, PolicyState } from "@/core/policy/types";

const autonomyModes = [
  { id: "readonly", label: "Read-Only", desc: "View only, no actions" },
  { id: "suggest", label: "Suggest", desc: "AI suggests, you decide" },
  { id: "confirm", label: "Confirm", desc: "AI acts after your approval" },
  { id: "auto", label: "Auto (within rules)", desc: "AI acts within your risk rules" },
];

export default function RulesRisk() {
  const [policy, setPolicy] = useState<PolicyState>(() => loadPolicy());
  const [killSwitchOpen, setKillSwitchOpen] = useState(false);

  const updatePolicy = useCallback((updates: Partial<PolicyState>, title: string, description?: string) => {
    setPolicy((current) => {
      const nextPolicy = { ...current, ...updates };
      savePolicy(nextPolicy);
      auditStore.append({
        id: crypto.randomUUID(),
        ts: Date.now(),
        level: "info",
        title,
        description,
        actor: "User",
        data: updates,
      });
      return nextPolicy;
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rules & Risk</h1>
        <p className="text-sm text-muted-foreground">Configure your autonomy level and risk parameters</p>
      </div>

      {/* Autonomy Mode */}
      <div className="finance-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Autonomy Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {autonomyModes.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                updatePolicy(
                  { autonomyMode: m.id as AutonomyMode },
                  "Autonomy mode updated",
                  `Set autonomy mode to ${m.label}.`
                )
              }
              className={`rounded-lg border p-4 text-left transition-all ${
                policy.autonomyMode === m.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className={`text-sm font-medium ${policy.autonomyMode === m.id ? "text-primary" : "text-foreground"}`}>
                {m.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Sliders */}
      <div className="finance-card space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Risk Parameters</h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Daily Loss</span>
            <span className="mono text-foreground font-medium">{policy.maxDailyLossPct}%</span>
          </div>
          <Slider
            value={[policy.maxDailyLossPct]}
            onValueChange={([value]) => setPolicy((prev) => ({ ...prev, maxDailyLossPct: value }))}
            onValueCommit={([value]) =>
              updatePolicy({ maxDailyLossPct: value }, "Risk policy updated", `Max daily loss set to ${value}%.`)
            }
            max={20}
            step={1}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Position Size</span>
            <span className="mono text-foreground font-medium">{policy.maxPositionSizePct}%</span>
          </div>
          <Slider
            value={[policy.maxPositionSizePct]}
            onValueChange={([value]) => setPolicy((prev) => ({ ...prev, maxPositionSizePct: value }))}
            onValueCommit={([value]) =>
              updatePolicy(
                { maxPositionSizePct: value },
                "Risk policy updated",
                `Max position size set to ${value}%.`
              )
            }
            max={50}
            step={1}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Crypto Allocation</span>
            <span className="mono text-foreground font-medium">{policy.maxCryptoAllocationPct}%</span>
          </div>
          <Slider
            value={[policy.maxCryptoAllocationPct]}
            onValueChange={([value]) => setPolicy((prev) => ({ ...prev, maxCryptoAllocationPct: value }))}
            onValueCommit={([value]) =>
              updatePolicy(
                { maxCryptoAllocationPct: value },
                "Risk policy updated",
                `Max crypto allocation set to ${value}%.`
              )
            }
            max={100}
            step={5}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-foreground">Leverage</div>
            <div className="text-xs text-muted-foreground">Allow leveraged positions</div>
          </div>
          <Switch
            checked={policy.allowLeverage}
            onCheckedChange={(checked) =>
              updatePolicy(
                { allowLeverage: checked },
                "Risk policy updated",
                checked ? "Leverage enabled." : "Leverage disabled."
              )
            }
          />
        </div>
      </div>

      {/* Kill Switch */}
      <div className="finance-card border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3 mb-4">
          <AlertOctagon className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Emergency Kill Switch</h3>
            <p className="text-xs text-muted-foreground">Instantly halt all automated trading and close open orders</p>
          </div>
        </div>
        <Button
          onClick={() => setKillSwitchOpen(true)}
          className="kill-switch-btn"
        >
          <ShieldAlert className="h-5 w-5 mr-2" />
          KILL SWITCH
        </Button>
      </div>

      <Dialog open={killSwitchOpen} onOpenChange={setKillSwitchOpen}>
        <DialogContent className="bg-card border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" /> Confirm Kill Switch
            </DialogTitle>
            <DialogDescription>
              This will immediately cancel all pending orders, halt all automations, and switch to read-only mode. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setKillSwitchOpen(false)}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                updatePolicy(
                  { killSwitch: true, autonomyMode: "readonly" },
                  "Kill switch activated",
                  "All automation halted. Autonomy set to read-only."
                );
                setKillSwitchOpen(false);
              }}
            >
              Activate Kill Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
