import type { Metadata } from "next";
import "./globals.css";
import FingerprintProvider from "@/components/FingerprintProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "WaitFree",
  description: "공공기관 실시간 상태 확인 서비스",
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
