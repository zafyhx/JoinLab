import Link from "next/link";
import {
  Database,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JL
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              Join<span className="text-blue-600">Lab</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dosen"
              className="text-xs font-semibold px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Panel Dosen
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <span>Masuk Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-6 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Tugas Mata Kuliah Pengembangan Software Edukasi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Kuasai <span className="text-blue-600">SQL JOIN</span> dengan Analisis Logika Instan
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Platform interaktif untuk mahasiswa praktikum basis data relasional. Mendiagnosis bukan sekadar benar/salah, melainkan akar penyebab kesalahan penggabungan tabel secara rule-based.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Mulai Latihan Mahasiswa</span>
            </Link>

            <Link
              href="/dosen"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Lihat Analitik Dosen</span>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-12 bg-white border-y border-slate-200 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Dirancang untuk Mengatasi Kesulitan Nyata
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">
                Berdasarkan temuan riset edukasi SQL: logical errors (cartesian product, wrong keys) lebih sering muncul dan sulit dideteksi mahasiswa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  20 Rule-Based Detectors
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mendeteksi cartesian product (E02), syarat hilang (E01), kunci salah (E03), penanganan NULL (E13), hingga fan-out tanpa menggunakan AI.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  3 Skema Database Nyata
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Latihan di skema Akademik, Toko Online Retail, dan Sirkulasi Perpustakaan yang dilengkapi visualisasi Entity Relationship Diagram (ERD) interaktif.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  30 Soal Bertingkat & Varian
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tersedia 3 level kesulitan dengan fitur &quot;Coba Soal Setara&quot; agar mahasiswa dapat mengulang konsep yang belum dikuasai pada entitas berbeda.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        JoinLab • Mata Kuliah Pengembangan Software Edukasi 2026 • Universitas Sebelas Maret
      </footer>
    </div>
  );
}
