import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attempts, attemptErrors, questions, users } from "@/lib/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    // 1. Overall stats
    const [totalAttemptsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(attempts);
    const totalAttempts = Number(totalAttemptsResult?.count || 0);

    const [correctAttemptsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(attempts)
      .where(eq(attempts.status, "correct"));
    const correctAttempts = Number(correctAttemptsResult?.count || 0);

    const successRate =
      totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // 2. Error code frequencies
    const errorCodesDistribution = await db
      .select({
        code: attemptErrors.errorCode,
        count: sql<number>`count(*)`,
      })
      .from(attemptErrors)
      .groupBy(attemptErrors.errorCode)
      .orderBy(desc(sql`count(*)`));

    // 3. Category distribution
    const categoryDistribution = await db
      .select({
        category: attemptErrors.category,
        count: sql<number>`count(*)`,
      })
      .from(attemptErrors)
      .groupBy(attemptErrors.category)
      .orderBy(desc(sql`count(*)`));

    // 4. Hardest questions (most incorrect attempts)
    const hardestQuestions = await db
      .select({
        questionId: attempts.questionId,
        questionCode: questions.code,
        questionTitle: questions.title,
        totalAttempts: sql<number>`count(*)`,
        failedCount: sql<number>`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .groupBy(attempts.questionId, questions.code, questions.title)
      .orderBy(desc(sql`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`))
      .limit(5);

    // 5. Students needing attention
    const studentsNeedingAttention = await db
      .select({
        userId: attempts.userId,
        userName: users.name,
        userEmail: users.email,
        failedCount: sql<number>`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`,
        totalAttempts: sql<number>`count(*)`,
      })
      .from(attempts)
      .innerJoin(users, eq(attempts.userId, users.id))
      .where(eq(users.role, "student"))
      .groupBy(attempts.userId, users.name, users.email)
      .orderBy(desc(sql`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`))
      .limit(5);

    return NextResponse.json({
      totalAttempts,
      correctAttempts,
      successRate,
      errorCodesDistribution,
      categoryDistribution,
      hardestQuestions,
      studentsNeedingAttention,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data analitik" },
      { status: 500 }
    );
  }
}
