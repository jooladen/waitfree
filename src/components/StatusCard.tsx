"use client";

import { useState, useEffect, useCallback } from "react";
import TrafficLight from "./TrafficLight";
import Skeleton from "./Skeleton";
import ErrorState from "./ErrorState";
import { useFingerprint } from "./FingerprintProvider";
import { useToast } from "./Toast";
import type { OrgType, OrgStatusResponse, ReportStatus } from "@/types";

interface StatusCardProps {
  orgId: string;
  orgName: string;
  orgType: OrgType;
}

export default function StatusCard({
  orgId,
  orgName,
  orgType,
}: StatusCardProps) {
  const { fingerprint } = useFingerprint();
  const { showToast } = useToast();
  const [status, setStatus] = useState<OrgStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [waitCount, setWaitCount] = useState("");
  const [reporting, setReporting] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/status/${orgId}`);
      if (!res.ok) throw new Error();
      const data: OrgStatusResponse = await res.json();
      setStatus(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleReport(reportStatus: ReportStatus) {
    if (!fingerprint || cooldown > 0 || reporting) return;
    setReporting(true);
    try {
      const body: Record<string, unknown> = {
        orgId,
        status: reportStatus,
        fingerprint,
      };
      if (orgType === "phone" && waitCount) {
        const parsed = parseInt(waitCount, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 999) {
          body.waitCount = parsed;
        }
      }
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("제보 완료!", "success");
        setCooldown(300);
        setWaitCount("");
        fetchStatus();
      } else if (res.status === 429) {
        showToast(data.error, "error");
        setCooldown(data.retryAfterSeconds || 300);
      } else {
        showToast(data.error || "제보에 실패했습니다", "error");
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setReporting(false);
    }
  }

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={fetchStatus} />;
  if (!status) return null;

  const cooldownMin = Math.floor(cooldown / 60);
  const cooldownSec = cooldown % 60;

  return (
    <div className="rounded-xl bg-gray-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold">{orgName}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
          {orgType === "website" ? "🌐 웹사이트" : "📞 전화"}
        </span>
      </div>

      <div className="mb-4 flex justify-center">
        <TrafficLight signal={status.signal} />
      </div>

      {status.summary.totalReports > 0 && (
        <p className="mb-2 text-center text-sm text-gray-600">
          {status.summary.badCount > 0 ? (
            <>
              지금{" "}
              <span className="font-semibold text-red-500">
                {status.summary.badCount}명
              </span>
              이 안 된다고 했어요
            </>
          ) : (
            <>
              지금{" "}
              <span className="font-semibold text-green-500">
                {status.summary.goodCount}명
              </span>
              이 잘 된다고 했어요
            </>
          )}
        </p>
      )}

      {status.auxiliaryMessage && (
        <p className="mb-3 text-center text-xs text-gray-500">
          {status.auxiliaryMessage}
        </p>
      )}

      {orgType === "website" && status.ping && (
        <p className="mb-3 text-center text-xs text-gray-400">
          {formatRelativeTime(status.ping.lastCheckedAt)} 자동 확인:{" "}
          {status.ping.isError
            ? "응답 실패"
            : `응답 ${((status.ping.responseTimeMs ?? 0) / 1000).toFixed(1)}초`}
        </p>
      )}

      {orgType === "phone" && cooldown <= 0 && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <label className="text-sm text-gray-500">대기 인원:</label>
          <input
            type="number"
            min="0"
            max="999"
            value={waitCount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (/^\d+$/.test(val) && parseInt(val) <= 999)) {
                setWaitCount(val);
              }
            }}
            placeholder="0~999"
            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
          />
          <span className="text-sm text-gray-500">명</span>
        </div>
      )}

      <div className="mb-4 flex justify-center gap-3">
        <button
          onClick={() => handleReport("good")}
          disabled={cooldown > 0 || reporting || !fingerprint}
          className="flex-1 rounded-lg bg-green-100 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          👍 잘 돼요
        </button>
        <button
          onClick={() => handleReport("bad")}
          disabled={cooldown > 0 || reporting || !fingerprint}
          className="flex-1 rounded-lg bg-red-100 py-2.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          😡 안 돼요!
        </button>
      </div>

      {cooldown > 0 && (
        <p className="mb-4 text-center text-xs text-gray-400">
          {cooldownMin}분 {cooldownSec.toString().padStart(2, "0")}초 후 다시
          제보할 수 있어요
        </p>
      )}

      {status.timeline.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <h3 className="mb-2 text-xs font-medium text-gray-400">최근 제보</h3>
          <ul className="space-y-1">
            {status.timeline.map((entry, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <span>{entry.status === "good" ? "👍" : "😡"}</span>
                <span>{formatRelativeTime(entry.createdAt)}</span>
                <span>&mdash;</span>
                <span>
                  {entry.status === "good" ? "잘 돼요" : "안 돼요"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}
