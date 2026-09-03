import { AlertIcon, BuildingIcon } from "@/components/icons";
import type { SaturationLevel, SaturationResult } from "@/types/commercial";

interface SaturationCardProps {
  saturation: SaturationResult;
  industryName: string;
}

const LEVEL_META: Record<
  SaturationLevel,
  { label: string; verdict: string; badge: string; bar: string }
> = {
  very_low: {
    label: "매우 낮음",
    verdict: "경쟁이 적어 진입 기회가 있는 편입니다",
    badge: "bg-emerald-500/15 text-emerald-300",
    bar: "bg-emerald-500",
  },
  low: {
    label: "낮음",
    verdict: "평균보다 경쟁이 적은 편입니다",
    badge: "bg-teal-500/15 text-teal-300",
    bar: "bg-teal-500",
  },
  normal: {
    label: "보통",
    verdict: "평균과 비슷한 수준의 경쟁 강도입니다",
    badge: "bg-slate-700 text-slate-300",
    bar: "bg-slate-500",
  },
  high: {
    label: "높음",
    verdict: "평균보다 경쟁이 치열한 편입니다",
    badge: "bg-amber-500/15 text-amber-300",
    bar: "bg-amber-500",
  },
  very_high: {
    label: "매우 높음 (포화)",
    verdict: "이미 포화 상태에 가까워 신중한 검토가 필요합니다",
    badge: "bg-rose-500/15 text-rose-300",
    bar: "bg-rose-500",
  },
};

export default function SaturationCard({ saturation, industryName }: SaturationCardProps) {
  const meta = LEVEL_META[saturation.level];
  // 게이지 표시용: ratio 0~3배 구간을 0~100%로 매핑 (3배 이상은 꽉 찬 것으로 표시)
  const gaugePct =
    saturation.ratio === null ? 0 : Math.min(100, Math.round((saturation.ratio / 3) * 100));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-panel sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
          <BuildingIcon className="h-4 w-4 text-emerald-400" />
          경쟁강도 진단
        </h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
          {meta.label}
        </span>
      </div>

      <p className="text-sm text-slate-300">
        <span className="font-semibold text-slate-100">{industryName}</span> 업종은{" "}
        {saturation.baselineLabel}
        {saturation.ratio !== null ? (
          <>
            {" "}
            대비 <span className="font-semibold text-slate-100">{saturation.ratio}배</span>{" "}
            밀집도입니다. {meta.verdict}.
          </>
        ) : (
          <> 데이터가 충분치 않아 비교할 수 없습니다.</>
        )}
      </p>

      {saturation.ratio !== null && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${gaugePct}%` }} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-800 px-3 py-2.5">
          <p className="font-medium text-slate-400">이 지역</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-100">
            {saturation.localCount.toLocaleString()}개 · {saturation.localSharePct}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-800 px-3 py-2.5">
          <p className="font-medium text-slate-400">{saturation.baselineLabel}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-100">
            {saturation.baselineCount.toLocaleString()}개 · {saturation.baselineSharePct}%
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500">
        <AlertIcon className="mt-0.5 h-3 w-3 shrink-0" />
        점포 수 기준 단순 비교이며, 실제 상권 매출·유동인구·임대료 등은 반영되지 않습니다.
        참고 지표로만 활용하세요.
      </p>
    </div>
  );
}
