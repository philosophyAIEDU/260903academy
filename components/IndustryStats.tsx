import type { Academy } from "@/types/academy";

interface IndustryStatsProps {
  academies: Academy[];
}

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
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
      <span className="font-medium text-slate-800">
        검색된 학원 {academies.length}개
      </span>
      {top.length > 0 && (
        <span>
          {" "}
          중{" "}
          {top.map(([type, count], i) => (
            <span key={type}>
              {i > 0 && ", "}
              {type} {count}개
            </span>
          ))}
          {sorted.length > top.length ? " 외" : ""}
        </span>
      )}
    </div>
  );
}
