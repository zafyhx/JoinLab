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
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      className={cn(
        "rounded-lg border p-5 transition-all",
        isCorrect
          ? "border-success/30 bg-success/10"
          : isIncorrect
          ? "border-destructive/30 bg-destructive/10"
          : "border-warning/30 bg-warning/10"
      )}
    >
      {/* Verdict header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {isCorrect ? (
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-success" />
          ) : isIncorrect ? (
            <XCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
          ) : (
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-warning" />
          )}
          <span
            className={cn(
              "text-base font-bold",
              isCorrect
                ? "text-success"
                : isIncorrect
                ? "text-destructive"
                : "text-warning"
            )}
          >
            {isCorrect
              ? "Jawaban tepat"
              : isIncorrect
              ? "Jawaban belum tepat"
              : "Eksekusi mengalami kendala"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {feedback.next?.retry_equivalent_url && (
            <Link
              href={feedback.next.retry_equivalent_url}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <RefreshCw className="h-3.5 w-3.5 text-accent" />
              Coba Soal Setara
            </Link>
          )}

          {isCorrect && feedback.next?.next_question_url && (
            <Link
              href={feedback.next.next_question_url}
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Soal Berikutnya
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">
        {feedback.summary}
      </p>

      {feedback.findings && feedback.findings.length > 0 && (
        <div className="mt-4 space-y-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analisis diagnosis logika
          </p>

          {feedback.findings.map((f: Finding) => {
            const currentHintLvl = openedHints[f.code] || 0;
            const isEvidenceOpen = showEvidence[f.code] || false;

            return (
              <div key={f.code} className="rounded-md border bg-card p-4">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded border bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-muted-foreground">
                      {f.code}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                  </div>
                  <Badge variant="outline">{f.category.replace("_", " ")}</Badge>
                </div>

                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {f.explanation}
                </p>

                {f.evidence && Object.keys(f.evidence).length > 0 && (
                  <div className="mb-3 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleEvidence(f.code)}
                      className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>Bukti temuan data</span>
                      {isEvidenceOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isEvidenceOpen && (
                      <pre className="mt-1.5 overflow-x-auto rounded border bg-muted p-2 font-mono text-[11px] text-foreground">
                        {JSON.stringify(f.evidence, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {f.hints && f.hints.length > 0 && (
                  <div className="mt-2 border-t pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-warning">
                        <Lightbulb className="h-4 w-4" />
                        Petunjuk bertahap ({currentHintLvl}/3)
                      </div>
                      {currentHintLvl < 3 && (
                        <button
                          type="button"
                          onClick={() => handleNextHint(f.code)}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          {currentHintLvl === 0
                            ? "Butuh petunjuk?"
                            : "Buka petunjuk lanjutan"}
                        </button>
                      )}
                    </div>

                    {currentHintLvl > 0 && (
                      <div className="space-y-1.5 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
                        {f.hints.slice(0, currentHintLvl).map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <span className="select-none font-bold text-warning">
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
