import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WaitFree - 공공기관 실시간 상태";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
            }}
          />
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#EAB308",
              boxShadow: "0 0 30px rgba(234, 179, 8, 0.5)",
            }}
          />
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "16px",
          }}
        >
          WaitFree
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#6B7280",
          }}
        >
          공공기관 지금 터졌나요?
        </div>
      </div>
    ),
    { ...size },
  );
}
