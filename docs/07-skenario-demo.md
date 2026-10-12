# 07. Skenario Demo Lengkap: JoinLab

Dokumen ini berisi panduan dan skenario demo lengkap untuk presentasi tugas kuliah JoinLab. Skenario dirancang untuk menunjukkan fitur-fitur utama platform, membuktikan bahwa indikator keberhasilan tercapai, dan mendemonstrasikan mesin feedback berbasis aturan.

---

## 1. Persiapan Demo

Sebelum memulai presentasi atau demo, pastikan hal-hal berikut sudah disiapkan:

### Checklist Sebelum Demo
- [ ] **Database Ready**: Pastikan database aplikasi (`joinlab_app`) dan database sandbox (`sb_akademik`, `sb_toko`, `sb_perpustakaan`) sudah berjalan.
- [ ] **Seed Data**: Jalankan perintah seed untuk memasukkan data awal, akun demo, dan sinkronisasi metadata:
  ```bash
  npm run db:sandbox-rebuild
  npx drizzle-kit push
  npm run db:seed
  npm run db:sync-metadata
  npm run db:refresh-expected
  ```
- [ ] **Akun Demo**:
  - Akun Mahasiswa (`student`): `mahasiswa@joinlab.test`
  - Akun Dosen/Instruktur (`instructor`): `dosen@joinlab.test`
  - Password (sesuai seed atau `.env` lokal).
- [ ] **Browser**: Buka Google Chrome atau Firefox. Siapkan dua window/tab:
  - Lebar 1440px (desktop) untuk tampilan utama.
  - Lebar 375px (mobile - via DevTools) untuk demonstrasi responsivitas.

---

## 2. Skenario A: Alur Mahasiswa

**Durasi target:** ~10 menit

Skenario ini mendemonstrasikan pengalaman mahasiswa dalam mengerjakan soal, melihat ERD, dan menerima feedback instan dari mesin diagnosis.

### A1: Pendaftaran dan Login
- Buka landing page aplikasi JoinLab.
- Klik tombol **Daftar** (atau login jika sudah ada akun mahasiswa).
- Isi form pendaftaran (jika mendemokan daftar baru) atau login menggunakan `mahasiswa@joinlab.test`.
- Setelah berhasil, sistem akan meredirect mahasiswa ke halaman **Dashboard**.

### A2: Navigasi Dashboard
- Di halaman Dashboard, tunjukkan sekilas **progres ringkas** mahasiswa.
- Navigasi ke daftar skema latihan dan klik pada skema **Akademik**.

### A3: Memilih Soal
- Tunjukkan daftar soal untuk skema Akademik.
- Perlihatkan *badge* status soal (misal: "Belum Dikerjakan").
- Pilih soal **Level 1** (misalnya `AK-1A`).

### A4: Workspace Soal (Skenario Jawaban Benar)
- **Baca deskripsi:** Tunjukkan area deskripsi (prompt) soal.
- **Lihat ERD:** Tunjukkan fitur ERD otomatis. Hover pada garis relasi untuk menunjukkan tabel yang terhubung dan identifikasi FK (Foreign Key) serta PK (Primary Key).
- **Tulis query BENAR:** Di editor SQL (Monaco), ketik query yang benar. Contoh (sesuai soal):
  ```sql
  SELECT m.nim, m.nama_mhs, j.nama_jurusan
  FROM mahasiswa m
  JOIN jurusan j ON m.id_jurusan = j.id_jurusan;
  ```
- Klik **Jalankan** untuk melihat hasil preview data (maksimal 100 baris).
- Klik **Periksa Jawaban**.
- **Hasil:** Sistem menampilkan feedback hijau "Benar!".
- Tunjukkan munculnya tombol **Soal Berikutnya** dan **Coba Soal Setara**.

### A5: Kesalahan Logika (Cartesian Product)
- Kembali ke soal Level 1 tadi (atau soal lain di level yang sama), dan buat percobaan baru dengan query **SALAH**.
- **Tulis query SALAH (tanpa `ON`):**
  ```sql
  SELECT m.nim, m.nama_mhs, j.nama_jurusan
  FROM mahasiswa m
  JOIN jurusan j;
  ```
- Klik **Periksa Jawaban**.
- **Hasil:** Sistem menolak jawaban dan menampilkan feedback berisi *finding* E01 (Syarat JOIN hilang) dan E02 (Cartesian product / Hasil terlalu besar).
- Baca penjelasan feedback. Klik tombol **"Butuh petunjuk?"** untuk membuka *hint* level 1, lalu klik lagi untuk *hint* level 2.
- **Perbaiki query** sesuai petunjuk dengan menambahkan klausa `ON`.
- Klik **Periksa Jawaban** lagi → Muncul indikator Benar!

