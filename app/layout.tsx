import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "경기도 학원 검색",
  description: "경기도교육청 학원 현황(경기데이터드림) 기반 학원 검색 · 지도 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
