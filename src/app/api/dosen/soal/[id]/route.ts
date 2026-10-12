import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { questionInputSchema } from "@/lib/validation/questionInput";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const questionId = Number(id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return NextResponse.json({ error: "ID soal tidak valid" }, { status: 422 });
    }

    const body = await req.json();
    const parsed = questionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const input = parsed.data;

    const [existing] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    await db
      .update(questions)
      .set({
        code: input.code,
        schemaDefinitionId: input.schemaDefinitionId,
        level: input.level,
        title: input.title,
        prompt: input.prompt,
        expectedSql: input.expectedSql,
        requiredTables: input.requiredTables,
        conceptTags: input.conceptTags,
        orderMatters: input.orderMatters,
        hints: input.hints,
        isPublished: input.isPublished,
      })
      .where(eq(questions.id, questionId));

    return NextResponse.json({ success: true, id: questionId });
  } catch (err: any) {
    console.error("Update question error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui soal." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const questionId = Number(id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return NextResponse.json({ error: "ID soal tidak valid" }, { status: 422 });
    }

    await db.delete(questions).where(eq(questions.id, questionId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete question error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus soal." },
      { status: 500 }
    );
  }
}
