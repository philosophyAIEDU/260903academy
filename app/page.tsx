"use client";

import { useCallback, useState } from "react";
import SearchForm from "@/components/SearchForm";
import AcademyMap from "@/components/AcademyMap";
import AcademyList from "@/components/AcademyList";
import DataSourceNotice from "@/components/DataSourceNotice";
import IndustryStats from "@/components/IndustryStats";
import { useFavorites } from "@/hooks/useFavorites";
import type { Academy, AcademySearchQuery, AcademySearchResponse } from "@/types/academy";

export default function HomePage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();

  const runSearch = useCallback(async (query: AcademySearchQuery) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedId(null);

    try {
      const params = new URLSearchParams();
      if (query.sigunNm) params.set("sigunNm", query.sigunNm);
      if (query.emdNm) params.set("emdNm", query.emdNm);
      if (query.indutypeDivNm) params.set("indutypeDivNm", query.indutypeDivNm);
      if (query.faclyNm) params.set("faclyNm", query.faclyNm);

      const res = await fetch(`/api/academies?${params.toString()}`);
      const body = (await res.json()) as AcademySearchResponse | { error: string };

      if (!res.ok || "error" in body) {
        const message = "error" in body ? body.error : "학원 데이터를 불러오지 못했습니다.";
        setError(message);
        setAcademies([]);
        return;
      }

      setAcademies(body.items);
      if (body.items.length === 0) {
        setError(null);
      }
    } catch {
      setError("네트워크 오류로 학원 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setAcademies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleAcademies = showFavoritesOnly
    ? academies.filter((a) => favoriteIds.has(a.id))
    : academies;

  const handleSelect = useCallback((academy: Academy) => {
    setSelectedId(academy.id);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900">경기도 학원 검색</h1>
        <p className="text-sm text-slate-500">
          경기도교육청 학원 현황(경기데이터드림) 데이터를 기반으로 지역·업종·교습과정으로 학원을
          검색하고 지도에서 위치를 확인하세요.
        </p>
      </header>

      <SearchForm onSearch={runSearch} loading={loading} />

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!error && hasSearched && !loading && (
        <div className="flex items-center justify-between gap-2">
          <IndustryStats academies={academies} />
          {favoriteIds.size > 0 && (
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              즐겨찾기만 보기
            </label>
          )}
        </div>
      )}

      <div className="grid min-h-[520px] flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-3">
          {loading ? (
            <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-slate-400">
              학원 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div className="h-full min-h-[400px]">
              <AcademyMap
                academies={visibleAcademies}
                selectedId={selectedId}
                onMarkerSelect={handleSelect}
              />
            </div>
          )}
        </section>

        <section className="min-h-[400px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              불러오는 중...
            </div>
          ) : !hasSearched ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-400">
              시군을 선택하고 검색하면 결과가 여기에 표시됩니다.
            </div>
          ) : (
            <AcademyList
              academies={visibleAcademies}
              selectedId={selectedId}
              onSelect={handleSelect}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </section>
      </div>

      <footer className="border-t border-slate-200 pt-3">
        <DataSourceNotice />
      </footer>
    </main>
  );
}
