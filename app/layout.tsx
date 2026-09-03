import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상권분석 · 경기도 학원 인텔리전스 | GG Commercial AI",
  description:
    "소상공인시장진흥공단 빅데이터 기반 전국 상권분석, AI 상권 분석가, 경기도교육청 학원 통합 인텔리전스 플랫폼.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
