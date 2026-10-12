# 04. Fitur dan User Flow: JoinLab

Dokumen ini adalah referensi detail untuk **setiap fitur MVP** dan **alur pengguna (user flow)** pada platform JoinLab. Dokumen ini selaras dengan kebutuhan fungsional di `01-PRD-analisis-kebutuhan.md`, arsitektur di `02-arsitektur-teknis.md`, dan skema di `03-database-dan-sandbox.md`.

Stack yang digunakan: **Next.js 15, React 19, TypeScript, Tailwind CSS v4, Shadcn UI**.

---

## 1. Daftar Fitur MVP

Berikut adalah daftar 10 fitur utama (MVP) beserta detail implementasinya:

### F-01: Autentikasi dan Manajemen Sesi
- **Deskripsi**: Sistem login, registrasi, dan logout dengan role-based access control (`student` dan `instructor`).
- **Kebutuhan fungsional terkait**: FR-01, FR-02
- **Komponen UI**: Halaman Login, Halaman Registrasi, Dropdown Profile (Navbar).
- **Data/Model**: `users` (id, email, password hash, role).
- **Perilaku edge case**:
  - Jika email sudah terdaftar saat registrasi, tampilkan pesan error yang jelas.
  - Jika `student` mencoba mengakses rute `/dosen/*`, alihkan (`redirect`) ke `/dashboard`.
  - Jika sesi kedaluwarsa, alihkan kembali ke halaman login dengan parameter URL asal.

### F-02: Jelajah Skema dan Bank Soal
- **Deskripsi**: Antarmuka bagi mahasiswa untuk melihat daftar skema database, memilih level kesulitan, dan melihat daftar soal beserta status penyelesaiannya (belum dicoba, pernah dicoba, solved).
- **Kebutuhan fungsional terkait**: FR-03, FR-17
- **Komponen UI**: Grid/Card Skema, Accordion Level, Badge Status, Progress Bar.
- **Data/Model**: `schema_definitions`, `variant_groups`, `questions`, `user_progress`.
- **Perilaku edge case**:
  - Jika tidak ada soal yang di-publish pada skema tertentu, tampilkan placeholder "Belum ada soal".
  - Jika konfigurasi penguncian level aktif, level berikutnya tidak bisa diklik dan diberi ikon gembok sebelum level sebelumnya memenuhi syarat.

### F-03: Skema Sandbox
- **Deskripsi**: Tiga konteks domain data (Akademik, Toko, Perpustakaan) yang menjadi target query. Data di dalamnya bersifat read-only bagi pengguna dan deterministik untuk pembandingan.
- **Kebutuhan fungsional terkait**: FR-05
- **Komponen UI**: Digunakan secara implisit pada Workspace (F-04) dan ERD (F-05).
- **Data/Model**: Database terpisah (`sb_akademik`, `sb_toko`, `sb_perpustakaan`), `schema_definitions` (metadata aplikasi).
- **Perilaku edge case**:
  - Jika koneksi ke database sandbox gagal, aplikasi menangkap exception dan mengembalikan pesan "Sandbox tidak tersedia, hubungi asisten".

### F-04: Workspace Soal (Interaktif)
- **Deskripsi**: Halaman utama tempat mahasiswa mengerjakan latihan. Terdiri dari panel deskripsi soal, ERD, editor SQL, dan tabel hasil.
- **Kebutuhan fungsional terkait**: FR-04, FR-05, FR-06, FR-18
- **Komponen UI**: `SqlEditor` (Monaco), `ErdViewer`, `ResultTable`, Split Pane Layout, Button "Jalankan" & "Periksa jawaban".
- **Data/Model**: `questions` (prompt, expected_result), request API `/api/soal/[code]/jalankan`.
- **Perilaku edge case**:
  - Jika query kosong atau invalid, tombol Jalankan di-disable atau menampilkan error dari `SqlGuard`.
  - Jika baris hasil melebihi 100, tabel menampilkan indikator terpotong (truncated) untuk menjaga performa rendering di browser.

### F-05: ERD Otomatis
- **Deskripsi**: Menampilkan Entity Relationship Diagram berdasarkan metadata skema database secara dinamis.
- **Kebutuhan fungsional terkait**: FR-10
- **Komponen UI**: Komponen Canvas/SVG (misal memakai React Flow) di dalam Workspace.
- **Data/Model**: `schema_definitions.erd_json`.
- **Perilaku edge case**:
  - Jika `erd_json` kosong, tampilkan fallback "ERD belum di-generate".

