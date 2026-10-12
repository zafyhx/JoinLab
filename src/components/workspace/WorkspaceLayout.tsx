"use client";

import React, { useState } from "react";
import { Question, SchemaDefinition } from "@/lib/db/schema";
import { ErdData } from "@/lib/domain/erd/ErdBuilder";
import { SqlEditor } from "./SqlEditor";
import { ErdViewer } from "./ErdViewer";
import { ResultTable } from "./ResultTable";
import { FeedbackPanel } from "./FeedbackPanel";
import { FeedbackPayload } from "@/lib/domain/feedback/FeedbackBuilder";
import {
  Play,
  CheckCircle,
  BookOpen,
  Database,
  ArrowLeft,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface WorkspaceLayoutProps {
  question: Question;
  schema: SchemaDefinition;
  erdData: ErdData | null;
  equivalentQuestionCode?: string | null;
}

export function WorkspaceLayout({
  question,
  schema,
  erdData,
  equivalentQuestionCode,
}: WorkspaceLayoutProps) {
  const [activeTab, setActiveTab] = useState<"soal" | "erd">("soal");
  const [sql, setSql] = useState<string>("SELECT ");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview state
  const [previewResult, setPreviewResult] = useState<{
    columns: string[];
    rows: unknown[][];
    rowCount?: number;
    executionMs?: number;
    truncated?: boolean;
    error?: string | null;
  } | null>(null);

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null);

  // Question Hints state
  const [questionHintLevel, setQuestionHintLevel] = useState<number>(0);
  const [questionHintsList, setQuestionHintsList] = useState<string[]>([]);

  // 1. Jalankan Query (Preview)
  const handleRun = async () => {
    if (!sql.trim()) return;
    setIsRunning(true);
    setPreviewResult(null);

    try {
      const res = await fetch(`/api/soal/${question.code}/jalankan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPreviewResult({
          columns: [],
          rows: [],
          error: data.error || "Gagal menjalankan query",
        });
      } else {
        setPreviewResult({
          columns: data.columns,
          rows: data.rows,
          rowCount: data.rowCount,
          executionMs: data.executionMs,
          truncated: data.truncated,
          error: null,
        });
      }
    } catch (err: any) {
      setPreviewResult({
        columns: [],
        rows: [],
        error: err.message || "Terjadi kesalahan jaringan",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Periksa Jawaban (Grading)
  const handleSubmit = async () => {
    if (!sql.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/soal/${question.code}/periksa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql,
          hintsUsed: questionHintLevel,
        }),
      });

      const data: FeedbackPayload = await res.json();
      setFeedback(data);

      if (data.columns && data.columns.length > 0) {
        setPreviewResult({
          columns: data.columns,
          rows: data.rows_preview,
          rowCount: data.result_diff?.actual_rows,
          executionMs: data.executed_ms,
          error: null,
        });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengirimkan jawaban untuk penilaian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Ambil petunjuk soal
  const handleOpenQuestionHint = async () => {
    const nextLevel = Math.min(questionHintLevel + 1, 3);
    try {
      const res = await fetch(`/api/soal/${question.code}/petunjuk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: nextLevel }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestionHintLevel(nextLevel);
        setQuestionHintsList((prev) => [...prev, data.hint]);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/skema/${schema.slug}`}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Kembali ke daftar soal"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {question.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Level {question.level} • {schema.name}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 truncate max-w-md">
              {question.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {equivalentQuestionCode && (
            <Link
              href={`/soal/${equivalentQuestionCode}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Soal Setara</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-sm disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? "Menjalankan..." : "Jalankan (Ctrl+Enter)"}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Memeriksa..." : "Periksa Jawaban"}</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Pane: Question Prompt & ERD */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("soal")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "soal"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Deskripsi Soal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("erd")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "erd"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Diagram Relasi (ERD)</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="bg-white border border-slate-200 rounded-b-xl p-5 shadow-sm flex-1 flex flex-col">
            {activeTab === "soal" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Instruksi Tugas
                  </h3>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {question.prompt}
                  </p>
                </div>

                {/* Tables & Concepts tags */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Tabel Acuan:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(question.requiredTables as string[]).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Konsep:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(question.conceptTags as string[]).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium"
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progressive Hints Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Bantuan Petunjuk ({questionHintLevel}/3)</span>
                    </div>
                    {questionHintLevel < 3 && (
                      <button
                        type="button"
                        onClick={handleOpenQuestionHint}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {questionHintLevel === 0 ? "Buka Petunjuk 1" : "Petunjuk Berikutnya"}
                      </button>
                    )}
                  </div>

                  {questionHintsList.length > 0 && (
                    <div className="space-y-2 bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-950">
                      {questionHintsList.map((hText, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2">
                          <span className="font-bold text-amber-800 select-none">
                            Petunjuk {hIdx + 1}:
                          </span>
                          <span>{hText}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ErdViewer
                erdData={erdData}
                highlightTables={question.requiredTables as string[]}
              />
            )}
          </div>
        </section>

        {/* Right Pane: SQL Editor + Result Preview + Feedback */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* SQL Editor Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">Editor SQL</span>
              <span className="text-[11px] text-slate-400">
                Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono">Ctrl+Enter</kbd> untuk menjalankan
              </span>
            </div>

            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleRun}
              disabled={isRunning || isSubmitting}
            />
          </div>

          {/* Feedback Section (if evaluated) */}
          {feedback && <FeedbackPanel feedback={feedback} />}

          {/* Result Table Preview */}
          <ResultTable
            columns={previewResult?.columns ?? []}
            rows={previewResult?.rows ?? []}
            rowCount={previewResult?.rowCount}
            executionMs={previewResult?.executionMs}
            truncated={previewResult?.truncated}
            error={previewResult?.error}
            isLoading={isRunning}
          />
        </section>
      </main>
    </div>
  );
}
