import { db } from "@/lib/db";
import {
  attempts,
  attemptErrors,
  userProgress,
  activityEvents,
  Question,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Verdict, FeedbackPayload } from "../feedback/FeedbackBuilder";

interface RecordAttemptParams {
  userId: number;
  question: Question;
  submittedSql: string;
  status: Verdict;
  executionMs: number;
  actualRowCount?: number;
  expectedRowCount?: number;
  errorCodes?: string[];
  errorCategories?: string[];
  feedback: FeedbackPayload;
  hintsUsed?: number;
}

export class ProgressService {
  public static async recordAttempt(params: RecordAttemptParams) {
    const {
      userId,
      question,
      submittedSql,
      status,
      executionMs,
      actualRowCount,
      expectedRowCount,
      errorCodes = [],
      errorCategories = [],
      feedback,
      hintsUsed = 0,
    } = params;

    // 1. Get existing progress
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.questionId, question.id)
        )
      )
      .limit(1);

    const attemptNumber = (existing?.attemptsCount ?? 0) + 1;
    const isFirstAttempt = attemptNumber === 1;
    const isCorrect = status === "correct";

    // 2. Insert into attempts table
    const [insertedAttempt] = await db
      .insert(attempts)
      .values({
        userId,
        questionId: question.id,
        attemptNumber,
        submittedSql,
        status,
        executionMs,
        actualRowCount: actualRowCount ?? null,
        expectedRowCount: expectedRowCount ?? null,
        errorCodes,
        errorCategories,
        feedback,
        hintsUsed,
      })
      .returning({ id: attempts.id });

    const attemptId = insertedAttempt.id;

    // 3. Normalize attempt errors for instructor analytics
    if (attemptId && errorCodes.length > 0) {
      const errorRows = errorCodes.map((code, idx) => ({
        attemptId: Number(attemptId),
        errorCode: code,
        category: errorCategories[idx] || "logika_hasil",
      }));
      await db.insert(attemptErrors).values(errorRows);
    }

    // 4. Update or insert user_progress
    const newStatus = isCorrect
      ? "solved"
      : existing?.status === "solved"
      ? "solved"
      : "attempted";

    if (existing) {
      await db
        .update(userProgress)
        .set({
          status: newStatus,
          attemptsCount: attemptNumber,
          firstAttemptCorrect: isFirstAttempt
            ? isCorrect
            : existing.firstAttemptCorrect,
          hintsUsedTotal: (existing.hintsUsedTotal ?? 0) + hintsUsed,
          solvedAt: isCorrect && !existing.solvedAt ? new Date() : existing.solvedAt,
          lastAttemptAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id));
    } else {
      await db.insert(userProgress).values({
        userId,
        questionId: question.id,
        status: newStatus,
        attemptsCount: 1,
        firstAttemptCorrect: isCorrect,
        hintsUsedTotal: hintsUsed,
        solvedAt: isCorrect ? new Date() : null,
        lastAttemptAt: new Date(),
      });
    }

    // 5. Record activity event
    await db.insert(activityEvents).values({
      userId,
      questionId: question.id,
      type: isCorrect ? "question_solved" : "attempt_submitted",
      meta: {
        status,
        attemptNumber,
        executionMs,
      },
    });
  }

  public static async recordHintOpened(
    userId: number,
    questionId: number,
    hintLevel: number
  ) {
    await db.insert(activityEvents).values({
      userId,
      questionId,
      type: "hint_opened",
      meta: { hintLevel },
    });
  }

  public static async recordErdOpened(userId: number, questionId: number) {
    await db.insert(activityEvents).values({
      userId,
      questionId,
      type: "erd_opened",
    });
  }
}
