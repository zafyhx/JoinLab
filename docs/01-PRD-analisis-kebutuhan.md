# 01. PRD dan Analisis Kebutuhan: JoinLab

> Dokumen ini adalah sumber kebenaran untuk **apa** yang dibangun dan **kenapa**.
> Dokumen lain (02 sampai 07 dan `AGENTS.md`) menjelaskan **bagaimana**.
> Kalau ada konflik antar dokumen, urutan prioritasnya: `AGENTS.md` > 01 > 04 > 03 > 02 > 05 > 06 > 07.

---

## 1. Ringkasan

**JoinLab** adalah platform latihan query SQL interaktif yang berfokus pada satu kesulitan spesifik: **JOIN antar tabel**. Mahasiswa menulis query di editor, query dijalankan di sandbox MySQL yang aman, lalu sistem memberi feedback terhadap **logika** query (bukan hanya benar atau salah) memakai aturan deteksi (rule-based), tanpa AI.

| Item | Keputusan |
|---|---|
| Nama proyek | JoinLab (nama kerja, boleh diganti) |
| Jenis | Aplikasi web, prototipe fungsional untuk tugas kuliah |
| Pengguna | Mahasiswa (pelaku latihan), dosen atau asisten (pengelola soal dan pemantau) |
| Bahasa UI | Indonesia |
| Bahasa kode, nama tabel aplikasi, nama variabel | Inggris |
| Bahasa data sandbox (nama tabel dan kolom soal) | Indonesia, supaya dekat dengan konteks mahasiswa |
| Stack | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Monaco Editor / CodeMirror, Lucide React, Drizzle ORM, MySQL |
| Feedback | Rule-based. AI hanya disebut sebagai pengembangan lanjutan |

---

## 2. Hasil analisis modul (dari materi PPTX "Modul 3: Analisis Kebutuhan JOIN SQL")

Modul memakai alur **Problem → User → Context → Cause → Need → Solution** dengan prinsip **"Problem First, Solution Later"**.

| Tahap | Temuan dari modul | Implikasi untuk produk |
|---|---|---|
| **Problem** | Mahasiswa lancar query satu tabel, tetapi sering salah saat JOIN. Query sering tetap jalan tanpa error, namun hasilnya salah secara logika (misalnya cartesian product). | Sistem tidak boleh hanya mengecek ada error atau tidak. Harus membandingkan **hasil** dan mendiagnosis **penyebab logika**. |
| **User** | Mahasiswa praktikum basis data. Pendamping: dosen dan asisten. | Dua peran: `student` dan `instructor`. |
| **Context** | Laptop pribadi dengan XAMPP dan MySQL Workbench, spesifikasi terbatas (slide 5). | Aplikasi ringan, berbasis MySQL, tanpa dependensi berat. Tidak ada fitur AI atau layanan eksternal yang wajib. |
| **Cause** | Latihan sedikit dan mirip contoh dosen. Tidak sadar kapan soal butuh JOIN. Sulit membayangkan relasi atau ERD. Feedback baru datang saat asistensi atau nilai keluar. | Bank soal bervariasi, ERD per soal, feedback instan. |
| **Need** | Soal bertingkat (2 tabel sampai banyak tabel) dengan skema bervariasi. Visualisasi relasi. Feedback terhadap logika. Bisa coba lagi di soal setara. | Menjadi dasar daftar fitur MVP (lihat bagian 7). |
| **Solution** | Platform latihan query interaktif (utama). Pendukung: bank soal bertingkat dan asistensi terjadwal. | JoinLab adalah solusi utama. Asistensi terjadwal berada di luar aplikasi. |

### Dua catatan penting dari modul

