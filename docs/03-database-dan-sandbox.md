# 03. Database, Sandbox, dan Mesin Diagnosis

Isi dokumen: (A) database aplikasi, (B) database sandbox, (C) pipeline eksekusi query, (D) pembandingan hasil, (E) detector kesalahan, (F) format feedback, (G) perintah artisan.

---

## A. Database aplikasi (`joinlab_app`, koneksi `mysql`)

Nama tabel dan kolom memakai bahasa Inggris. Semua tabel memiliki `created_at` dan `updated_at` kecuali dinyatakan lain.

### A.1 `users`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| name | varchar(100) | |
| email | varchar(150) unique | |
| password | varchar(255) | hash |
| role | enum(`student`,`instructor`) | default `student`, index |
| student_number | varchar(20) null | NIM opsional |
| email_verified_at | timestamp null | |
| remember_token | varchar(100) null | |

### A.2 `schema_definitions`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| slug | varchar(40) unique | `akademik`, `toko`, `perpustakaan` |
| name | varchar(100) | Nama tampilan (Akademik, Toko Online, Perpustakaan) |
| description | text | Deskripsi singkat konteks data |
| db_name | varchar(64) | `sb_akademik` dan seterusnya |
| erd_json | json null | Hasil `sandbox:sync-metadata` (struktur di bagian B.5) |
| table_stats | json null | Jumlah baris per tabel, dipakai detector cartesian |
| sort_order | smallint | |
| is_active | boolean | default true |

### A.3 `variant_groups`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| schema_definition_id | FK | |
| code | varchar(20) unique | contoh `AK-1` |
| level | tinyint | 1 sampai 3 |
| title | varchar(150) | Nama template soal |
| concept_tags | json | contoh `["inner_join","fk_pk"]` |

### A.4 `questions`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| code | varchar(20) unique | contoh `AK-1A` |
| schema_definition_id | FK | index gabungan dengan level |
| variant_group_id | FK null | Soal setara berbagi group yang sama |
| level | tinyint | 1 sampai 3 |
| title | varchar(150) | |
| prompt | text | Teks soal (Markdown ringan boleh) |
| expected_sql | text | Kunci jawaban |
| expected_result | json null | Cache `{columns:[], rows:[[...]]}` hasil kunci |
| expected_row_count | int null | |
| required_tables | json | Daftar tabel yang seharusnya dipakai |
| concept_tags | json | |
| order_matters | boolean | default false |
| hints | json | Array 3 string (petunjuk tingkat 1 sampai 3) |
| is_published | boolean | default false |
| created_by | FK null ke users | |

Index: `(schema_definition_id, level, is_published)`, `variant_group_id`.

### A.5 `attempts`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | FK | |
| question_id | FK | |
| attempt_number | smallint | Urutan percobaan user pada soal ini |
| submitted_sql | text | |
| status | enum(`correct`,`incorrect`,`error`,`rejected`,`timeout`) | |
| execution_ms | int null | |
| actual_row_count | int null | |
| expected_row_count | int null | |
| error_codes | json null | contoh `["E01","E02"]` |
| error_categories | json null | contoh `["sintaks_join","logika_hasil"]` |
| feedback | json null | Payload feedback (bagian F) |
| hints_used | tinyint | default 0 |
| created_at | timestamp | Tidak perlu `updated_at` |

Index: `(user_id, question_id)`, `(question_id, status)`, `created_at`.

### A.6 `attempt_errors` (dinormalisasi untuk analitik)
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| attempt_id | FK cascade | |
| error_code | varchar(20) | Merujuk `error_patterns.code` |
| category | varchar(30) | Salinan kategori saat itu |

Index: `error_code`, `category`.

### A.7 `error_patterns`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| code | varchar(20) unique | `E01` dan seterusnya |
| name | varchar(100) | Nama Indonesia |
| category | enum(`konsep_relasi`,`sintaks_join`,`logika_hasil`,`sintaks_umum`,`batas_sistem`) | Menjawab pertanyaan slide 9 |
| description | text | Untuk dosen |
| explanation | text | Penjelasan konsep untuk mahasiswa |

