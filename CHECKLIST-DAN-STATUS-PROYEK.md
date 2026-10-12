# CHECKLIST DAN STATUS PENGERJAAN PROYEK JOINLAB

> **Catatan untuk AI / Pengembang Selanjutnya:**  
> Dokumen ini memuat rangkuman status terkini, apa saja yang sudah selesai diimplementasikan, apa yang masih kurang, serta langkah-langkah konkret yang harus dijalankan untuk menyelesaikan proyek ini sampai siap didemokan.

---

## 📌 Ringkasan Proyek
- **Nama Proyek:** JoinLab
- **Tujuan:** Platform latihan interaktif query SQL berfokus pada **JOIN antar tabel** dengan **rule-based logical feedback (20 Detectors)** untuk mahasiswa praktikum basis data (Tugas Kuliah Pengembangan Software Edukasi).
- **Stack:** Next.js 15 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Monaco Editor, Drizzle ORM, PostgreSQL (pg driver), node-sql-parser, Vitest.
- **Prinsip Utama:**
  1. *No AI features in MVP:* Feedback didasarkan pada 20 detector aturan (E01–E20).
  2. *Sandbox Isolation:* Query mahasiswa hanya dijalankan lewat koneksi read-only `joinlab_ro` pada database sandbox (`sb_akademik`, `sb_toko`, `sb_perpustakaan`). Tidak boleh menyentuh `joinlab_app`.
  3. *Fail-safe:* Parser dan detector error tidak boleh melempar 500 ke user.

---

## ✅ Bagian yang SUDAH SELESAI (100% Ready)

### 1. Dokumentasi Lengkap (`docs/` & `AGENTS.md`)
- [x] `docs/01-PRD-analisis-kebutuhan.md` — Analisis kebutuhan, FR/NFR, hipotesis H1–H5 (Next.js 15 updated).
- [x] `docs/02-arsitektur-teknis.md` — Arsitektur teknis fullstack TypeScript.
- [x] `docs/03-database-dan-sandbox.md` — Skema 9 tabel, spesifikasi DDL sandbox, dan 20 detector E01–E20.
- [x] `docs/04-fitur-dan-user-flow.md` — Detail 10 fitur MVP & alur pengguna.
- [x] `docs/05-desain-ui.md` — Token desain, layout split-screen, pedoman UX.
- [x] `docs/06-bank-soal.md` — 30 bank soal (15 template x 2 varian A & B) untuk 3 skema.
- [x] `docs/07-skenario-demo.md` — Skenario presentasi demo mahasiswa, dosen, dan uji keamanan.
- [x] `docs/Modul3_Analisis_Kebutuhan_JOIN_SQL.md` — Latar belakang materi kuliah & analisis PPTX.
- [x] `AGENTS.md` — Aturan dan panduan developer/AI coding agent.

### 2. Database & Data Seeder
- [x] `src/lib/db/schema.ts` — 9 tabel Drizzle ORM (`users`, `schema_definitions`, `variant_groups`, `questions`, `attempts`, `attempt_errors`, `error_patterns`, `user_progress`, `activity_events`).
- [x] `src/lib/db/index.ts` — Drizzle ORM connection client.
- [x] `src/lib/db/sandbox.ts` — Pool koneksi terisolasi read-only (`joinlab_ro`).
- [x] `database/sandbox/grants.sql` — Hak akses `joinlab_ro` hanya `SELECT`.
- [x] `database/sandbox/akademik.sql`, `toko.sql`, `perpustakaan.sql` — DDL & data deterministik lengkap kasus tepi.
- [x] `scripts/data/questionsData.ts` — Struktur lengkap 30 soal (kode, prompt, kunci jawaban, hints, relasi).
- [x] `scripts/seed.ts` — Script seeder error patterns, 3 skema, variant groups, 30 questions, dan demo users.
- [x] `scripts/sandbox-rebuild.ts` — CLI rebuild database sandbox.
- [x] `scripts/sandbox-sync-metadata.ts` — CLI sinkronisasi metadata ERD JSON & statistik tabel.
- [x] `scripts/questions-refresh-expected.ts` — CLI kalkulasi & cache hasil kunci jawaban.

