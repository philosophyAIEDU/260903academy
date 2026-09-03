"use client";

import { ChevronDownIcon, MapPinIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import type { CodeOption, CommercialAnalysisQuery } from "@/types/commercial";

interface RegionIndustryPickerProps {
  sido: CodeOption[];
  sigungu: CodeOption[];
  dong: CodeOption[];
  large: CodeOption[];
  mid: CodeOption[];
  small: CodeOption[];
  value: CommercialAnalysisQuery;
  onChange: (next: CommercialAnalysisQuery) => void;
  onSubmit: () => void;
  loading: boolean;
}

const selectClass =
  "w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function FieldIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`pointer-events-none absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-white ${color}`}
    >
      {children}
    </span>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  color,
  icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: CodeOption[];
  disabled?: boolean;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <FieldIcon color={color}>{icon}</FieldIcon>
        <select
          id={id}
          value={value}
          disabled={disabled || options.length === 0}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
        >
          <option value="">전체</option>
          {options.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

export default function RegionIndustryPicker({
  sido,
  sigungu,
  dong,
  large,
  mid,
  small,
  value,
  onChange,
  onSubmit,
  loading,
}: RegionIndustryPickerProps) {
  const filteredSigungu = value.sidoCode
    ? sigungu.filter((s) => s.code.startsWith(value.sidoCode!))
    : sigungu;
  const filteredDong = value.sigunguCode
    ? dong.filter((d) => d.code.startsWith(value.sigunguCode!))
    : [];
  const filteredMid = value.largeCode
    ? mid.filter((m) => m.code.startsWith(value.largeCode!))
    : [];
  const filteredSmall = value.midCode
    ? small.filter((s) => s.code.startsWith(value.midCode!))
    : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
            <SearchIcon className="h-3.5 w-3.5 text-white" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">지역 · 업종 선택</h2>
        </div>

        <p className="mb-3 text-xs font-medium text-slate-500">지역</p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Select
            id="sidoCode"
            label="시/도"
            value={value.sidoCode ?? ""}
            onChange={(v) =>
              onChange({ ...value, sidoCode: v || undefined, sigunguCode: undefined, dongCode: undefined })
            }
            options={sido}
            color="bg-emerald-500"
            icon={<MapPinIcon className="h-3.5 w-3.5" />}
          />
          <Select
            id="sigunguCode"
            label="시/군/구"
            value={value.sigunguCode ?? ""}
            onChange={(v) => onChange({ ...value, sigunguCode: v || undefined, dongCode: undefined })}
            options={filteredSigungu}
            disabled={!value.sidoCode}
            color="bg-teal-500"
            icon={<MapPinIcon className="h-3.5 w-3.5" />}
          />
          <Select
            id="dongCode"
            label="행정동"
            value={value.dongCode ?? ""}
            onChange={(v) => onChange({ ...value, dongCode: v || undefined })}
            options={filteredDong}
            disabled={!value.sigunguCode}
            color="bg-sky-500"
            icon={<MapPinIcon className="h-3.5 w-3.5" />}
          />
        </div>

        <p className="mb-3 mt-4 text-xs font-medium text-slate-500">업종</p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Select
            id="largeCode"
            label="대분류"
            value={value.largeCode ?? ""}
            onChange={(v) =>
              onChange({ ...value, largeCode: v || undefined, midCode: undefined, smallCode: undefined })
            }
            options={large}
            color="bg-indigo-500"
            icon={<SearchIcon className="h-3.5 w-3.5" />}
          />
          <Select
            id="midCode"
            label="중분류"
            value={value.midCode ?? ""}
            onChange={(v) => onChange({ ...value, midCode: v || undefined, smallCode: undefined })}
            options={filteredMid}
            disabled={!value.largeCode}
            color="bg-violet-500"
            icon={<SearchIcon className="h-3.5 w-3.5" />}
          />
          <Select
            id="smallCode"
            label="소분류"
            value={value.smallCode ?? ""}
            onChange={(v) => onChange({ ...value, smallCode: v || undefined })}
            options={filteredSmall}
            disabled={!value.midCode}
            color="bg-fuchsia-500"
            icon={<SearchIcon className="h-3.5 w-3.5" />}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-sky-600 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none sm:w-auto sm:px-6"
        >
          {loading ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <SearchIcon className="h-4 w-4" />
              분석하기
            </>
          )}
        </button>
      </div>
    </form>
  );
}