### A.8 `user_progress`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| user_id, question_id | FK | `unique(user_id, question_id)` |
| status | enum(`not_started`,`attempted`,`solved`) | |
| attempts_count | smallint | |
| first_attempt_correct | boolean null | |
| hints_used_total | smallint | |
| solved_at | timestamp null | |
| last_attempt_at | timestamp null | |

### A.9 `activity_events`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | FK null | |
| question_id | FK null | |
| type | varchar(40) | `question_opened`, `erd_opened`, `query_run`, `query_rejected`, `hint_opened`, `retry_equivalent` |
| meta | json null | contoh `{"hint_level":2}` |
| created_at | timestamp | |

Index: `(type, created_at)`, `(user_id, type)`.

### A.10 Seeder aplikasi
- `ErrorPatternSeeder`: isi semua detector (bagian E).
- `SchemaDefinitionSeeder`: tiga skema (data ERD diisi `sandbox:sync-metadata`).
- `QuestionSeeder`: membaca daftar soal dari dokumen 06 (disalin ke array PHP atau file JSON di `database/seeders/data/questions.json`).
- `DemoUserSeeder`: `dosen@joinlab.test` (instructor), `mahasiswa@joinlab.test` (student). Password demo hanya untuk lokal, ambil dari `.env` atau tulis jelas di README bahwa ini akun demo.

---

## B. Database sandbox

### B.1 Prinsip
- Tiga database terpisah: `sb_akademik`, `sb_toko`, `sb_perpustakaan`.
- Data **deterministik** (ditulis tangan di file `.sql`, bukan acak) supaya hasil kunci jawaban stabil dan test dapat diulang.
- Data kecil, tetapi sengaja memuat kasus tepi (baris tanpa pasangan, NULL, duplikasi) agar kesalahan JOIN terlihat.
- Skema memakai PK dan FK yang eksplisit, karena ERD otomatis dibangun dari `INFORMATION_SCHEMA`.

### B.2 User read-only (`database/sandbox/grants.sql`)
```sql
CREATE USER IF NOT EXISTS 'joinlab_ro'@'%' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
-- Di lokal boleh memakai 'localhost' agar lebih ketat.

GRANT SELECT ON sb_akademik.*     TO 'joinlab_ro'@'%';
GRANT SELECT ON sb_toko.*         TO 'joinlab_ro'@'%';
GRANT SELECT ON sb_perpustakaan.* TO 'joinlab_ro'@'%';

ALTER USER 'joinlab_ro'@'%' WITH MAX_USER_CONNECTIONS 20;
FLUSH PRIVILEGES;
```
User ini **tidak boleh** memiliki hak pada `joinlab_app`. Test manual: login sebagai `joinlab_ro` lalu coba `INSERT`, `DROP`, dan `SELECT` ke `joinlab_app`. Semuanya harus gagal.

### B.3 Skema sandbox

#### `sb_akademik`
```sql
CREATE TABLE jurusan (
  id_jurusan   INT PRIMARY KEY,
  nama_jurusan VARCHAR(60) NOT NULL
);

CREATE TABLE dosen (
  id_dosen    INT PRIMARY KEY,
  nama_dosen  VARCHAR(80) NOT NULL,
  id_jurusan  INT NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);

CREATE TABLE mahasiswa (
  nim         CHAR(10) PRIMARY KEY,
  nama_mhs    VARCHAR(80) NOT NULL,
  angkatan    SMALLINT NOT NULL,
  id_jurusan  INT NOT NULL,
  FOREIGN KEY (id_jurusan) REFERENCES jurusan(id_jurusan)
);

CREATE TABLE mata_kuliah (
  kode_mk   CHAR(6) PRIMARY KEY,
  nama_mk   VARCHAR(80) NOT NULL,
  sks       TINYINT NOT NULL,
  id_dosen  INT NOT NULL,
  FOREIGN KEY (id_dosen) REFERENCES dosen(id_dosen)
);

CREATE TABLE krs (
  id_krs        INT PRIMARY KEY AUTO_INCREMENT,
  nim           CHAR(10) NOT NULL,
  kode_mk       CHAR(6) NOT NULL,
  semester      VARCHAR(12) NOT NULL,       -- contoh: '2024-Ganjil', '2024-Genap'
  nilai_angka   DECIMAL(5,2) NULL,          -- NULL jika nilai belum keluar
  UNIQUE (nim, kode_mk, semester),
  FOREIGN KEY (nim)     REFERENCES mahasiswa(nim),
  FOREIGN KEY (kode_mk) REFERENCES mata_kuliah(kode_mk)
);
```
Relasi: `mahasiswa → jurusan`, `dosen → jurusan`, `mata_kuliah → dosen`, `krs → mahasiswa`, `krs → mata_kuliah`.
Nama jurusan wajib: `Teknik Informatika`, `Sistem Informasi`, `Manajemen`.

