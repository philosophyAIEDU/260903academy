import "server-only";
import rawStats from "@/data/processed/commercial-stats.json";
import type {
  BreakdownItem,
  CodeOption,
  CommercialAnalysisQuery,
  CommercialAnalysisResponse,
  CommercialOptionsResponse,
  RawCommercialStats,
} from "@/types/commercial";

// JSON 모듈은 stats 필드를 튜플이 아닌 (string|number)[][]로만 추론하므로 unknown을 거쳐 캐스팅합니다.
const stats = rawStats as unknown as RawCommercialStats;

// ── 코드 계층 구조 유틸 ──────────────────────────────────────────
// 업종: 대분류(2자) ⊂ 중분류(4자) ⊂ 소분류(6자) — 모두 앞자리가 접두사로 포함됨
// 지역: 시도(2자) ⊂ 시군구(5자) ⊂ 행정동(8자) — 마찬가지로 접두사 포함
export function largeCodeOf(smallCode: string): string {
  return smallCode.slice(0, 2);
}
export function midCodeOf(smallCode: string): string {
  return smallCode.slice(0, 4);
}
export function sidoCodeOf(dongCode: string): string {
  return dongCode.slice(0, 2);
}
export function sigunguCodeOf(dongCode: string): string {
  return dongCode.slice(0, 5);
}

function toOption(code: string, names: Record<string, string>): CodeOption {
  return { code, name: names[code] ?? code };
}

function sortByName(a: CodeOption, b: CodeOption): number {
  return a.name.localeCompare(b.name, "ko");
}

/**
 * 드롭다운에 쓸 옵션 목록. 상위 코드(parentCode)가 주어지면 그 하위만 필터링합니다.
 * "데이터가 실제로 존재하는" 코드만 내려주기 위해 stats를 훑어 사용된 코드만 모읍니다
 * (아직 전국 데이터가 다 없는 초기 단계라, 없는 지역/업종을 선택 가능하게 보여주지 않기 위함).
 */
export function getOptions(): CommercialOptionsResponse {
  const dongCodes = new Set<string>();
  const smallCodes = new Set<string>();
  for (const [dongCode, smallCode] of stats.stats) {
    dongCodes.add(dongCode);
    smallCodes.add(smallCode);
  }

  const sigunguCodes = new Set(Array.from(dongCodes, sigunguCodeOf));
  const sidoCodes = new Set(Array.from(dongCodes, sidoCodeOf));
  const midCodes = new Set(Array.from(smallCodes, midCodeOf));
  const largeCodes = new Set(Array.from(smallCodes, largeCodeOf));

  return {
    sido: Array.from(sidoCodes, (c) => toOption(c, stats.sidoNames)).sort(sortByName),
    sigungu: Array.from(sigunguCodes, (c) => toOption(c, stats.sigunguNames)).sort(sortByName),
    dong: Array.from(dongCodes, (c) => toOption(c, stats.dongNames)).sort(sortByName),
    large: Array.from(largeCodes, (c) => toOption(c, stats.industryNames)).sort(sortByName),
    mid: Array.from(midCodes, (c) => toOption(c, stats.industryNames)).sort(sortByName),
    small: Array.from(smallCodes, (c) => toOption(c, stats.industryNames)).sort(sortByName),
    meta: stats.meta,
  };
}

function regionMatches(dongCode: string, query: CommercialAnalysisQuery): boolean {
  if (query.dongCode) return dongCode === query.dongCode;
  if (query.sigunguCode) return sigunguCodeOf(dongCode) === query.sigunguCode;
  if (query.sidoCode) return sidoCodeOf(dongCode) === query.sidoCode;
  return true;
}

function industryMatches(smallCode: string, query: CommercialAnalysisQuery): boolean {
  if (query.smallCode) return smallCode === query.smallCode;
  if (query.midCode) return midCodeOf(smallCode) === query.midCode;
  if (query.largeCode) return largeCodeOf(smallCode) === query.largeCode;
  return true;
}

function buildBreakdown(
  rows: Array<[string, string, number]>,
  keyOf: (dongCode: string, smallCode: string) => string,
  names: Record<string, string>,
  total: number
): BreakdownItem[] {
  const counts = new Map<string, number>();
  for (const [dongCode, smallCode, count] of rows) {
    const key = keyOf(dongCode, smallCode);
    counts.set(key, (counts.get(key) ?? 0) + count);
  }
  return Array.from(counts.entries())
    .map(([code, count]) => ({
      code,
      name: names[code] ?? code,
      count,
      sharePct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 지역+업종 조건으로 상권을 분석합니다. 지역/업종 조건은 각각 선택 사항이며,
 * 더 구체적인 코드(dongCode > sigunguCode > sidoCode, smallCode > midCode > largeCode)가
 * 있으면 그것을 우선합니다.
 */
export function analyzeCommercial(query: CommercialAnalysisQuery): CommercialAnalysisResponse {
  const regionRows = stats.stats.filter(([dongCode]) => regionMatches(dongCode, query));
  const matchedRows = regionRows.filter(([, smallCode]) => industryMatches(smallCode, query));

  const regionTotalCount = regionRows.reduce((sum, [, , count]) => sum + count, 0);
  const totalCount = matchedRows.reduce((sum, [, , count]) => sum + count, 0);

  // 업종 드릴다운: 이미 소분류까지 선택했으면 더 내려갈 레벨이 없음
  let industryBreakdown: BreakdownItem[] = [];
  if (query.smallCode) {
    industryBreakdown = [];
  } else if (query.midCode) {
    industryBreakdown = buildBreakdown(
      matchedRows,
      (_, smallCode) => smallCode,
      stats.industryNames,
      totalCount
    );
  } else if (query.largeCode) {
    industryBreakdown = buildBreakdown(
      matchedRows,
      (_, smallCode) => midCodeOf(smallCode),
      stats.industryNames,
      totalCount
    );
  } else {
    industryBreakdown = buildBreakdown(
      matchedRows,
      (_, smallCode) => largeCodeOf(smallCode),
      stats.industryNames,
      totalCount
    );
  }

  // 지역 드릴다운(행정동별 비교): 이미 행정동까지 선택했으면 의미 없음
  const dongBreakdown = query.dongCode
    ? []
    : buildBreakdown(matchedRows, (dongCode) => dongCode, stats.dongNames, totalCount);

  const scope: CommercialAnalysisResponse["scope"] = {};
  if (query.sidoCode) scope.sido = toOption(query.sidoCode, stats.sidoNames);
  if (query.sigunguCode) scope.sigungu = toOption(query.sigunguCode, stats.sigunguNames);
  if (query.dongCode) scope.dong = toOption(query.dongCode, stats.dongNames);
  if (query.largeCode) scope.large = toOption(query.largeCode, stats.industryNames);
  if (query.midCode) scope.mid = toOption(query.midCode, stats.industryNames);
  if (query.smallCode) scope.small = toOption(query.smallCode, stats.industryNames);

  return {
    scope,
    totalCount,
    regionTotalCount,
    sharePctOfRegion:
      regionTotalCount > 0 ? Math.round((totalCount / regionTotalCount) * 1000) / 10 : 0,
    industryBreakdown,
    dongBreakdown,
    meta: stats.meta,
  };
}
