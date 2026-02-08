export type AuditLevel = "info" | "warning" | "error";

export interface AuditEntry {
  id: string;
  ts: number;
  level: AuditLevel;
  title: string;
  description?: string;
  actor: string;
  moduleId?: string;
  data?: Record<string, unknown>;
}
