import Link from "next/link";
import { Database, GraduationCap, History, BarChart3, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthControls } from "./AuthControls";

export async function Navbar({ role = "student" }: { role?: "student" | "instructor" }) {
  const user = await getCurrentUser();
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            JL
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Join<span className="text-blue-600">Lab</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          <Link
            href="/skema/akademik"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            <span>Latihan SQL</span>
          </Link>
          <Link
            href="/riwayat"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </Link>
          <Link
            href="/progres"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Progres</span>
          </Link>
        </div>

        {/* User / Instructor Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/dosen"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Panel Dosen</span>
          </Link>
          <AuthControls user={user} />
        </div>
      </div>
    </nav>
  );
}
