"use client";

import { BuildingIcon, ListIcon, MapPinIcon } from "@/components/icons";
import SaturationCard from "@/components/analysis/SaturationCard";
import GapAnalysisPanel from "@/components/analysis/GapAnalysisPanel";
import AIAnalystChat from "@/components/analysis/AIAnalystChat";
import { downloadCsv } from "@/lib/csv-export";
import type { BreakdownItem, CommercialAnalysisResponse } from "@/types/commercial";

interface AnalysisResultProps {
  result: CommercialAnalysisResponse;
}

function scopeLabel(scope: CommercialAnalysisResponse["scope"]): string {
  const regionParts = [scope.sido?.name, scope.sigungu?.name, scope.dong?.name].filter(Boolean);
  const industryParts = [scope.large?.name, scope.mid?.name, scope.small?.name].filter(Boolean);
  const region = regionParts.length > 0 ? regionParts.join(" > ") : "전체 지역";
  const industry = industryParts.length > 0 ? industryParts.join(" > ") : "전체 업종";
  return `${region} · ${industry}`;
}

function selectedIndustryName(scope: CommercialAnalysisResponse["scope"]): string {
  return scope.small?.name ?? scope.mid?.name ?? scope.large?.name ?? "선택 업종";
}

function exportResultCsv(result: CommercialAnalysisResponse) {
  const rows: (string | number)[][] = [
    ["상권분석 결과 리포트 (GG Commercial AI)"],
    ["분석 조건", scopeLabel(result.scope)],
    ["데이터 기준월", result.meta.dataReferenceMonth ?? "확인 불가"],
    [],
    ["구분", "값"],
    ["선택 조건 점포 수", result.totalCount],
    ["선택 지역 전체 업종 점포 수", result.regionTotalCount],
    ["선택 지역 내 비중(%)", result.sharePctOfRegion],
  ];

  if (result.saturation) {
    rows.push(
      [],
      ["경쟁강도 진단"],
      ["비교 기준", result.saturation.baselineLabel],
      ["이 지역 점포 수", result.saturation.localCount],
      ["이 지역 비중(%)", result.saturation.localSharePct],
      ["비교 기준 점포 수", result.saturation.baselineCount],
      ["비교 기준 비중(%)", result.saturation.baselineSharePct],
      ["밀집 배율", result.saturation.ratio ?? "N/A"]
    );
  }

  if (result.industryBreakdown.length > 0) {
    rows.push(
      [],
      ["하위 업종별 분포"],
      ["업종", "점포 수", "비중(%)"],
      ...result.industryBreakdown.map((i) => [i.name, i.count, i.sharePct])
    );
  }

  if (result.dongBreakdown.length > 0) {
    rows.push(
      [],
      ["행정동별 분포"],
      ["행정동", "점포 수", "비중(%)"],
      ...result.dongBreakdown.map((d) => [d.name, d.count, d.sharePct])
    );
  }

  if (result.gapAnalysis.items.length > 0) {
    rows.push(
      [],
      [`업종 공백 분석 (${result.gapAnalysis.baselineLabel} 대비)`],
      ["업종", "이 지역 점포 수", `${result.gapAnalysis.baselineLabel} 점포 수`, "비율(배)"],
      ...result.gapAnalysis.items.map((g) => [g.name, g.localCount, g.baselineCount, g.ratio])
    );
  }

  const scopeSlug = scopeLabel(result.scope).replace(/[\s>·/]+/g, "_");
  downloadCsv(`상권분석리포트_${scopeSlug}.csv`, rows);
}

