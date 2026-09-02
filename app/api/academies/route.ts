import { NextRequest, NextResponse } from "next/server";
import { fetchAllAcademies, GgApiError } from "@/lib/gg-api";
import { hasValidCoordinate, normalizeAcademyRow } from "@/lib/normalize";
import { DATA_REFERENCE_DATE } from "@/lib/constants";
import type { AcademySearchResponse } from "@/types/academy";

export const dynamic = "force-dynamic";

/**
 * GET /api/academies?sigunNm=...&emdNm=...&indutypeDivNm=...&faclyNm=...
 *
 * 경기데이터드림 Tbinstutm API를 대신 호출하는 서버 프록시입니다.
 * - GG_API_KEY는 서버(이 파일) 밖으로 절대 노출되지 않습니다.
 * - SIGUN_NM / INDUTYPE_DIV_NM은 원본 API 파라미터로 전달해 데이터량을 줄입니다.
 * - EMD_NM(읍면동), 학원명(faclyNm)은 API가 지원하지 않는 파라미터이므로,
 *   위 조건으로 받아온 결과에 대해 여기서 부분일치(includes) 필터링을 적용합니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const sigunNm = searchParams.get("sigunNm")?.trim() || undefined;
  const emdNm = searchParams.get("emdNm")?.trim() || undefined;
  const indutypeDivNm = searchParams.get("indutypeDivNm")?.trim() || undefined;
  const faclyNm = searchParams.get("faclyNm")?.trim() || undefined;

  try {
    const rawRows = await fetchAllAcademies({ sigunNm, indutypeDivNm });

    let items = rawRows.map(normalizeAcademyRow).filter(hasValidCoordinate);

    if (emdNm) {
      const needle = emdNm.toLowerCase();
      items = items.filter((a) => a.emdName.toLowerCase().includes(needle));
    }
    if (faclyNm) {
      const needle = faclyNm.toLowerCase();
      items = items.filter((a) => a.name.toLowerCase().includes(needle));
    }

    const body: AcademySearchResponse = {
      items,
      totalCount: items.length,
      dataReferenceDate: DATA_REFERENCE_DATE,
    };

    return NextResponse.json(body);
  } catch (error) {
    const message =
      error instanceof GgApiError
        ? error.message
        : "학원 데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.";
    console.error("[api/academies] 오류:", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
