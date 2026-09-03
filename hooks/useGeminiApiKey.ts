"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gg-gemini-api-key";

/**
 * Gemini API 키를 브라우저 localStorage에만 저장합니다. 서버에는 절대 저장되지 않으며,
 * "AI 분석" 요청을 보낼 때마다 이 키를 함께 실어 보내는 용도로만 씁니다
 * (app/api/ai-analysis/route.ts는 요청 처리 중에만 사용하고 로그에 남기거나 저장하지 않음).
 */
export function useGeminiApiKey() {
  const [apiKey, setApiKeyState] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setApiKeyState(stored);
    } catch {
      // localStorage 접근 불가 환경은 조용히 무시 (키 입력을 매번 다시 하게 됨)
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    try {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_KEY, trimmed);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // 저장 실패는 무시 (세션 내 상태는 유지됨)
    }
  }, []);

  return { apiKey, setApiKey, isLoaded, hasKey: apiKey.length > 0 };
}
