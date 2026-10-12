import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attempts, questions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "instructor") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const records = await db
      .select({
        id: attempts.id,
        userName: users.name,
        userEmail: users.email,
        studentNumber: users.studentNumber,
        questionCode: questions.code,
        attemptNumber: attempts.attemptNumber,
        status: attempts.status,
        executionMs: attempts.executionMs,
        errorCodes: attempts.errorCodes,
        hintsUsed: attempts.hintsUsed,
        createdAt: attempts.createdAt,
      })
      .from(attempts)
      .innerJoin(users, eq(attempts.userId, users.id))
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .orderBy(desc(attempts.createdAt));

    // Build CSV
    const headers = [
      "ID",
      "Nama Mahasiswa",
      "Email",
      "NIM",
      "Kode Soal",
      "Percobaan Ke",
      "Status",
      "Eksekusi (ms)",
      "Kode Error",
      "Petunjuk Digunakan",
      "Waktu",
    ];

    const rows = records.map((r: any) => [
      r.id,
      `"${(r.userName || "").replace(/"/g, '""')}"`,
      r.userEmail,
      r.studentNumber || "-",
      r.questionCode,
      r.attemptNumber,
      r.status,
      r.executionMs ?? 0,
      `"${((r.errorCodes as string[]) || []).join(", ")}"`,
      r.hintsUsed,
      r.createdAt.toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rekap_percobaan_joinlab.csv"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengekspor data" },
      { status: 500 }
    );
  }
}
