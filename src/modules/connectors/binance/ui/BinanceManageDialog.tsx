import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2Off, RefreshCw, Settings, ShieldAlert, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventBus, Events } from "@/core/events/bus";
import { getConnectorState } from "@/core/dataHub/store";
import {
  BINANCE_CONNECTOR_ID,
  clearBinanceKeys,
  getBinanceKeys,
  isBinanceConnected,
  saveBinanceKeys,
  syncBinance,
  testBinanceConnection,
} from "@/modules/connectors/binance/service";

interface BinanceManageDialogProps {
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BinanceManageDialog({ disabled, open, onOpenChange }: BinanceManageDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectorState, setConnectorState] = useState(() => getConnectorState(BINANCE_CONNECTOR_ID));

  useEffect(() => {
    const handleUpdate = () => setConnectorState(getConnectorState(BINANCE_CONNECTOR_ID));
    eventBus.on(Events.DATAHUB_UPDATED, handleUpdate);
    return () => eventBus.off(Events.DATAHUB_UPDATED, handleUpdate);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const keys = getBinanceKeys();
    setApiKey(keys?.apiKey ?? "");
    setApiSecret(keys?.apiSecret ?? "");
    setFeedback(null);
  }, [open]);

  const statusLabel = useMemo(() => {
    if (connectorState?.status === "syncing") {
      return "Syncing";
    }
    if (connectorState?.status === "error") {
      return "Error";
    }
    return isBinanceConnected() ? "Connected" : "Disconnected";
  }, [connectorState?.status]);

  const canAct = !disabled && apiKey.trim() && apiSecret.trim();

  const handleTest = async () => {
    setFeedback(null);
    if (!canAct) {
      setFeedback({ type: "error", message: "Enter API key and secret first." });
      return;
    }
    setIsTesting(true);
    saveBinanceKeys(apiKey.trim(), apiSecret.trim());
    const result = await testBinanceConnection();
    setIsTesting(false);
    if (result.ok) {
      setFeedback({ type: "success", message: "Connection successful." });
    } else {
      setFeedback({ type: "error", message: result.error ?? "Connection failed." });
    }
  };

  const handleSync = async () => {
    setFeedback(null);
    if (!canAct) {
      setFeedback({ type: "error", message: "Enter API key and secret first." });
      return;
    }
    setIsSyncing(true);
    saveBinanceKeys(apiKey.trim(), apiSecret.trim());
    try {
      await syncBinance();
      setFeedback({ type: "success", message: "Sync completed." });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Sync failed." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    clearBinanceKeys();
    setApiKey("");
    setApiSecret("");
    setFeedback({ type: "success", message: "Disconnected and cleared local keys." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" disabled={disabled}>
          <Settings className="h-3 w-3" /> Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Binance Connector</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {disabled && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
              Install and enable the Binance module in the Module Store to connect.
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-foreground">{statusLabel}</span>
          </div>
          {connectorState?.error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5" />
              <span>{connectorState.error}</span>
            </div>
          )}
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="binance-api-key">API Key</Label>
              <Input
                id="binance-api-key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your Binance API key"
                disabled={disabled}
              />
              <p className="text-[11px] text-muted-foreground">Stored locally only for this MVP.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="binance-api-secret">API Secret</Label>
              <Input
                id="binance-api-secret"
                type="password"
                value={apiSecret}
                onChange={(event) => setApiSecret(event.target.value)}
                placeholder="Paste your Binance API secret"
                disabled={disabled}
              />
              <p className="text-[11px] text-muted-foreground">Stored locally only for this MVP.</p>
            </div>
          </div>
          {feedback && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                feedback.type === "success"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={handleTest}
            disabled={!canAct || isTesting}
          >
            {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <TestTube2 className="h-3.5 w-3.5" />}
            Test Connection
          </Button>
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSync}
            disabled={!canAct || isSyncing}
          >
            {isSyncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Sync Now
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={handleDisconnect}
            disabled={disabled || (!apiKey && !apiSecret && !isBinanceConnected())}
          >
            <Link2Off className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