1. **Slide 12 menegaskan solusi "bukan otomatis AI".** Maka mesin feedback dibuat rule-based: deteksi cartesian product, syarat JOIN hilang, tipe JOIN keliru, perbandingan hasil dengan kunci jawaban.
2. **Slide 9 mengakui belum jelas** apakah akar masalah ada di **konsep ERD** atau di **sintaks JOIN**. Maka setiap kesalahan diberi **kategori** dan dicatat, supaya pertanyaan itu bisa dijawab dengan data dari penggunaan nyata (lihat bagian 3 dan fitur analitik).

### Catatan kualitas materi (perlu dilengkapi di laporan, bukan di aplikasi)

- Slide 3 menyebut nilai praktikum JOIN "cenderung lebih rendah" tetapi belum ada angka. Sebaiknya dilengkapi data nyata (misalnya rata-rata nilai modul JOIN dibanding modul lain) sebelum dipresentasikan.
- Referensi di slide 13 (Taipalus dkk. 2018, Taipalus dan Seppänen 2020, Miedema dkk. 2021) diteruskan apa adanya. Detail sitasi dan DOI **harus dicek ulang** sebelum masuk laporan. Referensi nomor 2 belum memiliki DOI.

---

## 3. Hipotesis yang akan diuji lewat data aplikasi

| Kode | Hipotesis | Cara aplikasi menjawabnya |
|---|---|---|
| H1 | Kesalahan terbanyak berasal dari **pemahaman relasi atau ERD** (salah memilih tabel atau kunci). | Distribusi kategori kesalahan `konsep_relasi` dibanding kategori lain. |
| H2 | Kesalahan terbanyak berasal dari **sintaks atau penulisan JOIN** (ON hilang, ambigu, alias). | Distribusi kategori `sintaks_join` dan `sintaks_umum`. |
| H3 | Kesalahan terbanyak adalah **logika hasil** (tipe JOIN keliru, filter salah tempat, duplikasi). | Distribusi kategori `logika_hasil`. |
| H4 | Mahasiswa yang membuka ERD lebih sering benar pada percobaan pertama. | Korelasi event `erd_opened` dengan hasil percobaan pertama. |
| H5 | Mengerjakan **soal setara** setelah gagal meningkatkan peluang benar. | Persentase benar pada soal setara setelah soal asal gagal. |

> Aplikasi **tidak** menyimpulkan apa pun secara otomatis. Aplikasi hanya menyajikan angka dan grafik sederhana di panel analitik dosen.

---

## 4. Tujuan dan indikator keberhasilan

### Tujuan produk
1. Memberi latihan JOIN yang bertingkat dan bervariasi secara mandiri.
2. Memberi feedback instan yang menjelaskan **mengapa** query salah, bukan sekadar "salah".
3. Membantu mahasiswa membayangkan relasi antar tabel lewat ERD otomatis.
4. Memberi dosen atau asisten gambaran pola kesalahan kelas.

### Indikator keberhasilan untuk demo tugas kuliah
| # | Indikator | Cara verifikasi |
|---|---|---|
| 1 | 30 soal seed berjalan, setiap kunci jawaban menghasilkan data bukan kosong. | Test otomatis `QuestionBankIntegrityTest`. |
| 2 | Mesin feedback mendeteksi minimal 12 pola kesalahan dengan test per pola. | Test otomatis per detector. |
| 3 | Query berbahaya (non-SELECT, multi statement, SLEEP, akses skema lain) selalu ditolak. | Test otomatis `SqlGuardTest` dan uji manual. |
| 4 | Alur lengkap mahasiswa bisa didemokan tanpa error: login, pilih soal, jalankan, periksa, baca feedback, minta petunjuk, coba soal setara, lihat progres. | Skenario demo di dokumen 07. |
| 5 | Alur dosen bisa didemokan: tambah soal, preview, publish, lihat analitik pola kesalahan. | Skenario demo di dokumen 07. |
| 6 | Tampilan rapi di lebar 375px dan 1440px. | Verifikasi screenshot oleh agent. |

