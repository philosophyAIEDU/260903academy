/**
 * 소상공인시장진흥공단 상가(상권)정보 기반 "상권분석" 기능 타입 정의.
 *
 * 원본 CSV는 미리 지역×업종별로 집계되어 data/processed/commercial-stats.json으로
 * 저장됩니다 (scripts/build-commercial-stats.mjs 참고). 이 타입들은 그 집계 데이터의
 * 구조와, API가 주고받는 요청/응답 형태를 정의합니다.
 */

/** data/processed/commercial-stats.json의 원본 구조 */
export interface RawCommercialStats {
  meta: {
    generatedAt: string;
    sourceFiles: string[];
    totalStores: number;
    totalGroups: number;
    /** 소스 파일명의 "_YYYYMM" 패턴에서 추출한 데이터 기준 연월 (best-effort, 없으면 null) */
    dataReferenceMonth: string | null;
    /** 업체 목록(지도 마커)이 있는, 즉 /stores 조회가 가능한 시군구코드 목록 */
    storesAvailableSigungu: string[];
  };
  sidoNames: Record<string, string>;
  sigunguNames: Record<string, string>;
  dongNames: Record<string, string>;
  /** 업종 대/중/소분류 코드→명 (코드 길이로 레벨 구분: 2자=대, 4자=중, 6자=소) */
  industryNames: Record<string, string>;
  /** 행정동코드 → [위도, 경도] (지도 초기 중심 좌표용, 단순 산술평균) */
  dongCentroids: Record<string, [number, number]>;
  /** [행정동코드, 상권업종소분류코드, 점포수] 튜플 배열 */
  stats: [string, string, number][];
}

/** data/processed/stores/<시군구코드>.json 파티션 파일의 원소 형태 */
export type RawStoreTuple = [
  name: string,
  branch: string,
  smallCode: string,
  dongCode: string,
  address: string,
  lat: number,
  lng: number,
];

export interface Store {
  name: string;
  branch: string;
  smallCode: string;
  smallName: string;
  midName: string;
  largeName: string;
  dongCode: string;
  dongName: string;
  address: string;
  lat: number;
  lng: number;
}

export interface StoreListQuery {
  sigunguCode: string;
  dongCode?: string;
  largeCode?: string;
  midCode?: string;
  smallCode?: string;
  /** 반환할 최대 업체 수 (기본 300) — 지도 마커 렌더링 성능을 위한 상한 */
  limit?: number;
}

export interface StoreListResponse {
  /** 조건에 맞는 전체 업체 수 (limit으로 잘리기 전 값) */
  totalCount: number;
  /** 실제로 내려준 업체 목록 (최대 limit개, 균등 샘플링) */
  stores: Store[];
  /** 지도 초기 중심 좌표 (선택된 행정동/시군구의 평균 좌표) */
  center: { lat: number; lng: number } | null;
  truncated: boolean;
}

export interface CodeOption {
  code: string;
  name: string;
}

export interface CommercialOptionsResponse {
  /** 데이터가 실제로 존재하는 지역만 내려줍니다 (아직 전국이 아니라 일부 지역만 있을 수 있음) */
  sido: CodeOption[];
  sigungu: CodeOption[];
  dong: CodeOption[];
  large: CodeOption[];
  mid: CodeOption[];
  small: CodeOption[];
  meta: RawCommercialStats["meta"];
}

export interface CommercialAnalysisQuery {
  sidoCode?: string;
  sigunguCode?: string;
  dongCode?: string;
  largeCode?: string;
  midCode?: string;
  smallCode?: string;
}

export interface BreakdownItem extends CodeOption {
  count: number;
  /** 0~100, regionTotalCount(또는 상위 분류 합계) 대비 비율 */
  sharePct: number;
}

export interface CommercialAnalysisResponse {
  scope: {
    sido?: CodeOption;
    sigungu?: CodeOption;
    dong?: CodeOption;
    large?: CodeOption;
    mid?: CodeOption;
    small?: CodeOption;
  };
  /** 선택한 지역 + 업종 조건을 모두 만족하는 점포 수 */
  totalCount: number;
  /** 선택한 지역(업종 무관) 전체 점포 수 — 비중 계산 기준 */
  regionTotalCount: number;
  /** totalCount / regionTotalCount * 100 */
  sharePctOfRegion: number;
  /** 다음 하위 업종 레벨 기준 분포 (드릴다운용) */
  industryBreakdown: BreakdownItem[];
  /** 선택한 지역 범위 내 행정동별 분포 (행정동을 아직 특정하지 않았을 때 비교용) */
  dongBreakdown: BreakdownItem[];
  meta: RawCommercialStats["meta"];
}

export interface CommercialErrorResponse {
  error: string;
}