#### `sb_toko`
```sql
CREATE TABLE pelanggan (
  id_pelanggan INT PRIMARY KEY,
  nama         VARCHAR(80) NOT NULL,
  kota         VARCHAR(50) NOT NULL
);

CREATE TABLE kategori (
  id_kategori   INT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL
);

CREATE TABLE produk (
  id_produk    INT PRIMARY KEY,
  nama_produk  VARCHAR(100) NOT NULL,
  harga        INT NOT NULL,
  stok         INT NOT NULL,
  id_kategori  INT NOT NULL,
  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);

CREATE TABLE pesanan (
  id_pesanan    INT PRIMARY KEY,
  id_pelanggan  INT NOT NULL,
  tanggal       DATE NOT NULL,
  status        ENUM('menunggu','dikirim','selesai','batal') NOT NULL,
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan)
);

CREATE TABLE detail_pesanan (
  id_detail     INT PRIMARY KEY AUTO_INCREMENT,
  id_pesanan    INT NOT NULL,
  id_produk     INT NOT NULL,
  jumlah        INT NOT NULL,
  harga_satuan  INT NOT NULL,
  FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan),
  FOREIGN KEY (id_produk)  REFERENCES produk(id_produk)
);
```
Kategori wajib: `Elektronik`, `Fashion`, `Buku`, `Rumah Tangga`. Kota wajib: `Bandung`, `Jakarta`, `Surabaya`, `Yogyakarta`.

#### `sb_perpustakaan`
```sql
CREATE TABLE anggota (
  id_anggota INT PRIMARY KEY,
  nama       VARCHAR(80) NOT NULL,
  prodi      VARCHAR(60) NOT NULL
);

CREATE TABLE penulis (
  id_penulis   INT PRIMARY KEY,
  nama_penulis VARCHAR(80) NOT NULL
);

CREATE TABLE penerbit (
  id_penerbit   INT PRIMARY KEY,
  nama_penerbit VARCHAR(80) NOT NULL
);

CREATE TABLE buku (
  id_buku       INT PRIMARY KEY,
  judul         VARCHAR(150) NOT NULL,
  tahun_terbit  SMALLINT NOT NULL,
  id_penulis    INT NOT NULL,
  id_penerbit   INT NOT NULL,
  FOREIGN KEY (id_penulis)  REFERENCES penulis(id_penulis),
  FOREIGN KEY (id_penerbit) REFERENCES penerbit(id_penerbit)
);

CREATE TABLE peminjaman (
  id_pinjam    INT PRIMARY KEY AUTO_INCREMENT,
  id_anggota   INT NOT NULL,
  id_buku      INT NOT NULL,
  tgl_pinjam   DATE NOT NULL,
  tgl_kembali  DATE NULL,               -- NULL jika belum dikembalikan
  denda        INT NOT NULL DEFAULT 0,
  FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota),
  FOREIGN KEY (id_buku)    REFERENCES buku(id_buku)
);
```
Penerbit wajib: `Andi Offset`, `Gramedia Pustaka`, `Informatika Bandung`, `Erlangga`. Penulis wajib memuat `Sari Wulandari` (nama fiktif).

### B.4 Ukuran dan properti data seed

Ukuran target (boleh ditambah sedikit):

| Skema | Tabel | Jumlah baris |
|---|---|---|
| akademik | jurusan 3, dosen 8, mahasiswa 24, mata_kuliah 10, krs sekitar 60 | |
| toko | pelanggan 15, kategori 4, produk 14, pesanan 30, detail_pesanan sekitar 70 | |
| perpustakaan | anggota 15, penulis 8, penerbit 4, buku 25, peminjaman sekitar 50 | |

