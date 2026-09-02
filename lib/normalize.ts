import type { Academy, AcademyApiRow } from "@/types/academy";

/** "37.123" 같은 문자열/숫자 위경도를 안전하게 number로 변환. 파싱 불가하면 NaN. */
function toCoordinate(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return NaN;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function safeString(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

/**
 * 원본 API row를 프론트엔드용 Academy로 정규화합니다.
 * 위경도가 없거나 숫자로 변환 불가능한 행은 지도에 표시할 수 없으므로 호출부에서 걸러내세요.
 */
export function normalizeAcademyRow(row: AcademyApiRow): Academy {
  const name = safeString(row.FACLT_NM);
  const roadAddress = safeString(row.REFINE_ROADNM_ADDR);
  const courseClass = safeString(row.CRSE_CLASS_NM);

  return {
    id: `${name}__${roadAddress || safeString(row.REFINE_LOTNO_ADDR)}__${courseClass}`,
    sigunName: safeString(row.SIGUN_NM),
    emdName: safeString(row.EMD_NM),
    industryType: safeString(row.INDUTYPE_DIV_NM),
    name,
    representative: safeString(row.REPRSNTV_NM),
    courseClass,
    tel: safeString(row.TELNO),
    zipCode: safeString(row.REFINE_ZIP_CD),
    lotAddress: safeString(row.REFINE_LOTNO_ADDR),
    roadAddress,
    lat: toCoordinate(row.REFINE_WGS84_LAT),
    lng: toCoordinate(row.REFINE_WGS84_LOGT),
    sigunCode: safeString(row.SIGUN_CD),
  };
}

export function hasValidCoordinate(academy: Academy): boolean {
  return Number.isFinite(academy.lat) && Number.isFinite(academy.lng);
}
