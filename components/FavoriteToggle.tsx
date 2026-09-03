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
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
        active
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-500 shadow-sm shadow-amber-200"
          : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50/50"
      }`}
    >
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${active ? "scale-110 fill-amber-500 stroke-amber-500" : "fill-none stroke-current"}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
