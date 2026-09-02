import "server-only";
import type { AcademyApiRow, AcademySearchQuery } from "@/types/academy";
import { GG_API_BASE_URL, GG_API_MAX_PAGES, GG_API_PAGE_SIZE } from "@/lib/constants";

/**
 * 경기데이터드림 Tbinstutm(학원 현황) API 클라이언트.
 *
 * ⚠️ 스키마 확정 안내
 * 아래 파싱 로직(parseTbinstutmResponse)은 경기데이터드림의 다른 공공API들이 공통으로
 * 쓰는 표준 응답 포맷을 기준으로 작성했습니다:
 *   { "Tbinstutm": [ { "head": [ {"list_total_count": N}, {"RESULT": {"CODE": "...", "MESSAGE": "..."}} ] },
 *                    { "row": [ {...}, {...} ] } ] }
 * 실제 GG_API_KEY로 처음 호출하면 이 함수가 원본 응답 전체를 console.log로 찍습니다.
 * 만약 실제 구조가 위와 다르면(예: head/row 순서, 필드명 차이 등) 이 파일의
 * parseTbinstutmResponse()만 실제 로그를 보고 수정하면 됩니다. (다른 코드는 이 함수가
 * 반환하는 { rows, totalCount } 형태에만 의존하므로 영향받지 않습니다.)
 */

interface ParsedPage {
  rows: AcademyApiRow[];
  totalCount: number;
}

class GgApiError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * 원본 응답(unknown)을 { rows, totalCount }로 변환합니다.
 * 표준 head/row 배열 포맷을 우선 시도하고, 실패하면 몇 가지 대안 형태도 방어적으로 시도합니다.
 */
function parseTbinstutmResponse(raw: unknown): ParsedPage {
  if (!isRecord(raw)) {
    throw new GgApiError("API 응답이 JSON 객체 형태가 아닙니다.");
  }

  // 최상위 레벨 에러 (예: 인증키 오류 시 {"RESULT":{"CODE":"ERROR-333", ...}} 형태로 오는 경우)
  if (isRecord(raw.RESULT)) {
    const code = String(raw.RESULT.CODE ?? "");
    const message = String(raw.RESULT.MESSAGE ?? "알 수 없는 오류");
    if (code && code.startsWith("ERROR")) {
      throw new GgApiError(`경기데이터드림 API 오류 [${code}]: ${message}`);
    }
  }

  const container = raw["Tbinstutm"];
  if (!Array.isArray(container)) {
    // 데이터가 없는 경우 등 Tbinstutm 키 자체가 없을 수 있음
    return { rows: [], totalCount: 0 };
  }

  let totalCount = 0;
  let rows: AcademyApiRow[] = [];

  for (const block of container) {
    if (!isRecord(block)) continue;

    if (Array.isArray(block.head)) {
      for (const headItem of block.head) {
        if (!isRecord(headItem)) continue;
        if (typeof headItem.list_total_count === "number") {
          totalCount = headItem.list_total_count;
        } else if (typeof headItem.list_total_count === "string") {
          totalCount = Number(headItem.list_total_count) || 0;
        }
        if (isRecord(headItem.RESULT)) {
          const code = String(headItem.RESULT.CODE ?? "");
          const message = String(headItem.RESULT.MESSAGE ?? "알 수 없는 오류");
          if (code.startsWith("ERROR")) {
            throw new GgApiError(`경기데이터드림 API 오류 [${code}]: ${message}`);
          }
          // INFO-200(데이터 없음) 등은 에러가 아니라 정상적인 "결과 없음" 상태로 취급
        }
      }
    }

    if (Array.isArray(block.row)) {
      rows = block.row as AcademyApiRow[];
    }
  }

  return { rows, totalCount };
}

async function fetchAcademyPage(
  query: AcademySearchQuery,
  pIndex: number,
  pSize: number
): Promise<ParsedPage> {
  const apiKey = process.env.GG_API_KEY;
  if (!apiKey) {
    throw new GgApiError(
      "서버에 GG_API_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요."
    );
  }

  // ⚠️ URLSearchParams는 자체적으로 값을 인코딩하므로, 요구사항대로 직접
  // encodeURIComponent를 거친 뒤에는 URLSearchParams를 쓰지 않고 쿼리스트링을
  // 수동으로 조립합니다(그렇지 않으면 한글 파라미터가 이중 인코딩되어 API가 값을 못 읽습니다).
  const queryParts: string[] = [
    `KEY=${encodeURIComponent(apiKey)}`,
    `Type=${encodeURIComponent("json")}`,
    `pIndex=${encodeURIComponent(String(pIndex))}`,
    `pSize=${encodeURIComponent(String(pSize))}`,
  ];
  if (query.sigunNm) queryParts.push(`SIGUN_NM=${encodeURIComponent(query.sigunNm)}`);
  if (query.indutypeDivNm) {
    queryParts.push(`INDUTYPE_DIV_NM=${encodeURIComponent(query.indutypeDivNm)}`);
  }

  const url = `${GG_API_BASE_URL}?${queryParts.join("&")}`;

  const res = await fetch(url, { cache: "no-store" });
  const raw: unknown = await res.json().catch(() => {
    throw new GgApiError("API 응답을 JSON으로 파싱하지 못했습니다.");
  });

  // 최초 페이지 응답 구조를 그대로 로그로 남겨 실제 스키마를 확인할 수 있게 합니다.
  if (pIndex === 1) {
    console.log(
      `[gg-api] Tbinstutm 원본 응답 (pIndex=1) 확인용 로그:`,
      JSON.stringify(raw, null, 2)
    );
  }

  if (!res.ok) {
    throw new GgApiError(`경기데이터드림 API 호출 실패 (HTTP ${res.status})`);
  }

  return parseTbinstutmResponse(raw);
}

/**
 * SIGUN_NM / INDUTYPE_DIV_NM 조건으로 서버(pIndex를 늘려가며)에서 전체 페이지를 모아옵니다.
 * EMD_NM(읍면동), 학원명 검색은 API 파라미터로 지원되지 않아 이 함수 밖(route.ts)에서
 * 결과를 받아 부분일치 필터링합니다.
 */
export async function fetchAllAcademies(
  query: AcademySearchQuery
): Promise<AcademyApiRow[]> {
  const pSize = GG_API_PAGE_SIZE;
  const allRows: AcademyApiRow[] = [];

  let pIndex = 1;
  let totalCount = Infinity;

  while (allRows.length < totalCount && pIndex <= GG_API_MAX_PAGES) {
    const { rows, totalCount: pageTotalCount } = await fetchAcademyPage(query, pIndex, pSize);

    if (pIndex === 1) {
      totalCount = pageTotalCount;
    }

    if (rows.length === 0) break; // 더 이상 데이터가 없으면 종료

    allRows.push(...rows);
    pIndex += 1;
  }

  return allRows;
}

export { GgApiError };
