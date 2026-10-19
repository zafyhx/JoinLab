"use client";

import React, { useState } from "react";
import { Question, SchemaDefinition } from "@/lib/db/schema";
import { ErdData } from "@/lib/domain/erd/ErdBuilder";
import { SqlEditor } from "./SqlEditor";
import { ErdViewer } from "./ErdViewer";
import { ResultTable } from "./ResultTable";
import { FeedbackPanel } from "./FeedbackPanel";
import { FeedbackPayload } from "@/lib/domain/feedback/FeedbackBuilder";
import { Play, CheckCircle, BookOpen, Database, ArrowLeft, RefreshCw, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const [previewResult, setPreviewResult] = useState<{
    columns: string[];
    rows: unknown[][];
    rowCount?: number;
    executionMs?: number;
    truncated?: boolean;
    error?: string | null;
  } | null>(null);

  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null);

  const [questionHintLevel, setQuestionHintLevel] = useState<number>(0);
  const [questionHintsList, setQuestionHintsList] = useState<string[]>([]);

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/skema/${schema.slug}`}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Kembali ke daftar soal"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold text-accent">
                  {question.code}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Level {question.level} · {schema.name}
                </span>
              </div>
              <h1 className="max-w-md truncate text-base font-semibold text-foreground">
                {question.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {equivalentQuestionCode && (
              <Link
                href={`/soal/${equivalentQuestionCode}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "hidden sm:inline-flex"
                )}
              >
                <RefreshCw className="h-3.5 w-3.5 text-accent" />
                Soal Setara
              </Link>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isRunning ? "Menjalankan..." : "Jalankan"}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isSubmitting ? "Memeriksa..." : "Periksa Jawaban"}
            </Button>
          </div>
        </div>
      </header>

      {/* Split workspace */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12">
        {/* Left pane: prompt & ERD */}
        <section className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex gap-1 rounded-t-xl border border-white/80 bg-card/85 px-4 pt-3 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setActiveTab("soal")}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 pb-2.5 text-xs font-semibold transition-colors",
                activeTab === "soal"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Deskripsi Soal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("erd")}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 pb-2.5 text-xs font-semibold transition-colors",
                activeTab === "erd"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Database className="h-4 w-4" />
              Diagram Relasi (ERD)
            </button>
          </div>

          <div className="flex flex-1 flex-col rounded-b-xl border border-t-0 border-white/80 bg-card/85 p-5 shadow-sm backdrop-blur-sm">
            {activeTab === "soal" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Instruksi tugas
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {question.prompt}
                  </p>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Tabel acuan:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(question.requiredTables as string[]).map((t) => (
                        <span
                          key={t}
                          className="rounded border bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Konsep:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(question.conceptTags as string[]).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                      <Lightbulb className="h-4 w-4" />
                      Bantuan petunjuk ({questionHintLevel}/3)
                    </div>
                    {questionHintLevel < 3 && (
                      <button
                        type="button"
                        onClick={handleOpenQuestionHint}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        {questionHintLevel === 0 ? "Buka petunjuk 1" : "Petunjuk berikutnya"}
                      </button>
                    )}
                  </div>

                  {questionHintsList.length > 0 && (
                    <div className="space-y-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
                      {questionHintsList.map((hText, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2">
                          <span className="select-none font-bold text-warning">
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

        {/* Right pane: editor + feedback + result */}
        <section className="flex flex-col gap-5 lg:col-span-7">
          <div className="flex flex-col gap-2 rounded-xl border border-white/80 bg-card/85 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Editor SQL</span>
              <span className="text-[11px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                  Ctrl+Enter
                </kbd>{" "}
                untuk menjalankan
              </span>
            </div>

            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleRun}
              disabled={isRunning || isSubmitting}
            />
          </div>

          {feedback && <FeedbackPanel feedback={feedback} />}

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
