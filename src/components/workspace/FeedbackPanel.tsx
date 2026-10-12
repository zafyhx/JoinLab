"use client";

import React, { useState } from "react";
import { FeedbackPayload } from "@/lib/domain/feedback/FeedbackBuilder";
import { Finding } from "@/lib/domain/diagnosis/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface FeedbackPanelProps {
  feedback: FeedbackPayload | null;
  onOpenHint?: (level: number) => void;
}

export function FeedbackPanel({ feedback, onOpenHint }: FeedbackPanelProps) {
  const [openedHints, setOpenedHints] = useState<Record<string, number>>({});
  const [showEvidence, setShowEvidence] = useState<Record<string, boolean>>({});

  if (!feedback) return null;

  const isCorrect = feedback.verdict === "correct";
  const isIncorrect = feedback.verdict === "incorrect";

  const handleNextHint = (code: string) => {
    const current = openedHints[code] || 0;
    const next = Math.min(current + 1, 3);
    setOpenedHints((prev) => ({ ...prev, [code]: next }));
    if (onOpenHint) {
      onOpenHint(next);
    }
  };

  const toggleEvidence = (code: string) => {
    setShowEvidence((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition-all animate-in fade-in-50 ${
        isCorrect
          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
          : isIncorrect
          ? "bg-red-50/60 border-red-200 text-slate-900"
          : "bg-amber-50/60 border-amber-200 text-slate-900"
      }`}
    >
      {/* Verdict Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : isIncorrect ? (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <span
            className={`font-bold text-base ${
              isCorrect
                ? "text-emerald-800"
                : isIncorrect
                ? "text-red-800"
                : "text-amber-800"
            }`}
          >
            {isCorrect
              ? "Jawaban Tepat!"
              : isIncorrect
              ? "Jawaban Belum Tepat"
              : "Eksekusi Mengalami Kendala"}
          </span>
        </div>

        {/* Action Link: Soal Setara / Next */}
        <div className="flex items-center gap-2">
          {feedback.next?.retry_equivalent_url && (
            <Link
              href={feedback.next.retry_equivalent_url}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Coba Soal Setara</span>
            </Link>
          )}

          {isCorrect && feedback.next?.next_question_url && (
            <Link
              href={feedback.next.next_question_url}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span>Soal Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">
        {feedback.summary}
      </p>

      {/* Findings List (E01 - E20) */}
      {feedback.findings && feedback.findings.length > 0 && (
        <div className="space-y-3.5 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Analisis Diagnosis Logika:
          </p>

          {feedback.findings.map((f: Finding) => {
            const currentHintLvl = openedHints[f.code] || 0;
            const isEvidenceOpen = showEvidence[f.code] || false;

            return (
              <div
                key={f.code}
                className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {f.code}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-900">
                      {f.title}
                    </h4>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {f.category.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {f.explanation}
                </p>

                {/* Evidence accordion if available */}
                {f.evidence && Object.keys(f.evidence).length > 0 && (
                  <div className="mb-3 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleEvidence(f.code)}
                      className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                    >
                      <span>Bukti Temuan Data</span>
                      {isEvidenceOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isEvidenceOpen && (
                      <pre className="mt-1.5 p-2 bg-slate-50 border rounded text-[11px] font-mono text-slate-700 overflow-x-auto">
                        {JSON.stringify(f.evidence, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* 3-Level Progressive Hints */}
                {f.hints && f.hints.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Petunjuk Bertahap ({currentHintLvl}/3)</span>
                      </div>
                      {currentHintLvl < 3 && (
                        <button
                          type="button"
                          onClick={() => handleNextHint(f.code)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {currentHintLvl === 0
                            ? "Butuh Petunjuk?"
                            : "Buka Petunjuk Lanjutan"}
                        </button>
                      )}
                    </div>

                    {currentHintLvl > 0 && (
                      <div className="space-y-1.5 bg-amber-50/60 border border-amber-200/80 rounded-md p-3 text-xs text-amber-950">
                        {f.hints.slice(0, currentHintLvl).map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <span className="font-bold text-amber-700 select-none">
                              Tingkat {hIdx + 1}:
                            </span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
