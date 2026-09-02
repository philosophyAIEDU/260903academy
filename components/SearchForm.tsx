"use client";

import { useState } from "react";
import { COMMON_INDUTYPE_LIST, SIGUN_LIST } from "@/lib/constants";
import type { AcademySearchQuery } from "@/types/academy";

interface SearchFormProps {
  onSearch: (query: AcademySearchQuery) => void;
  loading: boolean;
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
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="sigunNm" className="text-xs font-medium text-slate-600">
          시군 <span className="text-rose-500">*</span>
        </label>
        <select
          id="sigunNm"
          value={sigunNm}
          onChange={(e) => setSigunNm(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">선택하세요</option>
          {SIGUN_LIST.map((sigun) => (
            <option key={sigun} value={sigun}>
              {sigun}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="emdNm" className="text-xs font-medium text-slate-600">
          읍면동
        </label>
        <input
          id="emdNm"
          type="text"
          value={emdNm}
          onChange={(e) => setEmdNm(e.target.value)}
          placeholder="예: 정자동"
          className="rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
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
          className="rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <datalist id="indutype-options">
          {COMMON_INDUTYPE_LIST.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="faclyNm" className="text-xs font-medium text-slate-600">
          학원명
        </label>
        <input
          id="faclyNm"
          type="text"
          value={faclyNm}
          onChange={(e) => setFaclyNm(e.target.value)}
          placeholder="학원명 검색"
          className="rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col justify-end gap-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {validationError && (
        <p className="col-span-full text-xs text-rose-600">{validationError}</p>
      )}
    </form>
  );
}
