"use client";

import { useCallback, useEffect, useState } from "react";
import ExecutiveHeader from "@/components/ExecutiveHeader";
import RegionIndustryPicker from "@/components/analysis/RegionIndustryPicker";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import StoreMapPanel from "@/components/analysis/StoreMapPanel";
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

export default function AnalysisPage() {
  const [options, setOptions] = useState<CommercialOptionsResponse | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [query, setQuery] = useState<CommercialAnalysisQuery>({});
  const [result, setResult] = useState<CommercialAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
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
      <ExecutiveHeader
        currentTab="commercial"
        subtitle="소상공인시장진흥공단 공공 빅데이터 기반 전국 상권분석 & 경쟁 진단"
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* 상단 웰컴 배너 / 타이틀 */}
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/70 p-6 sm:p-8 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  <SparklesIcon className="h-3.5 w-3.5 text-amber-600" />
                  프리미엄 상권 빅데이터 분석
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-medium text-slate-500">
                  데이터 기반 의사결정 인텔리전스
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                전국 상권 경쟁강도 및 공백 분석
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                공공데이터 포털 상가업소 빅데이터를 기반으로 지역별 밀집도, 상위 대비 과밀 진단,
                블루오션 틈새 업종, AI 상권 분석가의 전문 자문을 제공합니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-3 text-center shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">지원 데이터</p>
                <p className="text-sm font-extrabold text-slate-900">전국 상가 빅데이터</p>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-3 text-center shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">AI 모델</p>
                <p className="text-sm font-extrabold text-amber-700">Google Gemini Pro</p>
              </div>
            </div>
          </div>
        </div>

        {optionsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p>{optionsError}</p>
          </div>
        )}

        {options && options.sido.length === 0 && !optionsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>아직 등록된 상권 데이터가 없습니다. 지역 데이터 파일이 추가되면 즉시 이용할 수 있습니다.</p>
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
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/90 bg-white p-14 text-center shadow-panel">
            <SpinnerIcon className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-base font-bold text-slate-800">
              상권 빅데이터를 정밀 연산하고 있습니다...
            </p>
            <p className="text-xs text-slate-400">
              점포 수, 과밀도 지수, 공백 업종 지표를 추출 중입니다
            </p>
          </div>
        )}

        {!loading && !error && hasAnalyzed && result && (
          <>
            <AnalysisResult result={result} />
            <StoreMapPanel query={submittedQuery} />
          </>
        )}

        {!loading && !hasAnalyzed && options && options.sido.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-panel">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 shadow-inner">
              <SearchIcon className="h-7 w-7" />
            </span>
            <div className="max-w-md">
              <h3 className="text-base font-extrabold text-slate-900">
                상권 분석을 시작하려면 지역 또는 업종을 선택하세요
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                위의 설정 박스에서 분석하고 싶은 지역(시/군/구, 행정동)과 관심 업종(대·중·소분류)을 선택한 뒤
                <strong className="text-slate-700"> [상권 인텔리전스 분석 시작]</strong> 버튼을 누르면
                정밀 진단 리포트가 즉시 생성됩니다.
              </p>
            </div>
          </div>
        )}

        <footer className="pb-4 pt-2">
          <DataSourceNotice
            sourceName={COMMERCIAL_SOURCE_NAME}
            referenceLabel={options?.meta.dataReferenceMonth ?? "확인 중"}
            message="소상공인시장진흥공단 상권(상가)정보 공공데이터를 기반으로 구축되었으며 투자 및 창업 전 현장 실사를 권장합니다."
          />
        </footer>
      </main>
    </div>
  );
}
