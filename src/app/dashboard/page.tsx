import Link from "next/link";
import { db } from "@/lib/db";
import { schemaDefinitions, questions, userProgress, attempts } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import { ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const student = await getEffectiveStudent();

  const allSchemas = await db
    .select()
    .from(schemaDefinitions)
    .where(eq(schemaDefinitions.isActive, true))
    .orderBy(asc(schemaDefinitions.sortOrder));

  const allQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.isPublished, true));

  const progressList = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, student.id));

  const solvedCount = progressList.filter((p: any) => p.status === "solved").length;
  const firstAttemptSolved = progressList.filter((p: any) => p.firstAttemptCorrect).length;

  const recentAttempts = await db
    .select({
      id: attempts.id,
      questionCode: questions.code,
      questionTitle: questions.title,
      status: attempts.status,
      executionMs: attempts.executionMs,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.userId, student.id))
    .orderBy(desc(attempts.createdAt))
    .limit(5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="page-container space-y-9">
        {/* Header */}
        <div>
          <span className="page-eyebrow">Dashboard mahasiswa</span>
          <h1 className="page-title mt-2">Halo, {student.name}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Tingkatkan pemahaman konsep relasi database dan query SQL JOIN lewat
            studi kasus skema interaktif dengan feedback logika instan.
          </p>
        </div>

        {/* Stats — one panel, hairline dividers */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Soal terselesaikan
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {solvedCount}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {allQuestions.length}
              </span>
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Benar pada percobaan pertama
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {firstAttemptSolved}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                soal
              </span>
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Domain skema latihan
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {allSchemas.length}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                skema
              </span>
            </p>
          </div>
        </div>

        {/* Schema tracks */}
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Pilihan skema database
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {allSchemas.map((s: any) => {
              const schemaQuestions = allQuestions.filter(
                (q: any) => q.schemaDefinitionId === s.id
              );
              const schemaQuestionIds = new Set(schemaQuestions.map((q: any) => q.id));
              const schemaSolved = progressList.filter(
                (p: any) => schemaQuestionIds.has(p.questionId) && p.status === "solved"
              ).length;
              const percent =
                schemaQuestions.length > 0
                  ? Math.round((schemaSolved / schemaQuestions.length) * 100)
                  : 0;

              return (
                <Card key={s.slug} className="flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-accent">
                        {s.dbName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {schemaSolved}/{schemaQuestions.length} soal
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-foreground">
                      {s.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progres</span>
                      <span className="font-semibold text-foreground">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <Link
                      href={`/skema/${s.slug}`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "mt-5 w-full"
                      )}
                    >
                      Mulai Latihan
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent attempts */}
        {recentAttempts.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Percobaan terakhir
              </h2>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-3 font-semibold">Kode</th>
                      <th className="p-3 font-semibold">Judul soal</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Durasi</th>
                      <th className="p-3 font-semibold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentAttempts.map((att: any) => (
                      <tr key={att.id} className="transition-colors hover:bg-muted/40">
                        <td className="p-3 font-mono font-bold text-accent">
                          {att.questionCode}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          {att.questionTitle}
                        </td>
                        <td className="p-3">
                          {att.status === "correct" ? (
                            <Badge variant="success">Benar</Badge>
                          ) : (
                            <Badge variant="destructive">Belum tepat</Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">{att.executionMs} ms</td>
                        <td className="p-3 text-muted-foreground">
                          {att.createdAt.toLocaleDateString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
