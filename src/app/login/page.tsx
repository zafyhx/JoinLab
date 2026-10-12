"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitLogin(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk.");
      } else {
        router.push(data.redirect || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitLogin(email, password);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            JL
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">
            Join<span className="text-blue-600">Lab</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-2">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Masuk ke JoinLab</h1>
            <p className="text-sm text-slate-500">
              Lanjutkan latihan SQL JOIN kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.ac.id"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? "Memproses..." : "Masuk"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Atau masuk cepat untuk demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => submitLogin("mahasiswa@joinlab.test", "password123")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-60 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Mahasiswa</span>
              </button>
              <button
                type="button"
                onClick={() => submitLogin("dosen@joinlab.test", "password123")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-60 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Dosen</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
