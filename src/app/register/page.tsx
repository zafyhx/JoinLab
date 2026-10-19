"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputCls =
  "h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/70 bg-background/75 px-5 py-4 backdrop-blur-xl sm:px-8">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold leading-none text-primary-foreground shadow-sm transition-transform group-hover:rotate-6">
            ⋈
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            JoinLab
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/80 bg-card/85 p-6 shadow-lg backdrop-blur-xl sm:p-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Buat akun mahasiswa
            </h1>
            <p className="text-sm text-muted-foreground">
              Daftar untuk mulai berlatih query SQL JOIN.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground">
                Nama lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.ac.id"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="studentNumber" className="text-xs font-semibold text-foreground">
                NIM <span className="font-normal text-muted-foreground">(opsional)</span>
              </label>
              <input
                id="studentNumber"
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="K3523xxx"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className={inputCls}
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