### Metrik belajar yang dikumpulkan (tanpa target angka, karena belum ada baseline)
- Persentase benar pada percobaan pertama per soal dan per level.
- Rata-rata jumlah percobaan sampai benar.
- Distribusi kategori dan kode kesalahan.
- Persentase keberhasilan pada soal setara setelah gagal.
- Penggunaan ERD dan petunjuk.

---

## 5. Di luar cakupan (non-goals)

- Fitur AI atau LLM dalam bentuk apa pun (hanya dicatat sebagai pengembangan lanjutan).
- Query selain `SELECT` (tidak ada `INSERT`, `UPDATE`, `DELETE`, DDL).
- Integrasi LMS, SSO kampus, atau import data mahasiswa massal.
- Kompetisi, leaderboard, atau gamifikasi berat.
- Mode gelap (token warna disiapkan, tetapi implementasi bukan bagian MVP).
- Dukungan database selain MySQL.
- Aplikasi mobile native.

---

## 6. Persona

### Rani, mahasiswa semester 3
- Nyaman dengan `SELECT ... WHERE` satu tabel.
- Bingung menentukan tabel mana yang harus di-JOIN dan kolom mana yang disamakan.
- Sering panik saat hasil query "kok jadi ribuan baris".
- Mengerjakan di laptop dengan RAM terbatas dan koneksi kampus yang kadang lambat.
- Butuh: petunjuk bertahap, gambaran relasi, dan kesempatan mencoba lagi tanpa malu.

### Pak Dimas, dosen pengampu (atau asisten praktikum)
- Mengampu puluhan mahasiswa dan tidak sempat memeriksa semua latihan satu per satu.
- Ingin tahu soal mana yang paling sering gagal dan jenis kesalahan apa yang dominan.
- Ingin menambah atau mengubah soal tanpa menyentuh kode.
- Butuh: panel sederhana untuk kelola soal dan analitik kesalahan.

---

## 7. Pemetaan kebutuhan ke fitur (traceability)

| Kebutuhan (dari modul) | Fitur MVP | ID |
|---|---|---|
| Soal bertingkat 2 tabel ke banyak tabel | Bank soal 3 level | F-02 |
| Skema bervariasi | 3 skema sandbox (akademik, toko, perpustakaan) | F-02, F-03 |
| Visualisasi relasi | ERD otomatis per soal | F-05 |
| Feedback terhadap logika | Mesin diagnosis rule-based | F-06 |
| Bisa coba lagi di soal setara | Tombol "Coba soal setara" | F-07 |
| Feedback cepat, tidak menunggu asistensi | Hasil dan feedback instan | F-04, F-06 |
| Mengetahui akar masalah (slide 9) | Kategori kesalahan dan analitik | F-10 |
| Pemantauan progres | Riwayat dan progres | F-08 |
| Pengelolaan soal oleh dosen | Panel admin soal | F-09 |
| Akses oleh dua peran | Login dua peran | F-01 |

Detail setiap fitur ada di `04-fitur-dan-user-flow.md`.

---

## 8. Kebutuhan fungsional

