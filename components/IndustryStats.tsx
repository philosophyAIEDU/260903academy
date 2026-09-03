import type { Academy } from "@/types/academy";

interface IndustryStatsProps {
  academies: Academy[];
}

const PILL_COLORS = [
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-indigo-200 bg-indigo-50 text-indigo-900",
  "border-emerald-200 bg-emerald-50 text-emerald-900",
  "border-sky-200 bg-sky-50 text-sky-900",
  "border-purple-200 bg-purple-50 text-purple-900",
  "border-rose-200 bg-rose-50 text-rose-900",
];

export default function IndustryStats({ academies }: IndustryStatsProps) {
  if (academies.length === 0) return null;

  const counts = new Map<string, number>();
  for (const academy of academies) {
    const key = academy.industryType || "미분류";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-panel">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-900">
          검색 학원 {academies.length.toLocaleString()}개소 분포:
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.map(([type, count], i) => (
          <span
            key={type}
            className={`rounded-xl border px-3 py-1 text-xs font-bold shadow-xs ${PILL_COLORS[i % PILL_COLORS.length]}`}
          >
            {type} <span className="opacity-75 font-normal">({count})</span>
          </span>
        ))}
        {sorted.length > top.length && (
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            외 {sorted.length - top.length}개 업종
          </span>
        )}
      </div>
    </div>
  );
}
