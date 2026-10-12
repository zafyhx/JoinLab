import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { schemaDefinitions, questions, userProgress } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import {
  Database,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SchemaQuestionsPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch all schemas for navigation
  const allSchemas = await db
    .select()
    .from(schemaDefinitions)
    .where(eq(schemaDefinitions.isActive, true))
    .orderBy(asc(schemaDefinitions.sortOrder));

  // 2. Fetch current schema
  const currentSchema = allSchemas.find((s) => s.slug === slug);
  if (!currentSchema) {
    notFound();
  }

  // 3. Fetch questions for current schema
  const questionList = await db
    .select()
    .from(questions)
    .where(
      and(
        eq(questions.schemaDefinitionId, currentSchema.id),
        eq(questions.isPublished, true)
      )
    )
    .orderBy(asc(questions.level), asc(questions.code));

  // 4. Fetch user progress
  const student = await getEffectiveStudent();
  const progressList = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, student.id));

  const progressMap = new Map<number, string>();
  for (const p of progressList) {
    progressMap.set(p.questionId, p.status);
  }

  // FR-17: Level locking — aktif hanya jika JOINLAB_LEVEL_LOCKING=true
  // (default mati sesuai dokumen 01). Level N terkunci sampai persentase
  // soal selesai pada level N-1 mencapai JOINLAB_LEVEL_LOCK_MIN_PERCENT.
  const levelLockingEnabled = process.env.JOINLAB_LEVEL_LOCKING === "true";
  const lockMinPercent = parseInt(
    process.env.JOINLAB_LEVEL_LOCK_MIN_PERCENT ?? "60",
    10
  );

  const lockedLevels = new Set<number>();
  if (levelLockingEnabled) {
    let prevPercent = 100; // Level 1 selalu terbuka
    for (let lv = 1; lv <= 3; lv++) {
      if (lv > 1 && prevPercent < lockMinPercent) {
        lockedLevels.add(lv);
      }
      const qs = questionList.filter((q) => q.level === lv);
      const solved = qs.filter((q) => progressMap.get(q.id) === "solved").length;
      prevPercent = qs.length === 0 ? 100 : Math.round((solved / qs.length) * 100);
    }
  }

  // Group questions by Level
  const levels = [
    { level: 1, title: "Level 1: Dasar (INNER JOIN 2 Tabel)", desc: "Pemahaman kunci penghubung PK-FK dan penggabungan dasar." },
    { level: 2, title: "Level 2: Menengah (LEFT JOIN & 3 Tabel)", desc: "Menangani data tanpa pasangan (NULL) dan relasi bertingkat." },
    { level: 3, title: "Level 3: Lanjut (Agregasi, GROUP BY, Filter)", desc: "Menggabungkan JOIN dengan fungsi agregat (COUNT, SUM, AVG) dan urutan." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8">
        {/* Schema Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Skema Database Latihan</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            {currentSchema.name}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {currentSchema.description}
          </p>

          {/* Schema Switcher Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {allSchemas.map((s) => (
              <Link
                key={s.slug}
                href={`/skema/${s.slug}`}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  s.slug === slug
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Question Sections by Level */}
        <div className="space-y-8">
          {levels.map((lvl) => {
            const levelQuestions = questionList.filter((q) => q.level === lvl.level);
            if (levelQuestions.length === 0) return null;
            const isLevelLocked = lockedLevels.has(lvl.level);

            return (
              <div key={lvl.level} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>{lvl.title}</span>
                      {isLevelLocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          Terkunci
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{lvl.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {levelQuestions.length} Soal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {levelQuestions.map((q) => {
                    const status = progressMap.get(q.id) || "not_started";
                    const isSolved = status === "solved";
                    const isAttempted = status === "attempted";
                    const isLocked = isLevelLocked;

                    const cardBody = (
                      <>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                              {q.code}
                            </span>

                            {/* Status badge */}
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                <Lock className="w-3 h-3" />
                                Terkunci
                              </span>
                            ) : isSolved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Selesai
                              </span>
                            ) : isAttempted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Dicoba
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400">
                                Belum Dikerjakan
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                            {q.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {q.prompt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex flex-wrap gap-1">
                            {(q.conceptTags as string[]).slice(0, 2).map((c) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium"
                              >
                                {c.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                          {isLocked ? (
                            <span className="font-medium text-slate-400 flex items-center gap-1">
                              Butuh {lockMinPercent}% level sebelumnya
                            </span>
                          ) : (
                            <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Buka Soal <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </>
                    );

                    if (isLocked) {
                      return (
                        <div
                          key={q.code}
                          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between opacity-70 select-none"
                        >
                          {cardBody}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={q.code}
                        href={`/soal/${q.code}`}
                        className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {cardBody}
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
