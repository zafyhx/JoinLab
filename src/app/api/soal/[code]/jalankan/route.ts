import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { questions, schemaDefinitions, activityEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SandboxExecutor } from "@/lib/domain/sandbox/SandboxExecutor";
import { QueryRejectedError } from "@/lib/domain/sandbox/SqlGuard";
import { getEffectiveStudent } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rateLimit";

const runSchema = z.object({
  sql: z.string().min(1, "Query SQL wajib diisi").max(2000, "Query maksimal 2000 karakter"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await req.json();
    const parsed = runSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const { sql } = parsed.data;

    // Rate limit (NFR-02): 30 eksekusi per menit per pengguna
    const student = await getEffectiveStudent();
    const limit = rateLimit(`jalankan:${student.id}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    // 1. Fetch question and associated schema
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

    // 2. Execute query in sandbox (row limit 100 for preview)
    const result = await SandboxExecutor.run(q.schema.dbName, sql, {
      rowLimit: 100,
    });

    // 3. Record query_run activity event
    await db.insert(activityEvents).values({
      userId: student.id,
      questionId: q.question.id,
      type: "query_run",
      meta: {
        rowCount: result.rowCount,
        executionMs: result.executionMs,
      },
    });

    return NextResponse.json({
      columns: result.columns,
      rows: result.rows,
      rowCount: result.rowCount,
      truncated: result.truncated,
      executionMs: result.executionMs,
    });
  } catch (err: any) {
    if (err instanceof QueryRejectedError) {
      return NextResponse.json(
        { error: err.message, code: err.reason },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat menjalankan query" },
      { status: 400 }
    );
  }
}
