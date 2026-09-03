import { NextRequest, NextResponse } from "next/server";
import { GEMINI_API_BASE, GEMINI_MODEL, MAX_CHAT_TURNS } from "@/lib/ai-constants";
import { buildSystemInstruction } from "@/lib/gemini-prompt";
import type { AiAnalysisRequestBody } from "@/types/ai-analysis";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-analysis
 * body: { apiKey, result, messages }
 *
 * "AI 상권 분석가" 채팅의 프록시입니다. apiKey는 사용자가 브라우저에 직접 저장해둔
 * 자기 자신의 Gemini API 키이며, 이 요청을 Gemini에 그대로 전달하는 용도로만 쓰고
 * 서버에 저장하거나 로그로 남기지 않습니다(아래 catch에서도 error만 로깅하고 body는
 * 로깅하지 않는 것에 주의).
 *
 * Gemini API는 대화 상태를 서버에 저장하지 않으므로(stateless), 매 턴마다 전체 대화
 * 이력(messages)과 근거 데이터로 만든 systemInstruction을 함께 보냅니다.
 */
export async function POST(request: NextRequest) {
  let body: AiAnalysisRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const apiKey = body.apiKey?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API 키가 필요합니다." }, { status: 400 });
  }
  if (!body.result) {
    return NextResponse.json({ error: "분석할 상권 데이터가 없습니다." }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "대화 내용이 비어 있습니다." }, { status: 400 });
  }

  const systemInstruction = buildSystemInstruction(body.result);
  // 대화가 너무 길어지는 것을 막기 위해 최근 N턴만 전송합니다.
  const recentMessages = body.messages.slice(-MAX_CHAT_TURNS);

  const geminiBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: recentMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 1024,
    },
  };

  try {
    const res = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
        cache: "no-store",
      }
    );

    const data: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (data as { error?: { message?: string } } | null)?.error?.message ??
        `Gemini API 오류 (HTTP ${res.status})`;
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const candidate = (
      data as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        promptFeedback?: { blockReason?: string };
      } | null
    )?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    if (!text.trim()) {
      const blockReason = (data as { promptFeedback?: { blockReason?: string } } | null)
        ?.promptFeedback?.blockReason;
      return NextResponse.json(
        {
          error: blockReason
            ? `Gemini가 안전 정책에 따라 응답을 차단했습니다 (${blockReason}).`
            : "Gemini로부터 응답을 받지 못했습니다.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    // apiKey는 절대 로그에 남기지 않습니다.
    console.error("[api/ai-analysis] 오류:", error);
    return NextResponse.json(
      { error: "Gemini 호출 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
