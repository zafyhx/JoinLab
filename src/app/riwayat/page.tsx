import { db } from "@/lib/db";
import { attempts, questions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import { History, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default async function HistoryPage() {
  const student = await getEffectiveStudent();

  const attemptList = await db
    .select({
      id: attempts.id,
      questionCode: questions.code,
      questionTitle: questions.title,
      submittedSql: attempts.submittedSql,
      status: attempts.status,
      executionMs: attempts.executionMs,
      actualRowCount: attempts.actualRowCount,
      expectedRowCount: attempts.expectedRowCount,
      errorCodes: attempts.errorCodes,
      hintsUsed: attempts.hintsUsed,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.userId, student.id))
    .orderBy(desc(attempts.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Riwayat Latihan</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
            Riwayat Percobaan Query
          </h1>
          <p className="text-sm text-slate-600">
            Daftar seluruh submission query yang pernah kamu jalankan beserta status evaluasinya.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {attemptList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-3 stroke-slate-300" />
              <p className="text-sm">Belum ada riwayat percobaan query.</p>
              <Link
                href="/skema/akademik"
                className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline"
              >
                Mulai latihan sekarang →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-semibold">Soal</th>
                    <th className="p-3.5 font-semibold">Query SQL</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Baris (Hasil/Kunci)</th>
                    <th className="p-3.5 font-semibold">Kode Error</th>
                    <th className="p-3.5 font-semibold">Petunjuk</th>
                    <th className="p-3.5 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attemptList.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5">
                        <Link
                          href={`/soal/${att.questionCode}`}
                          className="font-mono font-bold text-blue-600 hover:underline block"
                        >
                          {att.questionCode}
                        </Link>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {att.questionTitle}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <pre className="font-mono text-[11px] text-slate-700 truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                          {att.submittedSql}
                        </pre>
                      </td>
                      <td className="p-3.5">
                        {att.status === "correct" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Benar
                          </span>
                        ) : att.status === "incorrect" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            Belum Tepat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {att.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {att.actualRowCount ?? "-"} / {att.expectedRowCount ?? "-"}
                      </td>
                      <td className="p-3.5">
                        {(att.errorCodes || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {(att.errorCodes as string[]).map((c) => (
                              <span
                                key={c}
                                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium">
                        {att.hintsUsed > 0 ? `Lvl ${att.hintsUsed}` : "-"}
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {att.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
