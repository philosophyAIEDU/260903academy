import { DATA_REFERENCE_DATE, DATA_SOURCE_NAME } from "@/lib/constants";
import { InfoIcon } from "@/components/icons";

interface DataSourceNoticeProps {
  sourceName?: string;
  referenceLabel?: string;
  message?: string;
}

export default function DataSourceNotice({
  sourceName = DATA_SOURCE_NAME,
  referenceLabel = DATA_REFERENCE_DATE,
  message = "공공데이터 개방 포털 기준이며, 실시간 폐업 및 인허가 변동 사항은 현장 확인을 권장합니다.",
}: DataSourceNoticeProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-xs leading-relaxed text-slate-500 shadow-sm backdrop-blur">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200/80 mt-0.5">
        <InfoIcon className="h-3 w-3" />
      </span>
      <div>
        <p className="text-slate-700 font-medium">
          공공데이터 출처: <span className="font-bold text-slate-900">{sourceName}</span> · 데이터 기준일:{" "}
          <span className="font-semibold text-amber-800">{referenceLabel}</span>
        </p>
        <p className="mt-0.5 text-slate-400 text-[11px]">{message}</p>
      </div>
    </div>
  );
}
