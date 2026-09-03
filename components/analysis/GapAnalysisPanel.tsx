import { SearchIcon } from "@/components/icons";
import type { GapAnalysisResult } from "@/types/commercial";

interface GapAnalysisPanelProps {
  gapAnalysis: GapAnalysisResult;
}

export default function GapAnalysisPanel({ gapAnalysis }: GapAnalysisPanelProps) {
  const { items, baselineLabel, levelLabel } = gapAnalysis;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-panel sm:p-6">
      <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-100">
        <SearchIcon className="h-4 w-4 text-violet-400" />
        업종 공백 분석
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        {baselineLabel} 대비 이 지역에 상대적으로 적은 {levelLabel} — 창업 기회 후보로
        참고해보세요
      </p>

      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">
          이미 가장 세부적인 업종을 선택했거나, 비교할 만한 데이터가 충분하지 않습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <li
              key={item.code}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-800 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">
                  {i + 1}. {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  이 지역 {item.localCount.toLocaleString()}개 · {baselineLabel}{" "}
                  {item.baselineCount.toLocaleString()}개
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  item.localCount === 0
                    ? "bg-violet-500/15 text-violet-300"
                    : "bg-slate-700 text-slate-300"
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
