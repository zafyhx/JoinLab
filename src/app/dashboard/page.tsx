import Link from "next/link";
import { db } from "@/lib/db";
import { schemaDefinitions, questions, userProgress, attempts } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import {
  Database,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const student = await getEffectiveStudent();

  // 1. Fetch schemas
  const allSchemas = await db
    .select()
    .from(schemaDefinitions)
    .where(eq(schemaDefinitions.isActive, true))
    .orderBy(asc(schemaDefinitions.sortOrder));

  // 2. Fetch all questions
  const allQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.isPublished, true));

  // 3. Fetch student's progress
  const progressList = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, student.id));

  const solvedCount = progressList.filter((p: any) => p.status === "solved").length;
  const firstAttemptSolved = progressList.filter((p: any) => p.firstAttemptCorrect).length;

  // 4. Fetch recent attempts
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Selamat Datang Kembali
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">
              Halo, {student.name}!
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Tingkatkan pemahaman konsep relasi database dan query SQL JOIN kamu melalui studi kasus skema interaktif dengan feedback logika instan.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Soal Terselesaikan</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {solvedCount} <span className="text-sm font-normal text-slate-400">/ {allQuestions.length}</span>
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Benar Percobaan Pertama</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {firstAttemptSolved} Soal
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Skema Latihan</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {allSchemas.length} Domain
              </h3>
            </div>
          </div>
        </div>

        {/* Schema Tracks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Pilihan Skema Database</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div
                  key={s.slug}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 mb-3 inline-block">
                      {s.dbName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {s.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>Progres</span>
                        <span>{schemaSolved} / {schemaQuestions.length} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/skema/${s.slug}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                    >
                      <span>Mulai Latihan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Attempts Table */}
        {recentAttempts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Percobaan Terakhir</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Kode Soal</th>
                    <th className="p-3 font-semibold">Judul Soal</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Durasi</th>
                    <th className="p-3 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttempts.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {att.questionCode}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {att.questionTitle}
                      </td>
                      <td className="p-3">
                        {att.status === "correct" ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Benar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Belum Tepat
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">
                        {att.executionMs} ms
                      </td>
                      <td className="p-3 text-slate-400">
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
        )}
      </main>
    </div>
  );
}
