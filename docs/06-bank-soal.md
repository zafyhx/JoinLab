# 06. Bank Soal: JoinLab

Dokumen ini berisi 30 soal SQL JOIN yang terbagi dalam 3 skema sandbox (Akademik, Toko, Perpustakaan), masing-masing memiliki 3 level kesulitan.
Terdapat 15 template soal (`Variant Group`), dan setiap template memiliki 2 varian (A dan B) untuk fitur "Coba soal setara".

---

## Skema 1: Akademik (Kode: AK)
**Tabel:** `jurusan`, `dosen`, `mahasiswa`, `mata_kuliah`, `krs`

### Level 1 (Dasar, INNER JOIN 2 Tabel)

| Field | Isi |
|---|---|
| Code | AK-1A |
| Variant Group | AK-1 |
| Skema | akademik |
| Level | 1 |
| Title | Data Mahasiswa dan Jurusan |
| Prompt | Tampilkan kolom `nim`, `nama_mhs`, dan `nama_jurusan` untuk semua mahasiswa. |
| Expected SQL | `SELECT mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan FROM mahasiswa INNER JOIN jurusan ON mahasiswa.id_jurusan = jurusan.id_jurusan;` |
| Required Tables | `["mahasiswa", "jurusan"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Data yang diminta berada di dua tabel berbeda. Tabel apa saja itu?", "Perhatikan kolom id_jurusan pada tabel mahasiswa dan jurusan.", "Gunakan INNER JOIN antara mahasiswa dan jurusan, hubungkan dengan ON id_jurusan."]` |

| Field | Isi |
|---|---|
| Code | AK-1B |
| Variant Group | AK-1 |
| Skema | akademik |
| Level | 1 |
| Title | Data Dosen dan Jurusan |
| Prompt | Tampilkan kolom `id_dosen`, `nama_dosen`, dan `nama_jurusan` untuk semua dosen. |
| Expected SQL | `SELECT dosen.id_dosen, dosen.nama_dosen, jurusan.nama_jurusan FROM dosen INNER JOIN jurusan ON dosen.id_jurusan = jurusan.id_jurusan;` |
| Required Tables | `["dosen", "jurusan"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Data dosen ada di tabel dosen, sedangkan nama jurusan ada di tabel jurusan.", "Kedua tabel tersebut terhubung melalui suatu kolom. Cari kolom yang sama.", "Gunakan INNER JOIN pada tabel dosen dan jurusan, dan samakan id_jurusan."]` |

| Field | Isi |
|---|---|
| Code | AK-2A |
| Variant Group | AK-2 |
| Skema | akademik |
| Level | 1 |
| Title | Mata Kuliah 3 SKS |
| Prompt | Tampilkan kolom `kode_mk`, `nama_mk`, dan `nama_dosen` pengampunya, khusus untuk mata kuliah yang memiliki jumlah `sks` sama dengan 3. |
| Expected SQL | `SELECT mata_kuliah.kode_mk, mata_kuliah.nama_mk, dosen.nama_dosen FROM mata_kuliah INNER JOIN dosen ON mata_kuliah.id_dosen = dosen.id_dosen WHERE mata_kuliah.sks = 3;` |
| Required Tables | `["mata_kuliah", "dosen"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Kamu perlu menggabungkan tabel mata_kuliah dengan tabel dosen.", "Jangan lupa menyaring hasil berdasarkan sks dari mata kuliah.", "Gunakan WHERE sks = 3 setelah melakukan INNER JOIN."]` |

| Field | Isi |
|---|---|
| Code | AK-2B |
| Variant Group | AK-2 |
| Skema | akademik |
| Level | 1 |
| Title | Mahasiswa Angkatan 2023 |
| Prompt | Tampilkan kolom `nim`, `nama_mhs`, dan `nama_jurusan` khusus untuk mahasiswa dengan `angkatan` 2023. |
| Expected SQL | `SELECT mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan FROM mahasiswa INNER JOIN jurusan ON mahasiswa.id_jurusan = jurusan.id_jurusan WHERE mahasiswa.angkatan = 2023;` |
| Required Tables | `["mahasiswa", "jurusan"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Tabel mana yang menyimpan data angkatan mahasiswa?", "Gabungkan tabel mahasiswa dan jurusan, lalu berikan kondisi pada angkatan.", "Tambahkan klausa WHERE angkatan = 2023 pada query INNER JOIN kamu."]` |

