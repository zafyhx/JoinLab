import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionUser } from "@/lib/auth/session";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid").max(150),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(72),
  studentNumber: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const { name, password, studentNumber } = parsed.data;
    const normalizedEmail = parsed.data.email.toLowerCase().trim();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [inserted] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
        studentNumber: studentNumber?.trim() || null,
      })
      .returning({ id: users.id });
    const insertedId = inserted.id;

    await setSessionUser({
      id: insertedId,
      name: name.trim(),
      email: normalizedEmail,
      role: "student",
      studentNumber: studentNumber?.trim() || null,
    });

    return NextResponse.json(
      {
        user: {
          id: insertedId,
          name: name.trim(),
          email: normalizedEmail,
          role: "student",
        },
        redirect: "/dashboard",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar. Coba lagi." },
      { status: 500 }
    );
  }
}
