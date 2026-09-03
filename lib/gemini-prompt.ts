import type { CommercialAnalysisResponse } from "@/types/commercial";

function scopeText(scope: CommercialAnalysisResponse["scope"]) {
  const region = [scope.sido?.name, scope.sigungu?.name, scope.dong?.name]
    .filter(Boolean)
    .join(" ");
  const industry = [scope.large?.name, scope.mid?.name, scope.small?.name]
    .filter(Boolean)
    .join(" > ");
  return {
    region: region || "전체 지역",
    industry: industry || "전체 업종",
  };
}

/**
 * 현재 상권분석 결과를 근거 데이터로 삼아 Gemini의 systemInstruction을 만듭니다.
 * 매 대화 턴마다 다시 전송되므로(Gemini API는 상태를 저장하지 않음), 여기 있는 수치만
 * 근거로 쓰도록 명시적으로 지시해 없는 통계를 지어내는 것을 막습니다.
 */
export function buildSystemInstruction(result: CommercialAnalysisResponse): string {
  const { region, industry } = scopeText(result.scope);
  const lines: string[] = [];

  lines.push(
    "당신은 대한민국 소상공인을 대상으로 상권분석 컨설팅을 하는 전문가 'AI 상권 분석가'입니다.",
    "사용자가 조회한 아래의 실제 데이터를 근거로, 전문적이고 실용적인 조언을 한국어로 제공하세요.",
    "",
    `[분석 대상] 지역: ${region} / 업종: ${industry}`,
    `[점포 수] 선택 조건: ${result.totalCount.toLocaleString()}개 · 선택 지역 전체 업종: ${result.regionTotalCount.toLocaleString()}개 (비중 ${result.sharePctOfRegion}%)`
  );

  if (result.saturation) {
    const s = result.saturation;
    lines.push(
      `[경쟁강도] ${s.baselineLabel} 대비 ${s.ratio ?? "N/A"}배 밀집 (이 지역 ${s.localCount.toLocaleString()}개·${s.localSharePct}%, 비교기준 ${s.baselineCount.toLocaleString()}개·${s.baselineSharePct}%)`
    );
  }

  if (result.industryBreakdown.length > 0) {
    const top = result.industryBreakdown
      .slice(0, 6)
      .map((i) => `${i.name}(${i.count.toLocaleString()}개,${i.sharePct}%)`)
      .join(", ");
    lines.push(`[하위 업종 분포 상위] ${top}`);
  }

  if (result.dongBreakdown.length > 0) {
    const top = result.dongBreakdown
      .slice(0, 6)
      .map((d) => `${d.name}(${d.count.toLocaleString()}개,${d.sharePct}%)`)
      .join(", ");
    lines.push(`[행정동별 분포 상위] ${top}`);
  }

  if (result.gapAnalysis.items.length > 0) {
    const gaps = result.gapAnalysis.items
      .slice(0, 6)
      .map(
        (g) =>
          `${g.name}(이 지역 ${g.localCount.toLocaleString()}개 vs ${result.gapAnalysis.baselineLabel} ${g.baselineCount.toLocaleString()}개, 비율 ${g.ratio}배)`
      )
      .join(", ");
    lines.push(`[업종 공백(상대적으로 적은 업종) 상위] ${gaps}`);
  }

  lines.push(
    "",
    "규칙:",
    "- 위에 주어진 수치 외의 통계·매출·유동인구·임대료 등을 지어내지 마세요. 그런 정보가 없다는 점을 밝히고, 참고용 점포 수 데이터 기준의 정성적 조언만 제공하세요.",
    "- 사용자가 인사만 하거나 잡담을 해도 자연스럽게 응대하되, 상권분석과 무관한 주제로 대화가 흘러가면 본래 역할(상권분석 컨설팅)로 정중히 돌아오세요.",
    "- 답변은 친절하고 전문적인 컨설턴트 어투로, 너무 길지 않게 핵심 위주로 작성하세요(특별한 요청이 없다면 5~8문장 내외).",
    "- 첫 응답이나 중요한 조언을 줄 때는 \"실제 상권 조사·현장 확인이 필요합니다\"라는 취지를 짧게 덧붙이세요."
  );

  return lines.join("\n");
}
