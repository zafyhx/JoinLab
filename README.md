# 🧪 JoinLab — Interactive SQL JOIN Learning Platform

<div align="center">

![JoinLab Banner](https://img.shields.io/badge/JoinLab-SQL%20JOIN%20Learning%20Lab-2563eb?style=for-the-badge&logo=postgresql&logoColor=white)

**Platform Latihan Interaktif Query SQL Berfokus pada Penguasaan Relasi & JOIN Antar Tabel dengan Sistem Diagnosis Berbasis Aturan (20 Logical Detectors)**

[![Next.js](https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%20(Strict)-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45-c5f74f?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests%20Passing-6e9f18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Sandbox-Read--Only%20Isolated-success?style=flat-square&logo=shield)](https://github.com/)

[Fitur Utama](#-fitur-utama) •
[Latar Belakang](#-latar-belakang--masalah) •
[Arsitektur](#-arsitektur-sistem) •
[20 Detektor Logika](#-sistem-diagnosis-20-logical-detectors) •
[Panduan Instalasi](#-panduan-instalasi--memulai) •
[Keamanan Sandbox](#-keamanan--isolasi-sandbox) •
[Pengujian](#-pengujian-otomatis)

</div>

---

## 📖 Ringkasan Proyek

**JoinLab** adalah platform edukasi interaktif berbasis web yang dikembangkan khusus untuk mengatasi salah satu titik kesulitan paling kritis dalam mata kuliah Basis Data: **operasi SQL `JOIN` antar tabel**.

Berbeda dengan platform kompetitif konvensional yang hanya memberikan verdict biner *(Passed/Failed)* atau compiler error standar, JoinLab dilengkapi **Rule-Based Pedagogical Diagnostic Engine (E01–E20)**. Mesin diagnosis ini menganalisis pohon sintaks abstrak (AST) query mahasiswa serta membandingkan multiset data hasil eksekusi dengan kunci jawaban untuk memberikan umpan balik pedagogis yang mendalam, kontekstual, dan membimbing tanpa pernah membocorkan kunci jawaban secara langsung.

> 💡 **Prinsip Utama:** *"Problem First, Solution Later"* & *"Rule-Based Precision without Black-Box AI"*. Seluruh umpan balik dirancang deterministik, terukur, dan aman untuk menjamin pemahaman konsep relasi entitas secara fundamental.

---

## 🎯 Latar Belakang & Masalah

Berdasarkan studi pedagogis praktikum basis data:
1. **Lancar di Single-Table, Tersandung di Multi-Table:** Mahasiswa umumnya menguasai query satu tabel (`SELECT`, `WHERE`, agregasi dasar), namun kesulitan besar saat beralih ke operasi relasional antar tabel.
2. **Kegagalan Tersembunyi (Silent Failures):** Query `JOIN` sering kali berhasil dieksekusi oleh DBMS tanpa error sintaks, tetapi menghasilkan logika data yang keliru (misalnya terjadi *Cartesian Product*, salah memasangkan *Foreign Key*, duplikasi akibat *fan-out*, atau hilangnya baris data karena salah penempatan klausa filter pada `LEFT JOIN`).
3. **Umpan Balik Terlambat:** Mahasiswa biasanya baru mengetahui kesalahannya saat asistensi praktikum atau ketika nilai akhir diumumkan, sehingga tidak terjadi siklus perbaikan kognitif seketika (*instant formative feedback*).

JoinLab hadir untuk menjembatani jurang pemahaman ini melalui lingkungan latihan terisolasi, skema ERD interaktif, petunjuk bertingkat (*scaffolded hints*), dan bank soal varian setara.

---

## ✨ Fitur Utama

### 1. 🖥️ Split-Screen Interactive Workspace
- **Monaco SQL Editor:** Editor profesional berstandar industri dengan sintaks highlighting, auto-completion, linting, dan shortcut produktivitas (`Ctrl+Enter` untuk eksekusi instan).
- **Interactive SVG ERD Viewer:** Visualisasi diagram relasi entitas langsung di samping editor untuk membantu mahasiswa menavigasi Primary Key (PK), Foreign Key (FK), dan relasi antar tabel tanpa berpindah tab.
- **Data Execution Inspector:** Tabel data interaktif hasil eksekusi mahasiswa dengan penandaan nilai `NULL`, penghitung durasi eksekusi dalam milidetik, serta indikator pemotongan baris (*row truncation*).

### 2. 🧠 Rule-Based Diagnostic Engine (20 Detectors)
- Evaluasi query berbasis AST (`node-sql-parser`) dan analisis selisih data kanonik (*multiset comparator*).
- Menghasilkan kartu temuan kesalahan terperinci: ringkasan masalah, bukti data (*evidence sample*), dan pertanyaan penuntun.
- Menerapkan mekanisme **Suppression Matrix** untuk menyaring kesalahan turunan sehingga mahasiswa fokus memperbaiki akar masalah utama terlebih dahulu.

### 3. 🪜 Scaffolded Multi-Tier Hints
- Petunjuk bertingkat 3 level:
  - **Level 1:** Pertanyaan pemandu konseptual.
  - **Level 2:** Petunjuk identifikasi tabel atau kolom kunci relasi di ERD.
  - **Level 3:** Petunjuk struktur klausa SQL yang dibutuhkan.
- **Zero Answer Leak:** Sistem secara ketat tidak pernah menampilkan `expected_sql` kepada mahasiswa dalam kondisi apa pun.

### 4. 🔀 Variant Groups & Soal Setara (FR-07)
- Soal dikelompokkan dalam kelompok varian (misalnya Varian A dan Varian B).
- Ketika mahasiswa mengalami kebuntuan atau telah menyelesaikan suatu soal, sistem menyediakan tombol **Coba Soal Setara** untuk melatih transfer pemahaman pada konteks entitas yang berbeda namun dengan pola JOIN serupa.

### 5. 📊 Dashboard Mahasiswa & Pelacakan Progres
- Ringkasan statistik pengerjaan, tingkat keberhasilan pada percobaan pertama (*first-attempt accuracy*), dan riwayat percobaan lengkap dengan kode temuan error.
- Matriks status soal per skema (Belum Dikerjakan, Sedang Dicoba, dan Berhasil Diselesaikan).

### 6. 👨‍🏫 Dosen & Asisten Laboratory Portal
- **Analitik Kelas Real-Time:** Grafik distribusi kesalahan mahasiswa berdasarkan kategori (E01–E20), identifikasi soal paling sulit, dan daftar mahasiswa yang membutuhkan asistensi segera.
- **Ekspor Data CSV:** Unduh seluruh rekap riwayat pengerjaan mahasiswa untuk keperluan penilaian praktikum dan analisis penelitian.
- **Manajemen Bank Soal (CRUD):** Antarmuka pembuatan dan kurasi soal dengan fitur preview validasi SQL sebelum dipublikasikan.

---

## 🏗️ Arsitektur Sistem

JoinLab mengusung arsitektur monorepo Fullstack TypeScript modern dengan isolasi ketat antara basis data aplikasi dan basis data sandbox latihan:

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React 19 / Next.js 15)"]
        UI["Split-Screen UI Workspace"]
        Editor["Monaco Editor (SQL)"]
        ERD["SVG ERD Viewer"]
        Panel["Feedback & Diagnostics Panel"]
    end

    subgraph Server ["Next.js App Router (Backend)"]
        API["API Route Handlers (/api/soal/...)"]
        Auth["HMAC-Signed Cookie Guard & Rate Limiter"]
        
        subgraph DomainEngine ["Domain Logic Layer"]
            Guard["SqlGuard (AST Validation & Non-SELECT Blocker)"]
            Executor["SandboxExecutor (Timeout 3s & Row Limit)"]
            Parser["QueryAnatomyParser (node-sql-parser)"]
            Comparator["ResultNormalizer & Comparator"]
            Engine["DiagnosisEngine (Detectors E01 - E20)"]
            Feedback["FeedbackBuilder (Bahasa Indonesia)"]
        end
    end

    subgraph Databases ["Database Storage Layer"]
        AppDB[("Application DB: joinlab_app\n(Drizzle ORM / Port 5432)")]
        SandboxDB[("Sandbox DB: joinlab_sandbox\n(Role: joinlab_ro / SELECT-only)")]
    end

    UI --> API
    API --> Auth
    Auth --> Guard
    Guard --> Executor
    Executor -->|SELECT Read-Only| SandboxDB
    Executor --> Comparator
    API -->|Read/Write Progress| AppDB
    Comparator --> Engine
    Parser --> Engine
    Engine --> Feedback
    Feedback --> Panel
```

### Karakteristik Desain Domain
- **Pure Domain Isolation:** Seluruh logika komparasi (`ResultComparator`), pembedahan query (`QueryAnatomyParser`), dan penjaga query (`SqlGuard`) berada di `src/lib/domain/` tanpa ketergantungan pada framework UI atau vendor DB tertentu.
- **Fail-Safe Pipeline:** Jika parser gagal mengenali dialek query atau terjadi kesalahan detector, sistem tidak akan pernah mengalami crash 500 melainkan beralih ke gracefully-handled fallback (E20).

---

## 🛡️ Keamanan & Isolasi Sandbox

Keamanan eksekusi kode SQL mahasiswa adalah prioritas absolut dalam arsitektur JoinLab:

| Lapisan Keamanan | Mekanisme Perlindungan |
|---|---|
| **Koneksi Database Terisolasi** | Query mahasiswa **hanya** dikirim ke koneksi `joinlab_ro` pada database sandbox (`joinlab_sandbox`). Role ini hanya memiliki hak akses `SELECT` pada schema latihan dan **ditolak secara absolut** untuk mengakses `joinlab_app`. |
| **SqlGuard Multi-Layer** | Memeriksa teks SQL sebelum dikirim ke database: menolak multi-statement (titik koma berganda), memblokir token berbahaya (`pg_sleep`, `dblink`, `pg_catalog`), serta melarang query non-SELECT (`DROP`, `DELETE`, `UPDATE`, `INSERT`). |
| **Batas Sumber Daya (Timeout & Limits)** | Eksekusi dibatasi timeout ketat 3.000 ms (3 detik). Tampilan di UI dibatasi 100 baris, sedangkan pembanding multiset dibatasi maksimal 5.000 baris untuk mencegah memory exhaustion. |
| **Keamanan Sesi & API** | Autentikasi menggunakan cookie terenkripsi dengan HMAC SHA-256 signature (`crypto.timingSafeEqual`). Dilengkapi proteksi verifikasi Origin CSRF dan In-Memory Rate Limiting (30 run/menit, 20 check/menit). |

---

## 🔍 Sistem Diagnosis (20 Logical Detectors)

JoinLab mengklasifikasikan kesalahan logika SQL ke dalam 5 kategori taksonomi pendidikan:

| Kode | Nama Detektor | Kategori | Deskripsi Singkat Masalah |
|:---:|---|:---:|---|
| **E01** | Syarat JOIN Belum Ada | `sintaks_join` | Penggabungan multi-tabel tanpa klausul `ON`/`USING` (memicu Cartesian product). |
| **E02** | Cartesian Product | `logika_hasil` | Jumlah baris melonjak drastis mendekati perkalian kartesian antar tabel. |
| **E03** | Kunci JOIN Salah | `konsep_relasi` | Klausul `ON` membandingkan kolom yang bukan pasangan PK–FK pada skema relasi. |
| **E04** | Tipe JOIN Keliru | `logika_hasil` | Penggunaan `INNER JOIN` padahal dibutuhkan `LEFT JOIN` (atau sebaliknya). |
| **E05** | Filter WHERE Merusak LEFT JOIN | `logika_hasil` | Klausa `WHERE` memfilter tabel kanan sehingga baris non-match tereliminasi secara tidak sengaja. |
| **E06** | Baris Duplikat | `logika_hasil` | Baris hasil valid namun mengalami duplikasi berulang yang tidak diinginkan. |
| **E07** | Baris Hilang | `logika_hasil` | Baris hasil lebih sedikit dari ekspektasi kunci jawaban. |
| **E08** | Kolom Tidak Sesuai | `logika_hasil` | Jumlah atau urutan kolom luaran tidak sesuai dengan spesifikasi soal. |
| **E09** | Kolom Ambigu | `sintaks_join` | Mengakses kolom yang namanya terdapat di lebih dari satu tabel tanpa alias tabel. |
| **E10** | Identifier Tidak Dikenal | `sintaks_umum` | Nama tabel atau kolom tidak ditemukan (dilengkapi saran ejaan Levenshtein). |
| **E11** | Kesalahan Sintaks SQL | `sintaks_umum` | Sintaks SQL tidak valid atau token klausa tidak lengkap. |
| **E12** | Kesalahan GROUP BY | `sintaks_umum` | Kolom non-agregat tidak dideklarasikan pada klausa `GROUP BY`. |
| **E13** | Penanganan NULL Agregat | `logika_hasil` | Nilai agregat menghasilkan `NULL` (membutuhkan `COALESCE`) atau `COUNT(*)` menghitung baris kosong. |
| **E14** | Tabel Prasyarat Belum Dipakai | `konsep_relasi` | Tabel esensial yang diperlukan untuk menghubungkan data belum diikutsertakan. |
| **E15** | Fan-Out Agregasi Membengkak | `logika_hasil` | Nilai `SUM` atau `COUNT` membengkak akibat join satu-ke-banyak ganda sebelum agregasi. |
| **E16** | Hasil Terlalu Besar | `batas_sistem` | Query menghasilkan volume baris ekstrem melebihi batas toleransi komparasi (5.000 baris). |
| **E17** | Waktu Eksekusi Habis | `batas_sistem` | Waktu eksekusi melampaui batas aman (3.000 ms). |
| **E18** | Tabel Berlebih | `konsep_relasi` | Mengikutsertakan tabel tambahan yang tidak relevan sehingga mengubah kardinalitas. |
| **E19** | Urutan Baris Tidak Sesuai | `logika_hasil` | Data baris lengkap namun urutan tidak sesuai ketentuan (`ORDER BY` hilang/keliru). |
| **E20** | Isi Hasil Berbeda | `logika_hasil` | Detektor fallback: baris memiliki ketidaksesuaian nilai pada sel tertentu. |

---

## 🗄️ Studi Kasus & Skema Database Sandbox

JoinLab menyediakan 3 skema basis data latihan dengan data deterministik yang dirancang sengaja memiliki kasus tepi (*edge cases*, baris tanpa pasangan, dan nilai `NULL`):

1. **`sb_akademik` (Sistem Informasi Akademik)**
   - Entitas: `jurusan`, `dosen`, `mahasiswa`, `mata_kuliah`, `krs`.
   - Kasus latihan: Dosen pembimbing, mahasiswa tanpa KRS, mata kuliah tanpa peserta, rekap SKS.
2. **`sb_toko` (E-Commerce & Retail)**
   - Entitas: `pelanggan`, `kategori`, `produk`, `pesanan`, `detail_pesanan`.
   - Kasus latihan: Pelanggan tanpa transaksi, produk belum pernah terjual, kalkulasi total belanja.
3. **`sb_perpustakaan` (Sistem Sirkulasi Perpustakaan)**
   - Entitas: `anggota`, `penulis`, `penerbit`, `buku`, `peminjaman`.
   - Kasus latihan: Buku belum pernah dipinjam, anggota bebas pinjam, durasi peminjaman dan denda.

---

## 📁 Struktur Direktori

```text
Software-E/
├── database/                    # File SQL inisialisasi & skema sandbox
│   └── sandbox/
│       ├── akademik.sql         # DDL & Data deterministik skema akademik
│       ├── toko.sql             # DDL & Data deterministik skema toko
│       ├── perpustakaan.sql     # DDL & Data deterministik skema perpustakaan
│       └── grants.sql           # Definisi hak akses role joinlab_ro
├── docs/                        # Dokumentasi komprehensif proyek (01 - 07)
│   ├── 01-PRD-analisis-kebutuhan.md
│   ├── 02-arsitektur-teknis.md
│   ├── 03-database-dan-sandbox.md
│   ├── 04-fitur-dan-user-flow.md
│   ├── 05-desain-ui.md
│   ├── 06-bank-soal.md
│   └── 07-skenario-demo.md
├── scripts/                     # CLI scripts administrasi & seeder database
│   ├── data/questionsData.ts    # Definisi 30 bank soal (Varian A & B)
│   ├── sandbox-rebuild.ts       # Rebuild database sandbox & create schemas
│   ├── sandbox-sync-metadata.ts # Sinkronisasi metadata ERD ke DB aplikasi
│   ├── questions-refresh-expected.ts # Komputasi & caching expected results
│   └── seed.ts                  # Seeder tabel aplikasi & demo accounts
├── src/
│   ├── app/                     # Next.js 15 App Router pages & API routes
│   │   ├── api/                 # Endpoint handlers (eksekusi, periksa, auth, dosen)
│   │   ├── dashboard/           # Halaman dashboard mahasiswa
│   │   ├── dosen/               # Portal analitik & kelola soal dosen
│   │   ├── progres/             # Matriks progres belajar
│   │   ├── riwayat/             # Riwayat percobaan mahasiswa
│   │   ├── skema/[slug]/        # Daftar soal per skema latihan
│   │   ├── soal/[code]/         # Workspace pengerjaan interaktif
│   │   ├── login/ & register/   # Autentikasi pengguna
│   │   └── page.tsx             # Landing page
│   ├── components/              # Komponen UI (Shadcn UI & Workspace)
│   │   ├── ui/                  # Komponen atomik Shadcn
│   │   └── workspace/           # Editor, ErdViewer, ResultTable, FeedbackPanel
│   └── lib/
│       ├── db/                  # Drizzle ORM client, schema, & sandbox pool
│       ├── domain/              # Pure domain logic (Guard, Executor, Detectors)
│       └── validation/          # Skema validasi Zod
└── tests/                       # Automated test suites (Vitest & Playwright)
    └── Unit/                    # Unit testing SqlGuard, ResultComparator, Detectors
```

---

## 🚀 Panduan Instalasi & Memulai

### Prasyarat Sistem
- **Node.js:** Versi 20.x atau lebih baru.
- **npm:** Versi 10.x atau lebih baru.
- **PostgreSQL:** Versi 16 atau lebih baru berjalan di `127.0.0.1:5432`.

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/username/joinlab.git
cd joinlab
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Pastikan variabel kredensial basis data sesuai dengan konfigurasi PostgreSQL lokal Anda:
```env
# Aplikasi
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rahasia_super_aman_ganti_ini_32_karakter_min

# App Database (Drizzle ORM)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/joinlab_app

# Sandbox Database (Role joinlab_ro)
SANDBOX_DB_HOST=127.0.0.1
SANDBOX_DB_PORT=5432
SANDBOX_DB_NAME=joinlab_sandbox
SANDBOX_DB_USER=joinlab_ro
SANDBOX_DB_PASSWORD=joinlab_ro_password_aman

# Sandbox Admin (Kredensial superuser untuk script CLI rebuild)
SANDBOX_ADMIN_USER=postgres
SANDBOX_ADMIN_PASSWORD=postgres
SANDBOX_ADMIN_DB=postgres

# Execution Limits
SANDBOX_TIMEOUT_MS=3000
SANDBOX_DISPLAY_ROWS=100
SANDBOX_COMPARE_ROWS=5000
SANDBOX_MAX_SQL_LENGTH=2000
```

### 3. Inisialisasi & Setup Database Otomatis
Jalankan urutan perintah berikut untuk membangun skema aplikasi dan sandbox secara utuh:

```bash
# 1. Bangun role joinlab_ro dan database sandbox beserta seluruh skemanya
npm run db:sandbox-rebuild

# 2. Sinkronisasikan metadata kolom, PK/FK, dan relasi ERD ke database aplikasi
npm run db:sync-metadata

# 3. Buat skema tabel aplikasi (joinlab_app) melalui Drizzle ORM
npx drizzle-kit push

# 4. Masukkan data seeder (20 error pattern, 30 bank soal, dan akun demo)
npm run db:seed

# 5. Jalankan validasi kunci jawaban untuk mengomputasi cache hasil ekspektasi
npm run db:refresh-expected
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Demo Cepat

Aplikasi menyediakan kredensial demo siap pakai untuk mempermudah evaluasi dan pengujian fitur:

| Peran | Email | Kata Sandi | Akses Utama |
|---|---|---|---|
| **Mahasiswa (Student)** | `mahasiswa@joinlab.test` | `password123` | Workspace Soal, Progres, Riwayat, ERD Viewer |
| **Dosen (Instructor)** | `dosen@joinlab.test` | `password123` | Analitik Kelas, Ekspor CSV, Manajemen Bank Soal |

> ⚡ *Tersedia tombol **Masuk Cepat Demo** langsung di halaman `/login`.*

---

## 🧪 Pengujian Otomatis

JoinLab dilengkapi unit testing komprehensif pada lapisan domain logic untuk memastikan keandalan parser, komparator, dan keamanan guard:

```bash
# Menjalankan seluruh pengujian unit menggunakan Vitest
npm test

# Menjalankan pengujian dengan antarmuka grafis (UI mode)
npm run test:ui

# Memverifikasi typecheck dan integritas build Next.js
npm run build

# Menjalankan pengujian End-to-End (E2E) via Playwright
npm run test:e2e
```

Status Pengujian Saat Ini:
- `SqlGuard.test.ts`: **9 passed** (Pencegahan SQL injection, multi-statement, token sleep, dan izin SELECT).
- `ResultComparator.test.ts`: **5 passed** (Validasi multiset baris, sorting sensitif, normalisasi canonical).
- `Detectors.test.ts`: **4 passed** (Deteksi akurat E01, E02, E04, dan mekanisme error).
- **Total: 18 unit tests passed (100% green).**

---

## 💻 Panduan Perintah NPM (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server dengan Turbopack. |
| `npm run build` | Menjalankan typecheck TypeScript dan kompilasi production build. |
| `npm run start` | Menjalankan production server hasil build. |
| `npm run lint` | Menjalankan linter ESLint pada seluruh berkas kode. |
| `npm run db:sandbox-rebuild` | Membangun ulang seluruh database sandbox dan permission grants. |
| `npm run db:sync-metadata` | Mengekstrak metadata DDL/ERD dari sandbox ke DB aplikasi. |
| `npm run db:seed` | Mengisi data awal soal, error pattern, dan akun demo. |
| `npm run db:refresh-expected`| Menjalankan `expected_sql` setiap soal dan memperbarui cache hasil. |
| `npm run db:studio` | Membuka antarmuka Drizzle Studio untuk inspeksi visual tabel aplikasi. |

---

## 👥 Tim & Kontribusi

Proyek ini dikembangkan sebagai prototipe perangkat lunak edukasi dalam mata kuliah **Pengembangan Software Edukasi**.

- **Arsitektur & Pengembangan:** Tim Pengembang JoinLab
- **Panduan Kontribusi:** Silakan gunakan standar [*Conventional Commits*](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`) saat mengajukan perubahan kode.

---

<div align="center">
<sub>Dibangun dengan dedikasi untuk memajukan pendidikan ilmu komputer dan rekayasa basis data.</sub>
</div>
