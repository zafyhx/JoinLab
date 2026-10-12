# Analisis Keseluruhan PPTX
## Modul 3 — Analisis Kebutuhan Awal Software Edukasi
### Studi Kasus: Kesulitan Mahasiswa Menyusun Query JOIN pada Praktikum Basis Data Relasional

> **Sumber utama analisis:** PPTX berjudul **“MODUL 3 — VERSI ALTERNATIF: Analisis Kebutuhan Awal Software Edukasi”** yang disusun oleh Alifian Sultan Basundara, Bagus Satyo Nugroho, dan Ridwan Hakim Mashadi untuk mata kuliah Pengembangan Software Edukasi, Pendidikan Teknik Informatika dan Komputer FKIP Universitas Sebelas Maret, 2026.

---

## 1. Ringkasan Eksekutif

PPTX ini membahas **analisis kebutuhan awal software edukasi** dengan studi kasus kesulitan mahasiswa semester awal dalam menyusun query SQL yang melibatkan `JOIN` pada praktikum Sistem Basis Data. Gagasan utama materi adalah bahwa pengembangan software edukasi harus dimulai dari **masalah pembelajaran yang nyata**, kemudian mengidentifikasi pengguna, konteks, penyebab, kebutuhan, dan baru setelah itu menentukan solusi teknologi.

Permasalahan utama yang diangkat bukan sekadar mahasiswa mengalami kesalahan sintaks SQL. Materi menekankan adanya **kesalahan logika** yang dapat terjadi ketika query tetap berhasil dieksekusi tetapi menghasilkan data yang salah atau menyesatkan. Contoh yang disebutkan adalah hasil data yang berlipat ganda akibat *cartesian product*. Dengan demikian, masalah yang hendak diselesaikan berada pada kemampuan mahasiswa dalam memahami relasi antar tabel, mengenali kapan `JOIN` dibutuhkan, dan menyusun query berdasarkan struktur data, bukan sekadar menghafal pola sintaks.

PPTX kemudian mengidentifikasi pengguna utama, karakteristik pengguna, konteks pembelajaran, penyebab dan dampak masalah, kebutuhan pengguna dan kebutuhan pembelajaran, serta informasi yang masih harus dikumpulkan sebelum menentukan bentuk software. Dari proses tersebut, kelompok mempertimbangkan beberapa alternatif solusi, yaitu **platform latihan query interaktif**, **asistensi tambahan**, serta **bank soal JOIN bertingkat yang dipadukan dengan diskusi kelompok**.

Kesimpulan materi adalah bahwa software edukasi **layak dipertimbangkan**, terutama karena kebutuhan latihan bertahap, visualisasi relasi tabel, dan umpan balik logika dapat didukung oleh sarana yang bisa diakses kapan saja. Namun, software baru bukan satu-satunya solusi. Bank soal berjenjang dan diskusi kelompok dapat menjadi langkah awal. Begitu juga, penggunaan AI tidak otomatis menjadi pilihan hanya karena teknologi tersebut sedang populer. Prinsip yang digunakan sepanjang analisis adalah **“Problem First, Solution Later.”**

---

## 2. Identitas dan Struktur Materi

### Identitas PPTX

- Judul: **MODUL 3 — VERSI ALTERNATIF**
- Tema: **Analisis Kebutuhan Awal Software Edukasi**
- Studi kasus: **Kesulitan Mahasiswa Menyusun Query JOIN pada Praktikum Basis Data Relasional**
- Mata kuliah: **Pengembangan Software Edukasi**
- Dosen pembimbing: **Slamet Kurniawan Fahrurozi, S.Pd., M.Pd.**
- Penyusun:
  - Alifian Sultan Basundara (K3523010)
  - Bagus Satyo Nugroho (K3523022)
  - Ridwan Hakim Mashadi (K3523066)
- Institusi: **Pendidikan Teknik Informatika dan Komputer, FKIP, Universitas Sebelas Maret**
- Tahun: **2026**

### Struktur alur materi

PPTX terdiri atas **13 slide** yang membangun argumentasi secara berurutan:

1. Identitas materi dan studi kasus
2. Latar belakang masalah dan pertanyaan kunci
3. Identifikasi masalah dan bukti
4. Pengguna dan karakteristik pengguna
5. Konteks pembelajaran
6. Penyebab dan dampak
7. Kebutuhan pengguna dan kebutuhan pembelajaran
8. Kerangka analisis kelompok
9. Informasi yang masih perlu dikumpulkan
10. Alternatif solusi
11. Rumusan akhir
12. Kesimpulan
13. Referensi

Secara konseptual, urutan ini membentuk rantai:

**Problem → User → Context → Cause → Need → Solution**

Rantai tersebut menjadi kerangka utama dalam menghindari kesalahan *solution-first*, yaitu menentukan teknologi terlebih dahulu sebelum memahami kebutuhan sebenarnya.

---

