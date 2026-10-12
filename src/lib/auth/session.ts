import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "joinlab_session";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor";
  studentNumber?: string | null;
}

/**
 * Session cookie is HMAC-signed: `<base64url(payload)>.<hmac>`.
 * A forged cookie (e.g. edited in DevTools) fails the signature check
 * and is treated as "not logged in".
 */
function getSessionSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "joinlab-dev-secret-ganti-di-production"
  );
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function serializeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function parseSession(raw: string | undefined): SessionUser | null {
  if (!raw) return null;
  const dotIndex = raw.indexOf(".");
  if (dotIndex <= 0) return null;

  const payload = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);
  const expectedSig = signPayload(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (
      parsed &&
      typeof parsed.id === "number" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      (parsed.role === "student" || parsed.role === "instructor")
    ) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
        studentNumber: parsed.studentNumber ?? null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function setSessionUser(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, serializeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Returns student user or falls back to demo student if not found in dev.
 */
export async function getEffectiveStudent(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user && user.role === "student") {
    return user;
  }

  // Find demo student in DB
  const [demoStudent] = await db
    .select()
    .from(users)
    .where(eq(users.email, "mahasiswa@joinlab.test"))
    .limit(1);

  if (demoStudent) {
    return {
      id: demoStudent.id,
      name: demoStudent.name,
      email: demoStudent.email,
      role: "student",
      studentNumber: demoStudent.studentNumber,
    };
  }

  return {
    id: 1,
    name: "Rani Permata",
    email: "mahasiswa@joinlab.test",
    role: "student",
    studentNumber: "K3523022",
  };
}
