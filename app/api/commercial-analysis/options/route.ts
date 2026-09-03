import { NextResponse } from "next/server";
import { getOptions } from "@/lib/commercial";

export const dynamic = "force-dynamic";

/**
 * GET /api/commercial-analysis/options
 * 상권분석 화면의 지역/업종 드롭다운에 쓸 옵션 목록을 반환합니다.
 * (아직 데이터가 있는 지역만 내려줍니다 — 전국 데이터가 모이기 전까지는 일부 지역만 나옵니다)
 */
export async function GET() {
  try {
    return NextResponse.json(getOptions());
  } catch (error) {
    console.error("[api/commercial-analysis/options] 오류:", error);
    return NextResponse.json(
      { error: "상권분석 옵션을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
