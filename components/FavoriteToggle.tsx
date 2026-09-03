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
      className={`shrink-0 rounded-full p-1 text-lg leading-none transition-all ${
        active
          ? "text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
          : "text-slate-600 hover:text-amber-400"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
