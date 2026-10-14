import { db } from "@/lib/db";
import { schemaDefinitions, questions, userProgress } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import { BarChart3, CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const student = await getEffectiveStudent();

  const allSchemas = await db
    .select()
    .from(schemaDefinitions)
    .where(eq(schemaDefinitions.isActive, true))
    .orderBy(asc(schemaDefinitions.sortOrder));

  const allQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.isPublished, true))
    .orderBy(asc(questions.level), asc(questions.code));

  const progressList = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, student.id));

  const progressMap = new Map<number, any>();
  for (const p of progressList) {
    progressMap.set(p.questionId, p);
  }

  const totalSolved = progressList.filter((p) => p.status === "solved").length;
  const overallPercent =
    allQuestions.length > 0 ? Math.round((totalSolved / allQuestions.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="page-container space-y-9">
        <div>
          <span className="page-eyebrow flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pencapaian pembelajaran
          </span>
          <h1 className="page-title mt-2">Ringkasan progres belajar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pantau sejauh mana penguasaan materi SQL JOIN kamu di setiap tingkat
            kesulitan dan domain skema.
          </p>
        </div>

        {/* Global progress */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg border bg-card p-6 sm:flex-row">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Total kelulusan soal
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Menyelesaikan {totalSolved} dari total {allQuestions.length} latihan
              bank soal.
            </p>
          </div>
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <div className="text-right">
              <span className="text-3xl font-semibold text-accent">
                {overallPercent}%
              </span>
            </div>
            <div className="h-3 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Schemas detail */}
        <div className="space-y-6">
          {allSchemas.map((schema) => {
            const schemaQuestions = allQuestions.filter(
              (q) => q.schemaDefinitionId === schema.id
            );
            const schemaSolved = schemaQuestions.filter(
              (q) => progressMap.get(q.id)?.status === "solved"
            ).length;
            const schemaPct =
              schemaQuestions.length > 0
                ? Math.round((schemaSolved / schemaQuestions.length) * 100)
                : 0;

            return (
              <div key={schema.slug} className="space-y-5 rounded-lg border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {schema.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {schemaSolved} dari {schemaQuestions.length} soal terselesaikan (
                      {schemaPct}%)
                    </p>
                  </div>
                  <Link
                    href={`/skema/${schema.slug}`}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Buka skema ini →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 md:grid-cols-10">
                  {schemaQuestions.map((q) => {
                    const prog = progressMap.get(q.id);
                    const isSolved = prog?.status === "solved";
                    const isAttempted = prog?.status === "attempted";

                    return (
                      <Link
                        key={q.code}
                        href={`/soal/${q.code}`}
                        className={`flex flex-col items-center justify-center gap-1 rounded-md border p-3 text-center transition-colors ${
                          isSolved
                            ? "border-success/30 bg-success/10 text-success"
                            : isAttempted
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold">{q.code}</span>
                        {isSolved ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : isAttempted ? (
                          <Clock className="h-3.5 w-3.5 text-warning" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-border" />
                        )}
                        <span className="text-[10px] opacity-70">Lvl {q.level}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
