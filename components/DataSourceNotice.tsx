import { DATA_REFERENCE_DATE, DATA_SOURCE_NAME } from "@/lib/constants";
import { InfoIcon } from "@/components/icons";

export default function DataSourceNotice() {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
      <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <p>
        출처: <span className="font-medium text-slate-600">{DATA_SOURCE_NAME}</span> · 데이터
        기준일자 {DATA_REFERENCE_DATE} · 실시간 정보가 아니므로 정확한 학원 운영 여부는 전화로
        확인하세요.
      </p>
    </div>
  );
}
