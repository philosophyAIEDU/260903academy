/**
 * 데이터 기준일자. 경기데이터드림 페이지에 게시된 기준일이며, 갱신 주기가 "수시"이므로
 * 실제 API 응답이 이 날짜보다 최신일 수 있습니다. 데이터가 갱신되면 이 상수만 수정하세요.
 */
export const DATA_REFERENCE_DATE = "2026-02-22";

export const DATA_SOURCE_NAME = "경기도교육청 학원 현황 (경기데이터드림)";

export const DATA_SOURCE_NOTICE = `출처: ${DATA_SOURCE_NAME} · 데이터 기준일자 ${DATA_REFERENCE_DATE} · 실시간 정보가 아니므로 정확한 학원 운영 여부는 전화로 확인하세요.`;

/** 경기도 31개 시군 (드롭다운용, API가 별도 코드표를 제공하지 않아 정적으로 관리) */
export const SIGUN_LIST: string[] = [
  "수원시",
  "성남시",
  "고양시",
  "용인시",
  "부천시",
  "안산시",
  "안양시",
  "남양주시",
  "화성시",
  "평택시",
  "의정부시",
  "시흥시",
  "파주시",
  "김포시",
  "광명시",
  "광주시",
  "군포시",
  "이천시",
  "양주시",
  "오산시",
  "구리시",
  "안성시",
  "포천시",
  "의왕시",
  "하남시",
  "여주시",
  "양평군",
  "동두천시",
  "과천시",
  "가평군",
  "연천군",
];

/**
 * 자주 쓰이는 업종구분 예시(참고용). 실제 값은 API 응답에서 관찰되는 값과 다를 수 있으므로
 * SearchForm에서는 이 목록 + "검색 결과에서 관찰된 값"을 함께 병합해 보여줍니다.
 */
export const COMMON_INDUTYPE_LIST: string[] = [
  "보습",
  "입시",
  "외국어",
  "예능(음악)",
  "예능(미술)",
  "예능(무용)",
  "피아노",
  "태권도",
  "컴퓨터",
  "독서실",
];

export const GG_API_BASE_URL = "https://openapi.gg.go.kr/Tbinstutm";

/** 한 번의 원본 API 호출당 요청할 건수 (10000 이상 등 과도한 값 금지, 100~500 권장) */
export const GG_API_PAGE_SIZE = 200;

/** 무한 루프 방지용 안전장치 (한 검색 요청당 최대 페이지 호출 수) */
export const GG_API_MAX_PAGES = 100;
