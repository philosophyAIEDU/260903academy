"use client";

interface FavoriteToggleProps {
  active: boolean;
  onToggle: () => void;
  label?: string;
}

export default function FavoriteToggle({ active, onToggle, label }: FavoriteToggleProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={label ?? (active ? "즐겨찾기 해제" : "즐겨찾기 추가")}
      className={`shrink-0 rounded-full p-1 text-lg leading-none transition-colors ${
        active ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