### 3. Core Domain Logic & Diagnosis Engine
- [x] `src/lib/domain/sandbox/SqlGuard.ts` — Validasi query (menolak non-SELECT, multi-statement, token berbahaya, akses schema sistem).
- [x] `src/lib/domain/sandbox/SandboxExecutor.ts` — Eksekutor query aman dengan timeout 3 detik & row limit.
- [x] `src/lib/domain/grading/ResultNormalizer.ts` — Normalisasi canonical numbers, decimals, strings, dates, dan NULL.
- [x] `src/lib/domain/grading/ResultComparator.ts` — Pembanding multiset, sequence matching, diff sampling, deduplikasi check.
- [x] `src/lib/domain/diagnosis/QueryAnatomyParser.ts` — Fail-safe AST parser via `node-sql-parser`.
- [x] `src/lib/domain/diagnosis/detectors/index.ts` — **20 Detector Lengkap (E01 s/d E20)**.
- [x] `src/lib/domain/diagnosis/DiagnosisEngine.ts` — Mesin diagnosis dengan aturan penekanan (suppression) & prioritas tampilan maksimal 3.
- [x] `src/lib/domain/feedback/FeedbackBuilder.ts` — Generator JSON feedback ramah Bahasa Indonesia.
- [x] `src/lib/domain/learning/EquivalentQuestionPicker.ts` — Algoritma pemilihan soal setara (prioritas belum dicoba).
- [x] `src/lib/domain/learning/ProgressService.ts` — Pencatat attempts, normalized errors, dan user progress.
- [x] `src/lib/domain/erd/ErdBuilder.ts` — Perhitungan koordinat layout SVG ERD.

### 4. API Route Handlers
- [x] `POST /api/soal/[code]/jalankan` — Preview query mahasiswa (limit 100 baris).
- [x] `POST /api/soal/[code]/periksa` — Penilaian, komparasi kunci jawaban, dan diagnosis detector.
- [x] `POST /api/soal/[code]/petunjuk` — Buka petunjuk bertingkat (level 1-3) tanpa membocorkan `expected_sql`.
- [x] `GET /api/soal/[code]/setara` — Redirect ke soal setara satu variant group.
- [x] `GET /api/dosen/ekspor/percobaan` — Unduh file CSV rekap submission.
- [x] `GET /api/dosen/analitik` — Data statistik kesalahan & mahasiswa perlu asistensi.

### 5. UI Workspace & Halaman
- [x] `src/components/workspace/SqlEditor.tsx` — Monaco Editor dengan highlight SQL & shortcut `Ctrl+Enter`.
- [x] `src/components/workspace/ErdViewer.tsx` — Visualisasi interaktif tabel ERD, indikator PK/FK, dan garis relasi SVG.
- [x] `src/components/workspace/ResultTable.tsx` — Tabel data hasil eksekusi, indikator NULL, waktu eksekusi, dan info pemotongan.
- [x] `src/components/workspace/FeedbackPanel.tsx` — Panel diagnosis, kartu temuan, bukti data collapsible, hints bertahap, tombol soal setara.
- [x] `src/components/workspace/WorkspaceLayout.tsx` — Split-screen workspace terpadu.
- [x] `src/app/page.tsx` — Landing page responsif dengan CTA latihan & demo.
- [x] `src/app/dashboard/page.tsx` — Dashboard mahasiswa (ringkasan progres, kartu skema, percobaan terakhir).
- [x] `src/app/skema/[slug]/page.tsx` — Daftar soal per skema dikelompokkan berdasarkan Level 1-3 dengan badge status.
- [x] `src/app/soal/[code]/page.tsx` — Halaman workspace pengerjaan soal.
- [x] `src/app/riwayat/page.tsx` — Tabel riwayat percobaan lengkap dengan kode error.
- [x] `src/app/progres/page.tsx` — Halaman pencapaian progres belajar per skema & matriks status soal.
- [x] `src/app/dosen/page.tsx` — Dashboard dosen (grafik batang distribusi error E01-E20, soal tersulit, daftar mahasiswa kesulitan, tombol ekspor CSV).

