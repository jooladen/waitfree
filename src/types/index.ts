export type OrgType = "website" | "phone";

export type SignalColor = "green" | "yellow" | "red" | "gray";

export type ReportStatus = "good" | "bad";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  url: string | null;
  phone: string | null;
  is_preset: boolean;
  ping_enabled: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  org_id: string;
  status: ReportStatus;
  wait_count: number | null;
  fingerprint: string;
  created_at: string;
}

export interface PingResult {
  id: string;
  org_id: string;
  response_time_ms: number;
  status_code: number | null;
  is_error: boolean;
  created_at: string;
}

export interface ReportSummary {
  totalReports: number;
  goodCount: number;
  badCount: number;
  avgWaitCount: number | null;
}

export interface PingInfo {
  lastCheckedAt: string | null;
  responseTimeMs: number | null;
  isError: boolean;
}

export interface TimelineEntry {
  status: ReportStatus;
  createdAt: string;
}

export interface OrgStatusResponse {
  orgId: string;
  orgName: string;
  orgType: OrgType;
  signal: SignalColor;
  summary: ReportSummary;
  ping: PingInfo | null;
  auxiliaryMessage: string | null;
  timeline: TimelineEntry[];
}
