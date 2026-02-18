import type { Metadata } from "next";
import "./globals.css";
import FingerprintProvider from "@/components/FingerprintProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "WaitFree - 정부24 서버 상태 | 건강보험공단 대기시간 실시간",
  description:
    "공공기관 서버 터졌나요? 전화 대기 몇 명? 실시간으로 확인하세요",
  metadataBase: new URL("https://waitfree.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WaitFree - 공공기관 실시간 상태",
    description:
      "정부24 터졌나요? 건강보험공단 전화 대기 몇 명? 지금 확인하세요",
    url: "https://waitfree.vercel.app",
    siteName: "WaitFree",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaitFree - 공공기관 실시간 상태",
    description:
      "정부24 터졌나요? 건강보험공단 전화 대기 몇 명? 지금 확인하세요",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased">
        <FingerprintProvider>
          <ToastProvider>
            <div className="mx-auto min-h-screen max-w-[480px] px-4 py-6">
              {children}
            </div>
          </ToastProvider>
        </FingerprintProvider>
      </body>
    </html>
  );
}
