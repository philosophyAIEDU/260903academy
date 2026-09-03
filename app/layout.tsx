import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상권분석 · 경기도 학원 검색",
  description:
    "소상공인시장진흥공단 상가업소정보 기반 전국 상권분석과 AI 상권 분석가, 경기도교육청 학원 검색을 한 곳에서.",
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
