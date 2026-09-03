"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DATA_REFERENCE_DATE } from "@/lib/constants";

interface ExecutiveHeaderProps {
  currentTab?: "commercial" | "compare" | "academy";
  subtitle?: string;
}

export default function ExecutiveHeader({
  subtitle = "소상공인시장진흥공단 빅데이터 기반 전국 상권분석 & 경기도교육청 학원 통합 솔루션",
}: ExecutiveHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "상권분석",
      href: "/",
      active: pathname === "/",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: "핵심",
    },
    {
      name: "지역 비교",
      href: "/compare",
      active: pathname === "/compare",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      name: "경기 학원 검색",
      href: "/academy",
      active: pathname === "/academy",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
      {/* 상단 럭셔리 골드/사파이어 헤어라인 바 */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600" />

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* 로고 및 브랜딩 */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-[1px] shadow-md transition-all duration-300 group-hover:shadow-gold-glow">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-gradient-to-br from-slate-900 to-slate-950 text-amber-400">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-slate-950 shadow-sm">
              AI
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                GG Commercial AI
              </span>
              <span className="rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-amber-100/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                PRO INTEL
              </span>
            </div>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </Link>

        {/* 네비게이션 탭 */}
        <nav className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-inner">
          {tabs.map((tab) => {
            const isActive = tab.active;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 font-bold"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-amber-600" : "text-slate-400"}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 우측 공공데이터 인증 뱃지 */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-500">
            공공데이터 실시간 연동
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-medium text-slate-700">
            기준 {DATA_REFERENCE_DATE}
          </span>
        </div>
      </div>
    </header>
  );
}
