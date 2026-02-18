import { SupabaseClient } from "@supabase/supabase-js";
import { PING_TIMEOUT_MS, CONSECUTIVE_BLOCK_THRESHOLD } from "./constants";

export interface PingExecutionResult {
  responseTimeMs: number;
  statusCode: number | null;
  isError: boolean;
}

export async function executePing(
  supabase: SupabaseClient,
  orgId: string,
  url: string
): Promise<PingExecutionResult> {
  const startTime = Date.now();
  let responseTimeMs: number;
  let statusCode: number | null = null;
  let isError = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WaitFree/1.0)",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    responseTimeMs = Date.now() - startTime;
    statusCode = response.status;

    if (!response.ok) {
      isError = true;
    }
  } catch {
    responseTimeMs = Date.now() - startTime;
    isError = true;
  }

  await supabase.from("ping_results").insert({
    org_id: orgId,
    response_time_ms: responseTimeMs,
    status_code: statusCode,
    is_error: isError,
  });

  const { data: recentPings } = await supabase
    .from("ping_results")
    .select("is_error, status_code")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(CONSECUTIVE_BLOCK_THRESHOLD);

  if (recentPings && recentPings.length >= CONSECUTIVE_BLOCK_THRESHOLD) {
    const allBlocked = recentPings.every(
      (p) => p.is_error || p.status_code === 403
    );
    if (allBlocked) {
      await supabase
        .from("organizations")
        .update({ ping_enabled: false })
        .eq("id", orgId);
    }
  }

  return { responseTimeMs, statusCode, isError };
}