### F-06: Mesin Feedback dan Diagnosis
- **Deskripsi**: Menilai hasil eksekusi query mahasiswa dan membandingkannya dengan kunci jawaban. Jika salah, mesin mengeksekusi detector rule-based untuk mendiagnosis penyebab logika/sintaks.
- **Kebutuhan fungsional terkait**: FR-07, FR-08
- **Komponen UI**: `FeedbackPanel` (menggunakan Alert/Callout Shadcn), tabel diff hasil, modal detail temuan.
- **Data/Model**: `ComparisonReport`, `attempts` (status, feedback, error_codes, error_categories).
- **Perilaku edge case**:
  - Jika query memicu error MySQL (misal 1064), langsung tampilkan error pembungkus yang aman tanpa mengeksekusi rule logika.
  - Jika lebih dari 3 error terdeteksi, batasi tampilan pada 3 prioritas teratas agar tidak membebani mahasiswa.

### F-07: Soal Setara (Equivalent Question)
- **Deskripsi**: Memberikan varian soal lain dengan konsep dan struktur penyelesaian (JOIN) yang sama untuk mahasiswa yang butuh latihan tambahan atau ingin mengulang setelah gagal.
- **Kebutuhan fungsional terkait**: FR-11
- **Komponen UI**: Tombol "Coba soal setara" di akhir halaman feedback.
- **Data/Model**: `variant_groups`, `questions`, `user_progress`.
- **Perilaku edge case**:
  - Jika semua varian dalam satu grup sudah berstatus `solved`, tampilkan notifikasi bahwa mahasiswa sudah menuntaskan konsep tersebut, alih-alih melempar error.

### F-08: Riwayat dan Progres
- **Deskripsi**: Pelacakan aktivitas belajar. Mahasiswa dapat melihat histori dari setiap percobaan eksekusinya dan rekap persentase kelulusannya per skema/level.
- **Kebutuhan fungsional terkait**: FR-12, FR-13
- **Komponen UI**: Tabel Riwayat (Pagination/Filter), Card Statistik Progres.
- **Data/Model**: `attempts`, `user_progress`, `activity_events`.
- **Perilaku edge case**:
  - Jika riwayat kosong, tampilkan empty state dengan ajakan untuk mulai mengerjakan soal.

### F-09: Panel Admin Soal Dosen
- **Deskripsi**: Halaman untuk instruktur dalam membuat, membaca, memperbarui, menghapus, serta melakukan *publish* soal latih.
- **Kebutuhan fungsional terkait**: FR-14, FR-19
- **Komponen UI**: Datatable Soal, Form Editor Soal (termasuk Monaco untuk `expected_sql`), Tombol Preview/Test Kunci.
- **Data/Model**: `questions`, fitur seeder, eksekutor ke sandbox.
- **Perilaku edge case**:
  - Jika dosen menyimpan soal, jalankan uji otomatis ke kunci jawaban (`expected_sql`). Jika gagal, tampilkan pesan warning (tapi tetap diizinkan menyimpan draft).
  - Soal yang sudah di-*publish* dan telah diisi mahasiswa sebaiknya memperingatkan instruktur saat diedit secara substansial.

### F-10: Analitik Dosen
- **Deskripsi**: Dasbor analitik untuk melihat metrik agregat: error terbanyak, distribusi kategori, soal paling sulit, dan daftar mahasiswa yang perlu perhatian/bantuan (banyak percobaan tetapi masih gagal).
- **Kebutuhan fungsional terkait**: FR-15, FR-16
- **Komponen UI**: Bar Chart (Shadcn UI/Recharts) untuk distribusi error, Tabel "Mahasiswa Butuh Perhatian", Tombol "Ekspor CSV".
- **Data/Model**: Agregat dari `attempt_errors`, `attempts`, `user_progress`.
- **Perilaku edge case**:
  - Jika data belum cukup untuk grafik (kosong), pastikan komponen chart tidak *crash* dan tampilkan teks "Data belum tersedia".

---

## 2. User Flow Detail

### F-01: Registrasi, Login, dan Logout
1. **Registrasi**:
   - Pengguna masuk ke rute `/register`.
   - Mengisi formulir: Nama, Email, Password, dan secara opsional NIM.
   - Klik **Daftar**. Sistem memvalidasi input via Zod.
   - Akun dibuat dengan `role = 'student'`, kemudian di-redirect ke `/login`.
