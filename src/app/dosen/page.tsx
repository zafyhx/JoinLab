import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import {
  BarChart3,
  Download,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Database,
} from "lucide-react";
import { db } from "@/lib/db";
import { attempts, attemptErrors, questions, users } from "@/lib/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  // FR-02: hanya instructor yang boleh membuka panel dosen
  const user = await getCurrentUser();
  if (!user || user.role !== "instructor") {
    redirect("/login");
  }

  // Fetch real analytics data
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

  // Error patterns breakdown
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

  // Hardest questions
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

  // Students needing attention
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar role="instructor" />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Panel Dosen & Asisten Praktikum</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
              Analitik Pola Kesalahan SQL JOIN
            </h1>
            <p className="text-sm text-slate-600">
              Evaluasi pola miskonsepsi sintaks vs konsep relasi mahasiswa berdasarkan data 20 detector rule-based.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/dosen/ekspor/percobaan"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Ekspor Rekap (CSV)</span>
            </a>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Submission</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {totalAttempts} Percobaan
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Rasio Keberhasilan</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {successRate}% Benar
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Detector Terpicu</span>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
              {errorDistribution.length} Jenis Pola
            </h3>
          </div>
        </div>

        {/* 2 Column Analytics: Error Distribution vs Hardest Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Error Distribution Bar Chart Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Distribusi Kode Kesalahan Terbanyak</span>
              </h2>
            </div>

            {errorDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
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
                          <span className="font-mono font-bold text-slate-800">
                            {item.code}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            ({item.category.replace("_", " ")})
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {item.count} kali
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hardest Questions Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-red-500" />
              <span>Soal dengan Kesalahan Tertinggi</span>
            </h2>

            {hardestQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Belum ada data percobaan soal.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {hardestQuestions.map((q) => (
                  <div key={q.code} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {q.code}
                      </span>
                      <h4 className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                        {q.title}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {q.failedCount} gagal / {q.totalAttempts}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Struggling Students Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Mahasiswa yang Memerlukan Perhatian / Asistensi</span>
          </h2>

          {strugglingStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada data mahasiswa yang terdeteksi kesulitan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Nama Mahasiswa</th>
                    <th className="p-3 font-semibold">NIM</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Total Percobaan</th>
                    <th className="p-3 font-semibold">Percobaan Gagal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {strugglingStudents.map((st) => (
                    <tr key={st.email} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{st.name}</td>
                      <td className="p-3 font-mono text-slate-600">{st.studentNumber || "-"}</td>
                      <td className="p-3 text-slate-500">{st.email}</td>
                      <td className="p-3 text-slate-700">{st.totalAttempts}</td>
                      <td className="p-3 font-bold text-red-600">
                        {st.failedCount} kali
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
