/**
 * AI 상권 분석가 기능 설정.
 *
 * ⚠️ 모델 이름 확인 안내: 이 프로젝트를 구성한 환경은 네트워크 정책상
 * generativelanguage.googleapis.com에 접속할 수 없어, 아래 모델 ID로 실제 호출을
 * 라이브 검증하지 못했습니다. Gemini가 "모델을 찾을 수 없음" 류의 오류를 반환하면,
 * 이 상수 하나만 실제 사용 가능한 모델 ID로 바꾸면 됩니다(Google AI Studio에서 확인 가능).
 */
export const GEMINI_MODEL = "gemini-3.5-flash-lite";

export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** 대화가 너무 길어져 요청이 무거워지는 것을 막기 위한 안전장치 (최근 N턴만 전송) */
export const MAX_CHAT_TURNS = 20;
