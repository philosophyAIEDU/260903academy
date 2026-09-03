import { SearchIcon } from "@/components/icons";
import type { GapAnalysisResult } from "@/types/commercial";

interface GapAnalysisPanelProps {
  gapAnalysis: GapAnalysisResult;
}

export default function GapAnalysisPanel({ gapAnalysis }: GapAnalysisPanelProps) {
  const { items, baselineLabel, levelLabel } = gapAnalysis;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <SearchIcon className="h-4 w-4 text-violet-600" />
        업종 공백 분석
      </h3>
      <p className="mb-4 text-xs text-slate-400">
        {baselineLabel} 대비 이 지역에 상대적으로 적은 {levelLabel} — 창업 기회 후보로
        참고해보세요
      </p>

      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          이미 가장 세부적인 업종을 선택했거나, 비교할 만한 데이터가 충분하지 않습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <li
              key={item.code}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {i + 1}. {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  이 지역 {item.localCount.toLocaleString()}개 · {baselineLabel}{" "}
                  {item.baselineCount.toLocaleString()}개
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  item.localCount === 0
                    ? "bg-violet-100 text-violet-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {item.localCount === 0 ? "전무" : `${item.ratio}배`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
