"use client";

import { BuildingIcon, ListIcon, MapPinIcon } from "@/components/icons";
import SaturationCard from "@/components/analysis/SaturationCard";
import GapAnalysisPanel from "@/components/analysis/GapAnalysisPanel";
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
    ["상권분석 결과"],
    ["조건", scopeLabel(result.scope)],
    ["데이터 기준", result.meta.dataReferenceMonth ?? "확인 불가"],
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
  downloadCsv(`상권분석_${scopeSlug}.csv`, rows);
}

function BreakdownBars({
  title,
  items,
  colorFrom,
  colorTo,
  emptyText,
}: {
  title: string;
  items: BreakdownItem[];
  colorFrom: string;
  colorTo: string;
  emptyText: string;
}) {
  const top = items.slice(0, 10);
  const max = top.length > 0 ? top[0]!.count : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      {top.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {top.map((item, i) => (
            <li key={item.code}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-slate-700">
                  {i + 1}. {item.name}
                </span>
                <span className="shrink-0 text-slate-400">
                  {item.count.toLocaleString()}개 · {item.sharePct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorFrom} ${colorTo}`}
                  style={{ width: max > 0 ? `${(item.count / max) * 100}%` : "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <div className="flex animate-fade-up flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{scopeLabel(result.scope)}</p>
        <button
          type="button"
          onClick={() => exportResultCsv(result)}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          CSV 다운로드
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 text-white shadow-lg shadow-emerald-500/25 sm:p-4">
          <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/10" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <BuildingIcon className="h-4 w-4" />
          </span>
          <p className="relative mt-2.5 text-xl font-bold leading-none sm:text-2xl">
            {result.totalCount.toLocaleString()}
            <span className="ml-0.5 text-xs font-medium opacity-80">개</span>
          </p>
          <p className="relative mt-1 text-[11px] font-medium text-white/80 sm:text-xs">
            선택 조건 점포 수
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-3.5 text-white shadow-lg shadow-sky-500/25 sm:p-4">
          <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/10" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <MapPinIcon className="h-4 w-4" />
          </span>
          <p className="relative mt-2.5 text-xl font-bold leading-none sm:text-2xl">
            {result.sharePctOfRegion}
            <span className="ml-0.5 text-xs font-medium opacity-80">%</span>
          </p>
          <p className="relative mt-1 text-[11px] font-medium text-white/80 sm:text-xs">
            선택 지역 내 비중
          </p>
        </div>

        <div className="relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-3.5 text-white shadow-lg shadow-violet-500/25 sm:col-span-1 sm:p-4">
          <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/10" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <ListIcon className="h-4 w-4" />
          </span>
          <p className="relative mt-2.5 text-xl font-bold leading-none sm:text-2xl">
            {result.regionTotalCount.toLocaleString()}
            <span className="ml-0.5 text-xs font-medium opacity-80">개</span>
          </p>
          <p className="relative mt-1 text-[11px] font-medium text-white/80 sm:text-xs">
            선택 지역 전체 업종 점포 수
          </p>
        </div>
      </div>

      {result.saturation && (
        <SaturationCard
          saturation={result.saturation}
          industryName={selectedIndustryName(result.scope)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownBars
          title="하위 업종별 분포"
          items={result.industryBreakdown}
          colorFrom="from-indigo-500"
          colorTo="to-violet-500"
          emptyText="더 세분화된 업종이 없습니다 (가장 상세한 분류입니다)."
        />
        <BreakdownBars
          title="행정동별 분포"
          items={result.dongBreakdown}
          colorFrom="from-emerald-500"
          colorTo="to-teal-500"
          emptyText="행정동을 이미 선택하셨습니다."
        />
      </div>

      <GapAnalysisPanel gapAnalysis={result.gapAnalysis} />
    </div>
  );
}
