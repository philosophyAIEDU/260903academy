import { NextRequest, NextResponse } from "next/server";
import { analyzeCommercial } from "@/lib/commercial";

export const dynamic = "force-dynamic";

/**
 * GET /api/commercial-analysis?sidoCode=&sigunguCode=&dongCode=&largeCode=&midCode=&smallCode=
 * 지역+업종 조건에 대한 상권 통계(점포 수, 업종별/행정동별 분포)를 반환합니다.
 * 실제 계산은 미리 집계해둔 data/processed/commercial-stats.json 위에서 이뤄지므로
 * 원본 CSV(수십만 행)를 매 요청마다 파싱하지 않습니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = {
    sidoCode: searchParams.get("sidoCode")?.trim() || undefined,
    sigunguCode: searchParams.get("sigunguCode")?.trim() || undefined,
    dongCode: searchParams.get("dongCode")?.trim() || undefined,
    largeCode: searchParams.get("largeCode")?.trim() || undefined,
    midCode: searchParams.get("midCode")?.trim() || undefined,
    smallCode: searchParams.get("smallCode")?.trim() || undefined,
  };

  try {
    return NextResponse.json(analyzeCommercial(query));
  } catch (error) {
    console.error("[api/commercial-analysis] 오류:", error);
    return NextResponse.json(
      { error: "상권분석 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