Prioritas: **M** = Must (wajib MVP), **S** = Should (diusahakan), **C** = Could (jika sisa waktu).

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Pengguna dapat mendaftar sebagai mahasiswa, login, dan logout. Akun dosen dibuat lewat seeder atau perintah artisan. | M |
| FR-02 | Hak akses dibedakan per peran. Mahasiswa tidak bisa membuka panel dosen. | M |
| FR-03 | Mahasiswa dapat melihat daftar skema, level, dan soal beserta status (belum, dicoba, benar). | M |
| FR-04 | Halaman soal menampilkan deskripsi, ERD skema, editor SQL, tombol jalankan dan periksa. | M |
| FR-05 | Query dijalankan di sandbox MySQL terpisah dengan user read-only, hanya `SELECT`, ada timeout dan batas baris. | M |
| FR-06 | Tombol **Jalankan** menampilkan hasil tanpa menilai. Tombol **Periksa jawaban** menilai dan mencatat percobaan. | M |
| FR-07 | Sistem membandingkan hasil query dengan hasil kunci jawaban (tanpa peduli urutan baris kecuali soal meminta urutan). | M |
| FR-08 | Sistem mendiagnosis penyebab kesalahan memakai detector berbasis aturan dan menampilkan penjelasan. | M |
| FR-09 | Petunjuk bertingkat (3 tingkat) yang dibuka atas permintaan mahasiswa. | M |
| FR-10 | ERD digambar otomatis dari metadata skema, dengan penanda PK dan FK. | M |
| FR-11 | Tombol **Coba soal setara** memberi soal lain dengan level dan konsep sama. | M |
| FR-12 | Riwayat percobaan per soal (query, waktu, status, kode kesalahan). | M |
| FR-13 | Halaman progres: persentase selesai per skema dan level, soal yang perlu diulang. | M |
| FR-14 | Dosen dapat membuat, mengubah, mempublikasikan, dan menyembunyikan soal. Preview menjalankan kunci jawaban. | M |
| FR-15 | Dosen melihat analitik: kode kesalahan terbanyak, kategori kesalahan, soal tersulit, daftar mahasiswa yang perlu perhatian. | M |
| FR-16 | Ekspor CSV rekap percobaan. | S |
| FR-17 | Level terkunci sampai level sebelumnya cukup dikerjakan (dapat diaktifkan lewat konfigurasi, default mati). | S |
| FR-18 | Pintasan keyboard: `Ctrl+Enter` untuk jalankan. | S |
| FR-19 | Pencarian dan filter soal di panel dosen. | C |

## 9. Kebutuhan non-fungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-01 | Keamanan | Sandbox memakai user MySQL read-only yang hanya punya hak `SELECT` pada database sandbox. Validasi di aplikasi hanyalah lapisan tambahan, pertahanan utama ada di hak akses database. |
| NFR-02 | Keamanan | Semua input tervalidasi di server. Perlindungan CSRF, password di-hash, throttle pada endpoint jalankan dan periksa. |
| NFR-03 | Kinerja | Timeout eksekusi query 3 detik. Tampilan hasil maksimal 100 baris. Batas pengambilan baris untuk pembandingan 5000. |
| NFR-04 | Kinerja | Halaman utama dan halaman soal termuat di bawah 2 detik pada laptop spesifikasi terbatas dan jaringan biasa. |
| NFR-05 | Keandalan | Kegagalan sandbox tidak merusak database aplikasi. Pesan error jelas dan tidak membocorkan detail internal. |
| NFR-06 | Kegunaan | UI berbahasa Indonesia natural. Responsif dari 375px sampai 1440px. |
| NFR-07 | Aksesibilitas | Fokus keyboard terlihat, kontras warna memadai, status feedback diumumkan lewat `aria-live`. |
| NFR-08 | Keterpeliharaan | Struktur kode berlapis (lihat dokumen 02), test otomatis untuk SQL guard, executor, comparator, dan detector. |
| NFR-09 | Portabilitas | Bisa dijalankan lokal di Laravel Herd dan di Docker Compose untuk deployment. |
| NFR-10 | Privasi | Hanya menyimpan data yang dibutuhkan: nama, email, identitas opsional (NIM), query, dan hasil percobaan. |

---

## 10. Asumsi, batasan, dan risiko

### Asumsi
- Pengguna utama adalah satu kelas praktikum (puluhan mahasiswa), bukan ribuan.
- Data sandbox kecil (puluhan sampai ratusan baris per tabel) dan dibuat deterministik.
- Mahasiswa mengakses lewat browser modern di laptop atau ponsel.

### Batasan
- Mesin feedback berbasis aturan, sehingga tidak bisa memahami maksud semua query. Untuk query di luar pola yang dikenal, sistem tetap memberi diff hasil dan petunjuk umum.
- Parser SQL pihak ketiga tidak selalu sanggup mengurai semua sintaks. Detector statis harus gagal dengan aman (tidak melempar error ke pengguna).

