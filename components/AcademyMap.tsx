"use client";

import { useEffect, useRef, useState } from "react";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import type { Academy } from "@/types/academy";

interface AcademyMapProps {
  academies: Academy[];
  selectedId: string | null;
  onMarkerSelect: (academy: Academy) => void;
}

const DEFAULT_CENTER = { lat: 37.4138, lng: 127.5183 }; // 경기도청 부근 기본 좌표
const KAKAO_SDK_ID = "kakao-maps-sdk";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInfoWindowContent(academy: Academy): string {
  return `
    <div style="padding:10px 12px;max-width:240px;font-size:12px;line-height:1.5;">
      <p style="margin:0 0 4px;font-weight:700;font-size:13px;">${escapeHtml(academy.name)}</p>
      <p style="margin:0 0 2px;color:#475569;">${escapeHtml(academy.roadAddress || academy.lotAddress || "주소 정보 없음")}</p>
      <p style="margin:0 0 2px;color:#475569;">전화: ${escapeHtml(academy.tel || "정보 없음")}</p>
      <p style="margin:0;color:#475569;">교습과정: ${escapeHtml(academy.courseClass || "정보 없음")}</p>
    </div>
  `;
}

/** 카카오맵 JS SDK를 1회만 로드하고, 이후 호출은 캐시된 Promise를 재사용합니다. */
let kakaoSdkLoadPromise: Promise<void> | null = null;

function loadKakaoSdk(appKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경이 아닙니다."));
  }
  if (window.kakao?.maps) {
    return Promise.resolve();
  }
  if (kakaoSdkLoadPromise) {
    return kakaoSdkLoadPromise;
  }

  kakaoSdkLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(KAKAO_SDK_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      window.kakao.maps.load(() => resolve());
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("카카오맵 스크립트 로드 실패")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SDK_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("카카오맵 스크립트 로드 실패")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return kakaoSdkLoadPromise;
}

export default function AcademyMap({ academies, selectedId, onMarkerSelect }: AcademyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<Map<string, kakao.maps.Marker>>(new Map());
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);

  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // SDK 로드 + 지도 최초 생성
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appKey) {
      setSdkError(
        "NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요."
      );
      return;
    }

    let cancelled = false;

    loadKakaoSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const center = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 7,
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
  }, []);

  // 검색 결과가 바뀔 때마다 마커 다시 그리기
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
    infoWindowRef.current?.close();

    academies.forEach((academy) => {
      const position = new window.kakao.maps.LatLng(academy.lat, academy.lng);
      const marker = new window.kakao.maps.Marker({ position, map, title: academy.name });

      window.kakao.maps.event.addListener(marker, "click", () => {
        infoWindowRef.current?.setContent(buildInfoWindowContent(academy));
        infoWindowRef.current?.open(map, marker);
        onMarkerSelect(academy);
      });

      markersRef.current.set(academy.id, marker);
    });

    if (academies.length > 0) {
      const first = academies[0]!;
      map.setCenter(new window.kakao.maps.LatLng(first.lat, first.lng));
      map.setLevel(academies.length === 1 ? 4 : 8);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, academies]);

  // 리스트에서 선택된 항목이 바뀌면 지도 이동 + 인포윈도우 오픈
  useEffect(() => {
    if (!sdkReady || !mapRef.current || !selectedId) return;
    const academy = academies.find((a) => a.id === selectedId);
    const marker = markersRef.current.get(selectedId);
    if (!academy || !marker) return;

    const position = new window.kakao.maps.LatLng(academy.lat, academy.lng);
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(4);
    infoWindowRef.current?.setContent(buildInfoWindowContent(academy));
    infoWindowRef.current?.open(mapRef.current, marker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, sdkReady]);

  if (sdkError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50 p-6 text-center">
        <AlertIcon className="h-6 w-6 text-rose-500" />
        <p className="text-sm font-medium text-rose-600">{sdkError}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!sdkReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white text-sm text-slate-400">
          <SpinnerIcon className="h-5 w-5 animate-spin text-indigo-400" />
          지도를 불러오는 중...
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
