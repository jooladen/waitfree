import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, combineFingerprint } from "@/lib/fingerprint";
import { REPORT_COOLDOWN_MS, MAX_WAIT_COUNT } from "@/lib/constants";
import type { ReportStatus } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, status, waitCount, fingerprint: browserFp } = body;

    if (!orgId || !status || !browserFp) {
      return Response.json(
        { error: "필수 필드가 누락되었습니다 (orgId, status, fingerprint)" },
        { status: 400 }
      );
    }

    if (status !== "good" && status !== "bad") {
      return Response.json(
        { error: "status는 'good' 또는 'bad'만 가능합니다" },
        { status: 400 }
      );
    }

    if (waitCount !== undefined && waitCount !== null) {
      if (
        !Number.isInteger(waitCount) ||
        waitCount < 0 ||
        waitCount > MAX_WAIT_COUNT
      ) {
        return Response.json(
          { error: `waitCount는 0~${MAX_WAIT_COUNT} 범위의 정수여야 합니다` },
          { status: 400 }
        );
      }
    }

    const ip = getClientIp(request);
    const fingerprint = await combineFingerprint(browserFp, ip);

    const supabase = createAdminClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      return Response.json(
        { error: "기관을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const cooldownStart = new Date(
      Date.now() - REPORT_COOLDOWN_MS
    ).toISOString();

    const { data: recentReport } = await supabase
      .from("reports")
      .select("created_at")
      .eq("fingerprint", fingerprint)
      .eq("org_id", orgId)
      .gte("created_at", cooldownStart)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentReport) {
      const lastReportTime = new Date(recentReport.created_at).getTime();
      const retryAfterMs = REPORT_COOLDOWN_MS - (Date.now() - lastReportTime);
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      return Response.json(
        {
          error: "조금 전에 제보했어요. 잠시 후에 다시 해주세요",
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const { data: report, error: insertError } = await supabase
      .from("reports")
      .insert({
        org_id: orgId,
        status: status as ReportStatus,
        wait_count: waitCount ?? null,
        fingerprint,
      })
      .select("id")
      .single();

    if (insertError || !report) {
      return Response.json(
        { error: "제보 저장에 실패했습니다" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, reportId: report.id });
  } catch {
    return Response.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
