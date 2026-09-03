"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import RegionIndustryPicker from "@/components/analysis/RegionIndustryPicker";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import StoreMapPanel from "@/components/analysis/StoreMapPanel";
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

export default function AnalysisPage() {
  const [options, setOptions] = useState<CommercialOptionsResponse | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [query, setQuery] = useState<CommercialAnalysisQuery>({});
  const [result, setResult] = useState<CommercialAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  // "분석하기"로 실제 제출된 조건 스냅샷. 지도 패널은 이 값이 바뀔 때만 다시 불러옵니다
  // (드롭다운을 만지는 동안 매번 지도를 다시 불러오지 않도록 query와 분리해서 관리).
  const [submittedQuery, setSubmittedQuery] = useState<CommercialAnalysisQuery | null>(null);

  useEffect(() => {
    fetch("/api/commercial-analysis/options")
      .then((res) => res.json())
      .then((body: CommercialOptionsResponse | { error: string }) => {
        if ("error" in body) {
          setOptionsError(body.error);
          return;
        }
        setOptions(body);
        // 아직 데이터가 있는 시/도가 하나뿐인 초기 단계에서는 자동으로 선택해둡니다.
        if (body.sido.length === 1) {
          setQuery((prev) => ({ ...prev, sidoCode: body.sido[0]!.code }));
        }
      })
      .catch(() => setOptionsError("지역/업종 옵션을 불러오지 못했습니다."));
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasAnalyzed(true);
    try {
      const res = await fetch(`/api/commercial-analysis?${buildQueryString(query)}`);
      const body = (await res.json()) as CommercialAnalysisResponse | { error: string };
      if (!res.ok || "error" in body) {
        setError("error" in body ? body.error : "분석 결과를 불러오지 못했습니다.");
        setResult(null);
        return;
      }
      setResult(body);
      setSubmittedQuery(query);
    } catch {
      setError("네트워크 오류로 분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-800 shadow-lg shadow-black/40">
        <div
          className="pointer-events-none absolute -left-14 -top-16 h-52 w-52 animate-blob rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 animate-blob rounded-full bg-sky-400/10 blur-3xl [animation-delay:2s]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-bold text-white shadow-inner ring-1 ring-white/15 backdrop-blur">
            상
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight text-white">상권분석</h1>
            <p className="truncate text-xs leading-tight text-emerald-100/80">
              지역·업종별 점포 수 통계 (소상공인시장진흥공단 상가업소정보 기반)
            </p>
          </div>
          <Link
            href="/compare"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20 sm:flex"
          >
            지역 비교 →
          </Link>
          <Link
            href="/academy"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20 sm:flex"
          >
            경기 학원 검색 →
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:gap-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Link
            href="/compare"
            className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm"
          >
            지역 비교 →
          </Link>
          <Link
            href="/academy"
            className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm"
          >
            경기 학원 검색 →
          </Link>
        </div>

        {optionsError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{optionsError}</p>
          </div>
        )}

        {options && options.sido.length === 0 && !optionsError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3.5 text-sm text-amber-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>아직 등록된 상권 데이터가 없습니다. 지역 데이터 파일이 추가되면 이용할 수 있습니다.</p>
          </div>
        )}

        {options && options.sido.length > 0 && (
          <RegionIndustryPicker
            sido={options.sido}
            sigungu={options.sigungu}
            dong={options.dong}
            large={options.large}
            mid={options.mid}
            small={options.small}
            value={query}
            onChange={setQuery}
            onSubmit={runAnalysis}
            loading={loading}
          />
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-300">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-sm text-slate-500 shadow-panel">
            <SearchIcon className="h-4 w-4 animate-pulse" />
            분석 중입니다...
          </div>
        )}

        {!loading && !error && hasAnalyzed && result && (
          <>
            <AnalysisResult result={result} />
            <StoreMapPanel query={submittedQuery} />
          </>
        )}

        {!loading && !hasAnalyzed && options && options.sido.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-panel">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <SearchIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-300">
                지역과 업종을 선택하고 분석하기를 눌러주세요
              </p>
              <p className="mt-1 text-xs text-slate-500">
                지역만 선택하면 그 지역의 업종 전체 분포를, 업종까지 선택하면 세부 통계를 볼 수
                있어요
              </p>
            </div>
          </div>
        )}

        <footer className="pb-2 pt-1">
          <DataSourceNotice
            sourceName={COMMERCIAL_SOURCE_NAME}
            referenceLabel={options?.meta.dataReferenceMonth ?? "확인 중"}
            message="실시간 정보가 아니며, 실제 운영 여부는 현장 확인이 필요합니다."
          />
        </footer>
      </main>
    </div>
  );
}