### Level 2 (Menengah, LEFT JOIN & 3 Tabel)

| Field | Isi |
|---|---|
| Code | AK-3A |
| Variant Group | AK-3 |
| Skema | akademik |
| Level | 2 |
| Title | Mahasiswa Tanpa KRS |
| Prompt | Tampilkan kolom `nim` dan `nama_mhs` untuk mahasiswa yang belum mengambil satupun mata kuliah (tidak memiliki data sama sekali di tabel `krs`). |
| Expected SQL | `SELECT mahasiswa.nim, mahasiswa.nama_mhs FROM mahasiswa LEFT JOIN krs ON mahasiswa.nim = krs.nim WHERE krs.nim IS NULL;` |
| Required Tables | `["mahasiswa", "krs"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Bagaimana cara menampilkan semua mahasiswa meskipun tidak ada di tabel krs?", "Gunakan LEFT JOIN dari tabel mahasiswa ke krs.", "Setelah di-LEFT JOIN, cari baris yang nilai kolom dari tabel krs bernilai NULL."]` |

| Field | Isi |
|---|---|
| Code | AK-3B |
| Variant Group | AK-3 |
| Skema | akademik |
| Level | 2 |
| Title | Dosen Tanpa Mata Kuliah |
| Prompt | Tampilkan kolom `id_dosen` dan `nama_dosen` untuk dosen yang belum mengampu mata kuliah satupun (tidak ada data di tabel `mata_kuliah`). |
| Expected SQL | `SELECT dosen.id_dosen, dosen.nama_dosen FROM dosen LEFT JOIN mata_kuliah ON dosen.id_dosen = mata_kuliah.id_dosen WHERE mata_kuliah.kode_mk IS NULL;` |
| Required Tables | `["dosen", "mata_kuliah"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Jika ingin mencari data yang 'tidak memiliki pasangan', JOIN jenis apa yang tepat?", "Gunakan LEFT JOIN dari dosen ke mata_kuliah.", "Saring hasilnya di klausa WHERE dengan mengecek apakah kolom kode_mk IS NULL."]` |

| Field | Isi |
|---|---|
| Code | AK-4A |
| Variant Group | AK-4 |
| Skema | akademik |
| Level | 2 |
| Title | KRS Semester Ganjil |
| Prompt | Tampilkan `nama_mhs`, `nama_mk`, dan `nilai_angka` untuk semua KRS pada `semester` '2024-Ganjil'. |
| Expected SQL | `SELECT mahasiswa.nama_mhs, mata_kuliah.nama_mk, krs.nilai_angka FROM krs INNER JOIN mahasiswa ON krs.nim = mahasiswa.nim INNER JOIN mata_kuliah ON krs.kode_mk = mata_kuliah.kode_mk WHERE krs.semester = '2024-Ganjil';` |
| Required Tables | `["krs", "mahasiswa", "mata_kuliah"]` |
| Concept Tags | `["multi_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Kamu perlu menggabungkan 3 tabel sekaligus: krs, mahasiswa, dan mata_kuliah.", "Tabel krs memiliki relasi dengan mahasiswa (nim) dan mata_kuliah (kode_mk).", "Lakukan dua kali INNER JOIN dari tabel krs, lalu filter berdasarkan semester."]` |

| Field | Isi |
|---|---|
| Code | AK-4B |
| Variant Group | AK-4 |
| Skema | akademik |
| Level | 2 |
| Title | KRS Semester Genap |
| Prompt | Tampilkan `nama_dosen`, `nama_mk`, dan `semester` dari tabel KRS untuk perkuliahan pada `semester` '2024-Genap'. |
| Expected SQL | `SELECT dosen.nama_dosen, mata_kuliah.nama_mk, krs.semester FROM krs INNER JOIN mata_kuliah ON krs.kode_mk = mata_kuliah.kode_mk INNER JOIN dosen ON mata_kuliah.id_dosen = dosen.id_dosen WHERE krs.semester = '2024-Genap';` |
| Required Tables | `["krs", "mata_kuliah", "dosen"]` |
| Concept Tags | `["multi_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Tabel mana saja yang menyimpan data dosen, mata kuliah, dan transaksi krs?", "krs terhubung ke mata_kuliah, dan mata_kuliah terhubung ke dosen.", "Hubungkan ketiga tabel dengan INNER JOIN secara berurutan, lalu tambahkan WHERE pada semester."]` |

