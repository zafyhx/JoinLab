import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { schemaDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { SandboxExecutor } from "@/lib/domain/sandbox/SandboxExecutor";

const previewSchema = z.object({
  schemaDefinitionId: z.coerce.number().int().positive(),
  sql: z.string().min(1, "SQL wajib diisi").max(2000),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const { schemaDefinitionId, sql } = parsed.data;

    const [schema] = await db
      .select()
      .from(schemaDefinitions)
      .where(eq(schemaDefinitions.id, schemaDefinitionId))
      .limit(1);

    if (!schema) {
      return NextResponse.json({ error: "Skema tidak ditemukan" }, { status: 404 });
    }

    const result = await SandboxExecutor.run(schema.dbName, sql, { rowLimit: 100 });

    return NextResponse.json({
      columns: result.columns,
      rows: result.rows,
      rowCount: result.rowCount,
      truncated: result.truncated,
      executionMs: result.executionMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menjalankan pratinjau kunci jawaban." },
      { status: 400 }
    );
  }
}