function BreakdownBars({
  title,
  items,
  colorFrom,
  colorTo,
  emptyText,
  icon,
}: {
  title: string;
  items: BreakdownItem[];
  colorFrom: string;
  colorTo: string;
  emptyText: string;
  icon: React.ReactNode;
}) {
  const top = items.slice(0, 10);
  const max = top.length > 0 ? top[0]!.count : 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-panel">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="text-amber-600">{icon}</span>
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
          상위 {top.length}개 항목
        </span>
      </div>

      {top.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {top.map((item, idx) => {
            const widthPct = max > 0 ? Math.round((item.count / max) * 100) : 0;
            return (
              <li key={item.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        idx === 0
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : idx === 1
                          ? "bg-slate-300 text-slate-800"
                          : idx === 2
                          ? "bg-amber-700/20 text-amber-900"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate font-medium text-slate-800">{item.name}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {item.count.toLocaleString()}개{" "}
                    <span className="font-normal text-slate-400">({item.sharePct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colorFrom} ${colorTo} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(2, widthPct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const hasSubIndustry = result.industryBreakdown.length > 0;
  const hasDong = result.dongBreakdown.length > 0;

  return (
    <section className="flex flex-col gap-5 animate-fade-up">
      {/* 럭셔리 브리핑 헤더 & 통계 다운로드 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-panel sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              EXECUTIVE BRIEFING
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">
              데이터 기준 {result.meta.dataReferenceMonth ?? "최신 분기"}
            </span>
          </div>
          <h2 className="mt-1 truncate text-lg font-extrabold text-slate-900 sm:text-xl">
            {scopeLabel(result.scope)}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => exportResultCsv(result)}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-gradient-to-b from-amber-50 to-amber-100/50 px-4 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition-all duration-200 hover:from-amber-100 hover:to-amber-200/60 hover:shadow-gold-glow"
        >
          <svg className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          분석 데이터 CSV 리포트 저장
        </button>
      </div>

      {/* 3구 VIP 메탈릭 KPI 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 카드 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-amber-100/30 p-5 shadow-panel transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">선택 조건 점포 수</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <BuildingIcon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {result.totalCount.toLocaleString()}
            <span className="ml-1 text-sm font-semibold text-slate-500">개소</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            현재 조건에 부합하는 활성 사업체
          </p>
        </div>

        {/* 카드 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-indigo-100/30 p-5 shadow-panel transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800">지역 내 업종 비중</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <ListIcon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {result.sharePctOfRegion}
            <span className="ml-0.5 text-sm font-semibold text-slate-500">%</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            지역 전체 사업체 중 차지하는 비율
          </p>
        </div>

        {/* 카드 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/60 p-5 shadow-panel transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">해당 지역 전체 점포 모수</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
              <MapPinIcon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {result.regionTotalCount.toLocaleString()}
            <span className="ml-1 text-sm font-semibold text-slate-500">개소</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            선택된 행정구역 전체 등록 점포
          </p>
        </div>
      </div>

      {/* 경쟁강도 진단 & 공백 분석 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {result.saturation ? (
          <SaturationCard
            saturation={result.saturation}
            industryName={selectedIndustryName(result.scope)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-xs text-slate-400">
            지역(시/군/구 이상)과 업종을 함께 선택하면 상위 지역 대비 경쟁 강도 진단이 활성화됩니다.
          </div>
        )}
        <GapAnalysisPanel gapAnalysis={result.gapAnalysis} />
      </div>

      {/* 하위 업종 및 행정동 분포 바 차트 */}
      {(hasSubIndustry || hasDong) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {hasSubIndustry && (
            <BreakdownBars
              title="하위 세부 업종별 점포 분포"
              items={result.industryBreakdown}
              colorFrom="from-amber-500"
              colorTo="to-amber-600"
              emptyText="더 이상 표시할 하위 업종이 없습니다."
              icon={<ListIcon className="h-4 w-4" />}
            />
          )}
          {hasDong && (
            <BreakdownBars
              title="행정동별 점포 밀집도"
              items={result.dongBreakdown}
              colorFrom="from-indigo-500"
              colorTo="to-indigo-600"
              emptyText="행정동별 분포 데이터가 없습니다."
              icon={<MapPinIcon className="h-4 w-4" />}
            />
          )}
        </div>
      )}

      {/* AI 상권 분석가 챗봇 패널 */}
      <AIAnalystChat result={result} />
    </section>
  );
}