### A6: Kesalahan Tipe JOIN (LEFT JOIN)
- Pindah ke soal **Level 2** yang membutuhkan `LEFT JOIN` (misalnya menampilkan semua mahasiswa beserta nilai, termasuk yang belum punya KRS).
- **Tulis query keliru (INNER JOIN):**
  ```sql
  SELECT m.nim, m.nama_mhs, k.nilai_angka
  FROM mahasiswa m
  JOIN krs k ON m.nim = k.nim;
  ```
- Klik **Periksa Jawaban**.
- **Hasil:** Muncul error E04 (Tipe JOIN keliru), karena *expected row count* lebih besar dan baris berisi mahasiswa tanpa KRS hilang.
- Gunakan petunjuk yang disediakan sistem.
- Perbaiki `JOIN` menjadi `LEFT JOIN`.
- Klik **Periksa Jawaban** → Benar!

### A7: Fitur Soal Setara
- Klik tombol **"Coba soal setara"**.
- Tunjukkan bahwa sistem mengarahkan mahasiswa ke soal varian B dari level dan konsep yang sama (membuktikan fitur `EquivalentQuestionPicker` berjalan).

### A8: Halaman Riwayat
- Buka halaman **Riwayat** dari navigasi utama.
- Tunjukkan daftar lengkap semua percobaan yang baru saja dilakukan, beserta status (`correct`, `incorrect`), *execution time*, dan kode kesalahan (jika ada).

### A9: Halaman Progres
- Buka halaman **Progres**.
- Perlihatkan *progress bar* penyelesaian per skema dan rekomendasi soal yang masih perlu diperbaiki.

### A10: Responsivitas Mobile
- Buka fitur DevTools browser dan ubah lebar layar menjadi **375px**.
- Tunjukkan bahwa layout tetap rapi, *workspace* menyesuaikan, dan *sidebar* berubah menjadi *hamburger menu*.

---

## 3. Skenario B: Alur Dosen

**Durasi target:** ~7 menit

Skenario ini mendemonstrasikan bagaimana dosen (atau asisten) mengelola bank soal dan memonitor analitik mahasiswa.

### B1: Login Dosen
- Logout dari akun mahasiswa.
- Login kembali menggunakan `dosen@joinlab.test`.
- Sistem akan mengarahkan ke panel khusus Dosen.

### B2: Halaman Kelola Soal
- Masuk ke menu **Kelola Soal**.
- Tunjukkan daftar soal yang tersedia dan demonstrasikan fitur *filter* (misalnya berdasarkan skema "Akademik" atau "Level").

### B3: Tambah Soal Baru
- Klik tombol **Tambah Soal**.
- Isi form penambahan soal:
  - **Judul:** Mahasiswa dan Mata Kuliah
  - **Prompt:** Tampilkan daftar mahasiswa beserta nama mata kuliah yang diambil.
  - **Skema:** Akademik
  - **Level:** 2
  - **Expected SQL (Kunci Jawaban):**
    ```sql
    SELECT m.nama_mhs, mk.nama_mk
    FROM mahasiswa m
    JOIN krs k ON m.nim = k.nim
    JOIN mata_kuliah mk ON k.kode_mk = mk.kode_mk;
    ```
  - **Hints:** Isi 3 tingkat petunjuk.
- Klik tombol **Preview Kunci Jawaban** untuk mengeksekusi `expected_sql` terhadap database sandbox.
- Tunjukkan bahwa tabel hasil *preview* berhasil muncul.
- Klik **Simpan**.

### B4: Publikasi Soal
- Kembali ke daftar soal.
- Tunjukkan cara mempublikasikan soal dengan mengubah *toggle* `is_published` pada soal yang baru dibuat agar dapat dilihat mahasiswa.

### B5: Analitik Dosen
- Buka menu **Analitik**.
- Tunjukkan grafik dan ringkasan data:
  - **Distribusi kode kesalahan**: Bar chart yang menampilkan frekuensi error (misal E01, E02, E04).
  - **Soal tersulit**: Daftar soal dengan *success rate* terendah berdasarkan percobaan mahasiswa pertama kali.
  - **Kategori kesalahan dominan**: Grafik *pie* atau persentase kategori dominan (menjawab *Cause* dari analisis kebutuhan).