### 6. Pengujian Unit (Vitest)
- [x] `tests/Unit/SqlGuard.test.ts` (9 tests passed)
- [x] `tests/Unit/ResultComparator.test.ts` (5 tests passed)
- [x] `tests/Unit/Detectors.test.ts` (4 tests passed)
- Total: **18 tests passing**.

---

## ⚠️ KEKURANGAN & DAFTAR PEKERJAAN (Action Items untuk AI Selanjutnya)

Berikut adalah hal-hal yang **harus diselesaikan** oleh AI atau pengembang selanjutnya:

### 1. Perbaikan Typecheck Build (`next build`)
- [x] Type error pada parameter lambda ternyata **sudah beres** (build lolos TypeScript tanpa perubahan pada file tersebut).
- [x] Blocker build sebenarnya adalah halaman `/dosen` yang di-prerender statis dan menyentuh DB saat build. Ditambahkan `export const dynamic = "force-dynamic"` di `src/app/dosen/page.tsx`.
- **Status:** `npm run build` kini selesai dengan kode keluar `0` tanpa error TypeScript.

### 2. Eksekusi Database Setup (PostgreSQL) — SELESAI
> **Catatan (07 Oktober 2026):** PostgreSQL 18.6 terpasang & berjalan di `127.0.0.1:5432`. File `.env` sudah dibuat. Seluruh langkah setup di bawah **sudah dijalankan dan berhasil**:
- [x] `npx drizzle-kit push` — skema aplikasi dibuat di database `joinlab_app`.
- [x] `npm run db:seed` — 20 error patterns, 3 schema definitions, 30 soal, 2 demo users.
- [x] `npm run db:sandbox-rebuild -- --force` — role `joinlab_ro` + database `joinlab_sandbox` + 3 schema (`sb_akademik`, `sb_toko`, `sb_perpustakaan`) + data + grants.
- [x] `npm run db:sync-metadata` — ERD JSON & statistik tabel (masing-masing 5 tabel).
- [x] `npm run db:refresh-expected` — 30 soal berhasil dihitung via sandbox.
> Catatan: script `npm run db:sync-metadata` kini membaca metadata dari PostgreSQL (bukan MySQL).

### 3. Halaman CRUD Soal untuk Dosen (Opsional / Pelengkap FR-14)
- [x] Halaman `src/app/dosen/soal/page.tsx` (daftar soal + form tambah/edit).
- [x] Form tambah/edit soal: judul, prompt, skema, level, `expected_sql`, `required_tables`, hints (3 tingkat), tags, `order_matters`, `is_published`.
- [x] Tombol **Preview** untuk menjalankan `expected_sql` dosen sebelum disimpan.
- [x] Toggle `is_published` dan hapus soal.
- [x] API routes: `GET/POST /api/dosen/soal`, `PATCH/DELETE /api/dosen/soal/[id]`, `POST /api/dosen/soal/[id]/publish`, `POST /api/dosen/soal/preview`.
- [x] Validasi input via Zod (`src/lib/validation/questionInput.ts`) dan cek peran `instructor`.

