"use client";

import { useEffect, useState } from "react";
import CommercialMap from "@/components/analysis/CommercialMap";
import { AlertIcon, MapPinIcon, SpinnerIcon } from "@/components/icons";
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
  /** "분석하기"로 실제 제출된 조건. sigunguCode가 없으면 지도를 보여줄 수 없습니다. */
  query: CommercialAnalysisQuery | null;
}

function buildQueryString(query: CommercialAnalysisQuery): string {
  const params = new URLSearchParams();
  if (query.sigunguCode) params.set("sigunguCode", query.sigunguCode);
  if (query.dongCode) params.set("dongCode", query.dongCode);
  if (query.largeCode) params.set("largeCode", query.largeCode);
  if (query.midCode) params.set("midCode", query.midCode);
  if (query.smallCode) params.set("smallCode", query.smallCode);
  return params.toString();
}

export default function StoreMapPanel({ query }: StoreMapPanelProps) {
  const [data, setData] = useState<StoreListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sigunguCode = query?.sigunguCode;

  useEffect(() => {
    if (!sigunguCode) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/commercial-analysis/stores?${buildQueryString(query!)}`)
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
    // query 객체 참조가 매번 바뀌므로 실제로 지도 조회에 영향을 주는 필드만 의존성으로 사용합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigunguCode, query?.dongCode, query?.largeCode, query?.midCode, query?.smallCode]);

  if (!sigunguCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-panel">
        <MapPinIcon className="h-6 w-6 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          시/군/구를 선택하면 지도에서 개별 업체를 볼 수 있어요
        </p>
        <p className="text-xs text-slate-400">
          업체 데이터가 지역 단위로 나뉘어 있어, 시/도 전체는 지도로 보여드릴 수 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-sky-50/50 px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-sky-600 text-white">
            <MapPinIcon className="h-3.5 w-3.5" />
          </span>
          지도에서 업체 보기
        </h3>
        {data && !loading && data.stores.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {data.totalCount.toLocaleString()}개 중 {data.stores.length.toLocaleString()}개 표시
            </span>
            <button
              type="button"
              onClick={() => exportStoresCsv(data.stores)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              CSV 다운로드
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 text-xs text-rose-600">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="h-[420px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
            <SpinnerIcon className="h-4 w-4 animate-spin text-emerald-400" />
            업체 위치를 불러오는 중...
          </div>
        ) : (
          <CommercialMap stores={data?.stores ?? []} center={data?.center ?? null} />
        )}
      </div>

      {data?.truncated && (
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          업체가 많아 대표로 {data.stores.length.toLocaleString()}개만 지도에 표시했습니다. 더
          자세히 보려면 행정동이나 업종을 좁혀서 다시 분석해보세요.
        </p>
      )}
    </div>
  );
}