2. **Login**:
   - Pengguna masuk ke rute `/login`.
   - Mengisi Email dan Password.
   - Klik **Masuk**. NextAuth memverifikasi kredensial.
   - Redirect ke `/dashboard` (jika `student`) atau `/dosen` (jika `instructor`).
3. **Logout**:
   - Klik ikon Profile di Navbar, pilih **Keluar**.
   - Sesi dihancurkan, pengguna dialihkan ke halaman utama (Landing Page) atau `/login`.

### F-02: Jelajah Skema dan Bank Soal
1. Mahasiswa masuk ke `/dashboard/skema`.
2. Halaman menampilkan grid yang memuat `Skema Akademik`, `Skema Toko`, dan `Skema Perpustakaan`.
3. Klik salah satu skema (misal Akademik). Masuk ke `/dashboard/skema/akademik`.
4. Menampilkan accordion untuk Level 1, 2, dan 3.
5. Klik accordion Level 1, melihat daftar card soal (misal "Daftar Mahasiswa").
6. Setiap card menampilkan badge status (`solved`, `attempted`, atau `not_started`).
7. Klik salah satu card untuk masuk ke Workspace (F-04).

### F-03: Skema Sandbox
*Alur ini tidak memiliki halaman UI mandiri secara eksplisit, namun menjadi penyedia data untuk soal.*
1. Saat di Workspace, dropdown (jika ada) atau header menampilkan nama Skema yang sedang aktif.
2. `SqlGuard` dan `SandboxExecutor` menggunakan nama db terkait (contoh `sb_akademik`) berdasarkan `schema_definition_id` dari soal.

### F-04: Workspace Soal
1. Masuk rute `/dashboard/soal/[code]`.
2. Sebelah kiri menampilkan panel **Deskripsi Soal** dan petunjuk (hint).
3. Sebelah kanan terbagi dua secara vertikal: atas untuk **ERD** dan bawah untuk **Editor SQL** & **Tabel Hasil**.
4. Mahasiswa menulis query di Monaco Editor.
5. Tekan `Ctrl+Enter` atau tombol **Jalankan**.
   - API me-return pratinjau hasil eksekusi (maks 100 baris).
   - Ditampilkan di tab "Tabel Hasil" tanpa mengevaluasi benar/salah.

### F-05: ERD Otomatis
1. Di dalam Workspace, panel ERD akan mengambil data `erd_json` milik skema tersebut.
2. Menampilkan box (tabel) berisi kolom, dengan highlight icon PK dan FK.
3. Saat kursor meng-hover nama tabel/kolom yang memiliki FK, garis relasinya ke tabel target ditebalkan (visual cue).

### F-06: Mesin Feedback dan Diagnosis
1. Di Workspace, setelah yakin, mahasiswa menekan tombol **Periksa jawaban**.
2. Frontend mengirim `POST /api/soal/[code]/periksa` dengan payload `sql`.
3. API menjalankan query, membandingkan multiset data dengan `expected_result` (sampai batas 5000 baris).
4. Jika **Benar** (`correct`):
   - Tampilkan pesan sukses warna hijau, animasi (konfeti), dan tombol menuju level/soal berikutnya atau soal setara.
5. Jika **Salah** (`incorrect`):
   - `DiagnosisEngine` mendeteksi error pattern (misal E01, E02).
   - Tampilkan `FeedbackPanel` dengan alert warna merah/kuning berisi 1-3 `findings`.
   - Tampilkan evidence (contoh: "Jumlah barismu membengkak menjadi 400").
   - Catat data `attempt` di database.

### F-07: Soal Setara (EquivalentQuestionPicker)
1. Setelah mahasiswa gagal (atau setelah berhasil tapi ingin latihan lagi), klik tombol **Coba soal setara**.
2. Sistem mencari `questions` dalam `variant_group_id` yang sama.
3. **Prioritas pencarian**:
   - Cari soal varian yang *belum pernah dicoba* (`not_started`).
   - Jika tidak ada, cari soal varian yang *pernah dicoba tapi belum solved*.
   - Jika semua sudah *solved*, tampilkan toast/modal informasi: "Kamu sudah menguasai varian soal ini!".
4. Jika ditemukan soal setara, sistem me-redirect rute ke `/dashboard/soal/[new_code]`.

