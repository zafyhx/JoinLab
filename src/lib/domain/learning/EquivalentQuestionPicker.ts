import { db } from "@/lib/db";
import { questions, userProgress, Question } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";

export class EquivalentQuestionPicker {
  /**
   * Finds an equivalent question within the same variant_group.
   * Priority:
   * 1. Not attempted yet by user
   * 2. Attempted but not solved
   * 3. Any other question in the same group (if all solved)
   */
  public static async pickEquivalent(
    currentQuestion: Question,
    userId: number
  ): Promise<Question | null> {
    if (!currentQuestion.variantGroupId) {
      return null;
    }

    // Get all candidate questions in the same variant group except the current one
    const candidates = await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.variantGroupId, currentQuestion.variantGroupId),
          ne(questions.id, currentQuestion.id),
          eq(questions.isPublished, true)
        )
      );

    if (candidates.length === 0) {
      return null;
    }

    // Fetch user progress for these candidates
    const candidateIds = candidates.map((c) => c.id);
    const progressList = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const progressMap = new Map<number, string>();
    for (const p of progressList) {
      progressMap.set(p.questionId, p.status);
    }

    // Priority 1: Unattempted
    const unattempted = candidates.filter(
      (c) => !progressMap.has(c.id) || progressMap.get(c.id) === "not_started"
    );
    if (unattempted.length > 0) {
      return unattempted[0];
    }

    // Priority 2: Attempted but not yet solved
    const attemptedUnsolved = candidates.filter(
      (c) => progressMap.get(c.id) === "attempted"
    );
    if (attemptedUnsolved.length > 0) {
      return attemptedUnsolved[0];
    }

    // Priority 3: Fallback to the first other candidate
    return candidates[0];
  }
}