# 3. Analisis Slide per Slide

## Slide 1 — Pembuka dan Identitas

Slide pertama memperkenalkan topik **Analisis Kebutuhan Awal Software Edukasi** melalui studi kasus kesulitan mahasiswa menyusun query `JOIN`.

Fokus studi kasus langsung diarahkan pada konteks pendidikan, bukan pada pengembangan software secara teknis. Hal ini penting karena tujuan modul adalah menganalisis kebutuhan sebelum memasuki tahap perancangan atau implementasi sistem.

### Makna utama

Studi kasus memosisikan **kesulitan mahasiswa dalam pembelajaran SQL** sebagai *problem domain*. Software hanya ditempatkan sebagai kemungkinan solusi yang akan dipertimbangkan setelah kebutuhan ditemukan.

---

## Slide 2 — Latar Belakang Masalah dan Pertanyaan Kunci

PPTX menjelaskan bahwa mahasiswa semester awal umumnya sudah mampu menulis query `SELECT` sederhana dari satu tabel. Kesulitan mulai muncul ketika soal membutuhkan data dari dua tabel atau lebih menggunakan `JOIN`.

Beberapa bentuk kesulitan yang disebutkan:

- mahasiswa menentukan kondisi penggabungan secara asal
- mahasiswa lupa syarat relasi antar tabel
- mahasiswa tidak menyadari bahwa soal membutuhkan `JOIN`
- query dapat berjalan tanpa error
- hasil query dapat tetap salah secara logika
- data dapat berlipat ganda akibat *cartesian product*

### Persoalan penting yang diangkat

Asisten praktikum mengusulkan pembangunan aplikasi belajar SQL berbasis AI yang dapat mengoreksi query mahasiswa. PPTX kemudian mempertanyakan apakah gagasan tersebut sudah didasarkan pada analisis kebutuhan yang kuat.

Jawaban yang diberikan adalah **belum**.

Alasan utamanya:

> **AI merupakan bentuk teknologi, bukan kebutuhan.**

Dengan kata lain, mahasiswa tidak secara langsung membutuhkan “AI”. Mereka membutuhkan dukungan untuk mengatasi kesulitan belajar tertentu. Teknologi harus dipilih setelah kebutuhan tersebut jelas.

### Prinsip utama

**Problem First, Solution Later**

Prinsip ini menjadi fondasi seluruh analisis dalam PPTX.

---

## Slide 3 — Identifikasi Masalah dan Bukti

### Masalah pembelajaran

Masalah dirumuskan secara spesifik:

> Mahasiswa mampu menulis query dasar dari satu tabel, tetapi kesulitan menyusun query yang melibatkan penggabungan (`JOIN`) dua tabel atau lebih ketika soal berbeda dari contoh di kelas.

Rumusan ini menunjukkan bahwa masalah bukan sekadar “tidak bisa SQL”. Masalah lebih spesifik pada **transfer kemampuan dari contoh yang sudah dikenal ke skenario baru**.

### Bukti atau indikasi

PPTX menyebutkan dua indikasi:

1. Nilai praktikum pada topik `JOIN` cenderung lebih rendah dibanding topik query dasar.
2. Mahasiswa sering menggunakan kondisi `WHERE` secara keliru sebagai pengganti syarat `JOIN`, sehingga query salah secara logika walaupun tidak menghasilkan error sintaks.

### Konteks riset yang digunakan PPTX

Materi mengaitkan masalah tersebut dengan penelitian Taipalus, Siponen, dan Vartiainen (2018). Dalam PPTX disebutkan bahwa **error logis dan “komplikasi”** lebih sering muncul dan lebih bertahan hingga jawaban akhir dibanding error sintaks.

PPTX juga mengacu pada Miedema, Aivaloglou, dan Fletcher (2021), yang melalui studi *think-aloud* menemukan bahwa sebagian mahasiswa pemula bahkan **tidak menyadari bahwa soal yang mereka kerjakan membutuhkan `JOIN`**.

### Inti analisis

Masalah mahasiswa berada pada lebih dari satu lapisan:

- **Lapisan konseptual:** memahami hubungan antar tabel
- **Lapisan pengenalan masalah:** mengenali kapan `JOIN` diperlukan
- **Lapisan implementasi query:** menuliskan kondisi `JOIN` dengan benar
- **Lapisan evaluasi hasil:** memahami apakah hasil query benar secara logika

---

## Slide 4 — Pengguna dan Karakteristik

### Pengguna utama

Pengguna utama didefinisikan sebagai:

**Mahasiswa semester awal Program Studi PTIK yang sedang menempuh mata kuliah Sistem Basis Data.**

### Stakeholder lain

PPTX mengidentifikasi:

- dosen pengampu
- asisten praktikum
- program studi

Stakeholder tersebut mempunyai kepentingan berbeda. Mahasiswa membutuhkan dukungan belajar, sedangkan dosen dan program studi berkaitan dengan pencapaian kompetensi pembelajaran.