Properti data yang **wajib** ada (diverifikasi test `QuestionBankIntegrityTest`):

**Akademik**
- Minimal 3 mahasiswa tanpa satu pun baris KRS (untuk soal LEFT JOIN, hasilnya 0).
- Minimal 1 dosen tanpa mata kuliah.
- KRS semester `2024-Ganjil` dan `2024-Genap`, masing-masing minimal 8 baris. Sebagian nilai pada `2024-Genap` bernilai NULL.
- Minimal 3 pasangan mahasiswa dan dosen dengan jurusan berbeda, dan juga ada pasangan dengan jurusan sama.
- Minimal 3 mahasiswa Teknik Informatika dan minimal 2 dosen Sistem Informasi.
- Ukuran tabel dipilih agar cartesian product 4 tabel melampaui 5000 baris (untuk memicu `ResultTooLarge`).

**Toko**
- Minimal 2 pelanggan tanpa pesanan.
- Minimal 1 pelanggan yang hanya punya pesanan berstatus bukan `selesai` (untuk soal filter pada `ON` vs `WHERE`).
- Keempat status ada, masing-masing minimal 4 pesanan.
- Minimal 2 produk yang tidak pernah terjual.
- Minimal 3 pelanggan Bandung, dan minimal 1 di antaranya punya lebih dari 1 pesanan selesai (untuk menguji duplikasi).
- Produk Elektronik: minimal 2 berharga di atas 1.000.000 dan minimal 1 di bawahnya.
- Minimal 3 pelanggan dengan pesanan berstatus `dikirim`, dan minimal 1 di antaranya membeli beberapa produk berbeda.
- Sebagian `harga_satuan` berbeda dari `produk.harga` (harga historis).

**Perpustakaan**
- Minimal 3 buku tidak pernah dipinjam dan minimal 2 anggota tidak pernah meminjam.
- Minimal 3 peminjaman dengan `tgl_kembali` NULL dan minimal 3 dengan `denda` lebih dari 0.
- Penerbit `Andi Offset` memiliki minimal 3 buku (minimal 1 terbit sebelum 2018 dan minimal 2 pada 2018 atau sesudahnya).
- Penulis `Sari Wulandari` memiliki minimal 2 buku (minimal 1 terbit sebelum 2015 dan minimal 1 pada 2015 atau sesudahnya).
- Minimal 2 penulis memiliki 2 buku atau lebih.
- Minimal 1 buku dipinjam oleh 2 anggota berbeda atau lebih.

### B.5 Struktur `erd_json` (hasil `sandbox:sync-metadata`)
```json
{
  "tables": [
    {
      "name": "mahasiswa",
      "x": 40, "y": 60,
      "columns": [
        {"name": "nim", "type": "char(10)", "pk": true, "fk": false, "nullable": false},
        {"name": "id_jurusan", "type": "int", "pk": false, "fk": true, "nullable": false}
      ]
    }
  ],
  "relations": [
    {"from_table": "mahasiswa", "from_column": "id_jurusan", "to_table": "jurusan", "to_column": "id_jurusan"}
  ]
}
```
Metadata dibaca dari `INFORMATION_SCHEMA.COLUMNS` dan `KEY_COLUMN_USAGE` (memakai kredensial admin saat artisan, bukan saat runtime web). Koordinat `x` dan `y` diambil dari peta tata letak manual di `config/erd_layout.php` (per skema) supaya ERD rapi dan konsisten. Jika tabel tidak ada di peta, gunakan tata letak grid otomatis.

---

## C. Pipeline eksekusi query

### C.1 `SqlGuard` (aturan penolakan)
Urutan pemeriksaan pada teks query:

