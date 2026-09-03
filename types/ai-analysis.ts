import type { CommercialAnalysisResponse } from "@/types/commercial";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface AiAnalysisRequestBody {
  /** 사용자가 직접 입력한 Gemini API 키. 서버는 이 요청을 처리하는 동안만 사용하고 저장하지 않습니다. */
  apiKey: string;
  /** 대화의 근거가 되는 현재 상권분석 결과 (매 요청마다 시스템 프롬프트로 다시 구성됨) */
  result: CommercialAnalysisResponse;
  /** 지금까지의 대화(가장 최근 사용자 메시지 포함) */
  messages: ChatMessage[];
  /** 사용자가 선택한 Gemini 모델 ID. 비어있거나 허용 목록에 없으면 서버가 기본 모델로 대체합니다. */
  model?: string;
}

export interface AiAnalysisResponseBody {
  text: string;
}

export interface AiAnalysisErrorBody {
  error: string;
}