### Karakteristik pengguna

PPTX menyebutkan empat karakteristik utama:

1. Mahasiswa baru mempelajari relasi antar tabel dan belum terbiasa membayangkan hubungan *primary key* dan *foreign key*.
2. Mahasiswa terbiasa dengan pola query satu tabel dari contoh dosen dan belum banyak mendapatkan variasi kasus.
3. Mahasiswa mengalami kesulitan memvisualisasikan skema tabel atau ERD ketika menyusun query secara mandiri.
4. Mayoritas pembelajar disebut bersifat reseptif dan cenderung mengikuti contoh sebelum merumuskan solusi sendiri.

### Implikasi desain

Karakteristik tersebut mengarah pada kebutuhan sistem yang tidak hanya menyediakan editor SQL, tetapi juga membantu mahasiswa:

- memahami struktur tabel
- melihat relasi
- mengenali hubungan antar atribut
- berlatih secara bertahap
- tidak bergantung sepenuhnya pada pola contoh

---

## Slide 5 — Konteks Pembelajaran

PPTX menjelaskan lingkungan belajar dari empat sudut pandang.

### 1. Tempat belajar

Pembelajaran teori berlangsung di kelas dan praktikum dilakukan di laboratorium komputer. Latihan mandiri di luar jam kuliah disebut masih terbatas.

### 2. Perangkat

Mahasiswa menggunakan laptop pribadi dengan lingkungan seperti:

- XAMPP
- MySQL Workbench

PPTX juga mencatat bahwa sebagian mahasiswa memiliki keterbatasan spesifikasi perangkat.

### 3. Pendampingan

Saat kuliah dan praktikum tersedia dosen atau asisten. Di luar jam tersebut, mahasiswa tidak mempunyai pendampingan langsung.

### 4. Tujuan

Kemampuan query dasar diposisikan sebagai bekal untuk mata kuliah lanjutan seperti:

- Pemrograman Web
- Rekayasa Perangkat Lunak

### Kesimpulan konteks

Dari kondisi tersebut, kebutuhan yang muncul tidak otomatis berarti “membuat aplikasi baru”. Kebutuhan yang lebih mendasar adalah:

**akses latihan + feedback yang tersedia kapan saja.**

Ini merupakan salah satu transisi penting dari *problem* menuju *need*.

---

## Slide 6 — Penyebab dan Dampak

Slide ini menghubungkan faktor penyebab dengan konsekuensi pembelajaran.

### Penyebab

**1. Latihan JOIN masih sedikit dan variasinya mirip contoh dosen**

Implikasinya, mahasiswa dapat menguasai pola yang sudah pernah dilihat tetapi kesulitan ketika struktur masalah berubah.

**2. Mahasiswa tidak menyadari kapan soal membutuhkan JOIN**

Penyebab ini berkaitan dengan kesulitan memahami maksud soal dan hubungan data.

**3. Sulit memvisualisasikan relasi antar tabel**

Mahasiswa mengalami hambatan ketika harus menghubungkan konsep ERD dengan query SQL.

**4. Feedback baru diperoleh saat asistensi atau nilai keluar**

Feedback tidak hadir pada saat kesalahan sedang terjadi.

### Dampak

Dampak yang diidentifikasi meliputi:

- kesulitan menghadapi soal ujian atau tugas dengan skema tabel berbeda
- query dapat berhasil dieksekusi tetapi salah secara logika
- mahasiswa melakukan *trial-and-error* tanpa memahami struktur data
- kesalahan baru diketahui setelah dikoreksi
- terdapat risiko hambatan pada mata kuliah lanjutan yang membutuhkan query lebih kompleks

### Pola sebab-akibat

Secara ringkas:

**Latihan kurang bervariasi + pemahaman relasi kurang kuat + feedback terlambat → mahasiswa sulit mentransfer kemampuan ke kasus baru → kesalahan logika tidak terdeteksi secara mandiri → berpotensi menghambat kompetensi lanjutan.**

---

# 4. Analisis Kebutuhan

## Slide 7 — Kebutuhan Pengguna dan Kebutuhan Pembelajaran

PPTX membedakan **kebutuhan pengguna** dari **kebutuhan pembelajaran**.

### Kebutuhan pengguna

Mahasiswa membutuhkan sarana untuk:

- berlatih query `JOIN` secara bertahap
- melihat visualisasi relasi antar tabel
- mendapatkan feedback langsung
- menerima feedback pada aspek logika, bukan hanya sintaks
- mengetahui letak kesalahan tanpa menunggu asistensi

### Kebutuhan pembelajaran

PPTX merumuskan empat kebutuhan pembelajaran:

1. Soal `JOIN` dengan skema tabel yang bervariasi.
2. Tingkat kesulitan yang meningkat secara bertahap.
3. Umpan balik terhadap logika query, bukan hanya keputusan benar atau salah.
4. Kesempatan memperbaiki kesalahan dan mencoba kembali pada soal yang setara.