### Level 3 (Lanjut, Multi JOIN + Agregasi)

| Field | Isi |
|---|---|
| Code | AK-5A |
| Variant Group | AK-5 |
| Skema | akademik |
| Level | 3 |
| Title | Mahasiswa Berprestasi Ganjil |
| Prompt | Tampilkan `nim`, `nama_mhs`, `nama_jurusan`, dan rata-rata `nilai_angka` (dengan alias `rata_rata_nilai`) dari tiap mahasiswa pada `semester` '2024-Ganjil'. Hanya tampilkan mahasiswa yang rata-rata nilainya lebih dari 70. Urutkan hasil dari rata-rata nilai terbesar ke terkecil. |
| Expected SQL | `SELECT mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan, AVG(krs.nilai_angka) AS rata_rata_nilai FROM mahasiswa INNER JOIN jurusan ON mahasiswa.id_jurusan = jurusan.id_jurusan INNER JOIN krs ON mahasiswa.nim = krs.nim WHERE krs.semester = '2024-Ganjil' GROUP BY mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan HAVING rata_rata_nilai > 70 ORDER BY rata_rata_nilai DESC;` |
| Required Tables | `["mahasiswa", "jurusan", "krs"]` |
| Concept Tags | `["multi_join", "group_by", "having", "order_by", "aggregate"]` |
| Order Matters | true |
| Hints | `["Kamu butuh tabel mahasiswa, jurusan, dan krs. Bagaimana cara menghitung rata-rata nilai?", "Gunakan fungsi agregat AVG() dan kelompokkan data dengan GROUP BY nim, nama_mhs, nama_jurusan.", "Gunakan HAVING setelah GROUP BY untuk memfilter rata-rata nilai, dan ORDER BY ... DESC untuk mengurutkan."]` |

| Field | Isi |
|---|---|
| Code | AK-5B |
| Variant Group | AK-5 |
| Skema | akademik |
| Level | 3 |
| Title | Beban Mengajar Dosen |
| Prompt | Tampilkan `id_dosen`, `nama_dosen`, `nama_jurusan`, dan total SKS (dengan alias `total_sks`) dari mata kuliah yang diajarkan tiap dosen. Hanya tampilkan dosen yang total SKS-nya lebih dari 4. Urutkan dari total SKS terbesar ke terkecil. |
| Expected SQL | `SELECT dosen.id_dosen, dosen.nama_dosen, jurusan.nama_jurusan, SUM(mata_kuliah.sks) AS total_sks FROM dosen INNER JOIN jurusan ON dosen.id_jurusan = jurusan.id_jurusan INNER JOIN mata_kuliah ON dosen.id_dosen = mata_kuliah.id_dosen GROUP BY dosen.id_dosen, dosen.nama_dosen, jurusan.nama_jurusan HAVING total_sks > 4 ORDER BY total_sks DESC;` |
| Required Tables | `["dosen", "jurusan", "mata_kuliah"]` |
| Concept Tags | `["multi_join", "group_by", "having", "order_by", "aggregate"]` |
| Order Matters | true |
| Hints | `["Tabel apa saja yang memiliki relasi untuk menghitung total SKS seorang dosen?", "Gabungkan tabel dosen, jurusan, dan mata_kuliah. Gunakan SUM(sks) beserta GROUP BY.", "Gunakan HAVING untuk syarat lebih dari 4, dan ORDER BY ... DESC untuk pengurutan."]` |

---

## Skema 2: Toko (Kode: TK)
**Tabel:** `pelanggan`, `kategori`, `produk`, `pesanan`, `detail_pesanan`

### Level 1

