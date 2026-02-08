import { eventBus, Events } from "@/core/events/bus";
import type { ConnectorMetrics, ConnectorState, DataHubState, Holding } from "@/core/dataHub/types";

export const DATAHUB_KEY = "financeos.datahub.v1";

function normalizeState(state: Partial<DataHubState> | null): DataHubState {
  return {
    connectors: state?.connectors ?? {},
    holdings: state?.holdings ?? {},
    metrics: state?.metrics ?? {},
  };
}

export function loadDataHub(): DataHubState {
  const raw = localStorage.getItem(DATAHUB_KEY);
  if (!raw) {
    return normalizeState(null);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DataHubState>;
    return normalizeState(parsed);
  } catch {
    return normalizeState(null);
  }
}

function saveDataHub(state: DataHubState) {
  localStorage.setItem(DATAHUB_KEY, JSON.stringify(state));
  eventBus.emit(Events.DATAHUB_UPDATED, state);
}

export function getDataHubState(): DataHubState {
  return loadDataHub();
}

export function getConnectorState(connectorId: string): ConnectorState | undefined {
  return loadDataHub().connectors[connectorId];
}

export function getConnectorHoldings(connectorId: string): Holding[] {
  return loadDataHub().holdings[connectorId] ?? [];
}

export function getConnectorMetrics(connectorId: string): ConnectorMetrics | undefined {
  return loadDataHub().metrics[connectorId];
}

export function updateConnectorState(connectorId: string, patch: Partial<ConnectorState>) {
  const state = loadDataHub();
  const existing = state.connectors[connectorId] ?? { status: "disconnected" as const };
  state.connectors[connectorId] = {
    ...existing,
    ...patch,
  };
  saveDataHub(state);
  return state.connectors[connectorId];
}

export function setConnectorHoldings(connectorId: string, holdings: Holding[]) {
  const state = loadDataHub();
  state.holdings[connectorId] = holdings;
  saveDataHub(state);
}

export function setConnectorMetrics(connectorId: string, metrics: ConnectorMetrics) {
  const state = loadDataHub();
  state.metrics[connectorId] = metrics;
  saveDataHub(state);
}

export function clearConnectorData(connectorId: string) {
  const state = loadDataHub();
  delete state.holdings[connectorId];
  delete state.metrics[connectorId];
  saveDataHub(state);
}
