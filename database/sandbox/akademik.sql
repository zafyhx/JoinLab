-- ============================================================
-- Sandbox Schema: sb_akademik
-- (Schema drop/create + search_path handled by sandbox-rebuild.ts)
-- ============================================================

CREATE TABLE jurusan (
  id_jurusan   INTEGER PRIMARY KEY,
  nama_jurusan VARCHAR(60) NOT NULL
);

CREATE TABLE dosen (
  id_dosen    INTEGER PRIMARY KEY,
  nama_dosen  VARCHAR(80) NOT NULL,
  id_jurusan  INTEGER NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);

CREATE TABLE mahasiswa (
  nim         VARCHAR(10) PRIMARY KEY,
  nama_mhs    VARCHAR(80) NOT NULL,
  angkatan    SMALLINT NOT NULL,
  id_jurusan  INTEGER NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);

CREATE TABLE mata_kuliah (
  kode_mk   VARCHAR(6) PRIMARY KEY,
  nama_mk   VARCHAR(80) NOT NULL,
  sks       SMALLINT NOT NULL,
  id_dosen  INTEGER NOT NULL,
  FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen)
);

CREATE TABLE krs (
  id_krs        SERIAL PRIMARY KEY,
  nim           VARCHAR(10) NOT NULL,
  kode_mk       VARCHAR(6) NOT NULL,
  semester      VARCHAR(12) NOT NULL,
  nilai_angka   NUMERIC(5,2),
  UNIQUE (nim, kode_mk, semester),
  FOREIGN KEY (nim)     REFERENCES mahasiswa(nim),
  FOREIGN KEY (kode_mk) REFERENCES mata_kuliah(kode_mk)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Jurusan (3)
INSERT INTO jurusan (id_jurusan, nama_jurusan) VALUES
(1, 'Teknik Informatika'),
(2, 'Sistem Informasi'),
(3, 'Manajemen');

-- Dosen (8, min 2 Sistem Informasi, min 1 tanpa mata kuliah)
INSERT INTO dosen (id_dosen, nama_dosen, id_jurusan) VALUES
(101, 'Dr. Bambang Sutopo', 1),
(102, 'Dr. Siti Nurhaliza', 1),
(103, 'Ahmad Fauzi, M.Kom', 2),
(104, 'Rina Wijaya, M.Kom', 2),
(105, 'Budi Santoso, M.M', 3),
(106, 'Hendra Kurniawan, M.T', 1),
(107, 'Dewi Lestari, M.Eng', 2),
(108, 'Eko Prasetyo, M.Kom', 1); -- Dosen tanpa MK

-- Mahasiswa (24, min 3 tanpa KRS, min 3 Teknik Informatika)
INSERT INTO mahasiswa (nim, nama_mhs, angkatan, id_jurusan) VALUES
('2410000001', 'Rani Permata', 2024, 1),
('2410000002', 'Budi Pratama', 2024, 1),
('2410000003', 'Citra Dewi', 2024, 1),
('2410000004', 'Deni Setiawan', 2024, 2),
('2410000005', 'Eka Saputra', 2024, 2),
('2410000006', 'Fani Rahma', 2024, 3),
('2410000007', 'Gilang Ramadhan', 2023, 1),
('2410000008', 'Hana Fitria', 2023, 1),
('2410000009', 'Indra Gunawan', 2023, 2),
('2410000010', 'Joko Widodo', 2023, 3),
('2410000011', 'Kartika Sari', 2024, 1),
('2410000012', 'Lukman Hakim', 2024, 2),
('2410000013', 'Maya Indah', 2024, 3),
('2410000014', 'Naufal Rizky', 2023, 1),
('2410000015', 'Olivia Tan', 2023, 2),
('2410000016', 'Pandu Putra', 2023, 3),
('2410000017', 'Qori Amalia', 2024, 1),
('2410000018', 'Rian Hidayat', 2024, 2),
('2410000019', 'Salsa Bella', 2024, 3),
('2410000020', 'Taufik Ismail', 2023, 1),
('2410000021', 'Umar Said', 2023, 2),
('2410000022', 'Vina Melati', 2024, 1), -- Tanpa KRS 1
('2410000023', 'Wahyu Utama', 2024, 2), -- Tanpa KRS 2
('2410000024', 'Zahra Aulia', 2024, 3); -- Tanpa KRS 3

-- Mata Kuliah (10)
INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, id_dosen) VALUES
('IF101', 'Algoritma Pemrograman', 4, 101),
('IF102', 'Struktur Data', 3, 101),
('IF201', 'Sistem Basis Data', 3, 102),
('IF202', 'Pemrograman Web', 3, 106),
('SI101', 'Pengantar Sistem Informasi', 3, 103),
('SI201', 'Analisis Proses Bisnis', 3, 104),
('SI202', 'Enterprise Resource Planning', 3, 107),
('MN101', 'Pengantar Manajemen', 3, 105),
('MN201', 'Manajemen Keuangan', 3, 105),
('IF301', 'Kecerdasan Buatan', 3, 102);

-- KRS (Semester 2024-Ganjil dan 2024-Genap)
INSERT INTO krs (nim, kode_mk, semester, nilai_angka) VALUES
-- 2024-Ganjil (nilai sudah ada)
('2410000001', 'IF101', '2024-Ganjil', 85.50),
('2410000001', 'IF201', '2024-Ganjil', 88.00),
('2410000002', 'IF101', '2024-Ganjil', 75.00),
('2410000002', 'IF201', '2024-Ganjil', 68.50),
('2410000003', 'IF101', '2024-Ganjil', 90.00),
('2410000004', 'SI101', '2024-Ganjil', 82.00),
('2410000004', 'IF201', '2024-Ganjil', 78.50),
('2410000005', 'SI101', '2024-Ganjil', 80.00),
('2410000006', 'MN101', '2024-Ganjil', 85.00),
('2410000007', 'IF201', '2024-Ganjil', 92.00),
('2410000008', 'IF202', '2024-Ganjil', 88.50),
('2410000009', 'SI201', '2024-Ganjil', 70.00),
('2410000010', 'MN201', '2024-Ganjil', 84.00),

-- 2024-Genap (sebagian nilai masih NULL karena belum selesai)
('2410000001', 'IF102', '2024-Genap', NULL),
('2410000001', 'IF202', '2024-Genap', 86.00),
('2410000002', 'IF102', '2024-Genap', NULL),
('2410000003', 'IF202', '2024-Genap', 91.50),
('2410000004', 'SI201', '2024-Genap', NULL),
('2410000005', 'SI202', '2024-Genap', 79.00),
('2410000006', 'MN201', '2024-Genap', NULL),
('2410000007', 'IF301', '2024-Genap', 87.00),
('2410000008', 'IF301', '2024-Genap', NULL),
('2410000011', 'IF101', '2024-Genap', 80.00),
('2410000012', 'SI101', '2024-Genap', NULL),
('2410000013', 'MN101', '2024-Genap', 83.00),
('2410000014', 'IF202', '2024-Genap', 77.50),
('2410000015', 'SI202', '2024-Genap', NULL);
