import { PING_FAST_MS, PING_SLOW_MS } from "./constants";
import type { SignalColor, PingResult, ReportSummary } from "@/types";

export interface SignalResult {
  signal: SignalColor;
  auxiliaryMessage: string | null;
}

export function determineWebsiteSignal(
  latestPing: PingResult | null,
  previousPing: PingResult | null,
  summary: ReportSummary
): SignalResult {
  if (!latestPing) {
    return { signal: "gray", auxiliaryMessage: null };
  }

  let signal: SignalColor;

  if (latestPing.is_error || latestPing.response_time_ms > PING_SLOW_MS) {
    const prevFailed =
      previousPing &&
      (previousPing.is_error || previousPing.response_time_ms > PING_SLOW_MS);
    signal = prevFailed ? "red" : "yellow";
  } else if (latestPing.response_time_ms > PING_FAST_MS) {
    signal = "yellow";
  } else {
    signal = "green";
  }

  let auxiliaryMessage: string | null = null;

  if (signal === "green" && summary.badCount >= 3) {
    auxiliaryMessage = `핑은 정상인데 ${summary.badCount}명이 안 된다고 했어요`;
  } else if (signal === "red" && summary.goodCount >= 3) {
    auxiliaryMessage = `서버는 느린데 ${summary.goodCount}명은 괜찮다고 했어요`;
  }

  return { signal, auxiliaryMessage };
}

export function determinePhoneSignal(summary: ReportSummary): SignalResult {
  const { totalReports, badCount } = summary;

  if (totalReports < 2) {
    return { signal: "gray", auxiliaryMessage: null };
  }

  const badRatio = badCount / totalReports;
  let signal: SignalColor;

  if (badRatio >= 0.7) {
    signal = "red";
  } else if (badRatio >= 0.3) {
    signal = "yellow";
  } else {
    signal = "green";
  }

  let auxiliaryMessage: string | null = null;
  if (summary.avgWaitCount !== null) {
    auxiliaryMessage = `평균 대기 약 ${Math.round(summary.avgWaitCount)}명`;
  }

  return { signal, auxiliaryMessage };
}
