export interface QuestionSeedData {
  code: string;
  variantGroupCode: string;
  variantGroupTitle: string;
  schemaSlug: string;
  level: number;
  title: string;
  prompt: string;
  expectedSql: string;
  requiredTables: string[];
  conceptTags: string[];
  orderMatters: boolean;
  hints: string[];
}

export const QUESTIONS_DATA: QuestionSeedData[] = [
  // ==========================================
  // SKEMA AKADEMIK (AK)
  // ==========================================
  // Level 1
  {
    code: "AK-1A",
    variantGroupCode: "AK-1",
    variantGroupTitle: "Data Entitas dan Jurusan",
    schemaSlug: "akademik",
    level: 1,
    title: "Data Mahasiswa dan Jurusan",
    prompt: "Tampilkan kolom nim, nama_mhs, dan nama_jurusan untuk semua mahasiswa.",
    expectedSql: "SELECT mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan FROM mahasiswa INNER JOIN jurusan ON mahasiswa.id_jurusan = jurusan.id_jurusan;",
    requiredTables: ["mahasiswa", "jurusan"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Data yang diminta berada di dua tabel berbeda: mahasiswa dan jurusan.",
      "Perhatikan kolom id_jurusan pada tabel mahasiswa dan jurusan yang saling berhubungan.",
      "Gunakan INNER JOIN untuk menggabungkan kedua tabel tersebut dengan menyamakan kolom kuncinya (lihat ERD)."
    ]
  },
  {
    code: "AK-1B",
    variantGroupCode: "AK-1",
    variantGroupTitle: "Data Entitas dan Jurusan",
    schemaSlug: "akademik",
    level: 1,
    title: "Data Dosen dan Jurusan",
    prompt: "Tampilkan kolom id_dosen, nama_dosen, dan nama_jurusan untuk semua dosen.",
    expectedSql: "SELECT dosen.id_dosen, dosen.nama_dosen, jurusan.nama_jurusan FROM dosen INNER JOIN jurusan ON dosen.id_jurusan = jurusan.id_jurusan;",
    requiredTables: ["dosen", "jurusan"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Data dosen ada di tabel dosen, sedangkan nama jurusan ada di tabel jurusan.",
      "Kedua tabel tersebut terhubung melalui kolom id_jurusan.",
      "Gunakan INNER JOIN untuk menggabungkan dosen dan jurusan dengan menyamakan kolom kuncinya (lihat ERD)."
    ]
  },
  {
    code: "AK-2A",
    variantGroupCode: "AK-2",
    variantGroupTitle: "Filter Data dengan Relasi",
    schemaSlug: "akademik",
    level: 1,
    title: "Mata Kuliah 3 SKS",
    prompt: "Tampilkan kolom kode_mk, nama_mk, dan nama_dosen pengampunya, khusus untuk mata kuliah yang memiliki sks sama dengan 3.",
    expectedSql: "SELECT mata_kuliah.kode_mk, mata_kuliah.nama_mk, dosen.nama_dosen FROM mata_kuliah INNER JOIN dosen ON mata_kuliah.id_dosen = dosen.id_dosen WHERE mata_kuliah.sks = 3;",
    requiredTables: ["mata_kuliah", "dosen"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Kamu perlu menggabungkan tabel mata_kuliah dengan tabel dosen menggunakan id_dosen.",
      "Jangan lupa menyaring hasil berdasarkan sks dari mata kuliah.",
      "Gunakan WHERE mata_kuliah.sks = 3 setelah melakukan INNER JOIN."
    ]
  },
  {
    code: "AK-2B",
    variantGroupCode: "AK-2",
    variantGroupTitle: "Filter Data dengan Relasi",
    schemaSlug: "akademik",
    level: 1,
    title: "Mahasiswa Angkatan 2023",
    prompt: "Tampilkan kolom nim, nama_mhs, dan nama_jurusan khusus untuk mahasiswa dengan angkatan 2023.",
    expectedSql: "SELECT mahasiswa.nim, mahasiswa.nama_mhs, jurusan.nama_jurusan FROM mahasiswa INNER JOIN jurusan ON mahasiswa.id_jurusan = jurusan.id_jurusan WHERE mahasiswa.angkatan = 2023;",
    requiredTables: ["mahasiswa", "jurusan"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Tabel mahasiswa menyimpan data angkatan, dan tabel jurusan menyimpan nama jurusan.",
      "Gabungkan tabel mahasiswa dan jurusan, lalu berikan kondisi pada angkatan.",
      "Tambahkan klausa WHERE mahasiswa.angkatan = 2023 pada query INNER JOIN kamu."
    ]
  },
  // Level 2
  {
    code: "AK-3A",
    variantGroupCode: "AK-3",
    variantGroupTitle: "Pencarian Data Tanpa Relasi",
    schemaSlug: "akademik",
    level: 2,
    title: "Mahasiswa Tanpa KRS",
    prompt: "Tampilkan kolom nim dan nama_mhs untuk mahasiswa yang belum mengambil satupun mata kuliah (tidak memiliki data sama sekali di tabel krs).",
    expectedSql: "SELECT mahasiswa.nim, mahasiswa.nama_mhs FROM mahasiswa LEFT JOIN krs ON mahasiswa.nim = krs.nim WHERE krs.nim IS NULL;",
    requiredTables: ["mahasiswa", "krs"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Bagaimana cara menampilkan semua mahasiswa meskipun tidak ada di tabel krs?",
      "Gunakan LEFT JOIN dari tabel mahasiswa ke krs berdasarkan nim.",
      "Setelah di-LEFT JOIN, cari baris yang nilai kolom dari tabel krs bernilai NULL (WHERE krs.nim IS NULL)."
    ]
  },
  {
    code: "AK-3B",
    variantGroupCode: "AK-3",
    variantGroupTitle: "Pencarian Data Tanpa Relasi",
    schemaSlug: "akademik",
    level: 2,
    title: "Dosen Tanpa Mata Kuliah",
    prompt: "Tampilkan kolom id_dosen dan nama_dosen untuk dosen yang belum mengampu mata kuliah satupun (tidak ada data di tabel mata_kuliah).",
    expectedSql: "SELECT dosen.id_dosen, dosen.nama_dosen FROM dosen LEFT JOIN mata_kuliah ON dosen.id_dosen = mata_kuliah.id_dosen WHERE mata_kuliah.kode_mk IS NULL;",
    requiredTables: ["dosen", "mata_kuliah"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Gunakan LEFT JOIN agar dosen yang tidak memiliki mata kuliah tetap muncul.",
      "Hubungkan dosen dengan mata_kuliah menggunakan id_dosen.",
      "Saring hasilnya di klausa WHERE dengan mengecek apakah kolom mata_kuliah.kode_mk IS NULL."
    ]
  },
  {
    code: "AK-4A",
    variantGroupCode: "AK-4",
    variantGroupTitle: "Relasi 3 Tabel Bertingkat",
    schemaSlug: "akademik",
    level: 2,
    title: "Mata Kuliah Mahasiswa Semester Ganjil",
    prompt: "Tampilkan kolom nama_mhs, nama_mk, dan nilai_angka untuk semua mahasiswa yang mengambil mata kuliah pada semester '2024-Ganjil'.",
    expectedSql: "SELECT mahasiswa.nama_mhs, mata_kuliah.nama_mk, krs.nilai_angka FROM mahasiswa INNER JOIN krs ON mahasiswa.nim = krs.nim INNER JOIN mata_kuliah ON krs.kode_mk = mata_kuliah.kode_mk WHERE krs.semester = '2024-Ganjil';",
    requiredTables: ["mahasiswa", "krs", "mata_kuliah"],
    conceptTags: ["inner_join", "three_tables"],
    orderMatters: false,
    hints: [
      "Soal ini membutuhkan 3 tabel: mahasiswa, krs, dan mata_kuliah.",
      "Tabel krs berfungsi sebagai jembatan antara mahasiswa dan mata_kuliah.",
      "Lakukan dua kali INNER JOIN: mahasiswa ke krs (nim), lalu krs ke mata_kuliah (kode_mk), lalu filter semester."
    ]
  },
  {
    code: "AK-4B",
    variantGroupCode: "AK-4",
    variantGroupTitle: "Relasi 3 Tabel Bertingkat",
    schemaSlug: "akademik",
    level: 2,
    title: "Dosen Pengampu Mahasiswa Semester Genap",
    prompt: "Tampilkan kolom nama_mhs, nama_mk, dan nama_dosen pengampunya untuk krs pada semester '2024-Genap'.",
    expectedSql: "SELECT mahasiswa.nama_mhs, mata_kuliah.nama_mk, dosen.nama_dosen FROM mahasiswa INNER JOIN krs ON mahasiswa.nim = krs.nim INNER JOIN mata_kuliah ON krs.kode_mk = mata_kuliah.kode_mk INNER JOIN dosen ON mata_kuliah.id_dosen = dosen.id_dosen WHERE krs.semester = '2024-Genap';",
    requiredTables: ["mahasiswa", "krs", "mata_kuliah", "dosen"],
    conceptTags: ["inner_join", "three_tables"],
    orderMatters: false,
    hints: [
      "Hubungkan mahasiswa ke krs, krs ke mata_kuliah, dan mata_kuliah ke dosen.",
      "Setiap JOIN membutuhkan kondisi ON yang menghubungkan kunci relasinya.",
      "Saring hanya semester '2024-Genap' pada klausa WHERE."
    ]
  },
  // Level 3
  {
    code: "AK-5A",
    variantGroupCode: "AK-5",
    variantGroupTitle: "Agregasi dan Relasi Lanjut",
    schemaSlug: "akademik",
    level: 3,
    title: "Jumlah Mata Kuliah per Dosen",
    prompt: "Tampilkan nama_dosen dan jumlah_mk (dihitung dari banyaknya mata kuliah yang diampu). Dosen yang belum mengampu mata kuliah harus tetap tampil dengan jumlah 0. Urutkan berdasarkan jumlah_mk terbanyak (DESC).",
    expectedSql: "SELECT dosen.nama_dosen, COUNT(mata_kuliah.kode_mk) AS jumlah_mk FROM dosen LEFT JOIN mata_kuliah ON dosen.id_dosen = mata_kuliah.id_dosen GROUP BY dosen.id_dosen, dosen.nama_dosen ORDER BY jumlah_mk DESC;",
    requiredTables: ["dosen", "mata_kuliah"],
    conceptTags: ["left_join", "aggregate", "group_by", "order_by", "outer_join"],
    orderMatters: true,
    hints: [
      "Agar dosen tanpa mata kuliah tetap tampil dengan jumlah 0, gunakan LEFT JOIN dan COUNT(mata_kuliah.kode_mk).",
      "Jangan gunakan COUNT(*) karena akan menghitung baris NULL sebagai 1.",
      "Gunakan GROUP BY dosen.id_dosen, dosen.nama_dosen dan ORDER BY jumlah_mk DESC."
    ]
  },
  {
    code: "AK-5B",
    variantGroupCode: "AK-5",
    variantGroupTitle: "Agregasi dan Relasi Lanjut",
    schemaSlug: "akademik",
    level: 3,
    title: "Rata-Rata Nilai per Jurusan",
    prompt: "Tampilkan nama_jurusan dan rata_nilai (dibulatkan atau format rata-rata dari nilai_angka mahasiswa di tabel krs). Tampilkan hanya jurusan yang memiliki mahasiswa dengan nilai. Urutkan berdasarkan rata_nilai tertinggi (DESC).",
    expectedSql: "SELECT jurusan.nama_jurusan, AVG(krs.nilai_angka) AS rata_nilai FROM jurusan INNER JOIN mahasiswa ON jurusan.id_jurusan = mahasiswa.id_jurusan INNER JOIN krs ON mahasiswa.nim = krs.nim WHERE krs.nilai_angka IS NOT NULL GROUP BY jurusan.id_jurusan, jurusan.nama_jurusan ORDER BY rata_nilai DESC;",
    requiredTables: ["jurusan", "mahasiswa", "krs"],
    conceptTags: ["inner_join", "aggregate", "group_by", "order_by"],
    orderMatters: true,
    hints: [
      "Hubungkan jurusan -> mahasiswa -> krs menggunakan INNER JOIN.",
      "Gunakan fungsi AVG(krs.nilai_angka) dan pastikan krs.nilai_angka IS NOT NULL.",
      "Kelompokkan dengan GROUP BY jurusan.id_jurusan, jurusan.nama_jurusan lalu ORDER BY rata_nilai DESC."
    ]
  },

  // ==========================================
  // SKEMA TOKO (TK)
  // ==========================================
  // Level 1
  {
    code: "TK-1A",
    variantGroupCode: "TK-1",
    variantGroupTitle: "Data Entitas dan Kategori Toko",
    schemaSlug: "toko",
    level: 1,
    title: "Data Produk dan Kategori",
    prompt: "Tampilkan kolom nama_produk, harga, dan nama_kategori untuk seluruh produk.",
    expectedSql: "SELECT produk.nama_produk, produk.harga, kategori.nama_kategori FROM produk INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori;",
    requiredTables: ["produk", "kategori"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Nama kategori tersimpan di tabel kategori, sedangkan produk ada di tabel produk.",
      "Kedua tabel terhubung melalui kolom id_kategori.",
      "Gunakan INNER JOIN untuk menggabungkan produk dan kategori dengan menyamakan kolom kuncinya (lihat ERD)."
    ]
  },
  {
    code: "TK-1B",
    variantGroupCode: "TK-1",
    variantGroupTitle: "Data Entitas dan Kategori Toko",
    schemaSlug: "toko",
    level: 1,
    title: "Data Pesanan dan Pelanggan",
    prompt: "Tampilkan kolom id_pesanan, tanggal, dan nama pelanggan yang memesan.",
    expectedSql: "SELECT pesanan.id_pesanan, pesanan.tanggal, pelanggan.nama FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan;",
    requiredTables: ["pesanan", "pelanggan"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Gunakan tabel pesanan dan pelanggan.",
      "Hubungkan kedua tabel menggunakan id_pelanggan.",
      "Pilih kolom id_pesanan, tanggal, dan pelanggan.nama dengan INNER JOIN."
    ]
  },
  {
    code: "TK-2A",
    variantGroupCode: "TK-2",
    variantGroupTitle: "Filter Transaksi Toko",
    schemaSlug: "toko",
    level: 1,
    title: "Pesanan Pelanggan Asal Bandung",
    prompt: "Tampilkan kolom id_pesanan, tanggal, nama pelanggan, dan status pesanan khusus untuk pelanggan yang berasal dari kota 'Bandung'.",
    expectedSql: "SELECT pesanan.id_pesanan, pesanan.tanggal, pelanggan.nama, pesanan.status FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan WHERE pelanggan.kota = 'Bandung';",
    requiredTables: ["pesanan", "pelanggan"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Gabungkan tabel pesanan dan pelanggan menggunakan id_pelanggan.",
      "Terapkan filter WHERE pelanggan.kota = 'Bandung'.",
      "Pastikan kolom yang ditampilkan adalah id_pesanan, tanggal, nama, dan status."
    ]
  },
  {
    code: "TK-2B",
    variantGroupCode: "TK-2",
    variantGroupTitle: "Filter Transaksi Toko",
    schemaSlug: "toko",
    level: 1,
    title: "Produk Kategori Elektronik",
    prompt: "Tampilkan kolom nama_produk, harga, dan stok khusus untuk produk yang berada dalam kategori 'Elektronik'.",
    expectedSql: "SELECT produk.nama_produk, produk.harga, produk.stok FROM produk INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori WHERE kategori.nama_kategori = 'Elektronik';",
    requiredTables: ["produk", "kategori"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Hubungkan produk dan kategori melalui id_kategori.",
      "Saring hanya kategori yang bernama 'Elektronik' pada klausa WHERE.",
      "Pilih kolom nama_produk, harga, dan stok."
    ]
  },
  // Level 2
  {
    code: "TK-3A",
    variantGroupCode: "TK-3",
    variantGroupTitle: "Pencarian Data Toko Tanpa Transaksi",
    schemaSlug: "toko",
    level: 2,
    title: "Pelanggan yang Belum Pernah Memesan",
    prompt: "Tampilkan kolom id_pelanggan, nama, dan kota untuk pelanggan yang belum pernah melakukan pemesanan sama sekali.",
    expectedSql: "SELECT pelanggan.id_pelanggan, pelanggan.nama, pelanggan.kota FROM pelanggan LEFT JOIN pesanan ON pelanggan.id_pelanggan = pesanan.id_pelanggan WHERE pesanan.id_pesanan IS NULL;",
    requiredTables: ["pelanggan", "pesanan"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Gunakan LEFT JOIN dari tabel pelanggan ke tabel pesanan.",
      "Pelanggan yang tidak pernah memesan akan memiliki nilai NULL pada kolom pesanan.",
      "Tambahkan WHERE pesanan.id_pesanan IS NULL."
    ]
  },
  {
    code: "TK-3B",
    variantGroupCode: "TK-3",
    variantGroupTitle: "Pencarian Data Toko Tanpa Transaksi",
    schemaSlug: "toko",
    level: 2,
    title: "Produk yang Belum Pernah Terjual",
    prompt: "Tampilkan kolom id_produk dan nama_produk untuk produk yang belum pernah ada dalam transaksi detail_pesanan.",
    expectedSql: "SELECT produk.id_produk, produk.nama_produk FROM produk LEFT JOIN detail_pesanan ON produk.id_produk = detail_pesanan.id_produk WHERE detail_pesanan.id_detail IS NULL;",
    requiredTables: ["produk", "detail_pesanan"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Gunakan LEFT JOIN dari produk ke detail_pesanan menggunakan id_produk.",
      "Saring baris yang detail_pesanannya bernilai NULL.",
      "Klausa WHERE detail_pesanan.id_detail IS NULL memastikan hanya produk belum terjual yang tampil."
    ]
  },
  {
    code: "TK-4A",
    variantGroupCode: "TK-4",
    variantGroupTitle: "Transaksi Rinci 3 Tabel",
    schemaSlug: "toko",
    level: 2,
    title: "Rincian Item Pesanan Selesai",
    prompt: "Tampilkan kolom nama pelanggan, nama_produk yang dibeli, jumlah, dan harga_satuan khusus untuk pesanan yang berstatus 'selesai'.",
    expectedSql: "SELECT pelanggan.nama, produk.nama_produk, detail_pesanan.jumlah, detail_pesanan.harga_satuan FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan INNER JOIN detail_pesanan ON pesanan.id_pesanan = detail_pesanan.id_pesanan INNER JOIN produk ON detail_pesanan.id_produk = produk.id_produk WHERE pesanan.status = 'selesai';",
    requiredTables: ["pesanan", "pelanggan", "detail_pesanan", "produk"],
    conceptTags: ["inner_join", "multiple_tables"],
    orderMatters: false,
    hints: [
      "Hubungkan pesanan ke pelanggan (id_pelanggan), lalu pesanan ke detail_pesanan (id_pesanan), lalu ke produk (id_produk).",
      "Pastikan semua kondisi ON terhubung dengan benar.",
      "Tambahkan WHERE pesanan.status = 'selesai'."
    ]
  },
  {
    code: "TK-4B",
    variantGroupCode: "TK-4",
    variantGroupTitle: "Transaksi Rinci 3 Tabel",
    schemaSlug: "toko",
    level: 2,
    title: "Rincian Item Pesanan Dikirim",
    prompt: "Tampilkan kolom id_pesanan, nama pelanggan, nama_produk, dan jumlah untuk pesanan yang sedang 'dikirim'.",
    expectedSql: "SELECT pesanan.id_pesanan, pelanggan.nama, produk.nama_produk, detail_pesanan.jumlah FROM pesanan INNER JOIN pelanggan ON pesanan.id_pelanggan = pelanggan.id_pelanggan INNER JOIN detail_pesanan ON pesanan.id_pesanan = detail_pesanan.id_pesanan INNER JOIN produk ON detail_pesanan.id_produk = produk.id_produk WHERE pesanan.status = 'dikirim';",
    requiredTables: ["pesanan", "pelanggan", "detail_pesanan", "produk"],
    conceptTags: ["inner_join", "multiple_tables"],
    orderMatters: false,
    hints: [
      "Gabungkan 4 tabel yang terlibat dalam transaksi belanja.",
      "Gunakan INNER JOIN beruntun dari pesanan -> pelanggan -> detail_pesanan -> produk.",
      "Saring hanya status = 'dikirim' di klausa WHERE."
    ]
  },
  // Level 3
  {
    code: "TK-5A",
    variantGroupCode: "TK-5",
    variantGroupTitle: "Total Transaksi dan Agregat Penjualan",
    schemaSlug: "toko",
    level: 3,
    title: "Total Belanja per Pelanggan",
    prompt: "Tampilkan nama pelanggan dan total_belanja (hasil perkalian jumlah * harga_satuan yang dijumlahkan). Pelanggan yang belum pernah memesan harus tetap tampil dengan total 0 atau NULL (gunakan COALESCE jika perlu). Urutkan dari total_belanja terbesar (DESC).",
    expectedSql: "SELECT pelanggan.nama, COALESCE(SUM(detail_pesanan.jumlah * detail_pesanan.harga_satuan), 0) AS total_belanja FROM pelanggan LEFT JOIN pesanan ON pelanggan.id_pelanggan = pesanan.id_pelanggan LEFT JOIN detail_pesanan ON pesanan.id_pesanan = detail_pesanan.id_pesanan GROUP BY pelanggan.id_pelanggan, pelanggan.nama ORDER BY total_belanja DESC;",
    requiredTables: ["pelanggan", "pesanan", "detail_pesanan"],
    conceptTags: ["left_join", "aggregate", "group_by", "order_by", "outer_join"],
    orderMatters: true,
    hints: [
      "Gunakan LEFT JOIN berantai dari pelanggan ke pesanan lalu ke detail_pesanan.",
      "Gunakan COALESCE(SUM(detail_pesanan.jumlah * detail_pesanan.harga_satuan), 0) untuk menangani pelanggan tanpa pesanan.",
      "GROUP BY pelanggan.id_pelanggan, pelanggan.nama dan urutkan ORDER BY total_belanja DESC."
    ]
  },
  {
    code: "TK-5B",
    variantGroupCode: "TK-5",
    variantGroupTitle: "Total Transaksi dan Agregat Penjualan",
    schemaSlug: "toko",
    level: 3,
    title: "Pendapatan per Kategori Produk",
    prompt: "Tampilkan nama_kategori dan total_pendapatan dari seluruh detail_pesanan. Kategori yang belum memiliki penjualan tetap tampil dengan total 0. Urutkan berdasarkan total_pendapatan terbesar (DESC).",
    expectedSql: "SELECT kategori.nama_kategori, COALESCE(SUM(detail_pesanan.jumlah * detail_pesanan.harga_satuan), 0) AS total_pendapatan FROM kategori LEFT JOIN produk ON kategori.id_kategori = produk.id_kategori LEFT JOIN detail_pesanan ON produk.id_produk = detail_pesanan.id_produk GROUP BY kategori.id_kategori, kategori.nama_kategori ORDER BY total_pendapatan DESC;",
    requiredTables: ["kategori", "produk", "detail_pesanan"],
    conceptTags: ["left_join", "aggregate", "group_by", "order_by", "outer_join"],
    orderMatters: true,
    hints: [
      "Mulai dari tabel kategori lalu lakukan LEFT JOIN ke produk dan detail_pesanan.",
      "Hitung total dengan COALESCE(SUM(detail_pesanan.jumlah * detail_pesanan.harga_satuan), 0).",
      "Kelompokkan berdasarkan kategori.id_kategori, kategori.nama_kategori dan urutkan DESC."
    ]
  },

  // ==========================================
  // SKEMA PERPUSTAKAAN (PP)
  // ==========================================
  // Level 1
  {
    code: "PP-1A",
    variantGroupCode: "PP-1",
    variantGroupTitle: "Data Buku dan Relasi Penulis/Penerbit",
    schemaSlug: "perpustakaan",
    level: 1,
    title: "Daftar Buku dan Penulisnya",
    prompt: "Tampilkan kolom judul buku, tahun_terbit, dan nama_penulis untuk seluruh buku.",
    expectedSql: "SELECT buku.judul, buku.tahun_terbit, penulis.nama_penulis FROM buku INNER JOIN penulis ON buku.id_penulis = penulis.id_penulis;",
    requiredTables: ["buku", "penulis"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Data buku ada di tabel buku, dan nama penulis di tabel penulis.",
      "Hubungkan kedua tabel menggunakan id_penulis.",
      "Gunakan INNER JOIN dan pilih judul, tahun_terbit, dan nama_penulis."
    ]
  },
  {
    code: "PP-1B",
    variantGroupCode: "PP-1",
    variantGroupTitle: "Data Buku dan Relasi Penulis/Penerbit",
    schemaSlug: "perpustakaan",
    level: 1,
    title: "Daftar Buku dan Penerbitnya",
    prompt: "Tampilkan kolom judul buku, tahun_terbit, dan nama_penerbit untuk seluruh buku.",
    expectedSql: "SELECT buku.judul, buku.tahun_terbit, penerbit.nama_penerbit FROM buku INNER JOIN penerbit ON buku.id_penerbit = penerbit.id_penerbit;",
    requiredTables: ["buku", "penerbit"],
    conceptTags: ["inner_join", "pk_fk"],
    orderMatters: false,
    hints: [
      "Gabungkan tabel buku dan penerbit.",
      "Gunakan id_penerbit sebagai kolom penghubung pada klausa ON.",
      "Pilih judul, tahun_terbit, dan nama_penerbit."
    ]
  },
  {
    code: "PP-2A",
    variantGroupCode: "PP-2",
    variantGroupTitle: "Filter Peminjaman Perpustakaan",
    schemaSlug: "perpustakaan",
    level: 1,
    title: "Peminjaman dengan Denda",
    prompt: "Tampilkan kolom nama anggota peminjam, tgl_pinjam, dan denda khusus untuk peminjaman yang memiliki denda lebih dari 0.",
    expectedSql: "SELECT anggota.nama, peminjaman.tgl_pinjam, peminjaman.denda FROM peminjaman INNER JOIN anggota ON peminjaman.id_anggota = anggota.id_anggota WHERE peminjaman.denda > 0;",
    requiredTables: ["peminjaman", "anggota"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Hubungkan peminjaman dengan anggota menggunakan id_anggota.",
      "Tambahkan kondisi filter WHERE peminjaman.denda > 0.",
      "Tampilkan nama anggota, tgl_pinjam, dan denda."
    ]
  },
  {
    code: "PP-2B",
    variantGroupCode: "PP-2",
    variantGroupTitle: "Filter Peminjaman Perpustakaan",
    schemaSlug: "perpustakaan",
    level: 1,
    title: "Buku Terbitan Penerbit Andi Offset",
    prompt: "Tampilkan kolom judul dan tahun_terbit untuk buku-buku yang diterbitkan oleh 'Andi Offset'.",
    expectedSql: "SELECT buku.judul, buku.tahun_terbit FROM buku INNER JOIN penerbit ON buku.id_penerbit = penerbit.id_penerbit WHERE penerbit.nama_penerbit = 'Andi Offset';",
    requiredTables: ["buku", "penerbit"],
    conceptTags: ["inner_join", "filtering"],
    orderMatters: false,
    hints: [
      "Gabungkan tabel buku dan penerbit menggunakan id_penerbit.",
      "Gunakan klausa WHERE penerbit.nama_penerbit = 'Andi Offset'.",
      "Pilih kolom buku.judul dan buku.tahun_terbit."
    ]
  },
  // Level 2
  {
    code: "PP-3A",
    variantGroupCode: "PP-3",
    variantGroupTitle: "Pencarian Data Buku/Anggota Pasif",
    schemaSlug: "perpustakaan",
    level: 2,
    title: "Buku yang Belum Pernah Dipinjam",
    prompt: "Tampilkan kolom id_buku dan judul untuk buku yang belum pernah ada riwayat peminjamannya di tabel peminjaman.",
    expectedSql: "SELECT buku.id_buku, buku.judul FROM buku LEFT JOIN peminjaman ON buku.id_buku = peminjaman.id_buku WHERE peminjaman.id_pinjam IS NULL;",
    requiredTables: ["buku", "peminjaman"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Gunakan LEFT JOIN dari tabel buku ke tabel peminjaman berdasarkan id_buku.",
      "Buku yang belum pernah dipinjam akan menghasilkan NULL pada kolom peminjaman.",
      "Saring dengan WHERE peminjaman.id_pinjam IS NULL."
    ]
  },
  {
    code: "PP-3B",
    variantGroupCode: "PP-3",
    variantGroupTitle: "Pencarian Data Buku/Anggota Pasif",
    schemaSlug: "perpustakaan",
    level: 2,
    title: "Anggota yang Belum Pernah Meminjam",
    prompt: "Tampilkan kolom id_anggota, nama, dan prodi untuk anggota yang belum pernah meminjam buku apapun.",
    expectedSql: "SELECT anggota.id_anggota, anggota.nama, anggota.prodi FROM anggota LEFT JOIN peminjaman ON anggota.id_anggota = peminjaman.id_anggota WHERE peminjaman.id_pinjam IS NULL;",
    requiredTables: ["anggota", "peminjaman"],
    conceptTags: ["left_join", "is_null_filtering", "outer_join"],
    orderMatters: false,
    hints: [
      "Lakukan LEFT JOIN dari tabel anggota ke peminjaman menggunakan id_anggota.",
      "Anggota yang belum pernah meminjam akan memiliki peminjaman.id_pinjam bernilai NULL.",
      "Tambahkan WHERE peminjaman.id_pinjam IS NULL."
    ]
  },
  {
    code: "PP-4A",
    variantGroupCode: "PP-4",
    variantGroupTitle: "Peminjaman Lengkap Multi-Tabel",
    schemaSlug: "perpustakaan",
    level: 2,
    title: "Rincian Peminjaman Belum Kembali",
    prompt: "Tampilkan kolom nama anggota, prodi, dan judul buku untuk peminjaman yang belum dikembalikan (tgl_kembali bernilai NULL).",
    expectedSql: "SELECT anggota.nama, anggota.prodi, buku.judul FROM peminjaman INNER JOIN anggota ON peminjaman.id_anggota = anggota.id_anggota INNER JOIN buku ON peminjaman.id_buku = buku.id_buku WHERE peminjaman.tgl_kembali IS NULL;",
    requiredTables: ["peminjaman", "anggota", "buku"],
    conceptTags: ["inner_join", "three_tables"],
    orderMatters: false,
    hints: [
      "Hubungkan peminjaman ke anggota (id_anggota) dan peminjaman ke buku (id_buku).",
      "Gunakan dua kali INNER JOIN.",
      "Saring hanya baris di mana peminjaman.tgl_kembali IS NULL."
    ]
  },
  {
    code: "PP-4B",
    variantGroupCode: "PP-4",
    variantGroupTitle: "Peminjaman Lengkap Multi-Tabel",
    schemaSlug: "perpustakaan",
    level: 2,
    title: "Buku Karya Sari Wulandari yang Dipinjam",
    prompt: "Tampilkan kolom nama peminjam, judul buku, dan tgl_pinjam untuk peminjaman buku yang ditulis oleh 'Sari Wulandari'.",
    expectedSql: "SELECT anggota.nama, buku.judul, peminjaman.tgl_pinjam FROM peminjaman INNER JOIN anggota ON peminjaman.id_anggota = anggota.id_anggota INNER JOIN buku ON peminjaman.id_buku = buku.id_buku INNER JOIN penulis ON buku.id_penulis = penulis.id_penulis WHERE penulis.nama_penulis = 'Sari Wulandari';",
    requiredTables: ["peminjaman", "anggota", "buku", "penulis"],
    conceptTags: ["inner_join", "multiple_tables"],
    orderMatters: false,
    hints: [
      "Hubungkan peminjaman -> anggota, peminjaman -> buku, dan buku -> penulis.",
      "Pastikan setiap klausul ON menghubungkan kolom kunci dengan benar.",
      "Tambahkan filter WHERE penulis.nama_penulis = 'Sari Wulandari'."
    ]
  },
  // Level 3
  {
    code: "PP-5A",
    variantGroupCode: "PP-5",
    variantGroupTitle: "Statistik Sirkulasi dan Buku Terpopuler",
    schemaSlug: "perpustakaan",
    level: 3,
    title: "Frekuensi Peminjaman per Buku",
    prompt: "Tampilkan judul buku dan total_pinjam (banyaknya frekuensi buku dipinjam). Buku yang belum pernah dipinjam harus tetap tampil dengan total_pinjam 0. Urutkan berdasarkan total_pinjam terbanyak (DESC).",
    expectedSql: "SELECT buku.judul, COUNT(peminjaman.id_pinjam) AS total_pinjam FROM buku LEFT JOIN peminjaman ON buku.id_buku = peminjaman.id_buku GROUP BY buku.id_buku, buku.judul ORDER BY total_pinjam DESC;",
    requiredTables: ["buku", "peminjaman"],
    conceptTags: ["left_join", "aggregate", "group_by", "order_by", "outer_join"],
    orderMatters: true,
    hints: [
      "Gunakan LEFT JOIN dari tabel buku ke peminjaman agar buku tanpa peminjaman tidak terbuang.",
      "Gunakan COUNT(peminjaman.id_pinjam) agar buku yang belum pernah dipinjam menghasilkan nilai 0.",
      "Kelompokkan dengan GROUP BY buku.id_buku, buku.judul dan urutkan ORDER BY total_pinjam DESC."
    ]
  },
  {
    code: "PP-5B",
    variantGroupCode: "PP-5",
    variantGroupTitle: "Statistik Sirkulasi dan Buku Terpopuler",
    schemaSlug: "perpustakaan",
    level: 3,
    title: "Total Denda per Program Studi",
    prompt: "Tampilkan prodi dan total_denda (jumlah denda yang dibayar/dikenakan anggota prodi tersebut). Tampilkan hanya prodi yang memiliki total denda lebih dari 0. Urutkan berdasarkan total_denda tertinggi (DESC).",
    expectedSql: "SELECT anggota.prodi, SUM(peminjaman.denda) AS total_denda FROM anggota INNER JOIN peminjaman ON anggota.id_anggota = peminjaman.id_anggota WHERE peminjaman.denda > 0 GROUP BY anggota.prodi HAVING SUM(peminjaman.denda) > 0 ORDER BY total_denda DESC;",
    requiredTables: ["anggota", "peminjaman"],
    conceptTags: ["inner_join", "aggregate", "group_by", "having", "order_by"],
    orderMatters: true,
    hints: [
      "Hubungkan anggota dengan peminjaman menggunakan id_anggota.",
      "Hitung total dengan SUM(peminjaman.denda) dan kelompokkan berdasarkan anggota.prodi.",
      "Gunakan HAVING total_denda > 0 dan urutkan ORDER BY total_denda DESC."
    ]
  }
];
