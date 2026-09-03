"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import RegionIndustryPicker from "@/components/analysis/RegionIndustryPicker";
import CompareResult from "@/components/analysis/CompareResult";
import DataSourceNotice from "@/components/DataSourceNotice";
import { AlertIcon, SearchIcon } from "@/components/icons";
import type {
  CommercialAnalysisQuery,
  CommercialAnalysisResponse,
  CommercialOptionsResponse,
} from "@/types/commercial";

const COMMERCIAL_SOURCE_NAME = "소상공인시장진흥공단 상가(상권)정보";

function buildQueryString(query: CommercialAnalysisQuery): string {
  const params = new URLSearchParams();
  if (query.sidoCode) params.set("sidoCode", query.sidoCode);
  if (query.sigunguCode) params.set("sigunguCode", query.sigunguCode);
  if (query.dongCode) params.set("dongCode", query.dongCode);
  if (query.largeCode) params.set("largeCode", query.largeCode);
  if (query.midCode) params.set("midCode", query.midCode);
  if (query.smallCode) params.set("smallCode", query.smallCode);
  return params.toString();
}

function regionLabel(
  query: CommercialAnalysisQuery,
  options: CommercialOptionsResponse | null
): string {
  if (!options) return "지역";
  const dong = options.dong.find((d) => d.code === query.dongCode);
  const sigungu = options.sigungu.find((s) => s.code === query.sigunguCode);
  const sido = options.sido.find((s) => s.code === query.sidoCode);
  return dong?.name ?? sigungu?.name ?? sido?.name ?? "전체";
}

async function fetchAnalysis(query: CommercialAnalysisQuery) {
  const res = await fetch(`/api/commercial-analysis?${buildQueryString(query)}`);
  const body = (await res.json()) as CommercialAnalysisResponse | { error: string };
  if (!res.ok || "error" in body) {
    throw new Error("error" in body ? body.error : "분석 결과를 불러오지 못했습니다.");
  }
  return body;
}

export default function ComparePage() {
  const [options, setOptions] = useState<CommercialOptionsResponse | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [queryA, setQueryA] = useState<CommercialAnalysisQuery>({});
  const [queryB, setQueryB] = useState<CommercialAnalysisQuery>({});
  const [resultA, setResultA] = useState<CommercialAnalysisResponse | null>(null);
  const [resultB, setResultB] = useState<CommercialAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompared, setHasCompared] = useState(false);

  useEffect(() => {
    fetch("/api/commercial-analysis/options")
      .then((res) => res.json())
      .then((body: CommercialOptionsResponse | { error: string }) => {
        if ("error" in body) {
          setOptionsError(body.error);
          return;
        }
        setOptions(body);
        if (body.sido.length === 1) {
          const sidoCode = body.sido[0]!.code;
          setQueryA((prev) => ({ ...prev, sidoCode }));
          setQueryB((prev) => ({ ...prev, sidoCode }));
        }
      })
      .catch(() => setOptionsError("지역/업종 옵션을 불러오지 못했습니다."));
  }, []);

  const runCompare = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasCompared(true);
    try {
      const [a, b] = await Promise.all([fetchAnalysis(queryA), fetchAnalysis(queryB)]);
      setResultA(a);
      setResultB(b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "비교 결과를 불러오지 못했습니다.");
      setResultA(null);
      setResultB(null);
    } finally {
      setLoading(false);
    }
  }, [queryA, queryB]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 shadow-lg shadow-blue-900/10">
        <div
          className="pointer-events-none absolute -left-14 -top-16 h-52 w-52 animate-blob rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 animate-blob rounded-full bg-orange-200/25 blur-3xl [animation-delay:2s]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base font-bold text-white shadow-inner ring-1 ring-white/25 backdrop-blur">
            비교
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight text-white">지역 비교</h1>
            <p className="truncate text-xs leading-tight text-blue-50">
              후보지 두 곳을 나란히 비교해보세요
            </p>
          </div>
          <Link
            href="/analysis"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/25 sm:flex"
          >
            상권분석으로
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
          >
            ← 상권분석으로
          </Link>
        </div>

        {optionsError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{optionsError}</p>
          </div>
        )}

        {options && options.sido.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RegionIndustryPicker
                idPrefix="a"
                title="지역 A"
                sido={options.sido}
                sigungu={options.sigungu}
                dong={options.dong}
                large={options.large}
                mid={options.mid}
                small={options.small}
                value={queryA}
                onChange={setQueryA}
                onSubmit={runCompare}
                loading={loading}
                hideSubmit
                accentBar="from-blue-500 via-indigo-500 to-sky-500"
                accentIcon="from-blue-500 to-indigo-600"
              />
              <RegionIndustryPicker
                idPrefix="b"
                title="지역 B"
                sido={options.sido}
                sigungu={options.sigungu}
                dong={options.dong}
                large={options.large}
                mid={options.mid}
                small={options.small}
                value={queryB}
                onChange={setQueryB}
                onSubmit={runCompare}
                loading={loading}
                hideSubmit
                accentBar="from-orange-500 via-amber-500 to-yellow-400"
                accentIcon="from-orange-500 to-amber-600"
              />
            </div>

            <button
              type="button"
              onClick={runCompare}
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none sm:w-auto sm:self-center sm:px-8"
            >
              <SearchIcon className="h-4 w-4" />
              {loading ? "비교 중..." : "두 지역 비교하기"}
            </button>
          </>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hasCompared && resultA && resultB && (
          <CompareResult
            a={resultA}
            b={resultB}
            labelA={regionLabel(queryA, options)}
            labelB={regionLabel(queryB, options)}
          />
        )}

        <footer className="pb-2 pt-1">
          <DataSourceNotice
            sourceName={COMMERCIAL_SOURCE_NAME}
            referenceLabel={options?.meta.dataReferenceMonth ?? "확인 중"}
            message="실시간 정보가 아니며, 아직 일부 지역 데이터만 반영되어 있습니다."
          />
        </footer>
      </main>
    </div>
  );
}
