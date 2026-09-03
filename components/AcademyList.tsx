"use client";

import FavoriteToggle from "@/components/FavoriteToggle";
import { BookIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
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
      <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
        <p className="text-sm font-medium text-slate-500">검색 결과가 없습니다.</p>
        <p className="text-xs text-slate-400">다른 조건으로 다시 검색해보세요.</p>
      </div>
    );
  }

  return (
    <ul className="thin-scrollbar h-full divide-y divide-slate-100 overflow-y-auto">
      {academies.map((academy) => {
        const active = academy.id === selectedId;
        return (
          <li key={academy.id}>
            <button
              type="button"
              onClick={() => onSelect(academy)}
              className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                active ? "bg-indigo-50/70" : ""
              }`}
            >
              {active && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
              <div className={`min-w-0 flex-1 ${active ? "" : "pl-5"}`}>
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {academy.name}
                  </p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {academy.industryType || "미분류"}
                  </span>
                </div>
                <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                  <MapPinIcon className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{academy.roadAddress || academy.lotAddress || "주소 정보 없음"}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <PhoneIcon className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{academy.tel || "전화번호 정보 없음"}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <BookIcon className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{academy.courseClass || "교습과정 정보 없음"}</span>
                </p>
              </div>
              <FavoriteToggle
                active={isFavorite(academy.id)}
                onToggle={() => onToggleFavorite(academy.id)}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
