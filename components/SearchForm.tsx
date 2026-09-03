"use client";

import { useState } from "react";
import { COMMON_INDUTYPE_LIST, SIGUN_LIST } from "@/lib/constants";
import { AlertIcon, ChevronDownIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import type { AcademySearchQuery } from "@/types/academy";

interface SearchFormProps {
  onSearch: (query: AcademySearchQuery) => void;
  loading: boolean;
}

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [sigunNm, setSigunNm] = useState("");
  const [emdNm, setEmdNm] = useState("");
  const [indutypeDivNm, setIndutypeDivNm] = useState("");
  const [faclyNm, setFaclyNm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sigunNm) {
      setValidationError("시군을 먼저 선택해주세요.");
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
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-indigo-600" />
        <h2 className="text-sm font-semibold text-slate-800">검색 조건</h2>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sigunNm" className="text-xs font-medium text-slate-600">
            시군 <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="sigunNm"
              value={sigunNm}
              onChange={(e) => setSigunNm(e.target.value)}
              className={`${fieldClass} appearance-none pr-8`}
            >
              <option value="">선택하세요</option>
              {SIGUN_LIST.map((sigun) => (
                <option key={sigun} value={sigun}>
                  {sigun}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="emdNm" className="text-xs font-medium text-slate-600">
            읍면동
          </label>
          <input
            id="emdNm"
            type="text"
            value={emdNm}
            onChange={(e) => setEmdNm(e.target.value)}
            placeholder="예: 정자동"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="indutypeDivNm" className="text-xs font-medium text-slate-600">
            업종구분
          </label>
          <input
            id="indutypeDivNm"
            list="indutype-options"
            type="text"
            value={indutypeDivNm}
            onChange={(e) => setIndutypeDivNm(e.target.value)}
            placeholder="예: 보습"
            className={fieldClass}
          />
          <datalist id="indutype-options">
            {COMMON_INDUTYPE_LIST.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="faclyNm" className="text-xs font-medium text-slate-600">
            학원명
          </label>
          <input
            id="faclyNm"
            type="text"
            value={faclyNm}
            onChange={(e) => setFaclyNm(e.target.value)}
            placeholder="학원명 검색"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col justify-end gap-1.5">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                검색
              </>
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertIcon className="h-3.5 w-3.5" />
          {validationError}
        </p>
      )}
    </form>
  );
}
