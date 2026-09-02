/**
 * 경기데이터드림 "경기도교육청 학원 현황"(Tbinstutm) 관련 타입 정의.
 *
 * ⚠️ 원본 API 응답의 head/row 중첩 구조는 경기데이터드림의 다른 공공API들이 공통으로
 * 쓰는 표준 포맷( {"Tbinstutm":[{head:[...]},{row:[...]}]} )을 기준으로 잠정 정의한 것입니다.
 * 개발 환경(3000번 포트)에서 실제 키로 최초 호출하면 lib/gg-api.ts의 console.log가
 * 원본 응답 전체를 그대로 찍어줍니다. 실제 구조가 다르면 이 파일과 lib/gg-api.ts의
 * parseTbinstutmResponse() 함수만 수정하면 되도록 파싱 로직을 한 곳에 모아뒀습니다.
 */

// ── 원본 API 행(row) 데이터 ─────────────────────────────────────
export interface AcademyApiRow {
  SIGUN_NM: string;
  EMD_NM: string;
  INDUTYPE_DIV_NM: string;
  FACLT_NM: string;
  REPRSNTV_NM: string;
  CRSE_CLASS_NM: string;
  TELNO: string;
  REFINE_ZIP_CD: string;
  REFINE_LOTNO_ADDR: string;
  REFINE_ROADNM_ADDR: string;
  REFINE_WGS84_LAT: string;
  REFINE_WGS84_LOGT: string;
  SIGUN_CD: string;
  // 실제 응답에 위 목록 외 필드가 더 있을 수 있어 열려있게 둠
  [key: string]: string | number | undefined;
}

export interface ApiResultInfo {
  CODE: string;
  MESSAGE: string;
}

export interface ApiHeadInfo {
  list_total_count: number;
  RESULT: ApiResultInfo;
}

/** Tbinstutm 성공 응답 (표준 경기데이터드림 포맷 기준 잠정 타입) */
export interface TbinstutmApiResponse {
  Tbinstutm?: Array<
    | { head: Array<{ list_total_count: number } | { RESULT: ApiResultInfo }> }
    | { row: AcademyApiRow[] }
  >;
  // 인증 실패 등 최상위 레벨 에러가 오는 경우 대비
  RESULT?: ApiResultInfo;
}

// ── 정규화된 프론트엔드용 타입 ───────────────────────────────────
export interface Academy {
  /** API에 고유 ID가 없어 name+address+course 조합으로 합성한 값 */
  id: string;
  sigunName: string;
  emdName: string;
  industryType: string;
  name: string;
  representative: string;
  courseClass: string;
  tel: string;
  zipCode: string;
  lotAddress: string;
  roadAddress: string;
  lat: number;
  lng: number;
  sigunCode: string;
}

export interface AcademySearchQuery {
  sigunNm?: string;
  emdNm?: string;
  indutypeDivNm?: string;
  faclyNm?: string;
}

export interface AcademySearchResponse {
  items: Academy[];
  totalCount: number;
  dataReferenceDate: string;
}

export interface AcademySearchErrorResponse {
  error: string;
}
