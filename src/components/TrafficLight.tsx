import type { SignalColor } from "@/types";

interface TrafficLightProps {
  signal: SignalColor;
  size?: "sm" | "lg";
}

const colorMap: Record<
  SignalColor,
  { bg: string; glow: string; label: string }
> = {
  green: {
    bg: "bg-green-500",
    glow: "0 0 24px rgba(34, 197, 94, 0.6)",
    label: "쾌적해요",
  },
  yellow: {
    bg: "bg-yellow-500",
    glow: "0 0 24px rgba(234, 179, 8, 0.6)",
    label: "좀 느려요",
  },
  red: {
    bg: "bg-red-500",
    glow: "0 0 24px rgba(239, 68, 68, 0.6)",
    label: "터졌어요!",
  },
  gray: {
    bg: "bg-gray-400",
    glow: "none",
    label: "정보 없음",
  },
};

export default function TrafficLight({
  signal,
  size = "lg",
}: TrafficLightProps) {
  const config = colorMap[signal];

  if (size === "sm") {
    return (
      <div
        className={`h-6 w-6 shrink-0 rounded-full ${config.bg}`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-20 w-20 rounded-full ${config.bg}`}
        style={{ boxShadow: config.glow }}
      />
      <span className="text-sm font-medium text-gray-600">
        {config.label}
      </span>
    </div>
  );
}