### Analisis

Kebutuhan pembelajaran menunjukkan bahwa solusi harus mendukung **proses belajar**, bukan hanya **proses mengerjakan soal**.

Karena itu, fitur yang penting bukan hanya:

`Input Query → Execute → Result`

tetapi lebih dekat dengan:

`Pahami Relasi → Susun Query → Jalankan → Evaluasi Logika → Dapatkan Feedback → Perbaiki → Coba Lagi`

---

## Slide 8 — Kerangka Analisis Kelompok

Kerangka analisis diringkas menjadi:

**Problem → User → Context → Cause → Need → Solution**

### Penerapan pada studi kasus

| Komponen | Hasil Analisis |
|---|---|
| Problem | Mahasiswa kesulitan menyusun query `JOIN` pada kasus tabel baru |
| User | Mahasiswa PTIK semester awal pada mata kuliah Sistem Basis Data |
| Context | Kuliah dan praktikum tersedia, latihan mandiri di luar kelas terbatas |
| Cause | Belum sadar membutuhkan `JOIN`, sulit memvisualisasikan relasi antar tabel |
| Need | Latihan bertahap dan umpan balik logika |
| Solution | Software latihan query dengan visualisasi ERD dan feedback |

### Nilai penting dari kerangka

Kerangka tersebut mencegah loncatan langsung dari:

**“Mahasiswa kesulitan JOIN” → “mari buat AI.”**

Sebaliknya, proses yang digunakan adalah:

**“Mahasiswa kesulitan JOIN” → “siapa yang kesulitan?” → “dalam konteks apa?” → “mengapa kesulitan?” → “apa yang dibutuhkan?” → “solusi apa yang paling sesuai?”**

---

# 5. Informasi yang Masih Belum Terjawab

## Slide 9 — Kesenjangan Data dalam Analisis

Salah satu bagian terpenting dalam PPTX adalah pengakuan bahwa analisis belum sepenuhnya final.

Kelompok belum memastikan apakah sumber kesulitan utama berasal dari:

1. **belum memahami konsep relasi antar tabel atau ERD**, atau
2. **kebingungan pada sintaks `JOIN`**.

Kedua penyebab tersebut mempunyai implikasi solusi yang berbeda.

### Cara konfirmasi yang diusulkan

PPTX menyarankan:

- wawancara singkat dengan beberapa mahasiswa
- wawancara dengan asisten praktikum
- analisis pola kesalahan dari hasil praktikum yang telah dikumpulkan

### Pertanyaan yang masih perlu dijawab

**Pertanyaan 1**

Berapa proporsi mahasiswa yang salah karena lupa syarat `JOIN` dibanding mahasiswa yang sebenarnya belum memahami relasi tabel?

**Pertanyaan 2**

Apakah mahasiswa menggambar atau membaca ERD sebelum menulis query, atau langsung menulis query tanpa perencanaan?

**Pertanyaan 3**

Bagaimana pola latihan mandiri mahasiswa di luar jam praktikum? Apakah mahasiswa benar-benar tidak berlatih, atau sebenarnya berlatih tetapi tidak mempunyai arah dan feedback?

### Analisis metodologis

Bagian ini memperkuat kualitas analisis karena PPTX **tidak memaksakan asumsi sebagai fakta final**. Kelompok secara eksplisit menyatakan adanya informasi yang harus dikumpulkan lebih lanjut sebelum keputusan pengembangan software dibuat.

---

# 6. Alternatif Solusi

## Slide 10 — Evaluasi Alternatif

PPTX menilai solusi berdasarkan **kebutuhan**, bukan tren teknologi.

Tiga alternatif dibandingkan.

### A. Platform Latihan Query Interaktif

Fitur utama:

- interaktif
- visualisasi relasi tabel atau ERD
- feedback logika
- dapat diakses kapan saja

Kelebihan:

- sesuai dengan kebutuhan latihan bertahap
- mendukung pemahaman struktur data
- memberikan feedback lebih cepat
- dapat digunakan di luar jam kuliah

Keterbatasan:

- membutuhkan waktu pengembangan
- membutuhkan sumber daya

**Status dalam PPTX: DIREKOMENDASIKAN**

---

### B. Asistensi Tambahan Terjadwal

Kelebihan:

- feedback personal dari asisten
- dapat segera diterapkan
- tidak memerlukan software baru

Keterbatasan:

- jangkauan terbatas
- bergantung pada jadwal asisten

**Status dalam PPTX: PENDUKUNG**

Solusi ini cocok untuk kebutuhan yang membutuhkan penjelasan personal, tetapi kurang ideal sebagai satu-satunya mekanisme karena waktu dan kapasitas pendamping terbatas.

---

### C. Bank Soal JOIN Bertingkat + Diskusi Kelompok

Kelebihan:

