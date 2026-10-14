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
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SchemaQuestionsPage({ params }: PageProps) {
  const { slug } = await params;

  const allSchemas = await db
    .select()
    .from(schemaDefinitions)
    .where(eq(schemaDefinitions.isActive, true))
    .orderBy(asc(schemaDefinitions.sortOrder));

  const currentSchema = allSchemas.find((s) => s.slug === slug);
  if (!currentSchema) {
    notFound();
  }

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
  const levelLockingEnabled = process.env.JOINLAB_LEVEL_LOCKING === "true";
  const lockMinPercent = parseInt(
    process.env.JOINLAB_LEVEL_LOCK_MIN_PERCENT ?? "60",
    10
  );

  const lockedLevels = new Set<number>();
  if (levelLockingEnabled) {
    let prevPercent = 100;
    for (let lv = 1; lv <= 3; lv++) {
      if (lv > 1 && prevPercent < lockMinPercent) {
        lockedLevels.add(lv);
      }
      const qs = questionList.filter((q) => q.level === lv);
      const solved = qs.filter((q) => progressMap.get(q.id) === "solved").length;
      prevPercent = qs.length === 0 ? 100 : Math.round((solved / qs.length) * 100);
    }
  }

  const levels = [
    { level: 1, title: "Level 1: Dasar (INNER JOIN 2 tabel)", desc: "Pemahaman kunci penghubung PK-FK dan penggabungan dasar." },
    { level: 2, title: "Level 2: Menengah (LEFT JOIN & 3 tabel)", desc: "Menangani data tanpa pasangan (NULL) dan relasi bertingkat." },
    { level: 3, title: "Level 3: Lanjut (Agregasi, GROUP BY, filter)", desc: "Menggabungkan JOIN dengan fungsi agregat (COUNT, SUM, AVG) dan urutan." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="page-container">
        {/* Schema header */}
        <div className="mb-8">
          <span className="page-eyebrow flex items-center gap-2">
            <Database className="h-4 w-4" />
            Skema database latihan
          </span>
          <h1 className="page-title mt-2">{currentSchema.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {currentSchema.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {allSchemas.map((s) => (
              <Link
                key={s.slug}
                href={`/skema/${s.slug}`}
                className={cn(
                  "rounded-md px-4 py-2 text-xs font-semibold transition-colors",
                  s.slug === slug
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Question sections by level */}
        <div className="space-y-9">
          {levels.map((lvl) => {
            const levelQuestions = questionList.filter((q) => q.level === lvl.level);
            if (levelQuestions.length === 0) return null;
            const isLevelLocked = lockedLevels.has(lvl.level);

            return (
              <div key={lvl.level} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <Layers className="h-4 w-4 text-accent" />
                      {lvl.title}
                      {isLevelLocked && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3" />
                          Terkunci
                        </Badge>
                      )}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{lvl.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {levelQuestions.length} soal
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {levelQuestions.map((q) => {
                    const status = progressMap.get(q.id) || "not_started";
                    const isSolved = status === "solved";
                    const isAttempted = status === "attempted";
                    const isLocked = isLevelLocked;

                    const cardBody = (
                      <>
                        <div>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="rounded border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground transition-colors group-hover:text-accent">
                              {q.code}
                            </span>

                            {isLocked ? (
                              <Badge variant="outline">
                                <Lock className="h-3 w-3" />
                                Terkunci
                              </Badge>
                            ) : isSolved ? (
                              <Badge variant="success">
                                <CheckCircle2 className="h-3 w-3" />
                                Selesai
                              </Badge>
                            ) : isAttempted ? (
                              <Badge variant="warning">
                                <Clock className="h-3 w-3" />
                                Dicoba
                              </Badge>
                            ) : (
                              <span className="text-[11px] font-medium text-muted-foreground">
                                Belum dikerjakan
                              </span>
                            )}
                          </div>

                          <h3 className="mb-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                            {q.title}
                          </h3>

                          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {q.prompt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                          <div className="flex flex-wrap gap-1">
                            {(q.conceptTags as string[]).slice(0, 2).map((c) => (
                              <span
                                key={c}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                              >
                                {c.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                          {isLocked ? (
                            <span className="flex items-center gap-1 font-medium text-muted-foreground">
                              Butuh {lockMinPercent}% level sebelumnya
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-accent transition-transform group-hover:translate-x-1">
                              Buka soal <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </>
                    );

                    if (isLocked) {
                      return (
                        <div
                          key={q.code}
                          className="flex select-none flex-col justify-between rounded-lg border bg-card p-5 opacity-70"
                        >
                          {cardBody}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={q.code}
                        href={`/soal/${q.code}`}
                        className="group flex flex-col justify-between rounded-lg border bg-card p-5 transition-colors hover:border-accent/50"
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