1. Panjang maksimal 2000 karakter dan tidak kosong setelah di-trim.
2. Buang komentar (`-- ...`, `# ...`, `/* ... */`) **sebelum** analisis, tetapi tolak jika ada komentar bertipe hint eksekusi `/*+ ... */` atau komentar bersyarat `/*! ... */`.
3. Hanya **satu** statement. Titik koma di akhir boleh. Titik koma di tengah ditolak.
4. Kata pertama harus `SELECT` atau `WITH`, tanpa mempedulikan huruf besar kecil.
5. Tolak jika mengandung token berikut (di luar string literal): `INTO OUTFILE`, `INTO DUMPFILE`, `INTO @`, `LOAD_FILE`, `SLEEP`, `BENCHMARK`, `GET_LOCK`, `RELEASE_LOCK`, `FOR UPDATE`, `LOCK IN SHARE MODE`, `INFORMATION_SCHEMA`, `PERFORMANCE_SCHEMA`, `MYSQL.`, `SYS.`.
6. Tolak rujukan lintas database dengan pola `identifier.identifier.identifier` atau `` `db`.`tabel` `` yang database-nya bukan database soal.
7. Hasil penolakan: exception `QueryRejected` dengan kode alasan (`not_select`, `multi_statement`, `forbidden_token`, `cross_database`, `too_long`, `empty`) dan pesan Indonesia dari `lang/id/feedback.php`.

Catatan: SqlGuard **bukan** pertahanan utama. Hak akses `joinlab_ro` yang menjaga keamanan sebenarnya. Test harus mencakup upaya penyamaran (huruf campuran, komentar di tengah kata kunci, spasi atau newline di antara kata).

### C.2 `SandboxExecutor`
Pseudokode:

```php
public function run(string $dbName, string $sql, int $rowLimit): ExecutionResult
{
    $this->guard->assertAllowed($sql, $dbName);

    config(['database.connections.sandbox.database' => $dbName]);
    DB::purge('sandbox');
    $pdo = DB::connection('sandbox')->getPdo();

    $pdo->exec('SET SESSION TRANSACTION READ ONLY');
    $pdo->exec('SET SESSION MAX_EXECUTION_TIME = ' . (int) config('joinlab.sandbox.timeout_ms'));
    $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);

    $start = hrtime(true);
    try {
        $stmt = $pdo->query($sql);
        $columns = $this->columnNames($stmt);
        $rows = [];
        $truncated = false;
        while (($row = $stmt->fetch(PDO::FETCH_NUM)) !== false) {
            if (count($rows) >= $rowLimit) { $truncated = true; break; }
            $rows[] = $row;
        }
        $stmt->closeCursor();
    } catch (PDOException $e) {
        // map errno: 3024 timeout, 1064 syntax, 1052 ambiguous, 1054/1146 unknown, 1055 group by
        throw $this->mapException($e);
    }
    $ms = (int) ((hrtime(true) - $start) / 1e6);

    return new ExecutionResult($columns, $rows, $truncated, $ms);
}
```
Poin penting:
- **Jangan** membungkus query mahasiswa dengan `SELECT * FROM (...) t LIMIT n`, karena akan gagal pada nama kolom duplikat (error 1060). Batasi baris lewat pengambilan kursor.
- `ExecutionResult` menyimpan `columns`, `rows`, `truncated`, `ms`, dan `rowCount` (jumlah baris yang berhasil diambil, ditandai `>=` jika `truncated`).
- Tampilan ke mahasiswa dipotong 100 baris, pembandingan memakai sampai 5000 baris.
- Pastikan `PDO::MYSQL_ATTR_USE_BUFFERED_QUERY` dikembalikan atau koneksi dipurge sesudah selesai.
- Error MySQL dipetakan ke exception domain. Pesan mentah MySQL boleh ditampilkan sebagian (nama kolom atau tabel yang salah), tetapi tanpa jalur file atau detail server.

### C.3 Cache kunci jawaban
`questions:refresh-expected` menjalankan `expected_sql` tiap soal lewat executor, menyimpan `expected_result` dan `expected_row_count`, dan memperbarui `schema_definitions.table_stats` (jumlah baris tiap tabel). Dijalankan ulang setiap kali data sandbox atau `expected_sql` berubah (otomatis saat dosen menyimpan soal).

---

## D. Pembandingan hasil

### D.1 Normalisasi (`ResultNormalizer`)
- Angka: bilangan bulat jadi integer. Desimal dibulatkan 4 digit lalu dibandingkan sebagai string kanonik (`12.5000`).
- `NULL` tetap `NULL` (bukan string kosong).
- Tanggal dan waktu jadi string ISO.
- String dibandingkan apa adanya (sensitif kapital mengikuti collation, tetapi dibandingkan sebagai string PHP).
- Setiap baris menjadi array berposisi (urutan kolom berdasarkan posisi).

