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
      label: "검색된 학원",
      value: academies.length.toLocaleString(),
      suffix: "개",
      icon: <BuildingIcon className="h-4 w-4" />,
      gradient: "from-indigo-600 to-indigo-800",
    },
    {
      label: "업종 수",
      value: industryCount.toLocaleString(),
      suffix: "종",
      icon: <BookIcon className="h-4 w-4" />,
      gradient: "from-violet-600 to-violet-800",
    },
    {
      label: "즐겨찾기",
      value: favoritesCount.toLocaleString(),
      suffix: "개",
      icon: <StarIcon className="h-4 w-4" />,
      gradient: "from-sky-600 to-sky-800",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-lg shadow-black/40 ring-1 ring-white/10 sm:p-4 ${tile.gradient}`}
        >
          <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-6 -left-2 h-14 w-14 rounded-full bg-white/10" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            {tile.icon}
          </span>
          <p className="relative mt-2.5 text-xl font-bold leading-none sm:text-2xl">
            {tile.value}
            <span className="ml-0.5 text-xs font-medium opacity-80">{tile.suffix}</span>
          </p>
          <p className="relative mt-1 truncate text-[11px] font-medium text-white/80 sm:text-xs">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}
