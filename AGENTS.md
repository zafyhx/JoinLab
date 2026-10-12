# AGENTS.md — JoinLab Development Instructions

## Project Overview
- JoinLab: platform latihan SQL JOIN interaktif untuk mahasiswa
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Shadcn UI, Drizzle ORM, MySQL, node-sql-parser
- Tugas kuliah Pengembangan Software Edukasi

## Architecture
- Fullstack TypeScript monorepo in `src/`
- `src/app/` = Next.js App Router pages and API route handlers
- `src/lib/domain/` = Pure domain logic (SqlGuard, SandboxExecutor, Detectors, etc.)
- `src/lib/db/` = Drizzle ORM schema and database client
- `src/components/` = React UI components (Shadcn UI based)
- `scripts/` = CLI utilities for database management

## Key Rules
1. **Dokumen prioritas:** AGENTS.md > 01 > 04 > 03 > 02 > 05 > 06 > 07. Jika ada konflik, ikuti urutan ini.
2. **Bahasa:** UI dan teks user-facing dalam Bahasa Indonesia. Kode, nama variabel, nama tabel aplikasi, komentar kode dalam English.
3. **Sandbox isolation:** Query mahasiswa HANYA dijalankan via koneksi sandbox read-only (`joinlab_ro`). JANGAN PERNAH jalankan raw user SQL pada koneksi aplikasi.
4. **No AI features in MVP.** Feedback harus rule-based via 20 detectors (E01-E20).
5. **TypeScript strict mode.** Gunakan `strict: true` di tsconfig. Semua domain types harus explicit, tidak boleh `any`.
6. **Drizzle ORM** untuk database aplikasi. `mysql2` driver langsung untuk sandbox execution.
7. **Zod** untuk validasi input di API route handlers.
8. **Shadcn UI** untuk semua komponen UI. Jangan buat komponen custom jika sudah ada di Shadcn.
9. **Server Components by default.** Gunakan `'use client'` hanya jika komponen butuh interaktivitas (editor, state, event handlers).
10. **Detectors harus fail-safe.** Jika parser gagal atau detector error, jangan throw — kembalikan null/fallback.
11. **Jangan tampilkan `expected_sql` ke mahasiswa** dalam kondisi apa pun, termasuk di hints level 3.
12. **Test:** Vitest untuk unit test domain logic, Playwright untuk E2E.
13. **Conventional Commits** untuk pesan commit.
14. **Tanya sebelum perintah destruktif** (rebuild sandbox, drop database, dll).

## Database
- App DB: `joinlab_app` (Drizzle ORM managed)
- Sandbox DBs: `sb_akademik`, `sb_toko`, `sb_perpustakaan` (raw SQL files in `database/sandbox/`)
- Sandbox user: `joinlab_ro` with SELECT-only grants

## File References
- PRD & requirements: `docs/01-PRD-analisis-kebutuhan.md`
- Architecture: `docs/02-arsitektur-teknis.md`
- DB schema & detectors: `docs/03-database-dan-sandbox.md`
- Features & user flows: `docs/04-fitur-dan-user-flow.md`
- UI design: `docs/05-desain-ui.md`
- Question bank: `docs/06-bank-soal.md`
- Demo scenarios: `docs/07-skenario-demo.md`

## Getting Started
```bash
npm install
# Setup databases
npm run db:sandbox-rebuild
npm run db:sync-metadata
npx drizzle-kit push
npm run db:seed
npm run db:refresh-expected
# Run dev server
npm run dev
```
