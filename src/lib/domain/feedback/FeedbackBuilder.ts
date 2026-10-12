import { Finding } from "../diagnosis/types";
import { ComparisonReport } from "../grading/types";
import { ExecutionResult } from "../sandbox/types";

export type Verdict = "correct" | "incorrect" | "error" | "rejected" | "timeout";

export interface FeedbackPayload {
  verdict: Verdict;
  summary: string;
  findings: Finding[];
  result_diff?: {
    expected_rows: number;
    actual_rows: number;
    missing_count: number;
    extra_count: number;
    missing_sample: unknown[][];
    extra_sample: unknown[][];
  };
  columns: string[];
  rows_preview: unknown[][];
  executed_ms: number;
  next?: {
    retry_equivalent_url?: string;
    next_question_url?: string;
  };
}

export class FeedbackBuilder {
  public static buildSuccess(
    execution: ExecutionResult,
    nextUrl?: string,
    retryEquivalentUrl?: string
  ): FeedbackPayload {
    return {
      verdict: "correct",
      summary: "Selamat! Query kamu berhasil dijalankan dan menghasilkan data yang tepat.",
      findings: [],
      columns: execution.columns,
      rows_preview: execution.rows.slice(0, 50),
      executed_ms: execution.executionMs,
      next: {
        next_question_url: nextUrl,
        retry_equivalent_url: retryEquivalentUrl,
      },
    };
  }

  public static buildIncorrect(
    comparison: ComparisonReport,
    execution: ExecutionResult,
    findings: Finding[],
    retryEquivalentUrl?: string
  ): FeedbackPayload {
    let summary = `Hasil query kamu ${comparison.actualRowCount} baris, seharusnya ${comparison.expectedRowCount} baris.`;
    if (comparison.actualRowCount === comparison.expectedRowCount) {
      summary = `Jumlah baris sudah sesuai (${comparison.actualRowCount} baris), namun isi atau format data berbeda dari yang diharapkan.`;
    }

    return {
      verdict: "incorrect",
      summary,
      findings,
      result_diff: {
        expected_rows: comparison.expectedRowCount,
        actual_rows: comparison.actualRowCount,
        missing_count: comparison.missingCount,
        extra_count: comparison.extraCount,
        missing_sample: comparison.missingRowsSample,
        extra_sample: comparison.extraRowsSample,
      },
      columns: execution.columns,
      rows_preview: execution.rows.slice(0, 50),
      executed_ms: execution.executionMs,
      next: {
        retry_equivalent_url: retryEquivalentUrl,
      },
    };
  }

  public static buildError(
    err: any,
    findings: Finding[],
    verdict: "error" | "timeout" | "rejected" = "error"
  ): FeedbackPayload {
    return {
      verdict,
      summary: err.message || "Terjadi kesalahan saat mengeksekusi query.",
      findings,
      columns: [],
      rows_preview: [],
      executed_ms: 0,
    };
  }
}
