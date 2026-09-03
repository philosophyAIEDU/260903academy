import { NextRequest, NextResponse } from "next/server";
import { listStores } from "@/lib/commercial-stores";

export const dynamic = "force-dynamic";

/**
 * GET /api/commercial-analysis/stores?sigunguCode=&dongCode=&largeCode=&midCode=&smallCode=&nameQuery=&limit=
 * 지도에 표시할 업체 목록(업체명·주소·좌표)을 반환합니다. sigunguCode는 필수입니다
 * (업체 데이터가 시군구 단위 정적 파일로 나뉘어 있어, 한 번에 한 시군구만 조회합니다).
 * nameQuery를 주면 상호명/지점명 부분일치로 추가 필터링합니다(대소문자 무시).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sigunguCode = searchParams.get("sigunguCode")?.trim();

  if (!sigunguCode) {
    return NextResponse.json({ error: "sigunguCode는 필수 파라미터입니다." }, { status: 400 });
  }

  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 300, 1), 1000) : undefined;

  const query = {
    sigunguCode,
    dongCode: searchParams.get("dongCode")?.trim() || undefined,
    largeCode: searchParams.get("largeCode")?.trim() || undefined,
    midCode: searchParams.get("midCode")?.trim() || undefined,
    smallCode: searchParams.get("smallCode")?.trim() || undefined,
    nameQuery: searchParams.get("nameQuery")?.trim() || undefined,
    limit,
  };

  try {
    const result = await listStores(query, request.nextUrl.origin);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/commercial-analysis/stores] 오류:", error);
    return NextResponse.json(
      { error: "업체 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
