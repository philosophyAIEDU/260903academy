import type { Academy } from "@/types/academy";

interface IndustryStatsProps {
  academies: Academy[];
}

const PILL_COLORS = [
  "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  "border-sky-500/30 bg-sky-500/10 text-sky-300",
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "border-rose-500/30 bg-rose-500/10 text-rose-300",
  "border-violet-500/30 bg-violet-500/10 text-violet-300",
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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <span className="text-sm font-semibold text-slate-100">
        검색된 학원 {academies.length.toLocaleString()}개
      </span>
      <span className="text-slate-600">·</span>
      <div className="flex flex-wrap gap-1.5">
        {top.map(([type, count], i) => (
          <span
            key={type}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${PILL_COLORS[i % PILL_COLORS.length]}`}
          >
            {type} {count}
          </span>
        ))}
        {sorted.length > top.length && (
          <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
            외 {sorted.length - top.length}개 업종
          </span>
        )}
      </div>
    </div>
  );
}
