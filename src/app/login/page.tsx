"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputCls =
  "h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
              Masuk ke JoinLab
            </h1>
            <p className="text-sm text-muted-foreground">
              Lanjutkan latihan SQL JOIN kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="space-y-3 border-t pt-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Atau masuk cepat untuk demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => submitLogin("mahasiswa@joinlab.test", "password123")}
                disabled={loading}
              >
                <GraduationCap className="h-4 w-4" />
                Mahasiswa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => submitLogin("dosen@joinlab.test", "password123")}
                disabled={loading}
              >
                <ShieldCheck className="h-4 w-4 text-accent" />
                Dosen
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
