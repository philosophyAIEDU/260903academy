"use client";

import { useEffect, useRef, useState } from "react";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { loadKakaoSdk } from "@/lib/kakao-map-loader";
import type { Store } from "@/types/commercial";

interface CommercialMapProps {
  stores: Store[];
  center: { lat: number; lng: number } | null;
}

const FALLBACK_CENTER = { lat: 36.5, lng: 127.8 }; // 대한민국 중앙 부근 (지역 데이터가 아직 없을 때 대비)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInfoWindowContent(store: Store): string {
  const title = store.branch ? `${store.name} ${store.branch}` : store.name;
  return `
    <div style="padding:10px 12px;max-width:240px;font-size:12px;line-height:1.5;">
      <p style="margin:0 0 4px;font-weight:700;font-size:13px;">${escapeHtml(title)}</p>
      <p style="margin:0 0 2px;color:#475569;">${escapeHtml(store.address || "주소 정보 없음")}</p>
      <p style="margin:0;color:#475569;">${escapeHtml(store.smallName)} · ${escapeHtml(store.dongName)}</p>
    </div>
  `;
}

export default function CommercialMap({ stores, center }: CommercialMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);

  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // SDK 로드 + 지도 최초 생성
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appKey) {
      setSdkError("NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요.");
      return;
    }

    let cancelled = false;

    loadKakaoSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const start = center ?? FALLBACK_CENTER;
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(start.lat, start.lng),
          level: 5,
        });
        infoWindowRef.current = new window.kakao.maps.InfoWindow({ removable: true });
        setSdkReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setSdkError(err.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 업체 목록이 바뀔 때마다 마커 다시 그리기 + 중심 이동
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.close();

    stores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);
      const marker = new window.kakao.maps.Marker({
        position,
        map,
        title: store.name,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        infoWindowRef.current?.setContent(buildInfoWindowContent(store));
        infoWindowRef.current?.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    if (center) {
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
      map.setLevel(stores.length > 50 ? 6 : 4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, stores, center]);

  if (sdkError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-900 p-6 text-center">
        <AlertIcon className="h-6 w-6 text-rose-400" />
        <p className="text-sm font-medium text-rose-400">{sdkError}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!sdkReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-900 text-sm text-slate-500">
          <SpinnerIcon className="h-5 w-5 animate-spin text-emerald-400" />
          지도를 불러오는 중...
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
