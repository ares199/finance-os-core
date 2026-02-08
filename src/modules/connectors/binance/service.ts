import { auditStore } from "@/core/audit/auditStore";
import { eventBus, Events } from "@/core/events/bus";
import {
  clearConnectorData,
  setConnectorHoldings,
  setConnectorMetrics,
  updateConnectorState,
} from "@/core/dataHub/store";
import type { Holding } from "@/core/dataHub/types";
import { loadInstalledModules } from "@/core/permissions/store";

const BINANCE_KEYS_KEY = "financeos.binance.keys.v1";
// DEV-only: production should use a backend proxy/server for Binance calls.
const BINANCE_BASE_URL = "/binance";
export const BINANCE_CONNECTOR_ID = "connector.binance";

interface BinanceKeys {
  apiKey: string;
  apiSecret: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface BinanceAccountResponse {
  balances: BinanceBalance[];
}

interface BinancePriceTicker {
  symbol: string;
  price: string;
}

function loadBinanceKeys(): BinanceKeys | null {
  const raw = localStorage.getItem(BINANCE_KEYS_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as BinanceKeys;
  } catch {
    return null;
  }
}

function ensureModuleEnabled() {
  const installed = loadInstalledModules();
  if (!installed[BINANCE_CONNECTOR_ID]?.enabled) {
    throw new Error("Binance connector is not installed or enabled.");
  }
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signQuery(secret: string, queryString: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(queryString));
  return bufferToHex(signature);
}

async function fetchBinanceSigned<T>(path: string, apiKey: string, apiSecret: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  searchParams.set("timestamp", Date.now().toString());
  const signature = await signQuery(apiSecret, searchParams.toString());
  searchParams.set("signature", signature);

  const response = await fetch(`${BINANCE_BASE_URL}${path}?${searchParams.toString()}`, {
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text) as { msg?: string };
      message = parsed.msg ?? text;
    } catch {
      message = text;
    }
    throw new Error(message || "Binance request failed.");
  }

  return JSON.parse(text) as T;
}

async function fetchBinancePublic<T>(path: string) {
  const response = await fetch(`${BINANCE_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Binance market data.");
  }
  return (await response.json()) as T;
}

export function isBinanceConnected(): boolean {
  const keys = loadBinanceKeys();
  return Boolean(keys?.apiKey && keys.apiSecret);
}

export function saveBinanceKeys(apiKey: string, apiSecret: string) {
  localStorage.setItem(BINANCE_KEYS_KEY, JSON.stringify({ apiKey, apiSecret }));
  updateConnectorState(BINANCE_CONNECTOR_ID, { status: "connected", error: undefined });
}

export function clearBinanceKeys() {
  localStorage.removeItem(BINANCE_KEYS_KEY);
  updateConnectorState(BINANCE_CONNECTOR_ID, { status: "disconnected", error: undefined });
  clearConnectorData(BINANCE_CONNECTOR_ID);
}

export function getBinanceKeys() {
  return loadBinanceKeys();
}

export async function testBinanceConnection() {
  ensureModuleEnabled();
  const keys = loadBinanceKeys();
  if (!keys) {
    return { ok: false, error: "Missing API key or secret." };
  }
  try {
    await fetchBinanceSigned<BinanceAccountResponse>("/api/v3/account", keys.apiKey, keys.apiSecret);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error." };
  }
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function syncBinance() {
  ensureModuleEnabled();
  const keys = loadBinanceKeys();
  if (!keys) {
    throw new Error("Missing API key or secret.");
  }

  updateConnectorState(BINANCE_CONNECTOR_ID, { status: "syncing", error: undefined });
  auditStore.append({
    id: crypto.randomUUID(),
    ts: Date.now(),
    level: "info",
    title: "Binance sync started",
    description: "Fetching Binance spot balances and prices.",
    actor: "Binance Connector",
    moduleId: BINANCE_CONNECTOR_ID,
  });

  try {
    const [account, tickers] = await Promise.all([
      fetchBinanceSigned<BinanceAccountResponse>("/api/v3/account", keys.apiKey, keys.apiSecret),
      fetchBinancePublic<BinancePriceTicker[]>("/api/v3/ticker/price"),
    ]);

    const priceMap = new Map<string, number>();
    tickers.forEach((ticker) => {
      const price = parseNumber(ticker.price);
      if (price > 0) {
        priceMap.set(ticker.symbol, price);
      }
    });

    const holdings: Holding[] = account.balances
      .map((balance) => {
        const free = parseNumber(balance.free);
        const locked = parseNumber(balance.locked);
        const total = free + locked;
        if (total <= 0) {
          return null;
        }

        const symbol = `${balance.asset}USDT`;
        let usdtValue: number | undefined;
        if (balance.asset === "USDT") {
          usdtValue = total;
        } else if (priceMap.has(symbol)) {
          usdtValue = total * (priceMap.get(symbol) ?? 0);
        }

        return {
          asset: balance.asset,
          free,
          locked,
          total,
          usdtValue,
        };
      })
      .filter((holding): holding is Holding => Boolean(holding));

    // TODO: Add USDC valuation fallback for assets without USDT pairs.
    const totalValueUSDT = holdings.reduce((sum, holding) => sum + (holding.usdtValue ?? 0), 0);

    setConnectorHoldings(BINANCE_CONNECTOR_ID, holdings);
    setConnectorMetrics(BINANCE_CONNECTOR_ID, { totalValueUSDT });
    updateConnectorState(BINANCE_CONNECTOR_ID, {
      status: "connected",
      lastSyncTs: Date.now(),
      error: undefined,
    });

    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "info",
      title: "Binance sync completed",
      description: "Binance spot balances synced successfully.",
      actor: "Binance Connector",
      moduleId: BINANCE_CONNECTOR_ID,
      data: {
        holdingsCount: holdings.length,
        totalValueUSDT,
      },
    });

    eventBus.emit(Events.CONNECTOR_SYNCED, {
      connectorId: BINANCE_CONNECTOR_ID,
      holdings,
      totalValueUSDT,
    });

    return { holdings, totalValueUSDT };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    updateConnectorState(BINANCE_CONNECTOR_ID, { status: "error", error: message });

    auditStore.append({
      id: crypto.randomUUID(),
      ts: Date.now(),
      level: "error",
      title: "Binance sync failed",
      description: message,
      actor: "Binance Connector",
      moduleId: BINANCE_CONNECTOR_ID,
    });

    throw error;
  }
}
