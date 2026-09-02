"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gg-academy-favorites";

/** 로컬스토리지 기반 즐겨찾기 (학원 id 목록) 관리 훅. */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoriteIds(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // localStorage 접근 불가 환경(사파리 프라이빗 모드 등)은 조용히 무시
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFavoriteIds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // 저장 실패는 무시 (기능 저하 없이 세션 내 상태만 유지)
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = new Set(favoriteIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      persist(next);
    },
    [favoriteIds, persist]
  );

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite, isLoaded };
}