- tidak membutuhkan teknologi baru
- cepat diterapkan
- dapat melatih penalaran melalui diskusi

Keterbatasan:

- feedback tidak secepat sistem otomatis

**Status dalam PPTX: DIREKOMENDASIKAN**

Menariknya, alternatif ini menunjukkan bahwa software bukan satu-satunya jawaban. Intervensi pembelajaran non-teknologi juga dapat memenuhi sebagian kebutuhan.

---

# 7. Rumusan Akhir Masalah

## Slide 11 — Problem Statement

PPTX merumuskan masalah secara lebih lengkap:

> Mahasiswa semester awal Program Studi Pendidikan Teknik Informatika dan Komputer kesulitan menyusun query SQL yang melibatkan `JOIN` antar tabel pada praktikum Sistem Basis Data, ditunjukkan oleh rendahnya nilai praktikum topik `JOIN` dan seringnya query yang berjalan tanpa error tetapi salah secara logika.

### Penyebab

- variasi latihan terbatas
- sebagian mahasiswa belum menyadari kebutuhan `JOIN`
- kesulitan memvisualisasikan relasi antar tabel

### Dampak

- kesulitan menghadapi soal dengan skema tabel baru
- risiko menghambat mata kuliah lanjutan

### Kebutuhan

Mahasiswa membutuhkan lingkungan latihan bertahap yang memungkinkan:

- mencoba query
- melihat relasi antar tabel
- menerima feedback logika
- memperbaiki kesalahan
- mencoba kembali soal setara

### Analisis

Rumusan akhir sudah menghubungkan empat elemen penting:

**Problem + Cause + Impact + Need**

Keempatnya membuat rumusan lebih siap digunakan sebagai dasar tahap berikutnya, misalnya analisis kebutuhan fungsional, spesifikasi fitur, atau desain media pembelajaran.

---

# 8. Kesimpulan Materi

## Slide 12 — Apakah Software Edukasi Layak Dipertimbangkan?

PPTX memberikan tiga kesimpulan utama.

### 1. Layak dipertimbangkan

Software edukasi dinilai layak karena kebutuhan utama berupa:

- latihan bertahap
- visualisasi relasi tabel
- feedback logika

lebih konsisten dipenuhi oleh sarana yang dapat diakses kapan saja dibandingkan sesi tatap muka yang dibatasi waktu.

### 2. Bukan solusi tunggal

Bank soal berjenjang dan diskusi kelompok tetap relevan sebagai langkah awal yang lebih cepat.

### 3. Tidak otomatis AI

AI tidak boleh dipilih semata-mata karena merupakan teknologi populer.

Keputusan teknologi harus didasarkan pada kebutuhan yang sudah dipetakan.

### Prinsip akhir

**Problem First, Solution Later**

Artinya:

> Tentukan masalah pembelajaran terlebih dahulu, pahami pengguna dan konteksnya, telusuri penyebabnya, identifikasi kebutuhan, kemudian pilih solusi yang paling sesuai.

---

# 9. Referensi yang Dicantumkan dalam PPTX

PPTX mencantumkan tiga publikasi ilmiah:

1. **Taipalus, T., Siponen, M., & Vartiainen, T. (2018).**  
   *Errors and Complications in SQL Query Formulation.*  
   ACM Transactions on Computing Education, 18(3), Article 15.  
   DOI: `https://doi.org/10.1145/3231712`

2. **Taipalus, T., & Seppänen, V. (2020).**  
   *SQL Education: A Systematic Mapping Study and Future Research Agenda.*  
   ACM Transactions on Computing Education, 20(3), Article 18.

3. **Miedema, D., Aivaloglou, E., & Fletcher, G. (2021).**  
   *Identifying SQL Misconceptions of Novices: Findings from a Think-Aloud Study.*  
   Proceedings of the 17th ACM Conference on International Computing Education Research (ICER 2021).  
   DOI: `https://doi.org/10.1145/3446871.3469759`

**Catatan:** daftar referensi di atas dituliskan mengikuti isi PPTX. Analisis ini tidak mengganti atau memverifikasi ulang isi publikasi di luar materi yang tersedia.

---

# 10. Pemetaan Konsep Utama

## Problem

Mahasiswa kesulitan menyusun query `JOIN` ketika berhadapan dengan kasus dan skema tabel baru.

## User

Mahasiswa semester awal PTIK pada mata kuliah Sistem Basis Data.

## Context

Pembelajaran berlangsung melalui teori, praktikum, dan latihan mandiri yang masih terbatas. Pendampingan tersedia saat sesi kuliah atau praktikum, tetapi tidak selalu tersedia di luar sesi tersebut.

## Cause

- latihan kurang bervariasi
- mahasiswa belum selalu mengenali kebutuhan `JOIN`
- visualisasi relasi tabel sulit
- feedback diperoleh terlambat

## Need