### B6: Daftar Mahasiswa & Progres
- Buka menu **Daftar Mahasiswa**.
- Tunjukkan tabel daftar mahasiswa beserta metrik progres mereka (jumlah soal selesai, rata-rata percobaan).

### B7: Ekspor CSV
- Klik tombol **Ekspor CSV**.
- Buka file CSV yang terunduh secara sekilas untuk membuktikan bahwa rekap riwayat percobaan dapat diekspor untuk keperluan rekap nilai.

---

## 4. Skenario C: Keamanan

**Durasi target:** ~3 menit

Skenario ini membuktikan isolasi *sandbox* dan keamanan database.

### C1: Mencegah Query DDL/DML (SqlGuard & Read-Only Sandbox)
- (Bisa dilakukan dari *workspace* mahasiswa atau *preview* dosen).
- Tulis query berbahaya:
  ```sql
  DROP TABLE mahasiswa;
  ```
- Klik **Jalankan**.
- **Hasil:** Query ditolak di level aplikasi oleh `SqlGuard`. (Bahkan jika lolos, user `joinlab_ro` tidak memiliki hak *drop*).

### C2: Mencegah Multi-Statement
- Tulis query:
  ```sql
  SELECT 1; DELETE FROM mahasiswa;
  ```
- Klik **Jalankan**.
- **Hasil:** Ditolak oleh detector aplikasi.

### C3: Mencegah Fungsi Berbahaya
- Tulis query:
  ```sql
  SELECT SLEEP(10);
  ```
- Klik **Jalankan**.
- **Hasil:** Ditolak oleh `SqlGuard` (atau akan *timeout* setelah 3 detik berdasarkan pengaturan PDO `MAX_EXECUTION_TIME`).

### C4: Authorization
- Login kembali sebagai mahasiswa.
- Paksa ubah URL di browser ke `/dosen`.
- **Hasil:** Sistem melakukan *redirect* kembali ke dashboard atau menampilkan halaman 403 (Forbidden), membuktikan *Role-Based Authorization* berjalan.

---

## 5. Poin-Poin Penting untuk Disampaikan Saat Demo

Saat presentasi, pastikan untuk menyoroti poin-poin verbal berikut ke audiens (dosen penguji/penilai):

- **Bukan AI:** "Platform ini memberikan feedback yang detail mengenai kesalahan logika (seperti kurangnya syarat JOIN atau salah tipe JOIN) murni menggunakan rule-based detector dari parser AST, bukan dengan LLM atau AI. Ini menjamin feedback akurat tanpa *hallucination*."
- **Sandbox Terisolasi:** "Query yang dijalankan pengguna langsung dieksekusi di database, namun sangat aman karena menggunakan koneksi terpisah ke database sandbox dengan user read-only yang terbatas hak akses dan waktunya (timeout)."
- **Evaluasi Berbasis Hasil:** "Sistem menilai kebenaran query dari dataset yang dikembalikan, bukan mencocokkan string query. Jadi, jika mahasiswa menggunakan ALIAS berbeda atau urutan `WHERE` berbeda, selama dataset hasilnya persis, jawaban akan dianggap benar."
- **20 Detector Kesalahan:** "Kami telah memetakan kesalahan umum mahasiswa ke dalam 20 detektor yang dapat menangkap mulai dari syntax error dasar hingga fan-out (agregat membengkak) atau duplikasi baris."
- **Visualisasi ERD:** "ERD yang tampil tidak digambar manual sebagai gambar statis, melainkan ditarik langsung dari metadata skema (*INFORMATION_SCHEMA*) di database sandbox dan dirender dinamis."

---

## 6. Troubleshooting Saat Demo (Langkah Darurat)

Jika terjadi masalah teknis saat demo berlangsung, berikut adalah langkah cepat untuk mitigasi:

- **Database / Data tidak muncul:**
  Buka terminal baru di root proyek dan jalankan ulang seed.
  ```bash
  npm run db:sandbox-rebuild
  ```
- **Port konflik (misal 3000 sudah terpakai):**
  Ubah konfigurasi port di file `.env` atau jalankan Next.js di port lain.
  ```bash
  npm run dev -- -p 3001
  ```
- **Tampilan rusak / State tersangkut:**
  Lakukan *Hard Refresh* (Ctrl+F5 atau Cmd+Shift+R) pada browser atau coba *Clear Cache/Cookies*.
- **Timeout query terlalu cepat:**
  Jika sedang berada di jaringan lokal yang lambat atau server lambat, edit `.env` untuk menambah `SANDBOX_TIMEOUT_MS=5000`.
