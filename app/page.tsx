"use client";

import { useCallback, useState } from "react";
import SearchForm from "@/components/SearchForm";
import AcademyMap from "@/components/AcademyMap";
import AcademyList from "@/components/AcademyList";
import DataSourceNotice from "@/components/DataSourceNotice";
import IndustryStats from "@/components/IndustryStats";
import { AlertIcon, ListIcon, MapIcon } from "@/components/icons";
import { useFavorites } from "@/hooks/useFavorites";
import type { Academy, AcademySearchQuery, AcademySearchResponse } from "@/types/academy";

export default function HomePage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"map" | "list">("map");

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
    setMobilePanel("map");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
            경
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-slate-900">
              경기도 학원 검색
            </h1>
            <p className="truncate text-[11px] leading-tight text-slate-500">
              경기데이터드림 공공데이터 기반 학원 위치 검색
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
        <SearchForm onSearch={runSearch} loading={loading} />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!error && hasSearched && !loading && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <IndustryStats academies={academies} />
            {favoriteIds.size > 0 && (
              <label className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                즐겨찾기만 보기
              </label>
            )}
          </div>
        )}

        {/* 모바일 전용 지도/목록 전환 탭 */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePanel("map")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              mobilePanel === "map" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            지도
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel("list")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              mobilePanel === "list" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            목록
            {visibleAcademies.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                {visibleAcademies.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid min-h-[560px] flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
          <section
            className={`flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3 lg:flex ${
              mobilePanel === "map" ? "flex" : "hidden"
            }`}
          >
            <div className="flex h-full min-h-[460px] flex-col">
              {loading ? (
                <MapSkeleton />
              ) : (
                <AcademyMap
                  academies={visibleAcademies}
                  selectedId={selectedId}
                  onMarkerSelect={handleSelect}
                />
              )}
            </div>
          </section>

          <section
            className={`min-h-[460px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2 lg:flex ${
              mobilePanel === "list" ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-slate-700">검색 결과</h2>
              {hasSearched && !loading && (
                <span className="text-xs text-slate-400">{visibleAcademies.length}건</span>
              )}
            </div>
            <div className="min-h-0 flex-1">
              {loading ? (
                <ListSkeleton />
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
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-200 pt-3 pb-2">
          <DataSourceNotice />
        </footer>
      </main>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full w-full p-3">
      <div className="skeleton h-full w-full rounded-lg" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-3.5 w-2/3 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
