"use client";

import FavoriteToggle from "@/components/FavoriteToggle";
import { AlertIcon, BookIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import type { Academy } from "@/types/academy";

interface AcademyListProps {
  academies: Academy[];
  selectedId: string | null;
  onSelect: (academy: Academy) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export default function AcademyList({
  academies,
  selectedId,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: AcademyListProps) {
  if (academies.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center bg-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 shadow-inner">
          <AlertIcon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">검색 조건에 부합하는 학원이 없습니다</p>
          <p className="mt-1 text-xs text-slate-500">시/군 또는 읍/면/동 조건을 조정하여 다시 검색해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="thin-scrollbar h-full divide-y divide-slate-100 overflow-y-auto bg-white">
      {academies.map((academy) => {
        const active = academy.id === selectedId;
        return (
          <li key={academy.id}>
            <div
              onClick={() => onSelect(academy)}
              className={`group flex w-full cursor-pointer items-start justify-between gap-3 py-4 px-4 text-left transition-all duration-200 hover:bg-slate-50/80 ${
                active
                  ? "border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/60 to-white shadow-sm pl-3.5"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {academy.name}
                  </p>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {academy.industryType || "일반학원"}
                  </span>
                </div>

                <div className="mt-1.5 space-y-1">
                  <p className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{academy.roadAddress || academy.lotAddress || "주소 정보 없음"}</span>
                  </p>
                  {academy.tel && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate font-medium text-slate-700">{academy.tel}</span>
                    </p>
                  )}
                  {academy.courseClass && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <BookIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate text-amber-900 font-medium">교습과정: {academy.courseClass}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-0.5">
                <FavoriteToggle
                  active={isFavorite(academy.id)}
                  onToggle={() => onToggleFavorite(academy.id)}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
