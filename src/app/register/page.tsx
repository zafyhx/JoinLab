"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          studentNumber: studentNumber || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar.");
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
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Buat Akun Mahasiswa</h1>
            <p className="text-sm text-slate-500">
              Daftar untuk mulai berlatih query SQL JOIN.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              <label htmlFor="studentNumber" className="text-xs font-semibold text-slate-700">
                NIM <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                id="studentNumber"
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="K3523xxx"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{loading ? "Memproses..." : "Daftar"}</span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