### D.2 Aturan benar
Jawaban `correct` jika **semua** terpenuhi:
1. Jumlah kolom sama.
2. Multiset baris sama (urutan baris diabaikan), **kecuali** `order_matters = true`, maka urutan baris juga harus sama.
3. Nama kolom (alias) berbeda **bukan** alasan salah. Sistem hanya menampilkan catatan "nama kolom berbeda dari yang diminta" (informasi, bukan kesalahan).
4. Urutan kolom harus sama dengan kunci (karena perbandingan berdasarkan posisi). Jika kolom sama tetapi urutan berbeda, sistem menandai `column_order_only` dan memberi pesan khusus (tetap dianggap salah, dengan petunjuk "urutan kolom mengikuti soal").

### D.3 `ComparisonReport`
```php
class ComparisonReport {
    public bool $isEqual;
    public int $expectedRowCount;
    public int $actualRowCount;
    public bool $actualTruncated;
    public bool $columnCountMatches;
    public bool $columnNamesMatch;
    public bool $columnOrderOnly;       // kolom sama tapi urutan beda
    public bool $rowOrderOnly;          // isi sama, urutan beda (hanya relevan jika order_matters)
    public bool $distinctActualEqualsExpected; // hasil sama setelah duplikat dibuang
    public array $missingRowsSample;    // maksimal 5 baris yang ada di kunci tapi tidak di jawaban
    public array $extraRowsSample;      // maksimal 5 baris yang ada di jawaban tapi tidak di kunci
    public int $missingCount;
    public int $extraCount;
}
```

---

## E. Detector kesalahan

Setiap detector mengimplementasikan:
```php
interface Detector {
    public function code(): string;
    public function detect(DiagnosisContext $ctx): ?Finding;
}
```
`DiagnosisContext` memuat: `Question`, `submitted_sql`, `QueryAnatomy` (bisa null jika parser gagal), `ComparisonReport` (null jika query error), `ExecutionResult` (null jika error), `SchemaDefinition` (ERD dan `table_stats`), dan `PDOException` terpetakan (jika ada).

`QueryAnatomy` dibangun dari parser: daftar tabel dan alias, daftar JOIN (tipe, tabel, kondisi `ON` atau `USING`), kondisi `WHERE`, daftar kolom `SELECT`, ada tidaknya `GROUP BY`, `DISTINCT`, fungsi agregat. Jika parser gagal, `QueryAnatomy` bernilai null dan detector statis dilewati (detector dinamis tetap jalan).

### E.1 Daftar detector

