import type { Academy } from "@/types/academy";

interface IndustryStatsProps {
  academies: Academy[];
}

const PILL_COLORS = [
  "bg-indigo-50 text-indigo-700",
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-semibold text-slate-800">
        검색된 학원 {academies.length.toLocaleString()}개
      </span>
      <span className="text-slate-300">·</span>
      <div className="flex flex-wrap gap-1.5">
        {top.map(([type, count], i) => (
          <span
            key={type}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${PILL_COLORS[i % PILL_COLORS.length]}`}
          >
            {type} {count}
          </span>
        ))}
        {sorted.length > top.length && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            외 {sorted.length - top.length}개 업종
          </span>
        )}
      </div>
    </div>
  );
}
