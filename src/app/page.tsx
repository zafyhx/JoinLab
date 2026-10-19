import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthControls } from "@/components/shared/AuthControls";
import { HeroInteractive } from "@/components/home/HeroInteractive";

export default async function LandingPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 text-white shadow-md backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold leading-none text-primary-foreground shadow-sm transition-transform duration-200 group-hover:rotate-6">
              ⋈
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">
              JoinLab
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <AuthControls user={user} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — asymmetric, proof-led */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
          <div aria-hidden className="hero-pulse absolute left-[8%] top-12 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div aria-hidden className="hero-pulse absolute right-[6%] top-28 -z-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <HeroInteractive user={user} />
          </div>
        </section>

        {/* How it works — a numbered path, not a tile grid */}
        <section className="mt-6 border-y border-white/70 bg-card/55 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
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
                <div key={step.n} className="bg-card/80 p-6 backdrop-blur-sm">
                  <span className="text-3xl font-bold text-accent">
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
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
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
              <div className="divide-y overflow-hidden rounded-xl border border-white/80 bg-card/85 shadow-sm backdrop-blur-sm">
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
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-8">
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
