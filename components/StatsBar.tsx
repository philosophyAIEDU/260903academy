import { BookIcon, BuildingIcon, StarIcon } from "@/components/icons";
import type { Academy } from "@/types/academy";

interface StatsBarProps {
  academies: Academy[];
  favoritesCount: number;
}

export default function StatsBar({ academies, favoritesCount }: StatsBarProps) {
  if (academies.length === 0) return null;

  const industryCount = new Set(academies.map((a) => a.industryType || "미분류")).size;

  const tiles = [
    {
      label: "검색된 학원 총계",
      value: academies.length.toLocaleString(),
      suffix: "개소",
      icon: <BuildingIcon className="h-4 w-4" />,
      theme: "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-100/30 text-indigo-900",
      iconBg: "bg-indigo-600 text-white",
    },
    {
      label: "분포 교습계열",
      value: industryCount.toLocaleString(),
      suffix: "개 분야",
      icon: <BookIcon className="h-4 w-4" />,
      theme: "border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-amber-100/30 text-amber-950",
      iconBg: "bg-amber-600 text-white",
    },
    {
      label: "관심 보관함 (즐겨찾기)",
      value: favoritesCount.toLocaleString(),
      suffix: "개소",
      icon: <StarIcon className="h-4 w-4" />,
      theme: "border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/60 text-slate-900",
      iconBg: "bg-slate-900 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-panel transition-all duration-200 hover:shadow-card ${tile.theme}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{tile.label}</span>
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${tile.iconBg}`}>
              {tile.icon}
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {tile.value}
            <span className="ml-1 text-xs font-semibold text-slate-500">{tile.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
