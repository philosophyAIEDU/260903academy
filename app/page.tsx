"use client";

import { useCallback, useState } from "react";
import SearchForm from "@/components/SearchForm";
import AcademyMap from "@/components/AcademyMap";
import AcademyList from "@/components/AcademyList";
import DataSourceNotice from "@/components/DataSourceNotice";
import IndustryStats from "@/components/IndustryStats";
import StatsBar from "@/components/StatsBar";
import { AlertIcon, ListIcon, MapIcon } from "@/components/icons";
import { DATA_REFERENCE_DATE } from "@/lib/constants";
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/10">
        <div
          className="pointer-events-none absolute -left-14 -top-16 h-52 w-52 animate-blob rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 animate-blob rounded-full bg-sky-300/25 blur-3xl [animation-delay:2s]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white shadow-inner ring-1 ring-white/25 backdrop-blur">
            경
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight text-white">
              경기도 학원 검색
            </h1>
            <p className="truncate text-xs leading-tight text-indigo-100">
              경기데이터드림 공공데이터 기반 · 실시간 지도 검색
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            데이터 기준 {DATA_REFERENCE_DATE}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-5 sm:p-6">
        <SearchForm onSearch={runSearch} loading={loading} />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!error && hasSearched && !loading && (
          <div className="flex animate-fade-up flex-col gap-3">
            <StatsBar academies={academies} favoritesCount={favoriteIds.size} />
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
          </div>
        )}

        {/* 모바일 전용 지도/목록 전환 탭 */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePanel("map")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              mobilePanel === "map"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            지도
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel("list")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              mobilePanel === "list"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
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

        <div className="grid min-h-[560px] flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
          <section
            className={`flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel lg:col-span-3 lg:flex ${
              mobilePanel === "map" ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <MapIcon className="h-3.5 w-3.5" />
                </span>
                지도
              </h2>
              {hasSearched && !loading && (
                <span className="text-xs text-slate-400">
                  {visibleAcademies.length.toLocaleString()}건 표시 중
                </span>
              )}
            </div>
            <div className="min-h-0 flex-1">
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
            className={`flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel lg:col-span-2 lg:flex ${
              mobilePanel === "list" ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <ListIcon className="h-3.5 w-3.5" />
                </span>
                검색 결과
              </h2>
              {hasSearched && !loading && (
                <span className="text-xs text-slate-400">
                  {visibleAcademies.length.toLocaleString()}건
                </span>
              )}
            </div>
            <div className="min-h-0 flex-1">
              {loading ? (
                <ListSkeleton />
              ) : !hasSearched ? (
                <EmptyState
                  title="검색 결과가 여기에 표시됩니다"
                  subtitle="시군을 선택하고 검색해보세요"
                />
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

        <footer className="pb-2 pt-1">
          <DataSourceNotice />
        </footer>
      </main>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-400 ring-1 ring-indigo-100">
        <ListIcon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>
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
