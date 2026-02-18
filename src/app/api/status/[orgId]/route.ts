import { NextRequest } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executePing } from "@/lib/ping";
import { determineWebsiteSignal, determinePhoneSignal } from "@/lib/signal";
import {
  PING_INTERVAL_MS,
  REPORT_WINDOW_MS,
  TIMELINE_LIMIT,
} from "@/lib/constants";
import type {
  OrgStatusResponse,
  PingResult,
  ReportSummary,
  TimelineEntry,
  ReportStatus,
} from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const supabase = createAdminClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      return Response.json(
        { error: "기관을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    let latestPing: PingResult | null = null;
    let previousPing: PingResult | null = null;
    let pingInfo: OrgStatusResponse["ping"] = null;

    if (org.type === "website") {
      const { data: pings } = await supabase
        .from("ping_results")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(2);

      if (pings && pings.length > 0) {
        latestPing = pings[0] as PingResult;
        previousPing = pings.length > 1 ? (pings[1] as PingResult) : null;

        pingInfo = {
          lastCheckedAt: latestPing.created_at,
          responseTimeMs: latestPing.response_time_ms,
          isError: latestPing.is_error,
        };

        const pingAge =
          Date.now() - new Date(latestPing.created_at).getTime();
        if (pingAge > PING_INTERVAL_MS && org.ping_enabled) {
          after(async () => {
            const bgSupabase = createAdminClient();
            await executePing(bgSupabase, orgId, org.url!);
          });
        }
      } else if (org.ping_enabled) {
        after(async () => {
          const bgSupabase = createAdminClient();
          await executePing(bgSupabase, orgId, org.url!);
        });
      }
    }

    const windowStart = new Date(Date.now() - REPORT_WINDOW_MS).toISOString();

    const { data: recentReports } = await supabase
      .from("reports")
      .select("status, wait_count")
      .eq("org_id", orgId)
      .gte("created_at", windowStart);

    const reports = recentReports || [];
    const goodCount = reports.filter((r) => r.status === "good").length;
    const badCount = reports.filter((r) => r.status === "bad").length;
    const totalReports = reports.length;

    let avgWaitCount: number | null = null;
    if (org.type === "phone") {
      const waitCounts = reports
        .filter((r) => r.wait_count !== null)
        .map((r) => r.wait_count as number);
      if (waitCounts.length > 0) {
        avgWaitCount =
          waitCounts.reduce((a, b) => a + b, 0) / waitCounts.length;
      }
    }

    const summary: ReportSummary = {
      totalReports,
      goodCount,
      badCount,
      avgWaitCount,
    };

    const { data: timelineData } = await supabase
      .from("reports")
      .select("status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(TIMELINE_LIMIT);

    const timeline: TimelineEntry[] = (timelineData || []).map((r) => ({
      status: r.status as ReportStatus,
      createdAt: r.created_at,
    }));

    let signal: OrgStatusResponse["signal"];
    let auxiliaryMessage: string | null;

    if (org.type === "website") {
      const result = determineWebsiteSignal(latestPing, previousPing, summary);
      signal = result.signal;
      auxiliaryMessage = result.auxiliaryMessage;
    } else {
      const result = determinePhoneSignal(summary);
      signal = result.signal;
      auxiliaryMessage = result.auxiliaryMessage;
    }

    const response: OrgStatusResponse = {
      orgId: org.id,
      orgName: org.name,
      orgType: org.type,
      signal,
      summary,
      ping: pingInfo,
      auxiliaryMessage,
      timeline,
    };

    return Response.json(response);
  } catch {
    return Response.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