### Risiko dan mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Query berbahaya lolos ke sandbox | Tinggi | Hak akses database minimal, validator, timeout, test keamanan. |
| Query berat membuat server lambat | Sedang | `MAX_EXECUTION_TIME`, batas baris, throttle, koneksi dibatasi. |
| Detector memberi diagnosis keliru | Sedang | Tampilkan diagnosis sebagai "kemungkinan penyebab", sertakan bukti (jumlah baris, tabel), test per detector. |
| Dua jawaban benar dengan bentuk berbeda dianggap salah | Sedang | Pembandingan berbasis **hasil** bukan teks query. |
| Kunci jawaban tidak unik atau ambigu | Sedang | Soal dirancang dengan kolom keluaran eksplisit. Test integritas bank soal. |
| Waktu pengerjaan tugas terbatas | Sedang | Prioritas M dikerjakan dulu, S dan C opsional. |

---

## 11. Keputusan yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Tujuan akhir | Tugas kuliah, MVP fungsional untuk demo |
| Ruang lingkup | Seperti bagian 7 dan 8 |
| Feedback | Rule-based. AI hanya pengembangan lanjutan |
| Eksekusi query | Sandbox MySQL terpisah, user read-only, hanya `SELECT`, timeout, batas baris |
| Stack | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Shadcn UI + Lucide React |
| ERD | Otomatis dari metadata skema, digambar sebagai SVG / React Flow |
| Data soal | 3 skema, 3 level, 30 soal (15 template, masing-masing 2 varian), dirancang di dokumen 06 |
| Deployment | Pengembangan dan demo lokal (Node.js + MySQL). Deployment online via Docker Compose di VPS (detail di dokumen 02) |
| Dokumen | 8 file, UI Indonesia, kode Inggris |
| Agent | Implementation plan dulu, tanya sebelum perintah destruktif, verifikasi UI di 375px dan 1440px, memakai skills ECC lokal |

---

## 12. Pengembangan lanjutan (tidak dikerjakan di MVP)

- Penjelasan tambahan berbasis AI sebagai opsi, dengan batasan: tidak mengganti mesin aturan dan tidak membocorkan kunci jawaban.
- Mode dark.
- Level terkunci dan lencana pencapaian.
- Soal bertipe "temukan kesalahan pada query ini".
- Dukungan `RIGHT JOIN`, `UNION`, dan subquery terkorelasi pada soal.
- Impor data mahasiswa lewat CSV.

---

## 13. Glosarium

| Istilah | Arti |
|---|---|
| JOIN | Menggabungkan baris dari dua tabel atau lebih berdasarkan syarat tertentu. |
| Cartesian product | Hasil gabungan tanpa syarat, setiap baris tabel A dipasangkan dengan setiap baris tabel B. |
| ERD | Entity Relationship Diagram, gambar tabel dan relasinya. |
| PK / FK | Primary key / foreign key. |
| Sandbox | Database terpisah dan terbatas tempat query mahasiswa dijalankan. |
| Kunci jawaban | Query acuan yang hasilnya dipakai sebagai pembanding. |
| Soal setara | Soal lain dengan level, struktur JOIN, dan konsep yang sama tetapi data atau entitas berbeda. |
| Detector | Aturan yang mendeteksi satu pola kesalahan tertentu. |
| Fan-out | Baris hasil membengkak karena JOIN ke tabel yang relasinya satu-ke-banyak. |

## 14. Referensi (diteruskan dari slide 13, wajib diverifikasi)

1. Taipalus dkk. (2018), tentang kesalahan query SQL oleh mahasiswa.
2. Taipalus dan Seppänen (2020), belum ada DOI di slide.
3. Miedema dkk. (2021), tentang kesalahan SQL dan pembelajaran.

Penulisan lengkap (judul, jurnal, DOI) harus dilengkapi dari sumber aslinya, jangan mengandalkan dokumen ini.
