"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertIcon,
  KeyIcon,
  SendIcon,
  SparklesIcon,
  SpinnerIcon,
  XIcon,
} from "@/components/icons";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import type { ChatMessage } from "@/types/ai-analysis";
import type { CommercialAnalysisResponse } from "@/types/commercial";

interface AIAnalystChatProps {
  result: CommercialAnalysisResponse;
}

const KICKOFF_MESSAGE = "이 상권을 종합적으로 분석하고 조언해주세요.";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600">
          <KeyIcon className="h-3.5 w-3.5 text-white" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">Gemini API 키 설정</h3>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        AI 상권 분석가는 Google Gemini를 사용합니다. 아래에 본인의 Gemini API 키를 입력하세요.{" "}
        <span className="font-medium text-slate-600">
          키는 이 브라우저에만 저장되며, 저희 서버에는 저장되지 않습니다.
        </span>{" "}
        키가 없다면{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-violet-600 underline underline-offset-2"
        >
          Google AI Studio
        </a>
        에서 무료로 발급받을 수 있습니다.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Gemini API 키 붙여넣기"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-16 text-sm text-slate-800 shadow-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            {reveal ? "숨기기" : "보기"}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => onSave(draft)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          >
            저장
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-500 shadow-sm hover:bg-slate-50"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIAnalystChat({ result }: AIAnalystChatProps) {
  const { apiKey, setApiKey, isLoaded, hasKey } = useGeminiApiKey();
  const [showKeySettings, setShowKeySettings] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 지역·업종으로 다시 분석하면 이전 대화 맥락은 더 이상 유효하지 않으므로 초기화합니다.
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
        body: JSON.stringify({ apiKey, result, messages: nextMessages }),
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50/70 via-white to-fuchsia-50/50 px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <SparklesIcon className="h-3.5 w-3.5" />
          </span>
          AI 상권 분석가
        </h3>
        <button
          type="button"
          onClick={() => setShowKeySettings(true)}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
        >
          <KeyIcon className="h-3 w-3" />키 변경
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-500 ring-1 ring-violet-100">
            <SparklesIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-600">
              지금 분석 중인 지역·업종 데이터를 바탕으로 AI 상권 분석가와 대화해보세요
            </p>
            <p className="mt-1 text-xs text-slate-400">
              경쟁강도, 업종 공백 등 위 통계를 근거로 조언을 드립니다. 이어서 자유롭게 질문할 수
              있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => sendMessage(KICKOFF_MESSAGE)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          >
            {loading ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                AI 분석 시작하기
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="thin-scrollbar max-h-[480px] overflow-y-auto p-4">
            <ul className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <li key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {m.text}
                  </div>
                </li>
              ))}
              {loading && (
                <li className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-400">
                    <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                    AI 상권 분석가가 답변을 작성하고 있어요...
                  </div>
                </li>
              )}
            </ul>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2 border-t border-slate-100 p-3"
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
              placeholder="추가로 궁금한 점을 물어보세요 (예: 대신 어떤 업종이 좋을까요?)"
              rows={1}
              className="max-h-28 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
              aria-label="전송"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 border-t border-slate-100 px-4 py-3 text-xs text-rose-600">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-rose-400 hover:text-rose-600"
            aria-label="오류 닫기"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
        AI 답변은 점포 수 데이터를 근거로 한 참고용 의견이며, 실제 상권 조사를 대체하지 않습니다.
      </p>
    </div>
  );
}
