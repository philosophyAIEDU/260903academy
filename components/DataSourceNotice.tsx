import { DATA_REFERENCE_DATE, DATA_SOURCE_NAME } from "@/lib/constants";

export default function DataSourceNotice() {
  return (
    <p className="text-xs text-slate-500 leading-relaxed">
      출처: {DATA_SOURCE_NAME} · 데이터 기준일자 {DATA_REFERENCE_DATE} · 실시간 정보가
      아니므로 정확한 학원 운영 여부는 전화로 확인하세요.
    </p>
  );
}
