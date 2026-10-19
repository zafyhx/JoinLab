"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export function AuthControls({ user }: { user: SessionUser | null }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  if (!user) {
    return (
      <div className="inline-flex items-center gap-[1px] font-sans">
        {/* Tombol Masuk (Kiri, ujung bulat kiri, potongan miring kanan lengkap dengan outline putih) */}
        <Link
          href="/login"
          className="group relative inline-flex h-9 items-center justify-center rounded-l-full bg-white p-[2px] shadow-sm transition-transform duration-200 active:scale-[0.98] [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)]"
        >
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-l-full bg-primary pl-4 pr-3.5 text-xs sm:text-sm font-semibold text-primary-foreground [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)] transition-colors group-hover:bg-primary/90">
            {/* Glass sheen on hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full pointer-events-none"
            />
            <span className="relative z-10">Masuk</span>
          </span>
        </Link>

        {/* Tombol Daftar (Kanan, potongan miring kiri, ujung bulat kanan lengkap dengan outline putih) */}
        <Link
          href="/register"
          className="group relative inline-flex h-9 items-center justify-center rounded-r-full bg-white p-[2px] shadow-sm transition-transform duration-200 active:scale-[0.98] [clip-path:polygon(10px_0,100%_0,100%_100%,0_100%)]"
        >
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-r-full bg-primary pl-3.5 pr-4 text-xs sm:text-sm font-semibold text-primary-foreground [clip-path:polygon(10px_0,100%_0,100%_100%,0_100%)] transition-colors group-hover:bg-primary/90">
            {/* Glass sheen on hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full pointer-events-none"
            />
            <span className="relative z-10">Daftar</span>
          </span>
        </Link>
      </div>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "U";
  const roleLabel = user.role === "instructor" ? "Dosen" : "Mahasiswa";

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-card/75 p-1 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2">
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-sm"
        >
          {initial}
        </span>
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="max-w-36 truncate text-xs font-semibold text-foreground">
            {user.name}
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
            {roleLabel}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Keluar"
        aria-label="Keluar"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
