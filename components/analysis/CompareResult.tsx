"use client";

import { BuildingIcon, MapPinIcon } from "@/components/icons";
import { downloadCsv } from "@/lib/csv-export";
import type { CommercialAnalysisResponse } from "@/types/commercial";

interface CompareResultProps {
  a: CommercialAnalysisResponse;
  b: CommercialAnalysisResponse;
  labelA: string;
  labelB: string;
}

function scopeLabel(scope: CommercialAnalysisResponse["scope"]): string {
  const regionParts = [scope.sido?.name, scope.sigungu?.name, scope.dong?.name].filter(Boolean);
  const industryParts = [scope.large?.name, scope.mid?.name, scope.small?.name].filter(Boolean);
  const region = regionParts.length > 0 ? regionParts.join(" > ") : "전체 지역";
  const industry = industryParts.length > 0 ? industryParts.join(" > ") : "전체 업종";
  return `${region} · ${industry}`;
}

function CompareRow({
  label,
  valueA,
  valueB,
  higherIsMoreCompetitive = false,
  unit = "",
}: {
  label: string;
  valueA: number;
  valueB: number;
  higherIsMoreCompetitive?: boolean;
  unit?: string;
}) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;
  const aGood = higherIsMoreCompetitive ? !aWins || valueA === valueB : aWins;
  const bGood = higherIsMoreCompetitive ? !bWins || valueA === valueB : bWins;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
      <td className="py-3.5 pr-4 text-xs font-bold text-slate-700">{label}</td>
      <td
        className={`py-3.5 px-3 text-right text-sm font-extrabold ${
          aGood ? "text-indigo-600 bg-indigo-50/40 rounded-lg" : "text-slate-700"
        }`}
      >
        {valueA.toLocaleString()}
        {unit && <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>}
      </td>
      <td
        className={`py-3.5 pl-3 text-right text-sm font-extrabold ${
          bGood ? "text-amber-600 bg-amber-50/40 rounded-lg" : "text-slate-700"
        }`}
      >
        {valueB.toLocaleString()}
        {unit && <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>}
      </td>
    </tr>
  );
}

function MiniBreakdown({
  result,
  color,
  textColor,
}: {
  result: CommercialAnalysisResponse;
  color: string;
  textColor: string;
}) {
  const top = result.industryBreakdown.slice(0, 5);
  if (top.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        세부 업종 분포 데이터가 없습니다.
      </div>
    );
  }
  const max = top[0]!.count;
  return (
    <ul className="flex flex-col gap-2.5">
      {top.map((item, idx) => (
        <li key={item.code}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate font-medium text-slate-700">
              <span className="font-bold text-slate-400 mr-1.5">{idx + 1}.</span>
              {item.name}
            </span>
            <span className={`shrink-0 font-bold ${textColor}`}>{item.count.toLocaleString()}개</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color}`}
              style={{ width: max > 0 ? `${Math.max(3, (item.count / max) * 100)}%` : "0%" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function exportCompareCsv(
  a: CommercialAnalysisResponse,
  b: CommercialAnalysisResponse,
  labelA: string,
  labelB: string
) {
  const rows: (string | number)[][] = [
    ["지역 비교 분석 리포트 (GG Commercial AI)"],
    ["비교 항목", labelA, labelB],
    ["상세 조건", scopeLabel(a.scope), scopeLabel(b.scope)],
    ["선택 조건 점포 수", a.totalCount, b.totalCount],
    ["선택 지역 전체 업종 점포 수", a.regionTotalCount, b.regionTotalCount],
    ["선택 지역 내 비중(%)", a.sharePctOfRegion, b.sharePctOfRegion],
  ];
  if (a.saturation && b.saturation) {
    rows.push(
      ["경쟁강도 배율", a.saturation.ratio ?? "N/A", b.saturation.ratio ?? "N/A"],
      ["비교 기준", a.saturation.baselineLabel, b.saturation.baselineLabel]
    );
  }
  downloadCsv(`상권비교리포트_${labelA}_vs_${labelB}.csv`, rows);
}

export default function CompareResult({ a, b, labelA, labelB }: CompareResultProps) {
  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span className="text-sm font-bold text-indigo-700">{labelA}</span>
          <span className="text-xs text-slate-400 font-bold">VS</span>
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-sm font-bold text-amber-800">{labelB}</span>
          <span className="text-xs text-slate-400 ml-2">정밀 상권 비교 대조 분석</span>
        </div>
        <button
          type="button"
          onClick={() => exportCompareCsv(a, b, labelA, labelB)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100"
        >
          비교 데이터 CSV 다운로드
        </button>
      </div>

      {/* 비교 매트릭스 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-panel">
        <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-100 pb-3 text-xs">
          <span className="font-bold text-slate-400">지표 항목</span>
          <span className="w-28 text-right font-extrabold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
            {labelA}
          </span>
          <span className="w-28 text-right font-extrabold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">
            {labelB}
          </span>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <CompareRow label="선택 조건 점포 수" valueA={a.totalCount} valueB={b.totalCount} unit="개" />
            <CompareRow
              label="지역 내 비중"
              valueA={a.sharePctOfRegion}
              valueB={b.sharePctOfRegion}
              unit="%"
            />
            <CompareRow
              label="지역 전체 업종 점포 모수"
              valueA={a.regionTotalCount}
              valueB={b.regionTotalCount}
              unit="개"
            />
            {a.saturation && b.saturation && (
              <CompareRow
                label="경쟁강도 배율 (낮을수록 유리)"
                valueA={a.saturation.ratio ?? 0}
                valueB={b.saturation.ratio ?? 0}
                higherIsMoreCompetitive
                unit="배"
              />
            )}
          </tbody>
        </table>
      </div>

      {/* 두 지역의 상위 업종 분포 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-panel">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <MapPinIcon className="h-3.5 w-3.5" />
              </span>
              {labelA} 상위 업종
            </h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
              A 지역
            </span>
          </div>
          <p className="mb-4 text-xs text-slate-500 truncate">{scopeLabel(a.scope)}</p>
          <MiniBreakdown result={a} color="bg-gradient-to-r from-indigo-500 to-indigo-600" textColor="text-indigo-700" />
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-panel">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-950">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
                <BuildingIcon className="h-3.5 w-3.5" />
              </span>
              {labelB} 상위 업종
            </h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              B 지역
            </span>
          </div>
          <p className="mb-4 text-xs text-slate-500 truncate">{scopeLabel(b.scope)}</p>
          <MiniBreakdown result={b} color="bg-gradient-to-r from-amber-500 to-amber-600" textColor="text-amber-800" />
        </div>
      </div>
    </div>
  );
}
