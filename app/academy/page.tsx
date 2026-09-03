"use client";

import { useCallback, useState } from "react";
import ExecutiveHeader from "@/components/ExecutiveHeader";
import SearchForm from "@/components/SearchForm";
import AcademyMap from "@/components/AcademyMap";
import AcademyList from "@/components/AcademyList";
import DataSourceNotice from "@/components/DataSourceNotice";
import IndustryStats from "@/components/IndustryStats";
import StatsBar from "@/components/StatsBar";
import { AlertIcon, ListIcon, MapIcon, SparklesIcon } from "@/components/icons";
import { DATA_REFERENCE_DATE } from "@/lib/constants";
import { useFavorites } from "@/hooks/useFavorites";
import type { Academy, AcademySearchQuery, AcademySearchResponse } from "@/types/academy";

export default function AcademyPage() {
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
      <ExecutiveHeader
        currentTab="academy"
        subtitle="경기도교육청 공공데이터 기반 실시간 인허가 학원·교습소 지도 검색"
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* 상단 럭셔리 배너 */}
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/70 p-6 sm:p-8 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                  <SparklesIcon className="h-3.5 w-3.5 text-indigo-600" />
                  경기도 교육청 공식 데이터 연동
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-medium text-slate-500">
                  실시간 위치 및 교습과정 분석
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                경기도 학원 공간 인텔리전스
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                경기도 31개 시·군 내 인허가 학원의 정밀 주소, 교습계열, 개설 과정 및 전화번호를
                고해상도 지도와 실시간 리스트로 확인하세요.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-3.5 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500">데이터 기준일</span>
              <p className="text-sm font-extrabold text-indigo-900">{DATA_REFERENCE_DATE}</p>
            </div>
          </div>
        </div>

        <SearchForm onSearch={runSearch} loading={loading} />

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {!error && hasSearched && !loading && (
          <div className="flex animate-fade-up flex-col gap-4">
            <StatsBar academies={academies} favoritesCount={favoriteIds.size} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <IndustryStats academies={academies} />
              </div>
              {favoriteIds.size > 0 && (
                <label className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm cursor-pointer hover:bg-amber-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>★ 즐겨찾기 학원만 보기 ({favoriteIds.size}개)</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* 모바일 뷰 전환 탭 */}
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePanel("map")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all ${
              mobilePanel === "map"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MapIcon className="h-4 w-4 text-amber-600" />
            지도 화면
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel("list")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all ${
              mobilePanel === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ListIcon className="h-4 w-4 text-indigo-600" />
            목록 화면
            {visibleAcademies.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                {visibleAcademies.length}
              </span>
            )}
          </button>
        </div>

        {/* 지도 & 리스트 분할 뷰 */}
        <div className="grid min-h-[580px] flex-1 grid-cols-1 gap-5 lg:grid-cols-5">
          {/* 지도 패널 */}
          <section
            className={`flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-panel lg:col-span-3 lg:flex ${
              mobilePanel === "map" ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                  <MapIcon className="h-3.5 w-3.5" />
                </span>
                공간 지리 지도 뷰
              </h2>
              {hasSearched && !loading && (
                <span className="text-xs font-semibold text-slate-500">
                  {visibleAcademies.length.toLocaleString()}개소 표시 중
                </span>
              )}
            </div>
            <div className="min-h-0 flex-1 relative bg-slate-50">
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

          {/* 목록 패널 */}
          <section
            className={`flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-panel lg:col-span-2 lg:flex ${
              mobilePanel === "list" ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-amber-400 shadow-sm">
                  <ListIcon className="h-3.5 w-3.5" />
                </span>
                학원 목록
              </h2>
              {hasSearched && !loading && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  총 {visibleAcademies.length.toLocaleString()}건
                </span>
              )}
            </div>
            <div className="min-h-0 flex-1">
              {loading ? (
                <ListSkeleton />
              ) : !hasSearched ? (
                <EmptyState
                  title="검색 조건에 따른 학원이 여기에 표시됩니다"
                  subtitle="위의 검색 조건에서 시군을 선택한 후 검색해보세요"
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

        <footer className="pb-4 pt-2">
          <DataSourceNotice
            sourceName="경기데이터드림 경기도 학원·교습소 현황"
            referenceLabel={DATA_REFERENCE_DATE}
            message="학원의 실제 인허가 및 정원, 폐업 정보는 교육지원청 또는 해당 학원에 직접 확인하시기 바랍니다."
          />
        </footer>
      </main>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center bg-white">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 shadow-inner">
        <ListIcon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full w-full p-4">
      <div className="skeleton h-full w-full rounded-2xl" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-slate-100 bg-white">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-5 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