- latihan bertahap
- soal bervariasi
- visualisasi ERD
- feedback logika
- kesempatan memperbaiki kesalahan
- akses belajar kapan saja

## Solution

- platform latihan query interaktif
- asistensi tambahan
- bank soal JOIN bertingkat dan diskusi kelompok

---

# 11. Analisis Kekuatan PPTX

## A. Fokus masalah cukup spesifik

PPTX tidak menggunakan masalah umum seperti “mahasiswa kesulitan belajar SQL”. Masalah dipersempit pada **query `JOIN` dalam praktikum basis data** dan pada situasi ketika skema tabel berbeda dari contoh.

Hal tersebut membuat studi kasus lebih mudah ditindaklanjuti.

## B. Tidak langsung terjebak pada solusi AI

Ini merupakan kekuatan konseptual utama. PPTX secara konsisten memisahkan:

**kebutuhan pembelajaran** dari **teknologi solusi**.

## C. Mengidentifikasi logical error

Materi tidak hanya membicarakan error sintaks. Justru kesalahan logika menjadi inti problem statement.

## D. Memasukkan konteks pengguna

PPTX tidak hanya menjelaskan “siapa pengguna”, tetapi juga perangkat, pendampingan, tempat belajar, serta tujuan pembelajaran.

## E. Mengakui adanya data yang masih kurang

Slide 9 memperlihatkan bahwa kelompok sadar beberapa asumsi belum cukup kuat dan masih perlu diverifikasi.

## F. Membandingkan solusi

PPTX tidak hanya menawarkan satu software, tetapi membandingkan beberapa alternatif dan keterbatasannya.

---

# 12. Analisis Hal yang Masih Perlu Diperkuat

Bagian berikut merupakan **analisis terhadap isi PPTX**, bukan tambahan fakta dari sumber luar.

## A. Bukti kuantitatif masih bersifat indikatif

PPTX menyebut nilai praktikum pada topik `JOIN` cenderung lebih rendah, tetapi tidak menampilkan:

- jumlah mahasiswa
- nilai rata-rata
- selisih dengan topik query dasar
- distribusi kesalahan
- persentase mahasiswa yang mengalami masalah

Karena itu, klaim tersebut dalam konteks analisis kebutuhan masih paling tepat diposisikan sebagai **indikasi yang perlu dibuktikan dengan data**.

## B. Karakteristik “mayoritas pembelajar reseptif” belum ditunjukkan sumber datanya

Pernyataan ini terdapat di PPTX, tetapi materi tidak menunjukkan hasil observasi, wawancara, atau instrumen yang menjadi dasar pengelompokan tersebut.

Karena itu, karakteristik ini masih perlu dikonfirmasi pada tahap pengumpulan data.

## C. Penyebab belum sepenuhnya diprioritaskan

PPTX telah menemukan beberapa penyebab, tetapi belum menentukan mana yang merupakan **root cause** paling dominan.

Contohnya:

- apakah masalah utama adalah konsep ERD?
- apakah masalah utama adalah sintaks `JOIN`?
- apakah masalah utama adalah kurang latihan?
- apakah masalah utama adalah keterlambatan feedback?

Pertanyaan tersebut penting karena solusi yang dibangun harus memprioritaskan penyebab yang paling berpengaruh.

## D. Kebutuhan masih berada pada level konseptual

Kebutuhan yang sudah ditemukan masih berupa kebutuhan pembelajaran. PPTX belum mengubahnya menjadi spesifikasi rinci seperti:

- fitur
- alur interaksi
- kebutuhan data
- aturan evaluasi query
- jenis feedback
- indikator keberhasilan pengguna
- kebutuhan nonfungsional

Hal ini wajar karena materi masih berada pada tahap **analisis kebutuhan awal**.

## E. “Feedback logika” belum dijelaskan mekanismenya

PPTX menganggap feedback logika sebagai kebutuhan penting, tetapi belum merumuskan bagaimana sistem membedakan:

- salah sintaks
- salah tabel
- salah relasi
- kondisi `JOIN` tidak tepat
- hasil terlalu banyak karena penggabungan yang salah
- hasil kosong karena kondisi penggabungan tidak sesuai

Ini merupakan persoalan desain yang perlu dijawab pada tahap berikutnya.

## F. Kebutuhan AI belum dibuktikan

PPTX dengan tepat menyatakan bahwa AI bukan kebutuhan otomatis. Namun demikian, PPTX belum sampai pada keputusan apakah AI:

- diperlukan
- hanya opsional
- atau tidak diperlukan

Keputusan tersebut memang seharusnya menunggu hasil analisis kebutuhan yang lebih kuat.

---

# 13. Implikasi untuk Pengembangan Software Edukasi

Berdasarkan kebutuhan yang dinyatakan di PPTX, calon sistem idealnya memiliki orientasi sebagai **lingkungan latihan SQL**, bukan sekadar mesin pengecek jawaban.

