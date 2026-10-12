import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF protection for API routes (Next.js 16 "proxy" convention).
 *
 * Browsers always send an `Origin` header on cross-site POST/PATCH/DELETE
 * requests. If Origin is present and does not match the request host, the
 * request is rejected. Combined with the SameSite=Lax session cookie, this
 * blocks forged cross-site mutations. Non-browser clients (curl/tests) do
 * not send Origin and are unaffected.
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default function proxy(req: NextRequest) {
  if (MUTATING_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      const host = req.headers.get("host");
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = "";
      }
      if (!originHost || originHost !== host) {
        return NextResponse.json(
          { error: "Permintaan lintas origin tidak diizinkan." },
          { status: 403 }
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
