/**
 * AI 상권 분석가 기능 설정.
 *
 * 첫 번째 모델(gemini-3.5-flash-lite)은 실제 사용자 키로 라이브 호출까지 확인된 값입니다.
 * 나머지 모델은 사용자가 선택할 수 있도록 추가한 옵션이며, Google AI Studio에서 제공하는
 * 모델 ID와 정확히 일치해야 정상 동작합니다(모델이 교체/폐기되면 이 목록만 수정하면 됩니다).
 */
export interface GeminiModelOption {
  id: string;
  label: string;
  description: string;
}

export const GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    description: "가장 빠르고 가벼운 기본 모델",
  },
  {
    id: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    description: "더 깊이 있는 분석에 적합한 모델",
  },
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    description: "최신 고성능 모델",
  },
];

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS[0]!.id;

export const GEMINI_MODEL_IDS = GEMINI_MODELS.map((m) => m.id);

export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** 대화가 너무 길어져 요청이 무거워지는 것을 막기 위한 안전장치 (최근 N턴만 전송) */
export const MAX_CHAT_TURNS = 20;
