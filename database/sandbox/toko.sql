-- ============================================================
-- Sandbox Schema: sb_toko
-- (Schema drop/create + search_path handled by sandbox-rebuild.ts)
-- ============================================================

CREATE TYPE status_pesanan AS ENUM ('menunggu', 'dikirim', 'selesai', 'batal');

CREATE TABLE pelanggan (
  id_pelanggan INTEGER PRIMARY KEY,
  nama         VARCHAR(80) NOT NULL,
  kota         VARCHAR(50) NOT NULL
);

CREATE TABLE kategori (
  id_kategori   INTEGER PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL
);

CREATE TABLE produk (
  id_produk    INTEGER PRIMARY KEY,
  nama_produk  VARCHAR(100) NOT NULL,
  harga        INTEGER NOT NULL,
  stok         INTEGER NOT NULL,
  id_kategori  INTEGER NOT NULL,
  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);

CREATE TABLE pesanan (
  id_pesanan    INTEGER PRIMARY KEY,
  id_pelanggan  INTEGER NOT NULL,
  tanggal       DATE NOT NULL,
  status        status_pesanan NOT NULL,
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan)
);

CREATE TABLE detail_pesanan (
  id_detail     SERIAL PRIMARY KEY,
  id_pesanan    INTEGER NOT NULL,
  id_produk     INTEGER NOT NULL,
  jumlah        INTEGER NOT NULL,
  harga_satuan  INTEGER NOT NULL,
  FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan),
  FOREIGN KEY (id_produk)  REFERENCES produk(id_produk)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Kategori (4)
INSERT INTO kategori (id_kategori, nama_kategori) VALUES
(1, 'Elektronik'),
(2, 'Fashion'),
(3, 'Buku'),
(4, 'Rumah Tangga');

-- Pelanggan (15, min 3 Bandung, min 2 tanpa pesanan)
INSERT INTO pelanggan (id_pelanggan, nama, kota) VALUES
(1, 'Andi Wijaya', 'Bandung'),
(2, 'Budi Santoso', 'Jakarta'),
(3, 'Citra Lestari', 'Surabaya'),
(4, 'Dedi Pratama', 'Bandung'),
(5, 'Eka Kurnia', 'Yogyakarta'),
(6, 'Fajar Ramadhan', 'Jakarta'),
(7, 'Gita Gutawa', 'Bandung'),
(8, 'Hadi Subroto', 'Surabaya'),
(9, 'Intan Permata', 'Yogyakarta'),
(10, 'Joko Susilo', 'Jakarta'),
(11, 'Kartika Putri', 'Bandung'),
(12, 'Lukman Hakim', 'Jakarta'),
(13, 'Mega Utami', 'Surabaya'),
(14, 'Naufal Abdi', 'Bandung'),   -- Tanpa pesanan 1
(15, 'Oki Setiana', 'Yogyakarta'); -- Tanpa pesanan 2

-- Produk (14, Elektronik min 2 > 1jt, min 1 < 1jt, min 2 tidak pernah terjual)
INSERT INTO produk (id_produk, nama_produk, harga, stok, id_kategori) VALUES
(101, 'Laptop Gaming Asus', 12500000, 10, 1),
(102, 'Smartphone Samsung', 4500000, 15, 1),
(103, 'Mouse Wireless Logitech', 150000, 50, 1),   -- Elektronik < 1jt
(104, 'Keyboard Mechanical', 650000, 25, 1),       -- Elektronik < 1jt
(105, 'Kemeja Flanel Pria', 220000, 30, 2),
(106, 'Jaket Hoodie Polos', 180000, 40, 2),
(107, 'Sepatu Sneakers Canvas', 350000, 20, 2),
(108, 'Buku Belajar SQL Praktis', 95000, 60, 3),
(109, 'Buku Panduan React & Next.js', 120000, 35, 3),
(110, 'Novel Laskar Pelangi', 85000, 45, 3),
(111, 'Blender Multifungsi Philips', 450000, 15, 4),
(112, 'Wajan Anti Lengket Tefal', 275000, 25, 4),
(113, 'Drone Kamera 4K Pro', 8500000, 5, 1),       -- Produk tidak pernah terjual 1
(114, 'Jas Hujan Ponco Parasut', 75000, 30, 2);    -- Produk tidak pernah terjual 2

-- Pesanan (min 4 tiap status: menunggu, dikirim, selesai, batal)
INSERT INTO pesanan (id_pesanan, id_pelanggan, tanggal, status) VALUES
-- Selesai (Andi Wijaya [1] Bandung punya >1 pesanan selesai)
(1001, 1, '2024-01-15', 'selesai'),
(1002, 1, '2024-02-10', 'selesai'),
(1003, 2, '2024-01-20', 'selesai'),
(1004, 3, '2024-02-05', 'selesai'),
(1005, 4, '2024-02-12', 'selesai'),

-- Dikirim (min 4)
(1006, 5, '2024-02-18', 'dikirim'),
(1007, 6, '2024-02-19', 'dikirim'),
(1008, 7, '2024-02-20', 'dikirim'),
(1009, 8, '2024-02-21', 'dikirim'),

-- Menunggu (min 4, Pelanggan 13 hanya punya pesanan menunggu/batal)
(1010, 9, '2024-02-22', 'menunggu'),
(1011, 10, '2024-02-23', 'menunggu'),
(1012, 11, '2024-02-24', 'menunggu'),
(1013, 13, '2024-02-25', 'menunggu'), -- Pelanggan 13 (tidak punya pesanan selesai)

-- Batal (min 4)
(1014, 2, '2024-01-10', 'batal'),
(1015, 3, '2024-01-18', 'batal'),
(1016, 7, '2024-02-01', 'batal'),
(1017, 12, '2024-02-15', 'batal');

-- Detail Pesanan (sebagian harga_satuan berbeda dari produk.harga untuk simulasi diskon/historis)
INSERT INTO detail_pesanan (id_pesanan, id_produk, jumlah, harga_satuan) VALUES
(1001, 101, 1, 12000000), -- Diskon promo
(1001, 103, 1, 150000),
(1002, 105, 2, 220000),
(1002, 108, 1, 95000),
(1003, 102, 1, 4500000),
(1004, 106, 1, 180000),
(1004, 111, 1, 450000),
(1005, 104, 1, 650000),
(1006, 107, 1, 350000),
(1006, 109, 1, 120000),
(1007, 102, 1, 4400000),
(1008, 105, 3, 210000),
(1009, 110, 2, 85000),
(1010, 103, 2, 150000),
(1011, 112, 1, 275000),
(1012, 108, 1, 95000),
(1013, 106, 1, 180000),
(1014, 101, 1, 12500000),
(1015, 107, 2, 350000),
(1016, 111, 1, 450000),
(1017, 109, 1, 120000);