| Kode | Nama | Kategori | Jenis | Kondisi deteksi | Bukti yang ditampilkan |
|---|---|---|---|---|---|
| E01 | Syarat JOIN hilang | `sintaks_join` | statis | Ada `JOIN` (bukan `CROSS JOIN`) tanpa `ON` atau `USING`, atau gaya koma (`FROM a, b`) tanpa predikat penghubung di `WHERE`. | Tabel yang belum punya syarat penghubung |
| E02 | Cartesian product | `logika_hasil` | dinamis | Jumlah baris hasil mendekati hasil kali jumlah baris tabel yang dipakai (dari `table_stats`), atau melampaui batas pembandingan dan ada lebih dari satu tabel tanpa syarat. | Jumlah baris hasil vs hasil kali jumlah baris tabel |
| E03 | Kunci JOIN salah | `konsep_relasi` | statis | Predikat `ON` membandingkan dua kolom yang bukan pasangan FK ke PK pada metadata (dan bukan kasus self join yang sah). | Pasangan kolom yang dipakai vs relasi yang tersedia di ERD |
| E04 | Tipe JOIN keliru | `logika_hasil` | statis + dinamis | Soal bertag `outer_join` tetapi jawaban memakai `INNER JOIN` dan baris yang hilang adalah baris tanpa pasangan. Atau sebaliknya: soal bertag `inner_join`, jawaban memakai `LEFT JOIN` dan ada baris ekstra berisi NULL di sisi kanan. | Contoh baris yang hilang atau berlebih |
| E05 | Filter di WHERE merusak LEFT JOIN | `logika_hasil` | statis + dinamis | Ada `LEFT JOIN` dan `WHERE` menyaring kolom tabel sisi kanan dengan operator selain `IS NULL`, dan ada baris hilang. | Kolom yang disaring dan saran memindahkan ke `ON` |
| E06 | Baris duplikat | `logika_hasil` | dinamis | Baris hasil lebih banyak dari kunci dan `distinctActualEqualsExpected = true`. | Jumlah baris dan jumlah setelah duplikat dibuang |
| E07 | Baris hilang | `logika_hasil` | dinamis | `missingCount > 0` dan bukan karena E04 atau E05. | Contoh baris yang ada di kunci tetapi tidak ada di jawaban |
| E08 | Kolom tidak sesuai | `logika_hasil` | dinamis | Jumlah kolom berbeda, atau kolom sama tetapi urutan berbeda. | Jumlah kolom diminta vs dikirim |
| E09 | Kolom ambigu | `sintaks_join` | error MySQL 1052 | Nama kolom ada di lebih dari satu tabel dan tidak diberi prefix. | Nama kolom yang ambigu |
| E10 | Nama tabel atau kolom tidak dikenal | `sintaks_umum` | error MySQL 1054, 1146 | Identifier tidak ada. Saran nama mirip dihitung dengan Levenshtein dari metadata skema. | Nama salah dan saran terdekat |
| E11 | Kesalahan sintaks | `sintaks_umum` | error MySQL 1064 | Sintaks tidak valid. | Potongan teks di dekat kesalahan |
| E12 | Kesalahan GROUP BY | `sintaks_umum` | error MySQL 1055 | Kolom non-agregat tidak ada di `GROUP BY` (mode `ONLY_FULL_GROUP_BY`). | Kolom yang bermasalah |
| E13 | Penanganan NULL pada agregat | `logika_hasil` | dinamis + statis | Hasil agregat bernilai NULL padahal kunci 0 (perlu `COALESCE`), atau `COUNT(*)` dipakai pada `LEFT JOIN` sehingga baris tanpa pasangan terhitung 1. | Contoh nilai kunci vs jawaban |
| E14 | Tabel yang dibutuhkan belum dipakai | `konsep_relasi` | statis | Ada tabel pada `required_tables` yang tidak muncul di `FROM` atau `JOIN`. | Nama tabel yang belum dipakai |
| E15 | Agregat membengkak (fan-out) | `logika_hasil` | dinamis | Jumlah baris sama dengan kunci, tetapi nilai agregat (`SUM` atau `COUNT`) lebih besar, dan JOIN melibatkan relasi satu-ke-banyak ganda. | Contoh nilai kunci vs jawaban |
| E16 | Hasil terlalu besar | `batas_sistem` | dinamis | Pengambilan baris menyentuh batas 5000. | Batas dan jumlah baris yang tercapai |
| E17 | Waktu eksekusi habis | `batas_sistem` | error MySQL 3024 | Query melewati timeout. | Batas waktu |
| E18 | Tabel berlebih | `konsep_relasi` | statis | Ada tabel di query yang tidak ada di `required_tables` dan memengaruhi jumlah baris. | Nama tabel berlebih |
| E19 | Urutan baris tidak sesuai | `logika_hasil` | dinamis | Hanya relevan jika `order_matters = true` dan `rowOrderOnly = true`. | Petunjuk memakai `ORDER BY` |
| E20 | Isi hasil berbeda | `logika_hasil` | dinamis | Jumlah baris sama tetapi isi berbeda dan tidak ada detector lain yang cocok. | Contoh baris berbeda |

### E.2 Prioritas, penekanan, dan batas tampilan
1. Jika query error di MySQL, hanya detector error (E09 sampai E12, E17) yang relevan.
2. Jika E01 terdeteksi, **tekan** E02, E06, E07, E16 (turunan dari syarat JOIN hilang).
3. Jika E04 atau E05 terdeteksi, **tekan** E07.
4. Jika E14 terdeteksi, **tekan** E03 dan E07 untuk tabel yang bersangkutan.
5. Urutan prioritas tampil: E01, E14, E03, E04, E05, E15, E06, E13, E18, E08, E19, E07, E20, E02, E16.
6. Tampilkan maksimal **3** temuan per percobaan. Temuan sisanya tetap disimpan di `error_codes`.
7. Jika tidak ada detector yang cocok tetapi hasil berbeda, tampilkan E20 dan diff hasil.

