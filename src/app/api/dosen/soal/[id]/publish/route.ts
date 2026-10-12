import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const questionId = Number(id);

    const [question] = await db
      .select({ id: questions.id, isPublished: questions.isPublished })
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const nextPublished = !question.isPublished;

    await db
      .update(questions)
      .set({ isPublished: nextPublished })
      .where(eq(questions.id, questionId));

    return NextResponse.json({ isPublished: nextPublished });
  } catch (err: any) {
    console.error("Toggle publish error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah status publikasi." },
      { status: 500 }
    );
  }
}
