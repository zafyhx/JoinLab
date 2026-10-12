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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Pencapaian Pembelajaran</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
            Ringkasan Progres Belajar
          </h1>
          <p className="text-sm text-slate-600">
            Pantau sejauh mana penguasaan materi SQL JOIN kamu di setiap tingkat kesulitan dan domain skema.
          </p>
        </div>

        {/* Global Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Total Kelulusan Soal
            </h3>
            <p className="text-xs text-slate-500">
              Menyelesaikan {totalSolved} dari total {allQuestions.length} latihan bank soal.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-600">
                {overallPercent}%
              </span>
            </div>
            <div className="w-40 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Schemas Detail */}
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
              <div
                key={schema.slug}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {schema.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {schemaSolved} dari {schemaQuestions.length} soal terselesaikan ({schemaPct}%)
                    </p>
                  </div>
                  <Link
                    href={`/skema/${schema.slug}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Buka skema ini →
                  </Link>
                </div>

                {/* Question badges matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
                  {schemaQuestions.map((q) => {
                    const prog = progressMap.get(q.id);
                    const isSolved = prog?.status === "solved";
                    const isAttempted = prog?.status === "attempted";

                    return (
                      <Link
                        key={q.code}
                        href={`/soal/${q.code}`}
                        className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSolved
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : isAttempted
                            ? "bg-amber-50 border-amber-300 text-amber-800"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold">{q.code}</span>
                        {isSolved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isAttempted ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className="text-[10px] text-slate-400">Lvl {q.level}</span>
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
