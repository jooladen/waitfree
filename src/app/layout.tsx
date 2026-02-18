import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
