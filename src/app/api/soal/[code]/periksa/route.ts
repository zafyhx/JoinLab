import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { questions, schemaDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SandboxExecutor } from "@/lib/domain/sandbox/SandboxExecutor";
import { QueryRejectedError } from "@/lib/domain/sandbox/SqlGuard";
import { ResultComparator } from "@/lib/domain/grading/ResultComparator";
import { QueryAnatomyParser } from "@/lib/domain/diagnosis/QueryAnatomyParser";
import { DiagnosisEngine } from "@/lib/domain/diagnosis/DiagnosisEngine";
import { FeedbackBuilder } from "@/lib/domain/feedback/FeedbackBuilder";
import { ProgressService } from "@/lib/domain/learning/ProgressService";
import { EquivalentQuestionPicker } from "@/lib/domain/learning/EquivalentQuestionPicker";
import { getEffectiveStudent } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rateLimit";

const periksaSchema = z.object({
  sql: z.string().min(1, "Query SQL wajib diisi").max(2000, "Query maksimal 2000 karakter"),
  hintsUsed: z.number().int().min(0).max(3).default(0),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await req.json();
    const parsed = periksaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const { sql, hintsUsed } = parsed.data;
    const student = await getEffectiveStudent();

    // Rate limit (NFR-02): 20 pemeriksaan per menit per pengguna
    const limit = rateLimit(`periksa:${student.id}`, 20, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pemeriksaan. Coba lagi dalam ${limit.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    // 1. Fetch question and schema
    const [q] = await db
      .select({
        question: questions,
        schema: schemaDefinitions,
      })
      .from(questions)
      .innerJoin(
        schemaDefinitions,
        eq(questions.schemaDefinitionId, schemaDefinitions.id)
      )
      .where(eq(questions.code, code))
      .limit(1);

    if (!q) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const question = q.question;
    const schema = q.schema;

    // 2. Ensure expected result exists (calculate if missing from cache)
    let expectedResult = question.expectedResult as any;
    if (!expectedResult || !expectedResult.columns) {
      const expExec = await SandboxExecutor.run(schema.dbName, question.expectedSql, {
        rowLimit: 5000,
      });
      expectedResult = {
        columns: expExec.columns,
        rows: expExec.rows,
      };
      await db
        .update(questions)
        .set({
          expectedResult,
          expectedRowCount: expExec.rowCount,
        })
        .where(eq(questions.id, question.id));
    }

    // 3. Execute student query in sandbox
    let executionResult;
    let executionError: any = null;

    try {
      executionResult = await SandboxExecutor.run(schema.dbName, sql, {
        rowLimit: 5000,
      });
    } catch (err: any) {
      executionError = err;
    }

    // 4. Parse SQL Anatomy
    const anatomy = QueryAnatomyParser.parse(sql);

    // 5. Compare result (if execution succeeded)
    let comparison = null;
    if (executionResult) {
      comparison = ResultComparator.compare(
        {
          columns: executionResult.columns,
          rows: executionResult.rows,
          truncated: executionResult.truncated,
        },
        expectedResult,
        question.orderMatters
      );
    }

    // 6. Run Diagnosis Engine
    const diagnosis = await DiagnosisEngine.diagnose({
      question,
      submittedSql: sql,
      anatomy,
      comparison,
      execution: executionResult ?? null,
      schema,
      error: executionError,
    });

    // 7. Check for equivalent question for retry option
    const equivalentQ = await EquivalentQuestionPicker.pickEquivalent(
      question,
      student.id
    );
    const retryEquivalentUrl = equivalentQ ? `/soal/${equivalentQ.code}` : undefined;

    // 8. Build Feedback Payload
    let feedback;
    let verdict: "correct" | "incorrect" | "error" | "rejected" | "timeout";

    if (executionError) {
      verdict =
        executionError.name === "QueryTimeoutError"
          ? "timeout"
          : executionError instanceof QueryRejectedError
          ? "rejected"
          : "error";
      feedback = FeedbackBuilder.buildError(
        executionError,
        diagnosis.displayedFindings,
        verdict
      );
    } else if (comparison && comparison.isEqual) {
      verdict = "correct";
      feedback = FeedbackBuilder.buildSuccess(
        executionResult!,
        `/skema/${schema.slug}`,
        retryEquivalentUrl
      );
    } else {
      verdict = "incorrect";
      feedback = FeedbackBuilder.buildIncorrect(
        comparison!,
        executionResult!,
        diagnosis.displayedFindings,
        retryEquivalentUrl
      );
    }

    // 9. Record attempt and progress
    await ProgressService.recordAttempt({
      userId: student.id,
      question,
      submittedSql: sql,
      status: verdict,
      executionMs: executionResult?.executionMs ?? 0,
      actualRowCount: executionResult?.rowCount,
      expectedRowCount: question.expectedRowCount ?? expectedResult.rows.length,
      errorCodes: diagnosis.allErrorCodes,
      errorCategories: diagnosis.allCategories,
      feedback,
      hintsUsed,
    });

    return NextResponse.json(feedback);
  } catch (err: any) {
    if (err instanceof QueryRejectedError) {
      return NextResponse.json(
        { error: err.message, code: err.reason },
        { status: 422 }
      );
    }

    console.error("Periksa endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
