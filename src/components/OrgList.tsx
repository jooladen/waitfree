"use client";

import { useState, useEffect } from "react";
import StatusCard from "./StatusCard";
import TrafficLight from "./TrafficLight";
import type { Organization, SignalColor } from "@/types";

interface OrgListProps {
  orgs: Organization[];
}

export default function OrgList({ orgs }: OrgListProps) {
  if (orgs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        아직 등록된 기관이 없어요. 첫 번째로 추가해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="mb-2 text-sm font-medium text-gray-400">
        사용자 등록 기관
      </h3>
      {orgs.map((org) => (
        <OrgListItem key={org.id} org={org} />
      ))}
    </div>
  );
}

function OrgListItem({ org }: { org: Organization }) {
  const [expanded, setExpanded] = useState(false);
  const [signal, setSignal] = useState<SignalColor>("gray");

  useEffect(() => {
    fetch(`/api/status/${org.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.signal) setSignal(data.signal);
      })
      .catch(() => {});
  }, [org.id]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3"
      >
        <TrafficLight signal={signal} size="sm" />
        <span className="flex-1 text-left text-sm font-medium">{org.name}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {org.type === "website" ? "🌐" : "📞"}
        </span>
        <span
          className={`text-xs text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 p-3">
          <StatusCard
            orgId={org.id}
            orgName={org.name}
            orgType={org.type}
          />
        </div>
      )}
    </div>
  );
}
