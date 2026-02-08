import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventBus, Events } from "@/core/events/bus";
import { getBinanceSnapshotSanitized } from "@/core/brain/snapshot";
import { listReports } from "@/core/brain/store";
import type { CEOReport } from "@/core/brain/types";
import { runCeoAiReview } from "@/core/brain/ceoAi";
import { OpenAIClient } from "@/core/llm/providers/openai";
import { getLlmErrorMessage } from "@/core/llm/errors";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Never";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function CeoAiWidget() {
  const [snapshot, setSnapshot] = useState(() => getBinanceSnapshotSanitized());
  const [reports, setReports] = useState(() => listReports());
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => setSnapshot(getBinanceSnapshotSanitized());
    eventBus.on(Events.DATAHUB_UPDATED, handleUpdate);
    return () => eventBus.off(Events.DATAHUB_UPDATED, handleUpdate);
  }, []);

  const latestReport: CEOReport | null = useMemo(() => reports[0] ?? null, [reports]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const client = new OpenAIClient();
      await runCeoAiReview(client);
      setReports(listReports());
    } catch (err) {
      setError(getLlmErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const hasHoldings = snapshot.stats.holdingsCount > 0;

  return (
    <div className="finance-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            CEO Brain (AI)
          </span>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Run AI CEO Review
        </Button>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div>
          Last sync: <span className="text-foreground/70 mono">{formatDateTime(snapshot.lastSyncTs)}</span>
        </div>
        <div>
          Total value: <span className="text-foreground/70 mono">
            {snapshot.totalValueUSDT !== null ? formatCurrency(snapshot.totalValueUSDT) : "--"}
          </span>
        </div>
      </div>

      {!hasHoldings && (
        <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 p-3 text-xs text-muted-foreground">
          No Binance holdings snapshot yet. <Link className="text-primary" to="/connectors">Go to Connectors → Binance → Sync</Link>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {latestReport ? (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Summary</div>
            <div className="text-sm text-foreground/90 mt-1">{latestReport.summary}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Exposures</div>
              <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                {latestReport.exposures.map((item, index) => (
                  <li key={`${item}-${index}`}>• {item}</li>
                ))}
                {latestReport.exposures.length === 0 && <li className="text-muted-foreground">No exposures listed.</li>}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Risks</div>
              <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                {latestReport.risks.map((item, index) => (
                  <li key={`${item}-${index}`}>• {item}</li>
                ))}
                {latestReport.risks.length === 0 && <li className="text-muted-foreground">No risks listed.</li>}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Opportunities</div>
              <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                {latestReport.opportunities.map((item, index) => (
                  <li key={`${item}-${index}`}>• {item}</li>
                ))}
                {latestReport.opportunities.length === 0 && <li className="text-muted-foreground">No opportunities listed.</li>}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommendations</div>
              <ul className="mt-1 space-y-1 text-xs text-foreground/80">
                {latestReport.recommendations.map((item, index) => (
                  <li key={`${item}-${index}`}>• {item}</li>
                ))}
                {latestReport.recommendations.length === 0 && <li className="text-muted-foreground">No recommendations listed.</li>}
              </ul>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Watchlist</div>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-3 gap-2 bg-muted/40 px-3 py-2 text-[11px] uppercase text-muted-foreground">
                <div>Asset</div>
                <div className="col-span-2">Reason</div>
              </div>
              {latestReport.watchlist.length > 0 ? (
                latestReport.watchlist.map((item, index) => (
                  <div key={`${item.asset}-${index}`} className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-foreground/80 border-t border-border">
                    <div className="font-medium text-foreground">{item.asset}</div>
                    <div className="col-span-2">{item.reason}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-muted-foreground">No watchlist entries.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-muted-foreground">No CEO review has been generated yet.</div>
      )}
    </div>
  );
}
