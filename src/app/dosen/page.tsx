import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import {
  BarChart3,
  Download,
  AlertTriangle,
  Users,
  FileQuestion,
} from "lucide-react";
import { db } from "@/lib/db";
import { attempts, attemptErrors, questions, users } from "@/lib/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "instructor") {
    redirect("/login");
  }

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

  const errorDistribution = await db
    .select({
      code: attemptErrors.errorCode,
      category: attemptErrors.category,
      count: sql<number>`count(*)`,
    })
    .from(attemptErrors)
    .groupBy(attemptErrors.errorCode, attemptErrors.category)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const hardestQuestions = await db
    .select({
      code: questions.code,
      title: questions.title,
      totalAttempts: sql<number>`count(*)`,
      failedCount: sql<number>`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .groupBy(questions.code, questions.title)
    .orderBy(desc(sql`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`))
    .limit(5);

  const strugglingStudents = await db
    .select({
      name: users.name,
      email: users.email,
      studentNumber: users.studentNumber,
      totalAttempts: sql<number>`count(*)`,
      failedCount: sql<number>`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`,
    })
    .from(attempts)
    .innerJoin(users, eq(attempts.userId, users.id))
    .where(eq(users.role, "student"))
    .groupBy(users.name, users.email, users.studentNumber)
    .orderBy(desc(sql`sum(case when ${attempts.status} != 'correct' then 1 else 0 end)`))
    .limit(5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="page-container space-y-9">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="page-eyebrow flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Panel dosen & asisten praktikum
            </span>
            <h1 className="page-title mt-2">Analitik pola kesalahan SQL JOIN</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Evaluasi pola miskonsepsi sintaks vs konsep relasi mahasiswa
              berdasarkan data 20 detector rule-based.
            </p>
          </div>

          <a
            href="/api/dosen/ekspor/percobaan"
            download
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          >
            <Download className="h-4 w-4 text-accent" />
            Ekspor rekap (CSV)
          </a>
        </div>

        {/* Metrics — one panel, hairline dividers */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Total submission</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {totalAttempts}
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Rasio keberhasilan</p>
            <p className="mt-1 text-3xl font-semibold text-success">
              {successRate}%
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Detector terpicu</p>
            <p className="mt-1 text-3xl font-semibold text-accent">
              {errorDistribution.length}
            </p>
          </div>
        </div>

        {/* Two-column analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Error distribution */}
          <Card className="space-y-4 p-6 lg:col-span-7">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Distribusi kode kesalahan terbanyak
            </h2>

            {errorDistribution.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Belum ada data kesalahan yang tercatat.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {errorDistribution.map((item) => {
                  const maxCount = Math.max(...errorDistribution.map((e) => Number(e.count)), 1);
                  const pct = Math.round((Number(item.count) / maxCount) * 100);

                  return (
                    <div key={item.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {item.code}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ({item.category.replace("_", " ")})
                          </span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {item.count} kali
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-accent transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Hardest questions */}
          <Card className="space-y-4 p-6 lg:col-span-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <FileQuestion className="h-4 w-4 text-destructive" />
              Soal dengan kesalahan tertinggi
            </h2>

            {hardestQuestions.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Belum ada data percobaan soal.
              </p>
            ) : (
              <div className="divide-y">
                {hardestQuestions.map((q) => (
                  <div key={q.code} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-accent">{q.code}</span>
                      <h4 className="max-w-[200px] truncate text-xs font-medium text-foreground">
                        {q.title}
                      </h4>
                    </div>
                    <span className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                      {q.failedCount} gagal / {q.totalAttempts}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Struggling students */}
        <Card className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Users className="h-4 w-4 text-accent" />
            Mahasiswa yang memerlukan perhatian / asistensi
          </h2>

          {strugglingStudents.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Belum ada data mahasiswa yang terdeteksi kesulitan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-3 font-semibold">Nama mahasiswa</th>
                    <th className="p-3 font-semibold">NIM</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Total percobaan</th>
                    <th className="p-3 font-semibold">Percobaan gagal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {strugglingStudents.map((st) => (
                    <tr key={st.email} className="transition-colors hover:bg-muted/40">
                      <td className="p-3 font-semibold text-foreground">{st.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {st.studentNumber || "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">{st.email}</td>
                      <td className="p-3 text-foreground">{st.totalAttempts}</td>
                      <td className="p-3 font-bold text-destructive">{st.failedCount} kali</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
