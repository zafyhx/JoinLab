"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";

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
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Masuk</span>
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Daftar</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-xs font-bold text-slate-800">{user.name}</span>
        <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Keluar</span>
      </button>
    </div>
  );
}
