"use client";

import { useEffect, useState } from "react";
import CommercialMap from "@/components/analysis/CommercialMap";
import { AlertIcon, MapPinIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import { downloadCsv } from "@/lib/csv-export";
import type { CommercialAnalysisQuery, Store, StoreListResponse } from "@/types/commercial";

function exportStoresCsv(stores: Store[]) {
  const rows: (string | number)[][] = [
    ["업체명", "지점명", "업종(대)", "업종(중)", "업종(소)", "행정동", "주소", "위도", "경도"],
    ...stores.map((s) => [
      s.name,
      s.branch,
      s.largeName,
      s.midName,
      s.smallName,
      s.dongName,
      s.address,
      s.lat,
      s.lng,
    ]),
  ];
  downloadCsv(`상권분석_업체목록_${stores.length}건.csv`, rows);
}

interface StoreMapPanelProps {
  query: CommercialAnalysisQuery | null;
}

function buildQueryString(query: CommercialAnalysisQuery, nameQuery: string): string {
  const params = new URLSearchParams();
  if (query.sigunguCode) params.set("sigunguCode", query.sigunguCode);
  if (query.dongCode) params.set("dongCode", query.dongCode);
  if (query.largeCode) params.set("largeCode", query.largeCode);
  if (query.midCode) params.set("midCode", query.midCode);
  if (query.smallCode) params.set("smallCode", query.smallCode);
  if (nameQuery) params.set("nameQuery", nameQuery);
  return params.toString();
}

export default function StoreMapPanel({ query }: StoreMapPanelProps) {
  const [data, setData] = useState<StoreListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const sigunguCode = query?.sigunguCode;

  useEffect(() => {
    setNameInput("");
    setDebouncedName("");
  }, [sigunguCode, query?.dongCode, query?.largeCode, query?.midCode, query?.smallCode]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(nameInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [nameInput]);

  useEffect(() => {
    if (!sigunguCode) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/commercial-analysis/stores?${buildQueryString(query!, debouncedName)}`)
      .then((res) => res.json())
      .then((body: StoreListResponse | { error: string }) => {
        if (cancelled) return;
        if ("error" in body) {
          setError(body.error);
          setData(null);
          return;
        }
        setData(body);
      })
      .catch(() => {
        if (!cancelled) setError("업체 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigunguCode, query?.dongCode, query?.largeCode, query?.midCode, query?.smallCode, debouncedName]);

  if (!sigunguCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-panel">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
          <MapPinIcon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">
            시/군/구를 선택하면 고정밀 상권 지도에서 개별 점포 위치를 확인할 수 있습니다
          </p>
          <p className="mt-1 text-xs text-slate-500">
            방대한 빅데이터를 효율적으로 렌더링하기 위해 시/군/구 단위부터 지도가 활성화됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-panel">
      {/* 상단 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white shadow-sm">
            <MapPinIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">상권 지리정보 및 점포 위치 매핑</h3>
            <p className="text-[11px] text-slate-500">카카오맵 고정밀 공간 지리 시각화</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data && !loading && data.stores.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {data.totalCount.toLocaleString()}개소 중 {data.stores.length.toLocaleString()}개소
                표시
              </span>
              <button
                type="button"
                onClick={() => exportStoresCsv(data.stores)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                점포 목록 CSV 다운로드
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 검색 필터 바 */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className="relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="상호명 검색 (예: 스타벅스, 교촌, 메가커피)"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 px-5 py-3 text-xs text-rose-700">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 지도 영역 */}
      <div className="h-[460px] w-full bg-slate-100 relative">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <SpinnerIcon className="h-5 w-5 animate-spin text-amber-600" />
            공간 지리 데이터를 로딩하는 중입니다...
          </div>
        ) : data && data.stores.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-6">
            <SearchIcon className="h-6 w-6 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">
              {debouncedName
                ? `"${debouncedName}"과(와) 일치하는 점포가 없습니다.`
                : "선택된 조건에 부합하는 점포가 없습니다."}
            </p>
          </div>
        ) : (
          <CommercialMap stores={data?.stores ?? []} center={data?.center ?? null} />
        )}
      </div>

      {data?.truncated && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            💡 등록 점포가 많아 상위 {data.stores.length.toLocaleString()}개소가 표시되었습니다. 행정동이나 소분류 업종을 세분화하면 정확한 점포를 모두 확인할 수 있습니다.
          </span>
        </div>
      )}
    </div>
  );
}