Secara konseptual, alur pembelajaran yang sesuai dengan isi PPTX adalah:

```text
Mahasiswa menerima kasus
        ↓
Mahasiswa melihat struktur tabel / ERD
        ↓
Mahasiswa mengidentifikasi relasi antar tabel
        ↓
Mahasiswa menentukan apakah perlu JOIN
        ↓
Mahasiswa menyusun query
        ↓
Query dijalankan
        ↓
Sistem mengevaluasi hasil dan logika
        ↓
Feedback diberikan
        ↓
Mahasiswa memperbaiki query
        ↓
Mahasiswa mencoba kembali
```

Dengan alur tersebut, software tidak hanya memberi tahu bahwa jawaban salah, tetapi mendukung proses mahasiswa untuk memahami **mengapa** jawaban tersebut salah.

---

# 14. Kandidat Kebutuhan Fungsional yang Dapat Diturunkan

Bagian ini merupakan **turunan analitis dari kebutuhan yang tercantum di PPTX**, bukan daftar fitur yang secara eksplisit sudah diputuskan oleh kelompok.

### Manajemen latihan

Sistem perlu menyediakan latihan `JOIN` bertahap dari kasus dua tabel menuju kasus yang melibatkan lebih banyak tabel.

### Variasi skema

Sistem perlu menyediakan skema tabel yang berbeda-beda agar mahasiswa tidak hanya menghafal satu pola.

### Visualisasi ERD

Sistem perlu memungkinkan mahasiswa melihat hubungan antar tabel untuk membantu memahami *primary key* dan *foreign key*.

### Pemeriksaan query

Sistem perlu menjalankan query mahasiswa pada lingkungan data yang sesuai.

### Feedback

Sistem perlu memberikan umpan balik atas kesalahan logika, bukan hanya error sintaks.

### Perbaikan dan pengulangan

Sistem perlu menyediakan kesempatan memperbaiki jawaban dan mencoba lagi pada soal yang sama atau soal setara.

### Akses mandiri

Sistem diharapkan dapat digunakan di luar waktu kuliah dan praktikum.

---

# 15. Kandidat Indikator Keberhasilan Pembelajaran

Bagian ini juga merupakan **turunan analitis** dari kebutuhan dalam PPTX.

Beberapa indikator yang relevan dapat diarahkan pada:

- kemampuan mahasiswa mengenali kapan `JOIN` diperlukan
- kemampuan menentukan relasi antar tabel berdasarkan ERD
- kemampuan menyusun query `JOIN` pada skema yang belum pernah digunakan
- berkurangnya logical error
- berkurangnya penggunaan `WHERE` secara keliru sebagai pengganti kondisi penggabungan
- meningkatnya kemampuan memperbaiki query berdasarkan feedback
- meningkatnya kemampuan menyelesaikan soal baru tanpa bergantung pada contoh identik

Indikator tersebut selaras dengan tujuan utama PPTX, yaitu meningkatkan kemampuan menghadapi **kasus baru**, bukan hanya mengulang contoh.

---

# 16. Rekomendasi Tahap Analisis Berikutnya

Berdasarkan alur yang sudah dibangun dalam PPTX, tahap paling logis berikutnya adalah **validasi masalah dan penyebab** sebelum masuk ke perancangan software.

Prioritas pengumpulan data:

1. **Analisis hasil praktikum**
   - identifikasi jenis kesalahan
   - kelompokkan logical error dan syntax error
   - cari pola kesalahan pada soal `JOIN`

2. **Wawancara mahasiswa**
   - bagaimana mahasiswa memahami soal
   - apakah mahasiswa mengenali kebutuhan `JOIN`
   - apakah mahasiswa membaca ERD
   - bagaimana mahasiswa mencari bantuan ketika menemui kesalahan

3. **Wawancara dosen dan asisten**
   - kesalahan yang paling sering ditemukan
   - bagian materi yang paling sulit
   - pola pemberian feedback
   - keterbatasan waktu asistensi

4. **Validasi kebutuhan**
   - tentukan kebutuhan yang paling penting
   - tentukan apakah software benar-benar diperlukan
   - tentukan fitur minimum yang paling relevan

5. **Baru kemudian menentukan teknologi**
   - sistem latihan biasa
   - rule-based checking
   - analisis query otomatis
   - atau AI, jika hasil analisis menunjukkan kebutuhan tersebut

---

# 17. Kesimpulan Analitis Keseluruhan

Secara keseluruhan, PPTX membangun argumentasi bahwa **pengembangan software edukasi tidak seharusnya dimulai dari ketertarikan terhadap teknologi tertentu, termasuk AI**. Masalah yang harus terlebih dahulu dibuktikan adalah kesulitan mahasiswa dalam menyusun query `JOIN`, terutama pada kasus yang menggunakan skema tabel baru.

