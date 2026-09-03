import { SearchIcon } from "@/components/icons";
import type { GapAnalysisResult } from "@/types/commercial";

interface GapAnalysisPanelProps {
  gapAnalysis: GapAnalysisResult;
}

export default function GapAnalysisPanel({ gapAnalysis }: GapAnalysisPanelProps) {
  const { items, baselineLabel, levelLabel } = gapAnalysis;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-panel transition-all hover:shadow-card">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-200/60">
            <SearchIcon className="h-4 w-4" />
          </span>
          상권 공백 및 기회 업종 발굴
        </h3>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
          블루오션 지수
        </span>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-700">{baselineLabel}</span> 대비 이 지역에
        상대적으로 입점 수가 현저히 적은 <strong className="text-slate-800">{levelLabel}</strong> 목록입니다.
        신규 창업 및 틈새시장 공략 시 우선 검토 아이템으로 추천됩니다.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">
          비교 대상 업종이 충분하지 않거나 이미 세부 하위 단계입니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => {
            const isZero = item.localCount === 0;
            return (
              <li
                key={item.code}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      i === 0
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : i === 1
                        ? "bg-slate-300 text-slate-800"
                        : i === 2
                        ? "bg-amber-700/20 text-amber-900"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-violet-900">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      이 지역 <span className="font-semibold text-slate-800">{item.localCount.toLocaleString()}개</span> · {baselineLabel}{" "}
                      <span className="font-semibold text-slate-800">{item.baselineCount.toLocaleString()}개</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${
                    isZero
                      ? "border-violet-300 bg-violet-100/80 text-violet-800 animate-pulse"
                      : "border-slate-200 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {isZero ? "점포 전무 (완전 공백)" : `${item.ratio}배`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
