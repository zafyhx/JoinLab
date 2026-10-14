import Link from "next/link";
import { ArrowRight, ShieldCheck, GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="text-2xl font-semibold leading-none text-accent"
            >
              ⋈
            </span>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              JoinLab
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Mulai Latihan
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — asymmetric, proof-led */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <span className="page-eyebrow">Platform praktikum basis data relasional</span>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
                Pahami <span className="text-accent">JOIN</span> lewat diagnosis
                logika, bukan sekadar benar atau salah.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                JoinLab melatih mahasiswa menulis query SQL JOIN pada skema
                database nyata, lalu mendiagnosis akar penyebab kesalahan
                penggabungan tabel secara rule based tanpa menebak.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  <GraduationCap className="h-4 w-4" />
                  Mulai Latihan Mahasiswa
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dosen"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Lihat Analitik Dosen
                </Link>
              </div>
            </div>

            {/* Proof object — a real JOIN, not a stock illustration */}
            <div className="relative">
              <div className="rounded-lg border border-ink-border bg-ink p-5 font-mono text-sm shadow-lg">
                <div className="mb-4 flex items-center gap-2 text-xs text-background/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
                  <span className="ml-2 font-sans">query.sql</span>
                </div>
                <pre className="leading-relaxed text-background/90">
                  <code>
                    <span className="text-background/55">SELECT</span> m.nama,
                    j.nama_jurusan{"\n"}
                    <span className="text-background/55">FROM</span> mahasiswa m{"\n"}
                    <span className="text-[oklch(0.75_0.15_78)]">JOIN</span> jurusan j{"\n"}
                    {"  "}
                    <span className="text-background/55">ON</span> m.jurusan_id = j.id;
                  </code>
                </pre>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm">
                <span className="font-mono text-foreground">mahasiswa</span>
                <span className="text-2xl text-accent">⋈</span>
                <span className="font-mono text-foreground">jurusan</span>
                <span className="text-xs text-muted-foreground">→ 24 baris</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — a numbered path, not a tile grid */}
        <section className="border-y bg-card">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Tiga langkah sampai paham akarnya
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Tulis query",
                  body: "Mulai dari templat SELECT, lengkapi JOIN dan kondisi ON pada editor dengan sorotan sintaks.",
                },
                {
                  n: "02",
                  title: "Jalankan di sandbox",
                  body: "Query dieksekusi pada koneksi read-only yang terisolasi, bukan di database aplikasi.",
                },
                {
                  n: "03",
                  title: "Baca diagnosis logika",
                  body: "Dapatkan feedback akar penyebab dari 20 detector: cartesian product, kunci salah, hingga NULL.",
                },
              ].map((step) => (
                <div key={step.n} className="bg-card p-6">
                  <span className="text-3xl font-semibold text-accent">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get — a single panel with dividers */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Dibangun untuk kesulitan nyata, bukan sekadar kuis.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Logical error seperti cartesian product dan pemilihan kunci yang
                salah lebih sering muncul dan lebih sulit dikenali mahasiswa.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="divide-y rounded-lg border bg-card">
                {[
                  {
                    k: "20 detector",
                    v: "Aturan E01–E20 mendeteksi syarat hilang, cartesian product, kunci salah, hingga fan-out tanpa AI.",
                  },
                  {
                    k: "3 skema nyata",
                    v: "Akademik, Toko Retail, dan Perpustakaan dengan visualisasi ERD interaktif.",
                  },
                  {
                    k: "30 soal bertingkat",
                    v: "Tiga level kesulitan dengan fitur &quot;Soal Setara&quot; untuk mengulang konsep yang belum dikuasai.",
                  },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-4"
                  >
                    <span className="text-sm font-semibold text-accent sm:col-span-1">
                      {row.k}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-3">
                      {row.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-8">
          <span className="flex items-center gap-2">
            <span aria-hidden className="text-base text-accent">
              ⋈
            </span>
            <span className="text-sm font-semibold text-foreground">
              JoinLab
            </span>
          </span>
          <span>
            Mata Kuliah Pengembangan Software Edukasi 2026 · Universitas Sebelas
            Maret
          </span>
        </div>
      </footer>
    </div>
  );
}
