"use client";

import { useState } from "react";
import { COMMON_INDUTYPE_LIST, SIGUN_LIST } from "@/lib/constants";
import {
  AlertIcon,
  BookIcon,
  ChevronDownIcon,
  MapPinIcon,
  SearchIcon,
  SpinnerIcon,
} from "@/components/icons";
import type { AcademySearchQuery } from "@/types/academy";

interface SearchFormProps {
  onSearch: (query: AcademySearchQuery) => void;
  loading: boolean;
}

const fieldClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:bg-white hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";

function FieldIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`pointer-events-none absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-white shadow-sm ${color}`}
    >
      {children}
    </span>
  );
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [sigunNm, setSigunNm] = useState("");
  const [emdNm, setEmdNm] = useState("");
  const [indutypeDivNm, setIndutypeDivNm] = useState("");
  const [faclyNm, setFaclyNm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sigunNm) {
      setValidationError("시/군을 먼저 선택해주세요.");
      return;
    }
    setValidationError(null);
    onSearch({
      sigunNm,
      emdNm: emdNm.trim() || undefined,
      indutypeDivNm: indutypeDivNm || undefined,
      faclyNm: faclyNm.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-panel backdrop-blur-xl"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700" />

      <div className="p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white shadow-md">
              <SearchIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">경기도 학원 검색 조건</h2>
              <p className="text-xs text-slate-500">
                경기도교육청 공공데이터 기반 실시간 인허가 학원 및 교습소 조회
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            실시간 지도 연동
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 시군 선택 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sigunNm" className="text-xs font-semibold text-slate-700">
              시/군 <span className="text-amber-600 font-bold">*필수</span>
            </label>
            <div className="relative">
              <FieldIcon color="bg-indigo-600">
                <MapPinIcon className="h-3.5 w-3.5" />
              </FieldIcon>
              <select
                id="sigunNm"
                value={sigunNm}
                onChange={(e) => {
                  setSigunNm(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className={fieldClass}
              >
                <option value="">시/군 선택</option>
                {SIGUN_LIST.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* 읍면동 입력 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="emdNm" className="text-xs font-semibold text-slate-700">
              읍/면/동 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <div className="relative">
              <FieldIcon color="bg-slate-700">
                <MapPinIcon className="h-3.5 w-3.5" />
              </FieldIcon>
              <input
                id="emdNm"
                type="text"
                value={emdNm}
                onChange={(e) => setEmdNm(e.target.value)}
                placeholder="예: 정자동, 백현동"
                className={inputClass}
              />
            </div>
          </div>

          {/* 교습계열 선택 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="indutypeDivNm" className="text-xs font-semibold text-slate-700">
              교습계열 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <div className="relative">
              <FieldIcon color="bg-amber-600">
                <BookIcon className="h-3.5 w-3.5" />
              </FieldIcon>
              <select
                id="indutypeDivNm"
                value={indutypeDivNm}
                onChange={(e) => setIndutypeDivNm(e.target.value)}
                className={fieldClass}
              >
                <option value="">전체 업종</option>
                {COMMON_INDUTYPE_LIST.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* 학원명 입력 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="faclyNm" className="text-xs font-semibold text-slate-700">
              학원명 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <div className="relative">
              <FieldIcon color="bg-slate-700">
                <SearchIcon className="h-3.5 w-3.5" />
              </FieldIcon>
              <input
                id="faclyNm"
                type="text"
                value={faclyNm}
                onChange={(e) => setFaclyNm(e.target.value)}
                placeholder="예: 대치, 종로, 에듀"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {validationError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            <AlertIcon className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <p className="text-xs text-slate-500">
            💡 경기도 31개 시·군 내 인허가 학원 위치와 교습과목, 정원을 실시간으로 조회합니다.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:from-amber-600 hover:via-amber-700 hover:to-slate-900 hover:shadow-gold-glow disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin text-amber-400" />
                <span>학원 데이터 조회 중...</span>
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4 text-amber-400" />
                <span>학원 데이터 정밀 검색</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