Permasalahan tersebut dijelaskan melalui beberapa aspek yang saling berkaitan, yaitu keterbatasan variasi latihan, kurangnya kesadaran mahasiswa terhadap kebutuhan `JOIN`, kesulitan dalam memvisualisasikan relasi tabel, dan keterlambatan feedback. Dampaknya bukan hanya kesalahan sintaks, tetapi juga **logical error**, yaitu query dapat dijalankan tetapi hasilnya tidak sesuai dengan maksud soal.

Dari masalah tersebut, kebutuhan yang dirumuskan adalah lingkungan latihan yang bertahap, bervariasi, dapat menunjukkan relasi tabel, memberikan feedback logika, dan memungkinkan mahasiswa memperbaiki jawaban secara mandiri. Kebutuhan ini kemudian digunakan untuk membandingkan beberapa alternatif solusi, yaitu platform latihan query interaktif, asistensi tambahan, serta bank soal JOIN bertingkat dengan diskusi kelompok.

Kekuatan utama PPTX terletak pada alur analisis yang konsisten:

**Problem → User → Context → Cause → Need → Solution.**

Namun, materi juga secara sadar menunjukkan bahwa analisis belum selesai. Masih diperlukan data untuk memastikan apakah akar masalah mahasiswa lebih dominan berasal dari pemahaman konsep ERD, pemahaman sintaks `JOIN`, kurangnya latihan, atau keterlambatan feedback. Dengan demikian, PPTX lebih tepat dipahami sebagai **analisis kebutuhan awal**, bukan sebagai spesifikasi final untuk pembangunan software.

Kesimpulan paling penting dari seluruh materi adalah:

> **Solusi teknologi harus mengikuti kebutuhan pembelajaran, bukan kebutuhan teknologi yang dipaksakan menjadi solusi.**

---

# 18. Peta Singkat PPTX

```text
LATAR BELAKANG
│
├── Mahasiswa lancar SELECT satu tabel
├── Kesulitan saat menggunakan JOIN
├── Logical error dapat terjadi meski query berjalan
└── Muncul usulan aplikasi berbasis AI
            │
            ▼
PERTANYAAN KUNCI
│
└── Apakah AI sudah didasarkan pada analisis kebutuhan?
            │
            ▼
IDENTIFIKASI MASALAH
│
├── Masalah pembelajaran
├── Bukti / indikasi
└── Riset terkait
            │
            ▼
PENGGUNA & KONTEKS
│
├── Mahasiswa semester awal
├── Dosen / asisten / program studi
├── Kondisi pembelajaran
└── Kondisi perangkat dan pendampingan
            │
            ▼
PENYEBAB & DAMPAK
│
├── Latihan kurang bervariasi
├── Belum sadar membutuhkan JOIN
├── Sulit visualisasi relasi
└── Feedback terlambat
            │
            ▼
KEBUTUHAN
│
├── Latihan bertahap
├── Soal bervariasi
├── Visualisasi ERD
├── Feedback logika
└── Kesempatan mencoba kembali
            │
            ▼
VALIDASI YANG MASIH DIPERLUKAN
│
├── Wawancara mahasiswa
├── Wawancara asisten
└── Analisis hasil praktikum
            │
            ▼
ALTERNATIF SOLUSI
│
├── Platform latihan interaktif
├── Asistensi tambahan
└── Bank soal + diskusi
            │
            ▼
KESIMPULAN
│
├── Software layak dipertimbangkan
├── Software bukan solusi tunggal
└── AI tidak otomatis diperlukan
```

---

## 19. Status Analisis

| Aspek | Status menurut PPTX |
|---|---|
| Problem teridentifikasi | Sudah |
| User teridentifikasi | Sudah |
| Context teridentifikasi | Sudah |
| Cause teridentifikasi | Sudah, tetapi perlu validasi |
| Impact teridentifikasi | Sudah |
| Need teridentifikasi | Sudah |
| Alternatif solusi | Sudah |
| Validasi kebutuhan | Belum selesai |
| Root cause paling dominan | Belum dipastikan |
| Spesifikasi fitur | Belum |
| Keputusan penggunaan AI | Belum final |
| Implementasi software | Belum menjadi fokus modul |

---

## 20. Catatan Penting untuk Pemanfaatan Dokumen

Dokumen Markdown ini mempertahankan struktur, istilah, dan argumentasi yang terdapat dalam PPTX. Bagian yang diberi penanda seperti **“turunan analitis”**, **“implikasi desain”**, atau **“analisis”** merupakan hasil penguraian terhadap isi materi, bukan klaim bahwa poin tersebut sudah secara eksplisit diputuskan dalam PPTX.

Dengan demikian, dokumen ini dapat digunakan sebagai:

- catatan belajar Modul 3
- dasar diskusi kelompok
- bahan penyusunan laporan analisis kebutuhan
- bahan presentasi lanjutan
- dasar menuju requirement analysis yang lebih rinci
- acuan untuk menentukan apakah software atau AI benar-benar diperlukan