| Field | Isi |
|---|---|
| Code | TK-1A |
| Variant Group | TK-1 |
| Skema | toko |
| Level | 1 |
| Title | Data Produk dan Kategori |
| Prompt | Tampilkan `id_produk`, `nama_produk`, dan `nama_kategori` untuk semua produk yang tersedia. |
| Expected SQL | `SELECT produk.id_produk, produk.nama_produk, kategori.nama_kategori FROM produk INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori;` |
| Required Tables | `["produk", "kategori"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Tabel apa yang menyimpan data produk dan kategori?", "Hubungkan kedua tabel menggunakan kolom kategori.", "Lakukan INNER JOIN antara produk dan kategori pada kolom id_kategori."]` |

| Field | Isi |
|---|---|
| Code | TK-1B |
| Variant Group | TK-1 |
| Skema | toko |
| Level | 1 |
| Title | Transaksi dan Pelanggan |
| Prompt | Tampilkan `id_pesanan`, `tanggal`, dan `nama` pelanggan untuk semua pesanan. |
| Expected SQL | `SELECT pesanan.id_pesanan, pesanan.tanggal, pelanggan.nama FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan;` |
| Required Tables | `["pesanan", "pelanggan"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Nama pelanggan ada di tabel terpisah dari tabel pesanan.", "Cari relasi antara tabel pelanggan dan pesanan.", "Gunakan INNER JOIN pada id_pelanggan di kedua tabel."]` |

| Field | Isi |
|---|---|
| Code | TK-2A |
| Variant Group | TK-2 |
| Skema | toko |
| Level | 1 |
| Title | Produk Elektronik |
| Prompt | Tampilkan `nama_produk`, `harga`, dan `nama_kategori` khusus untuk produk yang berada dalam kategori 'Elektronik'. |
| Expected SQL | `SELECT produk.nama_produk, produk.harga, kategori.nama_kategori FROM produk INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori WHERE kategori.nama_kategori = 'Elektronik';` |
| Required Tables | `["produk", "kategori"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Bagaimana kamu bisa memfilter hanya kategori Elektronik?", "Hubungkan produk dan kategori, lalu gunakan WHERE pada nama_kategori.", "Query kamu harus menggunakan INNER JOIN dan klausa WHERE kategori.nama_kategori = 'Elektronik'."]` |

| Field | Isi |
|---|---|
| Code | TK-2B |
| Variant Group | TK-2 |
| Skema | toko |
| Level | 1 |
| Title | Pesanan dari Bandung |
| Prompt | Tampilkan `id_pesanan`, `status`, dan `nama` pelanggan, khusus untuk pelanggan yang berasal dari `kota` 'Bandung'. |
| Expected SQL | `SELECT pesanan.id_pesanan, pesanan.status, pelanggan.nama FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan WHERE pelanggan.kota = 'Bandung';` |
| Required Tables | `["pesanan", "pelanggan"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Dimana data kota pelanggan disimpan?", "Gabungkan tabel pesanan dan pelanggan terlebih dahulu.", "Tambahkan kondisi WHERE pelanggan.kota = 'Bandung' setelah JOIN."]` |

### Level 2

| Field | Isi |
|---|---|
| Code | TK-3A |
| Variant Group | TK-3 |
| Skema | toko |
| Level | 2 |
| Title | Pelanggan Tanpa Pesanan |
| Prompt | Tampilkan `id_pelanggan`, `nama`, dan `kota` untuk pelanggan yang belum pernah melakukan pesanan sama sekali. |
| Expected SQL | `SELECT pelanggan.id_pelanggan, pelanggan.nama, pelanggan.kota FROM pelanggan LEFT JOIN pesanan ON pelanggan.id_pelanggan = pesanan.id_pelanggan WHERE pesanan.id_pesanan IS NULL;` |
| Required Tables | `["pelanggan", "pesanan"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Pelanggan yang belum memesan berarti datanya tidak ada di tabel pesanan.", "Gunakan LEFT JOIN dari tabel pelanggan ke tabel pesanan.", "Filter pelanggan dengan kondisi id_pesanan IS NULL."]` |

