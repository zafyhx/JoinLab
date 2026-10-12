import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionUser } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }

    await setSessionUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentNumber: user.studentNumber,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirect: user.role === "instructor" ? "/dosen" : "/dashboard",
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk. Coba lagi." },
      { status: 500 }
    );
  }
}
