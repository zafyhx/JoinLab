# 02. Arsitektur Teknis: JoinLab (Next.js 15 Fullstack TypeScript)

Dokumen ini menjelaskan stack, struktur kode, alur permintaan, keamanan, konfigurasi, pengujian, dan deployment.
Kebutuhan produk ada di `01`, skema database dan mesin diagnosis di `03`.

---

## 1. Stack

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Runtime & Language | Node.js v20+ / TypeScript 5+ | Single language di seluruh stack |
| Framework | **Next.js 15 (App Router)** | Server Components, Route Handlers, dan Server Actions |
| UI Framework | **React 19** | Komponen interaktif modern untuk split workspace |
| Styling | **Tailwind CSS v4** + **Shadcn UI** | Token desain & UI primitives accessible |
| Ikon | **Lucide React** (`lucide-react`) | Ikon SVG ringan & modern |
| Editor SQL | **Monaco Editor** (`@monaco-editor/react`) / **CodeMirror 6** | Syntax highlighting, autocompletion SQL, keyboard shortcuts |
| Database aplikasi | MySQL 8 (via **Drizzle ORM** / **Prisma**) | Menyimpan user, soal, percobaan, analitik |
| Database sandbox | MySQL 8 (via **`mysql2`** driver read-only) | Menyimpan data latihan, diakses user read-only |
| Parser SQL | **`node-sql-parser`** (npm) | Dipakai detector statis untuk parsing AST SQL |
| Autentikasi | NextAuth.js / Auth.js v5 (atau Lucia / Session Cookies) | Role-based authorization (`student`, `instructor`) |
| Testing | **Vitest** + **Playwright** | Vitest untuk domain unit tests, Playwright untuk E2E |
| Deployment | Node.js / Docker Compose di VPS | Nginx + Node Container + MySQL |

---

## 2. Gambaran arsitektur

```
Browser (React 19 + Monaco Editor + Tailwind + Shadcn UI + Lucide)
        │  fetch / API Route Handlers          │ Server Components (RSC)
        ▼                                      ▼
┌──────────────────────────────────────────────────────────┐
│ Next.js 15 (App Router)                                  │
│  Route Handlers / Actions ──► Zod Validation             │
│                    │                                     │
│                    ▼                                     │
│  Domain Services (TypeScript)                            │
│   ├─ Sandbox:   SqlGuard, SandboxExecutor                │
│   ├─ Grading:   ResultNormalizer, ResultComparator       │
│   ├─ Diagnosis: DiagnosisEngine + Detectors/*            │
│   ├─ Feedback:  FeedbackBuilder, HintService             │
│   ├─ Learning:  EquivalentQuestionPicker, ProgressService│
│   ├─ Erd:       ErdBuilder (metadata ► SVG layout)       │
│   └─ Insight:   AnalyticsService                         │
└───────────────┬──────────────────────────┬───────────────┘
                │ Drizzle ORM              │ mysql2 pool read-only
                ▼                          ▼
        DB aplikasi (joinlab_app)   DB sandbox (sb_akademik, sb_toko, sb_perpustakaan)
```

Prinsip:
1. **Separation of Concerns.** Logika bisnis sepenuhnya di service domain (`src/lib/domain/*`).
2. **Satu tanggung jawab per kelas/fungsi.** Detector hanya mendeteksi satu pola kesalahan SQL.
3. **Sandbox terisolasi.** Eksekusi SQL mahasiswa hanya melalui koneksi `mysql2` terisolasi dengan user read-only (`joinlab_ro`).
4. **Hasil dibandingkan, bukan teks query.** Dua query berbeda yang menghasilkan dataset sama dianggap benar.
5. **Gagal dengan aman (Fail-safe).** Parser atau detector error tidak boleh memicu HTTP 500, melainkan fallback ke feedback umum.

---

## 3. Struktur folder