### F-08: Riwayat dan Progres
1. Mahasiswa mengklik menu **Riwayat** di Sidebar.
2. Rute `/dashboard/riwayat` menampilkan datatable yang berisi waktu percobaan, kode soal, status (`correct`, `incorrect`, `error`), dan ikon buka log query.
3. Mahasiswa mengklik menu **Progres**.
4. Rute `/dashboard/progres` menampilkan grafik penyelesaian per Skema dan Level (contoh: Level 1 Akademik 80% selesai).

### F-09: Panel Admin Soal Dosen
1. Instruktur login, lalu masuk ke `/dosen/soal`.
2. Klik **Tambah Soal** atau **Edit**.
3. Form pengisian meliputi: Kode, Title, Prompt (Markdown), Kunci Jawaban (SQL), Tags, Required Tables, dsb.
4. Klik **Test Kunci**. API mengeksekusi `expected_sql` di sandbox dan menyimpan JSON meta (`expected_result`, row count).
5. Toggle status `is_published`. Klik **Simpan**.

### F-10: Analitik Dosen
1. Instruktur masuk ke `/dosen/analitik`.
2. Menampilkan widget:
   - Bar chart: Error Categories (berapa banyak yang `konsep_relasi`, `sintaks_join`, dll.).
   - Daftar 5 Soal dengan tingkat kegagalan tertinggi (Tersulit).
   - Daftar mahasiswa yang mengalami percobaan `incorrect` lebih dari batas tertentu berturut-turut pada 1 soal (Butuh Perhatian).
3. Klik tombol **Ekspor CSV** untuk mengunduh rekap raw data.

---

## 3. Petunjuk Bertingkat (Hints)

Sistem dirancang untuk mendukung mahasiswa yang buntu tanpa langsung memberikan jawaban. Mahasiswa harus meminta hint dengan menekan tombol **Buka Petunjuk** (Tingkat 1, 2, lalu 3). Setiap pembukaan dicatat di `hints_used` dan `activity_events`.

### Level Hint dan Aturannya
- **Level 1: Pertanyaan pemandu**
  - Bertujuan menstimulasi pemikiran konseptual tentang apa yang diminta soal.
  - *Contoh*: "Data apa saja yang diminta untuk ditampilkan? Berasal dari entitas mana saja?"
- **Level 2: Menunjuk tabel/kolom kunci**
  - Menyebutkan spesifik nama tabel atau kolom yang harus direlasikan (FK-PK), namun belum memberitahu sintaks utuhnya.
  - *Contoh*: "Kamu perlu mengambil data dari tabel `mahasiswa` dan `jurusan`. Perhatikan kolom `id_jurusan` yang menghubungkan keduanya."
- **Level 3: Menunjuk struktur tanpa menulis query**
  - Memberikan kerangka kerja JOIN, klausa filter, atau bentuk operasional (misal agregat), tapi kolom dan referensi harus disesuaikan sendiri.
  - *Contoh*: "Gunakan `INNER JOIN` antara tabel mahasiswa dan jurusan. Setelah itu, tambahkan kondisi filter `WHERE` untuk prodi Informatika."

> **ATURAN MUTLAK**: **JANGAN PERNAH menampilkan expected_sql (kunci jawaban)** pada level petunjuk mana pun. Aplikasi harus menjamin bahwa mahasiswa yang menebak hanya terbantu dari sisi pancingan logika.

---

## 4. Aturan Soal Setara (EquivalentQuestionPicker)

Fitur soal setara (`setara/route.ts`) bertugas menemukan alternatif latihan dengan bobot materi yang identik, agar hafalan sintaks dapat dihindari, namun konsepnya tetap diuji.

1. **Syarat mutlak**: Soal kandidat harus berasal dari `variant_group_id` yang persis sama dengan soal asal.
2. **Prioritas Penyajian (berurutan)**:
   - Pilih secara acak dari soal di varian grup tersebut yang status progresnya masih **`not_started`** (belum pernah dicoba).
   - Jika semua sudah pernah dicoba, pilih dari yang statusnya **`attempted`** (pernah dicoba namun masih salah / belum *solved*).
   - Jika semua soal di varian grup tersebut sudah berstatus **`solved`**, maka sistem membatalkan pencarian dan API merespons dengan indikasi "Semua varian telah dituntaskan", yang di-handle frontend dengan menampilkan alert.
3. Soal asal (`current_question_id`) selalu dikecualikan dari daftar pencarian.
