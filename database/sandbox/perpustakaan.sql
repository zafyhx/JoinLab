-- ============================================================
-- Sandbox Schema: sb_perpustakaan
-- (Schema drop/create + search_path handled by sandbox-rebuild.ts)
-- ============================================================

CREATE TABLE anggota (
  id_anggota INTEGER PRIMARY KEY,
  nama       VARCHAR(80) NOT NULL,
  prodi      VARCHAR(60) NOT NULL
);

CREATE TABLE penulis (
  id_penulis   INTEGER PRIMARY KEY,
  nama_penulis VARCHAR(80) NOT NULL
);

CREATE TABLE penerbit (
  id_penerbit   INTEGER PRIMARY KEY,
  nama_penerbit VARCHAR(80) NOT NULL
);

CREATE TABLE buku (
  id_buku       INTEGER PRIMARY KEY,
  judul         VARCHAR(150) NOT NULL,
  tahun_terbit  SMALLINT NOT NULL,
  id_penulis    INTEGER NOT NULL,
  id_penerbit   INTEGER NOT NULL,
  FOREIGN KEY (id_penulis)  REFERENCES penulis(id_penulis),
  FOREIGN KEY (id_penerbit) REFERENCES penerbit(id_penerbit)
);

CREATE TABLE peminjaman (
  id_pinjam    SERIAL PRIMARY KEY,
  id_anggota   INTEGER NOT NULL,
  id_buku      INTEGER NOT NULL,
  tgl_pinjam   DATE NOT NULL,
  tgl_kembali  DATE,
  denda        INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota),
  FOREIGN KEY (id_buku)    REFERENCES buku(id_buku)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Anggota (15, min 2 tidak pernah meminjam)
INSERT INTO anggota (id_anggota, nama, prodi) VALUES
(1, 'Ahmad Ridwan', 'Pendidikan Teknik Informatika'),
(2, 'Bella Safira', 'Pendidikan Teknik Informatika'),
(3, 'Candra Kusuma', 'Sistem Informasi'),
(4, 'Dinda Kirana', 'Teknik Elektro'),
(5, 'Eko Wahyudi', 'Pendidikan Teknik Informatika'),
(6, 'Fauziah Nur', 'Sistem Informasi'),
(7, 'Guntur Tri', 'Teknik Mesin'),
(8, 'Hafiz Pratama', 'Pendidikan Teknik Informatika'),
(9, 'Intan Nuraini', 'Pendidikan Matematika'),
(10, 'Julianto', 'Teknik Sipil'),
(11, 'Karin Novilda', 'Pendidikan Fisika'),
(12, 'Lutfi Hakim', 'Pendidikan Teknik Informatika'),
(13, 'Muhammad Alif', 'Sistem Informasi'),
(14, 'Nadya Arina', 'Pendidikan Teknik Informatika'), -- Belum pernah meminjam 1
(15, 'Oscar Lawalata', 'Teknik Mesin');               -- Belum pernah meminjam 2

-- Penulis (8, memuat Sari Wulandari, min 2 punya >= 2 buku)
INSERT INTO penulis (id_penulis, nama_penulis) VALUES
(1, 'Sari Wulandari'),
(2, 'Budi Raharjo'),
(3, 'Abdul Kadir'),
(4, 'Tere Liye'),
(5, 'Andrea Hirata'),
(6, 'Prof. Richardus Eko Indrajit'),
(7, 'Fajar Junaedi'),
(8, 'Dewi Lestari');

-- Penerbit (4)
INSERT INTO penerbit (id_penerbit, nama_penerbit) VALUES
(1, 'Andi Offset'),
(2, 'Gramedia Pustaka'),
(3, 'Informatika Bandung'),
(4, 'Erlangga');

