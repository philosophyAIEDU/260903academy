/**
 * AI 상권 분석가 기능 설정.
 *
 * 모델 ID는 실제 사용자 키로 라이브 호출까지 확인된 값입니다. 나중에 Gemini 쪽에서 모델을
 * 교체/폐기해 오류가 나면, 이 상수 하나만 새 모델 ID로 바꾸면 됩니다(Google AI Studio에서
 * 사용 가능한 모델 목록 확인 가능).
 */
export const GEMINI_MODEL = "gemini-3.5-flash-lite";

export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** 대화가 너무 길어져 요청이 무거워지는 것을 막기 위한 안전장치 (최근 N턴만 전송) */
export const MAX_CHAT_TURNS = 20;