| Field | Isi |
|---|---|
| Code | TK-3B |
| Variant Group | TK-3 |
| Skema | toko |
| Level | 2 |
| Title | Produk Tidak Laku |
| Prompt | Tampilkan `id_produk`, `nama_produk`, dan `harga` untuk produk yang tidak pernah dibeli sama sekali (tidak tercatat di `detail_pesanan`). |
| Expected SQL | `SELECT produk.id_produk, produk.nama_produk, produk.harga FROM produk LEFT JOIN detail_pesanan ON produk.id_produk = detail_pesanan.id_produk WHERE detail_pesanan.id_detail IS NULL;` |
| Required Tables | `["produk", "detail_pesanan"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Tabel mana yang menyimpan data pembelian produk?", "Gunakan LEFT JOIN dari tabel produk ke tabel detail_pesanan.", "Gunakan WHERE detail_pesanan.id_produk IS NULL atau id_detail IS NULL."]` |

| Field | Isi |
|---|---|
| Code | TK-4A |
| Variant Group | TK-4 |
| Skema | toko |
| Level | 2 |
| Title | Pesanan yang Selesai |
| Prompt | Tampilkan `nama` pelanggan, `id_pesanan`, dan `tanggal` untuk semua pesanan yang memiliki `status` 'selesai'. |
| Expected SQL | `SELECT pelanggan.nama, pesanan.id_pesanan, pesanan.tanggal FROM pelanggan INNER JOIN pesanan ON pelanggan.id_pelanggan = pesanan.id_pelanggan WHERE pesanan.status = 'selesai';` |
| Required Tables | `["pelanggan", "pesanan"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Tabel apa saja yang dibutuhkan untuk menampilkan nama dan id_pesanan?", "Gabungkan pelanggan dan pesanan dengan INNER JOIN.", "Saring hasilnya dimana status dari tabel pesanan adalah 'selesai'."]` |

| Field | Isi |
|---|---|
| Code | TK-4B |
| Variant Group | TK-4 |
| Skema | toko |
| Level | 2 |
| Title | Pesanan yang Batal |
| Prompt | Tampilkan `nama` pelanggan, `id_pesanan`, dan `tanggal` untuk semua pesanan yang memiliki `status` 'batal'. |
| Expected SQL | `SELECT pelanggan.nama, pesanan.id_pesanan, pesanan.tanggal FROM pelanggan INNER JOIN pesanan ON pelanggan.id_pelanggan = pesanan.id_pelanggan WHERE pesanan.status = 'batal';` |
| Required Tables | `["pelanggan", "pesanan"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Pertama, kamu butuh menghubungkan pelanggan dengan pesanannya.", "Gunakan kolom id_pelanggan untuk INNER JOIN.", "Pastikan kamu menggunakan klausa WHERE status = 'batal'."]` |

### Level 3

| Field | Isi |
|---|---|
| Code | TK-5A |
| Variant Group | TK-5 |
| Skema | toko |
| Level | 3 |
| Title | Total Nilai Belanja per Pesanan |
| Prompt | Tampilkan `id_pesanan`, `nama` pelanggan, `tanggal`, dan total nilai pesanan (sebagai `total_belanja`) yang didapat dari menjumlahkan hasil perkalian `jumlah` dengan `harga_satuan` di detail pesanan. Hanya hitung untuk pesanan dengan `status` 'selesai'. Urutkan dari total belanja terbesar. |
| Expected SQL | `SELECT pesanan.id_pesanan, pelanggan.nama, pesanan.tanggal, SUM(detail_pesanan.jumlah * detail_pesanan.harga_satuan) AS total_belanja FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan INNER JOIN detail_pesanan ON pesanan.id_pesanan = detail_pesanan.id_pesanan WHERE pesanan.status = 'selesai' GROUP BY pesanan.id_pesanan, pelanggan.nama, pesanan.tanggal ORDER BY total_belanja DESC;` |
| Required Tables | `["pesanan", "pelanggan", "detail_pesanan"]` |
| Concept Tags | `["multi_join", "group_by", "order_by", "aggregate", "filtering"]` |
| Order Matters | true |
| Hints | `["Kamu butuh pesanan, pelanggan, dan detail_pesanan. Bagaimana menjumlahkan total belanja?", "Gunakan fungsi SUM(jumlah * harga_satuan) bersama GROUP BY id_pesanan.", "Filter di WHERE status = 'selesai' dan urutkan menggunakan ORDER BY total_belanja DESC."]` |

