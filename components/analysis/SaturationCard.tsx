import { AlertIcon, BuildingIcon } from "@/components/icons";
import type { SaturationLevel, SaturationResult } from "@/types/commercial";

interface SaturationCardProps {
  saturation: SaturationResult;
  industryName: string;
}

const LEVEL_META: Record<
  SaturationLevel,
  { label: string; verdict: string; badge: string; bar: string; iconColor: string }
> = {
  very_low: {
    label: "매우 낮음 (블루오션)",
    verdict: "경쟁 점포가 매우 적어 신규 진입 및 시장 선점 기회가 높은 편입니다",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
    iconColor: "text-emerald-600",
  },
  low: {
    label: "낮음 (여유)",
    verdict: "평균 기준보다 점포 수가 적어 경쟁 압력이 비교적 완만합니다",
    badge: "border-teal-200 bg-teal-50 text-teal-800",
    bar: "bg-gradient-to-r from-teal-400 to-cyan-500",
    iconColor: "text-teal-600",
  },
  normal: {
    label: "보통 (균형)",
    verdict: "상위 지역 평균과 유사한 수준의 적정 경쟁 강도를 보이고 있습니다",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    iconColor: "text-slate-600",
  },
  high: {
    label: "높음 (경쟁 치열)",
    verdict: "평균 대비 점포 밀집도가 높아 차별화된 입지 및 마케팅 전략이 필요합니다",
    badge: "border-amber-300 bg-amber-50 text-amber-900",
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    iconColor: "text-amber-600",
  },
  very_high: {
    label: "매우 높음 (과밀·레드오션)",
    verdict: "이미 점포가 포화 상태에 가까워 신규 창업 시 매우 신중한 타당성 검토가 요구됩니다",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    bar: "bg-gradient-to-r from-rose-400 to-rose-600",
    iconColor: "text-rose-600",
  },
};

export default function SaturationCard({ saturation, industryName }: SaturationCardProps) {
  const meta = LEVEL_META[saturation.level];
  const gaugePct =
    saturation.ratio === null ? 0 : Math.min(100, Math.round((saturation.ratio / 3) * 100));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-panel transition-all hover:shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
            <BuildingIcon className="h-4 w-4" />
          </span>
          경쟁강도 및 과밀도 진단
        </h3>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide shadow-sm ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-100">
        <p className="text-sm leading-relaxed text-slate-700">
          <strong className="font-bold text-slate-950 underline decoration-amber-400 decoration-2 underline-offset-2">
            {industryName}
          </strong>{" "}
          업종은{" "}
          <span className="font-semibold text-slate-900">{saturation.baselineLabel}</span> 대비
          {saturation.ratio !== null ? (
            <>
              {" "}
              밀집도가{" "}
              <span className="font-extrabold text-amber-700 text-base">
                {saturation.ratio}배
              </span>
              입니다. {meta.verdict}.
            </>
          ) : (
            <> 비교 표본 데이터가 충분치 않아 비율 산출이 제한됩니다.</>
          )}
        </p>

        {saturation.ratio !== null && (
          <div className="mt-4">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${meta.bar}`}
                style={{ width: `${gaugePct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400">
              <span>0배 (희소)</span>
              <span>1.0배 (기준 평균)</span>
              <span>2.0배 (밀집)</span>
              <span>3.0배 이상 (포화)</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500">선택 지역 실점포</span>
          <p className="mt-1 text-base font-extrabold text-slate-900">
            {saturation.localCount.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">개</span>
          </p>
          <p className="text-[11px] font-semibold text-indigo-600">
            지역 내 비중 {saturation.localSharePct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500">{saturation.baselineLabel} 기준</span>
          <p className="mt-1 text-base font-extrabold text-slate-900">
            {saturation.baselineCount.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">개</span>
          </p>
          <p className="text-[11px] font-semibold text-slate-600">
            기준 비중 {saturation.baselineSharePct}%
          </p>
        </div>
      </div>

      <p className="mt-3.5 flex items-start gap-1.5 text-[11px] text-slate-400">
        <AlertIcon className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
        공공데이터 등록 점포 수 기준 단순 비교이며, 개별 상권의 유동인구·객단가·매출 규모에 따라 체감 경쟁도는 달라질 수 있습니다.
      </p>
    </div>
  );
}
