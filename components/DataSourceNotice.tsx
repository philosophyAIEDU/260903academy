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
  message = "실시간 정보가 아니므로 정확한 학원 운영 여부는 전화로 확인하세요.",
}: DataSourceNoticeProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs leading-relaxed text-slate-400">
      <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
      <p>
        출처: <span className="font-medium text-slate-300">{sourceName}</span> · 데이터 기준{" "}
        {referenceLabel} · {message}
      </p>
    </div>
  );
}