| Field | Isi |
|---|---|
| Code | TK-5B |
| Variant Group | TK-5 |
| Skema | toko |
| Level | 3 |
| Title | Produk Terlaris |
| Prompt | Tampilkan `id_produk`, `nama_produk`, `nama_kategori`, dan total kuantitas yang terjual (sebagai `total_terjual`) berdasarkan kolom `jumlah` di detail pesanan. Hanya hitung produk yang terjual lebih dari 5 unit pada pesanan dengan status 'selesai'. Urutkan dari total terjual terbanyak. |
| Expected SQL | `SELECT produk.id_produk, produk.nama_produk, kategori.nama_kategori, SUM(detail_pesanan.jumlah) AS total_terjual FROM produk INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori INNER JOIN detail_pesanan ON produk.id_produk = detail_pesanan.id_produk INNER JOIN pesanan ON detail_pesanan.id_pesanan = pesanan.id_pesanan WHERE pesanan.status = 'selesai' GROUP BY produk.id_produk, produk.nama_produk, kategori.nama_kategori HAVING total_terjual > 5 ORDER BY total_terjual DESC;` |
| Required Tables | `["produk", "kategori", "detail_pesanan", "pesanan"]` |
| Concept Tags | `["multi_join", "group_by", "having", "order_by", "aggregate", "filtering"]` |
| Order Matters | true |
| Hints | `["Tabel apa yang dibutuhkan? Ada 4 tabel: produk, kategori, detail_pesanan, dan pesanan.", "Gunakan SUM(jumlah) dan GROUP BY. Filter status pesanan menggunakan WHERE.", "Gunakan HAVING total_terjual > 5 untuk agregat, lalu ORDER BY DESC."]` |

---

## Skema 3: Perpustakaan (Kode: PP)
**Tabel:** `anggota`, `penulis`, `penerbit`, `buku`, `peminjaman`

### Level 1

| Field | Isi |
|---|---|
| Code | PP-1A |
| Variant Group | PP-1 |
| Skema | perpustakaan |
| Level | 1 |
| Title | Buku dan Penerbit |
| Prompt | Tampilkan `id_buku`, `judul`, dan `nama_penerbit` untuk semua buku di perpustakaan. |
| Expected SQL | `SELECT buku.id_buku, buku.judul, penerbit.nama_penerbit FROM buku INNER JOIN penerbit ON buku.id_penerbit = penerbit.id_penerbit;` |
| Required Tables | `["buku", "penerbit"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Nama penerbit terpisah dari tabel buku. Coba gabungkan kedua tabel tersebut.", "Perhatikan foreign key id_penerbit pada tabel buku.", "Gunakan INNER JOIN pada tabel buku dan penerbit."]` |

| Field | Isi |
|---|---|
| Code | PP-1B |
| Variant Group | PP-1 |
| Skema | perpustakaan |
| Level | 1 |
| Title | Buku dan Penulis |
| Prompt | Tampilkan `id_buku`, `judul`, dan `nama_penulis` untuk semua buku di perpustakaan. |
| Expected SQL | `SELECT buku.id_buku, buku.judul, penulis.nama_penulis FROM buku INNER JOIN penulis ON buku.id_penulis = penulis.id_penulis;` |
| Required Tables | `["buku", "penulis"]` |
| Concept Tags | `["inner_join", "pk_fk"]` |
| Order Matters | false |
| Hints | `["Nama penulis ada di tabel penulis, sedangkan judul buku di tabel buku.", "Buku dan penulis dihubungkan oleh sebuah kolom.", "Gunakan INNER JOIN pada tabel buku dan penulis menggunakan id_penulis."]` |

| Field | Isi |
|---|---|
| Code | PP-2A |
| Variant Group | PP-2 |
| Skema | perpustakaan |
| Level | 1 |
| Title | Buku Terbitan Baru |
| Prompt | Tampilkan `judul`, `tahun_terbit`, dan `nama_penerbit` khusus untuk buku yang terbit pada tahun 2020 atau lebih baru (>= 2020). |
| Expected SQL | `SELECT buku.judul, buku.tahun_terbit, penerbit.nama_penerbit FROM buku INNER JOIN penerbit ON buku.id_penerbit = penerbit.id_penerbit WHERE buku.tahun_terbit >= 2020;` |
| Required Tables | `["buku", "penerbit"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Tabel mana yang memiliki data tahun terbit?", "Lakukan penggabungan buku dan penerbit.", "Gunakan klausa WHERE tahun_terbit >= 2020."]` |