```
src/
├─ app/                                 (Next.js App Router)
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ (dashboard)/
│  │  ├─ dashboard/page.tsx
│  │  ├─ skema/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  ├─ soal/
│  │  │  └─ [code]/page.tsx              (Workspace interaktif: Editor + ERD + Feedback)
│  │  ├─ riwayat/page.tsx
│  │  └─ progres/page.tsx
│  ├─ (instructor)/
│  │  ├─ dosen/
│  │  │  ├─ page.tsx
│  │  │  ├─ soal/page.tsx
│  │  │  ├─ analitik/page.tsx
│  │  │  └─ mahasiswa/page.tsx
│  ├─ api/
│  │  ├─ soal/[code]/
│  │  │  ├─ jalankan/route.ts           (Preview query)
│  │  │  ├─ periksa/route.ts            (Penilaian & diagnosis)
│  │  │  ├─ petunjuk/route.ts           (Catat & ambil hint)
│  │  │  └─ setara/route.ts             (Ambil soal setara)
│  │  └─ dosen/
│  │     └─ ekspor/percobaan/route.ts   (Ekspor CSV)
│  ├─ layout.tsx
│  └─ page.tsx                          (Landing page)
├─ components/                          (React UI components)
│  ├─ ui/                               (Shadcn UI primitives: button, dialog, tabs, etc.)
│  ├─ workspace/                        (SqlEditor, ErdViewer, ResultTable, FeedbackPanel)
│  └─ shared/                           (Navbar, Sidebar, StatCard)
├─ lib/
│  ├─ db/                              (Drizzle ORM schema & client)
│  │  ├─ index.ts
│  │  └─ schema.ts                      (Tabel aplikasi: users, questions, attempts, dll.)
│  ├─ domain/                           (Domain Business Logic)
│  │  ├─ sandbox/
│  │  │  ├─ SqlGuard.ts
│  │  │  ├─ SandboxExecutor.ts
│  │  │  └─ types.ts
│  │  ├─ grading/
│  │  │  ├─ ResultNormalizer.ts
│  │  │  ├─ ResultComparator.ts
│  │  │  └─ types.ts
│  │  ├─ diagnosis/
│  │  │  ├─ DiagnosisEngine.ts
│  │  │  └─ detectors/                  (20 file detector kesalahan SQL)
│  │  ├─ feedback/
│  │  │  └─ FeedbackBuilder.ts
│  │  ├─ learning/
│  │  │  ├─ EquivalentQuestionPicker.ts
│  │  │  └─ ProgressService.ts
│  │  └─ erd/
│  │     └─ ErdBuilder.ts
│  └─ auth/                             (Session & Role Helpers)
scripts/                                (CLI Utilities / Data management)
├─ sandbox-rebuild.ts                   (Rebuild sandbox DBs)
├─ sandbox-sync-metadata.ts             (Sync ERD metadata)
└─ questions-refresh-expected.ts        (Refresh cached expected results)
docs/                                   (Dokumentasi proyek)
```

---

## 4. Alur utama

### 4.1 Jalankan query (preview)
1. Mahasiswa menekan **Jalankan** atau `Ctrl+Enter`.
2. Frontend melempar `POST /api/soal/{code}/jalankan` dengan body `{ sql }`.
3. Validasi skema Zod (string, wajib, max 2000 karakter).
4. `SqlGuard.assertAllowed(sql)` mengecek query. Jika bermasalah, kembalikan HTTP 422.
5. `SandboxExecutor.run(...)` mengecek pada DB sandbox terikat dengan timeout 3 detik & row limit.
6. Kembalikan JSON: `{ columns, rows, truncated, executionMs }`.
7. Catat `ActivityEvent` bertipe `query_run` di DB aplikasi.

### 4.2 Periksa jawaban (penilaian)
1. `POST /api/soal/{code}/periksa` dengan body `{ sql, hintsUsed }`.
2. Eksekusi query mahasiswa dengan batas pengambilan 5000 baris.
3. `ResultNormalizer` menormalkan data hasil mahasiswa & data kunci jawaban (`expected_result`).
4. `ResultComparator` menghasilkan `ComparisonReport`.
5. Jika hasil cocok: status `correct`. Jika tidak cocok: `DiagnosisEngine` menjalankan seluruh detector.
6. `FeedbackBuilder` menyusun pesan feedback ramah dalam Bahasa Indonesia, lalu `Attempt` disimpan di DB aplikasi.
7. `ProgressService` memperbarui status `user_progress`.
8. Kembalikan JSON feedback lengkap ke frontend.

---

## 5. Konfigurasi & Environment

### `.env`
```env
# Application Settings
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rahasia_super_aman_32_karakter

# App Database (Drizzle ORM / MySQL)
DATABASE_URL=mysql://root:password@127.0.0.1:3306/joinlab_app

# Sandbox Database (Read-Only User)
SANDBOX_DB_HOST=127.0.0.1
SANDBOX_DB_PORT=3306
SANDBOX_DB_USER=joinlab_ro
SANDBOX_DB_PASSWORD=password_read_only_kuat

# Sandbox Admin (Hanya untuk Script CLI Rebuild)
SANDBOX_ADMIN_USER=root
SANDBOX_ADMIN_PASSWORD=password

# Execution Limits
SANDBOX_TIMEOUT_MS=3000
SANDBOX_DISPLAY_ROWS=100
SANDBOX_COMPARE_ROWS=5000
```

---

## 6. Keamanan

1. **DB Grants Isolasi.** User `joinlab_ro` hanya memiliki izin `SELECT` pada DB sandbox (`sb_akademik`, `sb_toko`, `sb_perpustakaan`).
2. **Session Controls.** Setiap koneksi Sandbox mengeksekusi `SET SESSION TRANSACTION READ ONLY` & `SET SESSION MAX_EXECUTION_TIME = 3000`.
3. **SqlGuard AST & Lexer Check.** Menolak multi-statements, query selain `SELECT`/`WITH`, file IO (`INTO OUTFILE`), sleep/benchmark, dan akses skema sistem (`information_schema`, `mysql`).
4. **Rate Limiting.** Limit API route `/api/soal/*/jalankan` dan `periksa` untuk mencegah abuse.

---

## 7. Deployment

- **Demo / Local**: `npm run dev` di Node.js (v20+) dengan MySQL lokal.
- **Production**: Docker Compose (Next.js Standalone Container + Nginx Reverse Proxy + MySQL 8 Container).
