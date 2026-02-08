import type { CEOReport } from "@/core/brain/types";

const CEO_REPORTS_KEY = "financeos.ceoAiReports.v1";

function loadReports(): CEOReport[] {
  const raw = localStorage.getItem(CEO_REPORTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as CEOReport[];
  } catch {
    return [];
  }
}

function saveReports(reports: CEOReport[]) {
  localStorage.setItem(CEO_REPORTS_KEY, JSON.stringify(reports));
}

export function listReports(): CEOReport[] {
  return loadReports().sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export function appendReport(report: CEOReport) {
  const reports = loadReports();
  reports.push(report);
  saveReports(reports);
}

export function clearReports() {
  saveReports([]);
}