| Field | Isi |
|---|---|
| Code | PP-2B |
| Variant Group | PP-2 |
| Skema | perpustakaan |
| Level | 1 |
| Title | Karya Sari Wulandari |
| Prompt | Tampilkan `judul`, `tahun_terbit`, dan `nama_penulis` khusus untuk buku yang ditulis oleh 'Sari Wulandari'. |
| Expected SQL | `SELECT buku.judul, buku.tahun_terbit, penulis.nama_penulis FROM buku INNER JOIN penulis ON buku.id_penulis = penulis.id_penulis WHERE penulis.nama_penulis = 'Sari Wulandari';` |
| Required Tables | `["buku", "penulis"]` |
| Concept Tags | `["inner_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Kamu butuh menggabungkan tabel buku dengan tabel penulis.", "Saring hasilnya untuk penulis bernama Sari Wulandari.", "Gunakan klausa WHERE nama_penulis = 'Sari Wulandari' setelah INNER JOIN."]` |

### Level 2

| Field | Isi |
|---|---|
| Code | PP-3A |
| Variant Group | PP-3 |
| Skema | perpustakaan |
| Level | 2 |
| Title | Buku Belum Pernah Dipinjam |
| Prompt | Tampilkan `id_buku` dan `judul` khusus untuk buku yang belum pernah dipinjam sama sekali (tidak tercatat di tabel `peminjaman`). |
| Expected SQL | `SELECT buku.id_buku, buku.judul FROM buku LEFT JOIN peminjaman ON buku.id_buku = peminjaman.id_buku WHERE peminjaman.id_pinjam IS NULL;` |
| Required Tables | `["buku", "peminjaman"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Buku yang belum dipinjam berarti tidak ada di tabel peminjaman.", "Gunakan LEFT JOIN dari buku ke peminjaman.", "Periksa nilai NULL di tabel peminjaman dengan klausa WHERE."]` |

| Field | Isi |
|---|---|
| Code | PP-3B |
| Variant Group | PP-3 |
| Skema | perpustakaan |
| Level | 2 |
| Title | Anggota Belum Pernah Meminjam |
| Prompt | Tampilkan `id_anggota` dan `nama` khusus untuk anggota yang belum pernah meminjam buku satupun. |
| Expected SQL | `SELECT anggota.id_anggota, anggota.nama FROM anggota LEFT JOIN peminjaman ON anggota.id_anggota = peminjaman.id_anggota WHERE peminjaman.id_pinjam IS NULL;` |
| Required Tables | `["anggota", "peminjaman"]` |
| Concept Tags | `["left_join", "is_null_filtering"]` |
| Order Matters | false |
| Hints | `["Gunakan teknik penggabungan luar (outer join).", "Kamu bisa menggunakan LEFT JOIN antara anggota dan peminjaman.", "Cari yang kolom id_pinjam-nya bernilai NULL."]` |

| Field | Isi |
|---|---|
| Code | PP-4A |
| Variant Group | PP-4 |
| Skema | perpustakaan |
| Level | 2 |
| Title | Buku Belum Dikembalikan |
| Prompt | Tampilkan `nama` anggota, `judul` buku, dan `tgl_pinjam` untuk semua peminjaman yang bukunya belum dikembalikan (`tgl_kembali` bernilai NULL). |
| Expected SQL | `SELECT anggota.nama, buku.judul, peminjaman.tgl_pinjam FROM peminjaman INNER JOIN anggota ON peminjaman.id_anggota = anggota.id_anggota INNER JOIN buku ON peminjaman.id_buku = buku.id_buku WHERE peminjaman.tgl_kembali IS NULL;` |
| Required Tables | `["peminjaman", "anggota", "buku"]` |
| Concept Tags | `["multi_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Ada tiga tabel yang saling berhubungan disini: peminjaman, anggota, buku.", "Lakukan INNER JOIN secara berurutan pada ketiga tabel tersebut.", "Saring datanya pada kondisi dimana tgl_kembali IS NULL."]` |

