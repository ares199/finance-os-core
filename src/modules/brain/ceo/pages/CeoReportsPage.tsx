import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { listReports } from "@/core/brain/store";
import type { CEOReport } from "@/core/brain/types";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function CeoReportsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const reports = useMemo(() => listReports(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CEO Brain Reports</h1>
        <p className="text-sm text-muted-foreground">Historical CEO AI reviews for Binance holdings.</p>
      </div>

      {reports.length === 0 ? (
        <div className="finance-card text-sm text-muted-foreground">No reports yet. Run the AI CEO review from the widget.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isOpen = expanded[report.ts] ?? false;
            const ToggleIcon = isOpen ? ChevronDown : ChevronRight;
            return (
              <div key={report.ts} className="finance-card">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [report.ts]: !isOpen,
                    }))
                  }
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{formatDateTime(report.ts)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{report.summary}</div>
                  </div>
                  <ToggleIcon className="h-4 w-4 text-muted-foreground" />
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-3 text-sm text-foreground/80">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Exposures</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        {report.exposures.map((item, index) => (
                          <li key={`${item}-${index}`}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Risks</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        {report.risks.map((item, index) => (
                          <li key={`${item}-${index}`}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Opportunities</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        {report.opportunities.map((item, index) => (
                          <li key={`${item}-${index}`}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommendations</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        {report.recommendations.map((item, index) => (
                          <li key={`${item}-${index}`}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Watchlist</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        {report.watchlist.map((item, index) => (
                          <li key={`${item.asset}-${index}`}>
                            <span className="font-medium text-foreground">{item.asset}</span>: {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total value (USDT): {report.metrics.totalValueUSDT ?? "--"} · Unpriced assets: {report.metrics.unpricedAssetsCount}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
