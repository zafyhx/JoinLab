import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProgressService } from "@/lib/domain/learning/ProgressService";
import { getEffectiveStudent } from "@/lib/auth/session";

const petunjukSchema = z.object({
  level: z.number().int().min(1).max(3),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await req.json();
    const parsed = petunjukSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Tingkat petunjuk harus antara 1 sampai 3" },
        { status: 422 }
      );
    }

    const { level } = parsed.data;

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.code, code))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const hints = (question.hints as string[]) || [];
    const hintText = hints[level - 1] || "Tidak ada petunjuk tambahan.";

    const student = await getEffectiveStudent();
    await ProgressService.recordHintOpened(student.id, question.id, level);

    return NextResponse.json({
      level,
      hint: hintText,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil petunjuk" },
      { status: 500 }
    );
  }
}