| Field | Isi |
|---|---|
| Code | PP-4B |
| Variant Group | PP-4 |
| Skema | perpustakaan |
| Level | 2 |
| Title | Peminjaman Berdenda |
| Prompt | Tampilkan `nama` anggota, `judul` buku, dan `denda` untuk semua peminjaman yang nilai dendanya lebih dari 0. |
| Expected SQL | `SELECT anggota.nama, buku.judul, peminjaman.denda FROM peminjaman INNER JOIN anggota ON peminjaman.id_anggota = anggota.id_anggota INNER JOIN buku ON peminjaman.id_buku = buku.id_buku WHERE peminjaman.denda > 0;` |
| Required Tables | `["peminjaman", "anggota", "buku"]` |
| Concept Tags | `["multi_join", "filtering"]` |
| Order Matters | false |
| Hints | `["Gabungkan tabel peminjaman dengan anggota dan buku.", "Cari mana transaksi yang dendanya > 0.", "Pastikan kamu menggunakan INNER JOIN dan klausa WHERE denda > 0."]` |

### Level 3

| Field | Isi |
|---|---|
| Code | PP-5A |
| Variant Group | PP-5 |
| Skema | perpustakaan |
| Level | 3 |
| Title | Akumulasi Denda Anggota |
| Prompt | Tampilkan `id_anggota`, `nama`, `prodi`, dan total denda (sebagai `total_denda`) dari seluruh peminjaman yang pernah dilakukan tiap anggota. Hanya tampilkan anggota yang memiliki total denda di atas 10000. Urutkan dari denda terbesar. |
| Expected SQL | `SELECT anggota.id_anggota, anggota.nama, anggota.prodi, SUM(peminjaman.denda) AS total_denda FROM anggota INNER JOIN peminjaman ON anggota.id_anggota = peminjaman.id_anggota GROUP BY anggota.id_anggota, anggota.nama, anggota.prodi HAVING total_denda > 10000 ORDER BY total_denda DESC;` |
| Required Tables | `["anggota", "peminjaman"]` |
| Concept Tags | `["inner_join", "group_by", "having", "order_by", "aggregate"]` |
| Order Matters | true |
| Hints | `["Kamu hanya butuh menggabungkan anggota dan peminjaman untuk mencari denda.", "Gunakan SUM(denda) untuk menjumlahkan dan jangan lupa GROUP BY.", "Gunakan HAVING total_denda > 10000 dan ORDER BY total_denda DESC."]` |

| Field | Isi |
|---|---|
| Code | PP-5B |
| Variant Group | PP-5 |
| Skema | perpustakaan |
| Level | 3 |
| Title | Penerbit Paling Sering Dipinjam (Tanpa Denda) |
| Prompt | Tampilkan `id_penerbit`, `nama_penerbit`, dan jumlah buku yang pernah dipinjam (sebagai `total_dipinjam`) dari penerbit tersebut. Hanya hitung peminjaman yang denda-nya bernilai 0. Urutkan dari jumlah pinjaman terbanyak. |
| Expected SQL | `SELECT penerbit.id_penerbit, penerbit.nama_penerbit, COUNT(peminjaman.id_pinjam) AS total_dipinjam FROM penerbit INNER JOIN buku ON penerbit.id_penerbit = buku.id_penerbit INNER JOIN peminjaman ON buku.id_buku = peminjaman.id_buku WHERE peminjaman.denda = 0 GROUP BY penerbit.id_penerbit, penerbit.nama_penerbit ORDER BY total_dipinjam DESC;` |
| Required Tables | `["penerbit", "buku", "peminjaman"]` |
| Concept Tags | `["multi_join", "group_by", "order_by", "aggregate", "filtering"]` |
| Order Matters | true |
| Hints | `["Kamu butuh tabel penerbit, buku, dan peminjaman.", "Gunakan COUNT(id_pinjam) bersama GROUP BY, lalu tambahkan WHERE denda = 0.", "Urutkan hasilnya menggunakan ORDER BY total_dipinjam DESC."]` |
