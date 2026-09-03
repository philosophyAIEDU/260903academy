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
}: {
  label: string;
  valueA: number;
  valueB: number;
  higherIsMoreCompetitive?: boolean;
}) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;
  // "경쟁강도" 류 지표는 낮은 쪽이 유리하므로 강조 색을 반대로 씁니다.
  const aGood = higherIsMoreCompetitive ? !aWins || valueA === valueB : aWins;
  const bGood = higherIsMoreCompetitive ? !bWins || valueA === valueB : bWins;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2.5 pr-3 text-xs font-medium text-slate-500">{label}</td>
      <td
        className={`py-2.5 px-2 text-right text-sm font-semibold ${aGood ? "text-blue-600" : "text-slate-700"}`}
      >
        {valueA.toLocaleString()}
      </td>
      <td
        className={`py-2.5 pl-2 text-right text-sm font-semibold ${bGood ? "text-orange-600" : "text-slate-700"}`}
      >
        {valueB.toLocaleString()}
      </td>
    </tr>
  );
}

function MiniBreakdown({ result, color }: { result: CommercialAnalysisResponse; color: string }) {
  const top = result.industryBreakdown.slice(0, 5);
  if (top.length === 0) {
    return <p className="text-xs text-slate-400">세부 업종 분포가 없습니다.</p>;
  }
  const max = top[0]!.count;
  return (
    <ul className="flex flex-col gap-2">
      {top.map((item) => (
        <li key={item.code}>
          <div className="mb-0.5 flex items-center justify-between text-[11px]">
            <span className="truncate font-medium text-slate-600">{item.name}</span>
            <span className="shrink-0 text-slate-400">{item.count.toLocaleString()}개</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: max > 0 ? `${(item.count / max) * 100}%` : "0%" }}
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
    ["지역 비교 결과"],
    ["항목", labelA, labelB],
    ["조건", scopeLabel(a.scope), scopeLabel(b.scope)],
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
  downloadCsv(`상권비교_${labelA}_vs_${labelB}.csv`, rows);
}

export default function CompareResult({ a, b, labelA, labelB }: CompareResultProps) {
  return (
    <div className="flex animate-fade-up flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          <span className="font-semibold text-blue-600">{labelA}</span> vs{" "}
          <span className="font-semibold text-orange-600">{labelB}</span>
        </p>
        <button
          type="button"
          onClick={() => exportCompareCsv(a, b, labelA, labelB)}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          CSV 다운로드
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-2 text-xs">
          <span />
          <span className="text-right font-semibold text-blue-600">{labelA}</span>
          <span className="text-right font-semibold text-orange-600">{labelB}</span>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <CompareRow label="선택 조건 점포 수" valueA={a.totalCount} valueB={b.totalCount} />
            <CompareRow
              label="지역 내 비중(%)"
              valueA={a.sharePctOfRegion}
              valueB={b.sharePctOfRegion}
            />
            <CompareRow
              label="지역 전체 업종 점포 수"
              valueA={a.regionTotalCount}
              valueB={b.regionTotalCount}
            />
            {a.saturation && b.saturation && (
              <CompareRow
                label="경쟁강도 배율"
                valueA={a.saturation.ratio ?? 0}
                valueB={b.saturation.ratio ?? 0}
                higherIsMoreCompetitive
              />
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
            <MapPinIcon className="h-4 w-4" />
            {labelA}
          </h3>
          <p className="mb-3 text-[11px] text-slate-400">{scopeLabel(a.scope)}</p>
          <MiniBreakdown result={a} color="bg-blue-500" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-orange-600">
            <BuildingIcon className="h-4 w-4" />
            {labelB}
          </h3>
          <p className="mb-3 text-[11px] text-slate-400">{scopeLabel(b.scope)}</p>
          <MiniBreakdown result={b} color="bg-orange-500" />
        </div>
      </div>
    </div>
  );
}
