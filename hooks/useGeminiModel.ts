"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_GEMINI_MODEL, GEMINI_MODEL_IDS } from "@/lib/ai-constants";

const STORAGE_KEY = "gg-gemini-model";

/**
 * 사용자가 선택한 Gemini 모델을 브라우저 localStorage에 기억해둡니다.
 * 저장된 값이 더 이상 허용 목록에 없으면(모델 목록 변경 등) 기본 모델로 되돌립니다.
 */
export function useGeminiModel() {
  const [model, setModelState] = useState(DEFAULT_GEMINI_MODEL);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && GEMINI_MODEL_IDS.includes(stored)) {
        setModelState(stored);
      }
    } catch {
      // localStorage 접근 불가 환경은 조용히 무시 (기본 모델 사용)
    }
  }, []);

  const setModel = useCallback((next: string) => {
    setModelState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 저장 실패는 무시 (세션 내 상태는 유지됨)
    }
  }, []);

  return { model, setModel };
}
