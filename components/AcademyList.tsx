"use client";

import FavoriteToggle from "@/components/FavoriteToggle";
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
      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-400">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <ul className="h-full divide-y divide-slate-100 overflow-y-auto">
      {academies.map((academy) => {
        const active = academy.id === selectedId;
        return (
          <li key={academy.id}>
            <button
              type="button"
              onClick={() => onSelect(academy)}
              className={`flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-indigo-50 ${
                active ? "bg-indigo-50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {academy.name}
                  </p>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                    {academy.industryType || "미분류"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {academy.roadAddress || academy.lotAddress}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {academy.tel || "전화번호 정보 없음"} · {academy.courseClass || "교습과정 정보 없음"}
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
