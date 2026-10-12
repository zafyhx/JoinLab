import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EquivalentQuestionPicker } from "@/lib/domain/learning/EquivalentQuestionPicker";
import { getEffectiveStudent } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.code, code))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const student = await getEffectiveStudent();
    const equivalent = await EquivalentQuestionPicker.pickEquivalent(
      question,
      student.id
    );

    if (!equivalent) {
      return NextResponse.json(
        { message: "Tidak ada soal setara yang tersedia pada kelompok varian ini." },
        { status: 404 }
      );
    }

    const redirectUrl = new URL(`/soal/${equivalent.code}`, req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengalihkan ke soal setara" },
      { status: 500 }
    );
  }
}