-- Buku (25)
-- Andi Offset: min 3 buku (1 < 2018, 2 >= 2018)
-- Sari Wulandari: min 2 buku (1 < 2015, 1 >= 2015)
-- Min 3 buku tidak pernah dipinjam
INSERT INTO buku (id_buku, judul, tahun_terbit, id_penulis, id_penerbit) VALUES
(101, 'Dasar-Dasar Pemrograman SQL', 2014, 1, 1),       -- Sari Wulandari, Andi (<2015, <2018)
(102, 'Desain Database Relasional Modern', 2019, 1, 1),  -- Sari Wulandari, Andi (>=2015, >=2018)
(103, 'Kumpulan Soal Praktikum Basis Data', 2021, 2, 1), -- Andi (>=2018)
(104, 'Pemrograman Python untuk Pemula', 2018, 2, 3),    -- Budi Raharjo, Informatika
(105, 'Mudah Belajar Java', 2020, 2, 3),
(106, 'Algoritma dan Struktur Data C++', 2016, 3, 1),
(107, 'Logika Pemrograman Komputer', 2015, 3, 4),
(108, 'Bumi', 2014, 4, 2),
(109, 'Bulan', 2015, 4, 2),
(110, 'Matahari', 2016, 4, 2),
(111, 'Laskar Pelangi', 2005, 5, 2),
(112, 'Sang Pemimpi', 2006, 5, 2),
(113, 'Sistem Informasi Manajemen Strategis', 2017, 6, 4),
(114, 'Tata Kelola Teknologi Informasi', 2022, 6, 4),
(115, 'Komunikasi Massa Praktis', 2019, 7, 2),
(116, 'Filosofi Kopi', 2006, 8, 2),
(117, 'Aroma Karsa', 2018, 8, 2),
(118, 'Data Science Fundamental', 2023, 2, 3),
(119, 'Machine Learning dengan Python', 2022, 3, 3),
(120, 'Pengembangan Web Next.js & React', 2024, 1, 3),
(121, 'Arsitektur Microservices', 2023, 6, 1),
(122, 'Cyber Security Essentials', 2021, 2, 4),
(123, 'Kecerdasan Buatan Terapan', 2020, 3, 1),          -- Belum pernah dipinjam 1
(124, 'Cloud Computing Enterprise', 2022, 6, 3),         -- Belum pernah dipinjam 2
(125, 'Metodologi Penelitian Informatika', 2018, 7, 4);   -- Belum pernah dipinjam 3

-- Peminjaman
-- Min 3 dengan tgl_kembali NULL
-- Min 3 dengan denda > 0
-- Min 1 buku dipinjam 2 anggota berbeda (Buku 101 dipinjam anggota 1 dan anggota 3)
INSERT INTO peminjaman (id_pinjam, id_anggota, id_buku, tgl_pinjam, tgl_kembali, denda) VALUES
(1, 1, 101, '2024-01-05', '2024-01-12', 0),
(2, 3, 101, '2024-01-15', '2024-01-22', 0),    -- Buku 101 dipinjam oleh anggota berbeda
(3, 2, 102, '2024-01-10', '2024-01-25', 10000), -- Denda 1
(4, 4, 103, '2024-01-12', '2024-01-28', 12000), -- Denda 2
(5, 5, 104, '2024-01-15', '2024-02-02', 15000), -- Denda 3
(6, 6, 105, '2024-02-01', '2024-02-08', 0),
(7, 7, 106, '2024-02-05', '2024-02-12', 0),
(8, 8, 107, '2024-02-10', '2024-02-17', 0),
(9, 9, 108, '2024-02-12', '2024-02-19', 0),
(10, 10, 109, '2024-02-15', '2024-02-22', 0),

-- Peminjaman yang belum dikembalikan (tgl_kembali NULL min 3)
(11, 1, 110, '2024-02-20', NULL, 0),             -- Belum kembali 1
(12, 2, 111, '2024-02-21', NULL, 0),             -- Belum kembali 2
(13, 3, 112, '2024-02-22', NULL, 0),             -- Belum kembali 3
(14, 11, 113, '2024-02-23', NULL, 0),
(15, 12, 114, '2024-02-24', NULL, 0);
