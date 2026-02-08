import { auditStore } from "@/core/audit/auditStore";
import { getBinanceSnapshotSanitized } from "@/core/brain/snapshot";
import { appendReport } from "@/core/brain/store";
import type { CEOReport } from "@/core/brain/types";
import type { LLMClient, LLMMessage } from "@/core/llm/types";

const MODULE_ID = "brain.ceo";

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function extractJson(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    return null;
  }
  return text.slice(first, last + 1);
}

function computeConcentrationPct(
  holdings: Array<{ usdtValue?: number | null }>,
  totalValueUSDT: number | null,
  count: number
) {
  if (!totalValueUSDT || totalValueUSDT <= 0) {
    return null;
  }
  const sorted = [...holdings]
    .filter((holding) => (holding.usdtValue ?? 0) > 0)
    .sort((a, b) => (b.usdtValue ?? 0) - (a.usdtValue ?? 0))
    .slice(0, count);
  const sum = sorted.reduce((acc, holding) => acc + (holding.usdtValue ?? 0), 0);
  return Math.round((sum / totalValueUSDT) * 1000) / 10;
}

function buildReportBase(snapshot: ReturnType<typeof getBinanceSnapshotSanitized>): CEOReport {
  const concentrationTop3Pct = computeConcentrationPct(snapshot.holdings, snapshot.totalValueUSDT, 3);
  const concentrationTop5Pct = computeConcentrationPct(snapshot.holdings, snapshot.totalValueUSDT, 5);

  return {
    ts: new Date().toISOString(),
    summary: "",
    exposures: [],
    risks: [],
    opportunities: [],
    recommendations: [],
    watchlist: [],
    metrics: {
      totalValueUSDT: snapshot.totalValueUSDT ?? null,
      concentrationTop3Pct,
      concentrationTop5Pct,
      unpricedAssetsCount: snapshot.stats.unpricedCount,
    },
  };
}

function buildSafeReport(message: string, snapshot: ReturnType<typeof getBinanceSnapshotSanitized>): CEOReport {
  const base = buildReportBase(snapshot);
  return {
    ...base,
    summary: message,
    exposures: snapshot.topHoldings.map((holding) => holding.asset),
    risks: snapshot.unpricedAssets.length > 0 ? ["Some assets lack current USDT pricing."] : [],
    opportunities: [],
    recommendations: ["Consider reviewing Binance sync status and pricing coverage."],
  };
}

function parseReport(text: string, snapshot: ReturnType<typeof getBinanceSnapshotSanitized>): CEOReport | null {
  const rawJson = extractJson(text);
  if (!rawJson) {
    return null;
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (typeof parsed.summary !== "string") {
    return null;
  }

  const watchlist = Array.isArray(parsed.watchlist)
    ? parsed.watchlist
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const record = item as { asset?: unknown; reason?: unknown };
          if (typeof record.asset !== "string" || typeof record.reason !== "string") {
            return null;
          }
          return { asset: record.asset.trim(), reason: record.reason.trim() };
        })
        .filter((item): item is { asset: string; reason: string } => Boolean(item?.asset && item?.reason))
    : [];

  const base = buildReportBase(snapshot);
  const metricsInput = typeof parsed.metrics === "object" && parsed.metrics ? (parsed.metrics as Record<string, unknown>) : {};

  return {
    ts: typeof parsed.ts === "string" ? parsed.ts : base.ts,
    summary: parsed.summary.trim(),
    exposures: toStringArray(parsed.exposures),
    risks: toStringArray(parsed.risks),
    opportunities: toStringArray(parsed.opportunities),
    recommendations: toStringArray(parsed.recommendations),
    watchlist,
    metrics: {
      totalValueUSDT: base.metrics.totalValueUSDT,
      concentrationTop3Pct: toNumber(metricsInput.concentrationTop3Pct) ?? base.metrics.concentrationTop3Pct ?? null,
      concentrationTop5Pct: toNumber(metricsInput.concentrationTop5Pct) ?? base.metrics.concentrationTop5Pct ?? null,
      unpricedAssetsCount: base.metrics.unpricedAssetsCount,
    },
  };
}

function buildPrompt(snapshot: ReturnType<typeof getBinanceSnapshotSanitized>): LLMMessage[] {
  const system = `You are the FinanceOS CEO Brain. Return JSON only. No markdown. No prose outside JSON.
Follow the schema strictly. Do not include trading/execution language like "buy" or "sell". Use cautious phrasing such as "consider reviewing".
Focus on concentration, exposure, and risk. Keep it conservative.`;

  const user = `Generate a CEO report using this JSON snapshot. Output must be valid JSON only.
Schema:
{
  "ts": string,
  "summary": string,
  "exposures": string[],
  "risks": string[],
  "opportunities": string[],
  "recommendations": string[],
  "watchlist": [{ "asset": string, "reason": string }],
  "metrics": {
    "totalValueUSDT": number|null,
    "concentrationTop3Pct": number|null,
    "concentrationTop5Pct": number|null,
    "unpricedAssetsCount": number
  }
}
Snapshot:
${JSON.stringify(snapshot)}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export async function runCeoAiReview(llmClient: LLMClient): Promise<CEOReport> {
  const snapshot = getBinanceSnapshotSanitized();
  const holdingsCount = snapshot.stats.holdingsCount;

  if (holdingsCount === 0 || !snapshot.lastSyncTs) {
    const report = buildSafeReport("No Binance holdings snapshot found. Sync Binance first.", snapshot);
    appendReport(report);
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "info",
      title: "AI CEO Review completed",
      actor: "ai",
      moduleId: MODULE_ID,
      data: {
        lastSyncTs: snapshot.lastSyncTs,
        totalValueUSDT: snapshot.totalValueUSDT,
        holdingsCount,
      },
    });
    return report;
  }

  try {
    const messages = buildPrompt(snapshot);
    const response = await llmClient.chat(messages, {
      maxTokens: 900,
    });

    const parsed = parseReport(response.text, snapshot);
    if (!parsed) {
      const report = buildSafeReport("AI response could not be parsed. Please run the review again.", snapshot);
      appendReport(report);
      auditStore.append({
        id: crypto.randomUUID(),
        ts: Date.now(),
        level: "error",
        title: "AI CEO Review failed",
        description: "AI response could not be parsed.",
        actor: "ai",
        moduleId: MODULE_ID,
      });
      return report;
    }

    appendReport(parsed);
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "info",
      title: "AI CEO Review completed",
      actor: "ai",
      moduleId: MODULE_ID,
      data: {
        lastSyncTs: snapshot.lastSyncTs,
        totalValueUSDT: snapshot.totalValueUSDT,
        holdingsCount,
      },
    });

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "error",
      title: "AI CEO Review failed",
      description: message,
      actor: "ai",
      moduleId: MODULE_ID,
    });
    throw error;
  }
}
