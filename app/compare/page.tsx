"use client";

import { useCallback, useEffect, useState } from "react";
import ExecutiveHeader from "@/components/ExecutiveHeader";
import RegionIndustryPicker from "@/components/analysis/RegionIndustryPicker";
import CompareResult from "@/components/analysis/CompareResult";
import DataSourceNotice from "@/components/DataSourceNotice";
import { AlertIcon, SearchIcon, SparklesIcon, SpinnerIcon } from "@/components/icons";
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
  return dong?.name ?? sigungu?.name ?? sido?.name ?? "전체 지역";
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
      <ExecutiveHeader
        currentTab="compare"
        subtitle="두 상권 후보지의 점포 수·밀집도·경쟁 강도 1:1 정밀 대조 분석"
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* 상단 럭셔리 배너 */}
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/70 p-6 sm:p-8 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  <SparklesIcon className="h-3.5 w-3.5 text-amber-600" />
                  후보지 1:1 비교 대조 분석
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-medium text-slate-500">
                  입지 타당성 및 경쟁력 매트릭스
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                지역별 상권 비교 인텔리전스
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                출점 및 창업을 고려 중인 두 개 후보 지역을 나란히 설정하여 총 점포 규모, 타깃 업종 점유 비중,
                경쟁강도 배율을 한눈에 대조하세요.
              </p>
            </div>
          </div>
        </div>

        {optionsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p>{optionsError}</p>
          </div>
        )}

        {options && options.sido.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RegionIndustryPicker
                idPrefix="a"
                title="비교 후보지 A (사파이어)"
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
                accentBar="from-indigo-600 via-indigo-700 to-indigo-900"
                accentIcon="from-indigo-600 to-indigo-800"
              />
              <RegionIndustryPicker
                idPrefix="b"
                title="비교 후보지 B (앰버 골드)"
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
                accentBar="from-amber-500 via-amber-600 to-amber-700"
                accentIcon="from-amber-500 to-amber-600"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={runCompare}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:from-amber-600 hover:via-amber-700 hover:to-slate-900 hover:shadow-gold-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin text-amber-400" />
                    <span>양측 상권 데이터 동시 대조 중...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 text-amber-400" />
                    <span>후보지 상권 정밀 비교 분석 실행</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
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

        <footer className="pb-4 pt-2">
          <DataSourceNotice
            sourceName={COMMERCIAL_SOURCE_NAME}
            referenceLabel={options?.meta.dataReferenceMonth ?? "확인 중"}
            message="비교 데이터는 동일 기준월 공공 상권 정보를 바탕으로 산출되었으며 상대적 수치 지표입니다."
          />
        </footer>
      </main>
    </div>
  );
}