### E.3 Petunjuk bertingkat
Petunjuk berasal dari dua sumber:
- **Petunjuk soal** (`questions.hints`, 3 tingkat): spesifik soal, ditulis di dokumen 06.
- **Petunjuk temuan** (dari detector): dibuka bertahap (tingkat 1 pertanyaan pemandu, tingkat 2 menunjuk tabel atau kunci, tingkat 3 menunjuk struktur tanpa menulis query lengkap).

Aturan: **tidak pernah** menampilkan kunci jawaban (`expected_sql`) ke mahasiswa pada tingkat petunjuk mana pun. Pembukaan petunjuk dicatat ke `hints_used` dan `activity_events`.

---

## F. Format feedback (`attempts.feedback` dan respons JSON)

```json
{
  "verdict": "incorrect",
  "summary": "Hasil query kamu 72 baris, seharusnya 24 baris.",
  "findings": [
    {
      "code": "E01",
      "category": "sintaks_join",
      "title": "Syarat JOIN belum ada",
      "explanation": "Tanpa syarat ON, setiap baris mahasiswa dipasangkan dengan setiap baris jurusan.",
      "evidence": {"tables": ["mahasiswa", "jurusan"]},
      "hints": [
        "Kolom mana yang menghubungkan mahasiswa dengan jurusan?",
        "Cari foreign key di tabel mahasiswa yang menunjuk ke jurusan.",
        "Tambahkan ON dengan menyamakan kedua kolom id_jurusan."
      ]
    }
  ],
  "result_diff": {
    "expected_rows": 24,
    "actual_rows": 72,
    "missing_count": 0,
    "extra_count": 48,
    "missing_sample": [],
    "extra_sample": [["2410000001", "Rani", "Manajemen"]]
  },
  "columns": ["nim", "nama_mhs", "nama_jurusan"],
  "rows_preview": [["2410000001", "Rani", "Teknik Informatika"]],
  "executed_ms": 12,
  "next": {"retry_equivalent_url": "/soal/AK-1A/setara"}
}
```
Verdict yang valid: `correct`, `incorrect`, `error`, `rejected`, `timeout`.
Teks tampilan berasal dari `lang/id/feedback.php`, dengan placeholder seperti `:tables`, `:expected`, `:actual`.

Nada pesan: ramah, spesifik, tidak menyalahkan, menjelaskan **mengapa**. Contoh:
- E01: "Query ini menggabungkan `:tables` tanpa syarat penghubung, sehingga setiap baris dipasangkan dengan semua baris lain. Coba tambahkan `ON` yang menyamakan kolom kunci kedua tabel."
- E05: "Kamu memakai LEFT JOIN, tetapi kondisi pada `:column` ada di WHERE. Akibatnya baris tanpa pasangan ikut tersaring. Coba pindahkan kondisi itu ke bagian ON."

---

## G. Perintah CLI / NPM Scripts

| Perintah | Fungsi | Destruktif |
|---|---|---|
| `npm run db:sandbox-rebuild` | Drop dan buat ulang tiga database sandbox dari `database/sandbox/*.sql`, lalu terapkan `grants.sql`. Memakai `SANDBOX_ADMIN_*`. | **Ya** (hanya database sandbox) |
| `npm run db:sync-metadata` | Baca `INFORMATION_SCHEMA`, isi `schema_definitions.erd_json` dan `table_stats`. | Tidak |
| `npm run db:refresh-expected` | Hitung ulang `expected_result` dan `expected_row_count`. | Tidak |
| `npm run db:create-instructor --email=... --name=...` | Buat akun dosen. | Tidak |
| `npx drizzle-kit push` / `npm run db:seed` | Migrasi dan seed database aplikasi. | Aman pada database baru. |

Perintah `db:sandbox-rebuild` wajib meminta konfirmasi (`--force` untuk melewati) dan menolak berjalan jika `NODE_ENV=production` tanpa `--force`.
