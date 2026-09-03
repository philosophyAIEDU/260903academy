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
  idPrefix?: string;
  title?: string;
  hideSubmit?: boolean;
  accentBar?: string;
  accentIcon?: string;
}

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:bg-white hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function FieldIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`pointer-events-none absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-white shadow-sm ${color}`}
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
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label}
        </label>
        {options.length > 0 && (
          <span className="text-[10px] font-medium text-slate-400">
            {options.length}개 옵션
          </span>
        )}
      </div>
      <div className="relative">
        <FieldIcon color={color}>{icon}</FieldIcon>
        <select
          id={id}
          value={value}
          disabled={disabled || options.length === 0}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
        >
          <option value="">전체 (선택 안 함)</option>
          {options.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
  idPrefix = "",
  title = "상권 정밀 분석 조건 설정",
  hideSubmit = false,
  accentBar = "from-amber-500 via-amber-600 to-indigo-700",
  accentIcon = "from-amber-500 to-amber-600",
}: RegionIndustryPickerProps) {
  function handleSidoChange(code: string) {
    onChange({ ...value, sidoCode: code || undefined, sigunguCode: undefined, dongCode: undefined });
  }
  function handleSigunguChange(code: string) {
    onChange({ ...value, sigunguCode: code || undefined, dongCode: undefined });
  }
  function handleDongChange(code: string) {
    onChange({ ...value, dongCode: code || undefined });
  }

  function handleLargeChange(code: string) {
    onChange({ ...value, largeCode: code || undefined, midCode: undefined, smallCode: undefined });
  }
  function handleMidChange(code: string) {
    onChange({ ...value, midCode: code || undefined, smallCode: undefined });
  }
  function handleSmallChange(code: string) {
    onChange({ ...value, smallCode: code || undefined });
  }

  const hasAnyFilter = Boolean(
    value.sidoCode || value.sigunguCode || value.dongCode || value.largeCode || value.midCode || value.smallCode
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-panel backdrop-blur-xl transition-all duration-300">
      {/* 상단 럭셔리 라인 */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accentBar}`} />

      <div className="p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accentIcon} text-white shadow-md`}
            >
              <SearchIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="text-xs text-slate-500">
                지역과 업종을 단계별로 선택하여 정밀 상권 경쟁력과 기회를 진단하세요
              </p>
            </div>
          </div>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => onChange({})}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              초기화
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* STEP 1: 지역 선택 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                분석 지역 선택
              </h3>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                필수 권장
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                id={`${idPrefix}sido`}
                label="시/도"
                value={value.sidoCode ?? ""}
                onChange={handleSidoChange}
                options={sido}
                color="bg-indigo-600"
                icon={<MapPinIcon className="h-3.5 w-3.5" />}
              />
              <Select
                id={`${idPrefix}sigungu`}
                label="시/군/구"
                value={value.sigunguCode ?? ""}
                onChange={handleSigunguChange}
                options={sigungu}
                disabled={!value.sidoCode}
                color="bg-indigo-600"
                icon={<MapPinIcon className="h-3.5 w-3.5" />}
              />
              <Select
                id={`${idPrefix}dong`}
                label="행정동"
                value={value.dongCode ?? ""}
                onChange={handleDongChange}
                options={dong}
                disabled={!value.sigunguCode}
                color="bg-indigo-600"
                icon={<MapPinIcon className="h-3.5 w-3.5" />}
              />
            </div>
          </div>

          {/* STEP 2: 업종 선택 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-sm">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                타깃 업종 선택
              </h3>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                상세 분석
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                id={`${idPrefix}large`}
                label="대분류"
                value={value.largeCode ?? ""}
                onChange={handleLargeChange}
                options={large}
                color="bg-amber-600"
                icon={<SearchIcon className="h-3.5 w-3.5" />}
              />
              <Select
                id={`${idPrefix}mid`}
                label="중분류"
                value={value.midCode ?? ""}
                onChange={handleMidChange}
                options={mid}
                disabled={!value.largeCode}
                color="bg-amber-600"
                icon={<SearchIcon className="h-3.5 w-3.5" />}
              />
              <Select
                id={`${idPrefix}small`}
                label="소분류"
                value={value.smallCode ?? ""}
                onChange={handleSmallChange}
                options={small}
                disabled={!value.midCode}
                color="bg-amber-600"
                icon={<SearchIcon className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        </div>

        {!hideSubmit && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              💡 지역만 선택하면 해당 지역 전체 상권 지형을, 업종까지 선택하면 과밀도 및 경쟁 강도를
              정밀 진단합니다.
            </p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:from-amber-600 hover:via-amber-700 hover:to-slate-900 hover:shadow-gold-glow disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin text-amber-400" />
                  <span>상권 빅데이터 분석 중...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 text-amber-400" />
                  <span>상권 인텔리전스 분석 시작</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
