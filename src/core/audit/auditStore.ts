import { eventBus, Events } from "@/core/events/bus";
import type { AuditEntry } from "@/core/audit/types";

const AUDIT_KEY = "financeos.audit.v1";

function loadAuditEntries(): AuditEntry[] {
  const raw = localStorage.getItem(AUDIT_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

function saveAuditEntries(entries: AuditEntry[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

export const auditStore = {
  list(): AuditEntry[] {
    return loadAuditEntries().sort((a, b) => b.ts - a.ts);
  },
  append(entry: AuditEntry) {
    const entries = loadAuditEntries();
    entries.push(entry);
    saveAuditEntries(entries);
    eventBus.emit(Events.AUDIT_APPENDED, entry);
  },
  clear() {
    saveAuditEntries([]);
  },
};
