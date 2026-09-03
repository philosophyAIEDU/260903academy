"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertIcon,
  ChevronDownIcon,
  KeyIcon,
  SendIcon,
  SparklesIcon,
  SpinnerIcon,
  XIcon,
} from "@/components/icons";
import { GEMINI_MODELS } from "@/lib/ai-constants";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { useGeminiModel } from "@/hooks/useGeminiModel";
import type { ChatMessage } from "@/types/ai-analysis";
import type { CommercialAnalysisResponse } from "@/types/commercial";

interface AIAnalystChatProps {
  result: CommercialAnalysisResponse;
}

const KICKOFF_MESSAGE = "이 상권을 종합적으로 분석하고 전략적 조언을 해주세요.";

function ModelSelect({
  model,
  onChange,
  compact,
}: {
  model: string;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={model}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
          compact ? "pr-7" : "pr-8"
        }`}
      >
        {GEMINI_MODELS.map((m) => (
          <option key={m.id} value={m.id} className="text-slate-800">
            {m.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function ApiKeyForm({
  initialValue,
  onSave,
  onCancel,
  showCancel,
}: {
  initialValue: string;
  onSave: (key: string) => void;
  onCancel?: () => void;
  showCancel: boolean;
}) {
  const [draft, setDraft] = useState(initialValue);
  const [reveal, setReveal] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-white p-6 shadow-panel">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
          <KeyIcon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Gemini AI Executive API 키 설정</h3>
          <p className="text-[11px] text-slate-500">지능형 상권 심층 자문 엔진 구동</p>
        </div>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-slate-600">
        AI 상권 분석가는 Google Gemini 최신 모델을 통해 상권 빅데이터를 종합 추론합니다. 본인의 Gemini API 키를 입력해주세요.{" "}
        <span className="font-semibold text-slate-800">
          키는 안전하게 브라우저 로컬 스토리지에만 보관되며 외부 서버로 절대 전송되지 않습니다.
        </span>{" "}
        (
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-amber-700 underline underline-offset-2 hover:text-amber-800"
        >
          Google AI Studio 무료 발급
        </a>
        )
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <input
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="AI Studio API 키 입력 (예: AIzaSy...)"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-16 text-sm font-mono text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            {reveal ? "숨김" : "보기"}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => onSave(draft)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-amber-700 hover:to-amber-800 hover:shadow-gold-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            안전하게 저장
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIAnalystChat({ result }: AIAnalystChatProps) {
  const { apiKey, setApiKey, isLoaded, hasKey } = useGeminiApiKey();
  const { model, setModel } = useGeminiModel();
  const [showKeySettings, setShowKeySettings] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [result]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, result, messages: nextMessages, model }),
      });
      const body = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !body.text) {
        setError(body.error ?? "AI 응답을 받지 못했습니다.");
        return;
      }
      setMessages((prev) => [...prev, { role: "model", text: body.text! }]);
    } catch {
      setError("네트워크 오류로 AI 응답을 받지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) return null;

  if (!hasKey || showKeySettings) {
    return (
      <ApiKeyForm
        initialValue={apiKey}
        showCancel={hasKey}
        onCancel={() => setShowKeySettings(false)}
        onSave={(key) => {
          setApiKey(key);
          setShowKeySettings(false);
        }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-panel">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 via-white to-indigo-50/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm">
            <SparklesIcon className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">AI Executive Market Advisor</h3>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.2 text-[10px] font-bold text-amber-800">
                PRO INTEL
              </span>
            </div>
            <p className="text-[11px] text-slate-500">실시간 상권 빅데이터 기반 종합 심층 자문</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelect model={model} onChange={setModel} />
          <button
            type="button"
            onClick={() => setShowKeySettings(true)}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <KeyIcon className="h-3 w-3 text-slate-400" />
            키 관리
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-10">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-600 ring-1 ring-amber-200/60 shadow-inner">
            <SparklesIcon className="h-7 w-7" />
          </span>
          <div className="max-w-md">
            <h4 className="text-base font-bold text-slate-900">
              현재 분석 중인 상권 데이터를 토대로 AI 심층 조언을 받아보세요
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              선택한 지역의 점포 과밀도, 하위 업종 공백, 행정동별 분포 데이터를 다각도로 교차 분석하여
              신규 출점 및 타당성 분석 조언을 제공합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => sendMessage(KICKOFF_MESSAGE)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-amber-700 hover:shadow-gold-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin text-amber-400" />
                <span>데이터 다각도 종합 분석 중...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 text-amber-400" />
                <span>AI 상권 종합 브리핑 받기</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="thin-scrollbar max-h-[500px] overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm"
                      : "border border-slate-200/90 bg-slate-50/80 text-slate-800 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs font-semibold text-amber-900 shadow-sm">
                  <SpinnerIcon className="h-4 w-4 animate-spin text-amber-600" />
                  AI 분석가가 종합 데이터 모델링 및 답변을 생성하고 있습니다...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2 border-t border-slate-100 bg-slate-50/40 p-4"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="추가로 궁금한 점을 질의하세요 (예: 이 지역에서 틈새시장으로 가장 유망한 업종은 무엇인가요?)"
              rows={1}
              className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-sm transition-all hover:bg-amber-600 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label="전송"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 border-t border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-rose-600 hover:text-rose-800"
            aria-label="오류 닫기"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 AI 분석 결과는 등록 점포 통계를 토대로 한 참고 의견이며, 투자 및 창업의 최종 판단은 현장 실사를 병행하시기 바랍니다.</span>
      </div>
    </div>
  );
}
