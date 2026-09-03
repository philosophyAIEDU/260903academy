import "server-only";
import rawStats from "@/data/processed/commercial-stats.json";
import type {
  BreakdownItem,
  CodeOption,
  CommercialAnalysisQuery,
  CommercialAnalysisResponse,
  CommercialOptionsResponse,
  GapAnalysisResult,
  GapItem,
  RawCommercialStats,
  SaturationLevel,
  SaturationResult,
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

function sumByKey(
  rows: Array<[string, string, number]>,
  keyOf: (dongCode: string, smallCode: string) => string
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [dongCode, smallCode, count] of rows) {
    const key = keyOf(dongCode, smallCode);
    counts.set(key, (counts.get(key) ?? 0) + count);
  }
  return counts;
}

function totalOf(rows: Array<[string, string, number]>): number {
  return rows.reduce((sum, [, , count]) => sum + count, 0);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildBreakdown(
  rows: Array<[string, string, number]>,
  keyOf: (dongCode: string, smallCode: string) => string,
  names: Record<string, string>,
  total: number
): BreakdownItem[] {
  const counts = sumByKey(rows, keyOf);
  return Array.from(counts.entries())
    .map(([code, count]) => ({
      code,
      name: names[code] ?? code,
      count,
      sharePct: total > 0 ? round1((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 선택한 지역의 "한 단계 위" 지역 조건과 표시용 라벨을 계산합니다.
 * 경쟁강도/업종공백 분석의 비교 기준(baseline)으로 씁니다
 * (행정동 선택 시 그 시군구 평균과, 시군구 선택 시 그 시도 평균과, 그 외엔 전체 평균과 비교).
 */
function baselineRegionOf(query: CommercialAnalysisQuery): {
  query: CommercialAnalysisQuery;
  label: string;
} {
  if (query.dongCode) {
    const sigunguCode = query.sigunguCode ?? sigunguCodeOf(query.dongCode);
    return {
      query: { sigunguCode },
      label: `${stats.sigunguNames[sigunguCode] ?? sigunguCode} 평균`,
    };
  }
  if (query.sigunguCode) {
    const sidoCode = query.sidoCode ?? sidoCodeOf(query.sigunguCode);
    return { query: { sidoCode }, label: `${stats.sidoNames[sidoCode] ?? sidoCode} 평균` };
  }
  return { query: {}, label: "전체 지역 평균" };
}

function levelOf(ratio: number): SaturationLevel {
  if (ratio < 0.5) return "very_low";
  if (ratio < 0.8) return "low";
  if (ratio <= 1.2) return "normal";
  if (ratio <= 2.0) return "high";
  return "very_high";
}

/**
 * 선택한 업종이 선택한 지역에 "상대적으로" 얼마나 밀집해 있는지 진단합니다(경쟁강도/포화도).
 * 비교 기준은 한 단계 넓은 지역의 같은 업종 비중이며, 업종을 선택하지 않았으면 진단할 수
 * 없어 null을 반환합니다.
 */
export function analyzeSaturation(query: CommercialAnalysisQuery): SaturationResult | null {
  if (!query.largeCode && !query.midCode && !query.smallCode) return null;

  const localRows = stats.stats.filter(([dongCode]) => regionMatches(dongCode, query));
  const localMatched = localRows.filter(([, smallCode]) => industryMatches(smallCode, query));
  const localTotal = totalOf(localRows);
  const localCount = totalOf(localMatched);

  const { query: baselineQuery, label: baselineLabel } = baselineRegionOf(query);
  const baselineRows = stats.stats.filter(([dongCode]) => regionMatches(dongCode, baselineQuery));
  const baselineMatched = baselineRows.filter(([, smallCode]) => industryMatches(smallCode, query));
  const baselineTotal = totalOf(baselineRows);
  const baselineCount = totalOf(baselineMatched);

  const localSharePct = localTotal > 0 ? (localCount / localTotal) * 100 : 0;
  const baselineSharePct = baselineTotal > 0 ? (baselineCount / baselineTotal) * 100 : 0;
  const ratio = baselineSharePct > 0 ? localSharePct / baselineSharePct : null;

  return {
    level: ratio !== null ? levelOf(ratio) : "normal",
    ratio: ratio !== null ? round1(ratio) : null,
    localCount,
    localTotal,
    localSharePct: round1(localSharePct),
    baselineCount,
    baselineTotal,
    baselineSharePct: round1(baselineSharePct),
    baselineLabel,
  };
}

const GAP_MIN_BASELINE_COUNT = 5; // 너무 희귀한 업종(노이즈)은 "공백"으로 취급하지 않음
const GAP_MAX_ITEMS = 8;

/**
 * 선택한 지역에서, 비교 기준(baseline) 대비 상대적으로 "부족한" 업종을 찾습니다.
 * 업종 필터를 어디까지 선택했는지에 따라 비교 레벨이 달라집니다
 * (선택 없음 → 대분류끼리, 대분류만 → 그 안의 중분류끼리, 중분류까지 → 그 안의 소분류끼리).
 */
export function analyzeGaps(query: CommercialAnalysisQuery): GapAnalysisResult {
  const { label: baselineLabel } = baselineRegionOf(query);

  // 이미 소분류까지 선택했으면 그 안에서 더 내려갈 레벨이 없어 비교가 성립하지 않습니다
  // (industryBreakdown이 같은 경우 빈 배열을 주는 것과 동일한 이유).
  if (query.smallCode) {
    return { baselineLabel, levelLabel: "소분류", items: [] };
  }

  const localRows = stats.stats.filter(([dongCode]) => regionMatches(dongCode, query));
  const { query: baselineQuery } = baselineRegionOf(query);
  const baselineRows = stats.stats.filter(([dongCode]) => regionMatches(dongCode, baselineQuery));

  let keyOf: (dongCode: string, smallCode: string) => string;
  let levelLabel: string;
  if (query.midCode) {
    keyOf = (_, smallCode) => smallCode;
    levelLabel = "소분류";
  } else if (query.largeCode) {
    keyOf = (_, smallCode) => midCodeOf(smallCode);
    levelLabel = "중분류";
  } else {
    keyOf = (_, smallCode) => largeCodeOf(smallCode);
    levelLabel = "대분류";
  }

  // local/baseline 모두 query에 이미 선택된 업종 필터(large/mid) 안으로 좁혀서 비교해야
  // 의미가 있습니다(예: 대분류=음식을 선택했으면 baseline도 음식 안에서의 분포와 비교).
  const localFiltered = localRows.filter(([, smallCode]) => industryMatches(smallCode, query));
  const baselineFiltered = baselineRows.filter(([, smallCode]) => industryMatches(smallCode, query));

  const localCounts = sumByKey(localFiltered, keyOf);
  const baselineCounts = sumByKey(baselineFiltered, keyOf);
  const localTotal = totalOf(localFiltered);
  const baselineTotal = totalOf(baselineFiltered);

  const items: GapItem[] = [];
  for (const [code, baselineCount] of baselineCounts) {
    if (baselineCount < GAP_MIN_BASELINE_COUNT) continue;
    const localCount = localCounts.get(code) ?? 0;
    const localSharePct = localTotal > 0 ? (localCount / localTotal) * 100 : 0;
    const baselineSharePct = baselineTotal > 0 ? (baselineCount / baselineTotal) * 100 : 0;
    const ratio = baselineSharePct > 0 ? localSharePct / baselineSharePct : 0;
    items.push({
      code,
      name: stats.industryNames[code] ?? code,
      localCount,
      baselineCount,
      localSharePct: round1(localSharePct),
      baselineSharePct: round1(baselineSharePct),
      ratio: round1(ratio),
    });
  }

  items.sort((a, b) => a.ratio - b.ratio || b.baselineCount - a.baselineCount);

  return { baselineLabel, levelLabel, items: items.slice(0, GAP_MAX_ITEMS) };
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
    sharePctOfRegion: regionTotalCount > 0 ? round1((totalCount / regionTotalCount) * 100) : 0,
    industryBreakdown,
    dongBreakdown,
    saturation: analyzeSaturation(query),
    gapAnalysis: analyzeGaps(query),
    meta: stats.meta,
  };
}
