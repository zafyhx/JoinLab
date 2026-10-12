import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  questions,
  schemaDefinitions,
  variantGroups,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { questionInputSchema } from "@/lib/validation/questionInput";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const [questionList, schemaList] = await Promise.all([
    db
      .select({
        id: questions.id,
        code: questions.code,
        title: questions.title,
        level: questions.level,
        prompt: questions.prompt,
        expectedSql: questions.expectedSql,
        requiredTables: questions.requiredTables,
        conceptTags: questions.conceptTags,
        hints: questions.hints,
        orderMatters: questions.orderMatters,
        isPublished: questions.isPublished,
        schemaDefinitionId: questions.schemaDefinitionId,
        schemaSlug: schemaDefinitions.slug,
        schemaName: schemaDefinitions.name,
      })
      .from(questions)
      .innerJoin(
        schemaDefinitions,
        eq(questions.schemaDefinitionId, schemaDefinitions.id)
      )
      .orderBy(asc(schemaDefinitions.sortOrder), asc(questions.level), asc(questions.code)),
    db
      .select({
        id: schemaDefinitions.id,
        slug: schemaDefinitions.slug,
        name: schemaDefinitions.name,
      })
      .from(schemaDefinitions)
      .where(eq(schemaDefinitions.isActive, true))
      .orderBy(asc(schemaDefinitions.sortOrder)),
  ]);

  return NextResponse.json({ questions: questionList, schemas: schemaList });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
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
      .where(eq(questions.code, input.code))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `Kode soal '${input.code}' sudah terpakai.` },
        { status: 409 }
      );
    }

    const [inserted] = await db
      .insert(questions)
      .values({
        code: input.code,
        schemaDefinitionId: input.schemaDefinitionId,
        variantGroupId: null,
        level: input.level,
        title: input.title,
        prompt: input.prompt,
        expectedSql: input.expectedSql,
        requiredTables: input.requiredTables,
        conceptTags: input.conceptTags,
        orderMatters: input.orderMatters,
        hints: input.hints,
        isPublished: input.isPublished,
        createdBy: user.id,
      })
      .returning({ id: questions.id });

    return NextResponse.json(
      { id: inserted.id, code: input.code },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create question error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan soal." },
      { status: 500 }
    );
  }
}
