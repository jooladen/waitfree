"use client";

import { useState } from "react";
import StatusCard from "./StatusCard";
import type { Organization } from "@/types";

interface PresetTabsProps {
  presets: Organization[];
}

export default function PresetTabs({ presets }: PresetTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (presets.length === 0) return null;

  const activeOrg = presets[activeIndex];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {presets.map((org, i) => (
          <button
            key={org.id}
            onClick={() => setActiveIndex(i)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              i === activeIndex
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {org.name}
          </button>
        ))}
      </div>
      <StatusCard
        key={activeOrg.id}
        orgId={activeOrg.id}
        orgName={activeOrg.name}
        orgType={activeOrg.type}
      />
    </div>
  );
}
