import { db } from "@/lib/db";
import { attempts, questions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/shared/Navbar";
import { getEffectiveStudent } from "@/lib/auth/session";
import { History, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="page-container">
        <div className="mb-6">
          <span className="page-eyebrow flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat latihan
          </span>
          <h1 className="page-title mt-2">Riwayat percobaan query</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Daftar seluruh submission query yang pernah kamu jalankan beserta
            status evaluasinya.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          {attemptList.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <History className="mx-auto mb-3 h-10 w-10 stroke-border" />
              <p className="text-sm">Belum ada riwayat percobaan query.</p>
              <Link
                href="/skema/akademik"
                className="mt-4 inline-block text-xs font-semibold text-accent hover:underline"
              >
                Mulai latihan sekarang →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-3.5 font-semibold">Soal</th>
                    <th className="p-3.5 font-semibold">Query SQL</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Baris (hasil/kunci)</th>
                    <th className="p-3.5 font-semibold">Kode error</th>
                    <th className="p-3.5 font-semibold">Petunjuk</th>
                    <th className="p-3.5 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attemptList.map((att) => (
                    <tr key={att.id} className="transition-colors hover:bg-muted/40">
                      <td className="p-3.5">
                        <Link
                          href={`/soal/${att.questionCode}`}
                          className="block font-mono font-bold text-accent hover:underline"
                        >
                          {att.questionCode}
                        </Link>
                        <span className="block max-w-xs truncate text-[11px] text-muted-foreground">
                          {att.questionTitle}
                        </span>
                      </td>
                      <td className="max-w-sm p-3.5">
                        <pre className="truncate rounded border bg-muted p-1.5 font-mono text-[11px] text-foreground">
                          {att.submittedSql}
                        </pre>
                      </td>
                      <td className="p-3.5">
                        {att.status === "correct" ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3" />
                            Benar
                          </Badge>
                        ) : att.status === "incorrect" ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3" />
                            Belum tepat
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertTriangle className="h-3 w-3" />
                            {att.status}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {att.actualRowCount ?? "-"} / {att.expectedRowCount ?? "-"}
                      </td>
                      <td className="p-3.5">
                        {(att.errorCodes || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {(att.errorCodes as string[]).map((c) => (
                              <span
                                key={c}
                                className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-muted-foreground">
                        {att.hintsUsed > 0 ? `Lvl ${att.hintsUsed}` : "-"}
                      </td>
                      <td className="whitespace-nowrap p-3.5 text-muted-foreground">
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