### 4. Halaman Autentikasi UI (`/login` & `/register`)
- [x] Halaman `src/app/login/page.tsx` dan `src/app/register/page.tsx`.
- [x] Tombol "Masuk Cepat Demo" untuk mahasiswa & dosen (`mahasiswa@joinlab.test` / `dosen@joinlab.test`, password `password123`).
- [x] API routes: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout` (dengan `bcryptjs`).
- [x] `Navbar` kini async dan menampilkan status login (nama/role + tombol Keluar) atau tombol Masuk/Daftar.

### 5. Verifikasi Akhir
- [x] Verifikasi runtime via dev server + endpoint API:
  - Alur mahasiswa: `/api/soal/AK-1A/jalankan` (24 baris) & `/periksa` dengan query benar → verdict `correct`.
  - Halaman `/dosen` & `GET /api/dosen/analitik` → HTTP 200 (dengan login dosen).
  - Auth: `dosen@joinlab.test`/`password123` → role instructor + redirect `/dosen`; password salah → 401.
  - Keamanan: `DROP TABLE` → 422 (`not_select`); `pg_sleep` → 422 (`forbidden_token`); multi-statement → 422.
  - Isolasi sandbox: role `joinlab_ro` bisa `SELECT`; `DELETE`/`INSERT`/`CREATE` diblokir (SQLSTATE 42501).
- [ ] Verifikasi tampilan visual di lebar 375px & 1440px (perlu dicek manual di browser).

### 6. Audit End-to-End & Penguatan Keamanan (07 Oktober 2026) — SELESAI
Audit E2E seluruh fitur (62 pengujian + investigasi) menemukan 4 kerentanan dan beberapa deviasi. Semua sudah diperbaiki dan diverifikasi ulang (34/34 PASS, vitest 18/18, build exit 0):

- [x] **S1 — Session cookie kini HMAC-signed** (`payload.signature`, `crypto.timingSafeEqual`). Cookie palsu (role instructor hasil edit DevTools) kini ditolak: API dosen 403, halaman diarahkan ke /login. Dulu: **diterima**.
- [x] **S2 — `GET /api/dosen/ekspor/percobaan` kini butuh login instructor** (403 tanpa login). Dulu: data mahasiswa (nama, email, NIM) terbuka.
- [x] **S3 — `GET /api/dosen/analitik` kini butuh login instructor** (403 tanpa login). Dulu: 200 untuk publik.
- [x] **S4 — Guard role halaman `/dosen` & `/dosen/soal`** (FR-02): mahasiswa/tanpa login → redirect `/login`; `/dosen/soal` dipecah jadi server page ber-guard + komponen client `SoalManager`.
- [x] **CSRF (NFR-02)** — `src/proxy.ts` (konvensi Next 16 pengganti middleware) menolak POST/PATCH/DELETE dengan `Origin` yang tidak cocok dengan host.
- [x] **Throttle (NFR-02)** — rate limit in-memory: `/jalankan` 30x/menit, `/periksa` 20x/menit per pengguna (HTTP 429 + `Retry-After`).
- [x] **E20 jadi fallback murni** sesuai dok 03 §E.2.7 — tidak lagi menyertai temuan lain; hanya muncul saat tidak ada detector lain yang cocok.
- [x] **FR-17 level locking** — implementasi config-gated (`JOINLAB_LEVEL_LOCKING=true`, `JOINLAB_LEVEL_LOCK_MIN_PERCENT`, default mati sesuai PRD); level terkunci ditampilkan dengan ikon gembok di `/skema/[slug]`.
- [x] **FR-19 pencarian & filter soal dosen** — search kode/judul + filter skema/level/status di panel Kelola Soal.
- [x] **Hint level 3 soal 2-tabel** tidak lagi menuliskan kondisi ON utuh (AK-1A, AK-1B, TK-1A); `npm run db:seed` kini menyinkronkan hint dari seed kanonik.
- [ ] Verifikasi visual 375px/1440px di browser (belum dilakukan).

---

## 🚀 Panduan Ringkas Memulai untuk AI Berikutnya

Untuk melanjutkan pengerjaan proyek ini, AI berikutnya cukup membaca file ini dan menjalankan:

```bash
# 1. Jalankan unit test untuk memastikan domain logic tetap hijau
npx vitest run

# 2. Periksa error TypeScript pada build
npm run build

# 3. Lanjutkan perbaikan type error pada file yang disebutkan di atas
```

*Dokumen ini diperbarui secara otomatis pada tanggal 07 Oktober 2026.*
