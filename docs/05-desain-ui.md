# 05. Desain UI dan Tata Letak: JoinLab

> Dokumen ini adalah referensi untuk **desain visual, token desain, tata letak halaman, dan pedoman UI/UX** aplikasi JoinLab.
> Dokumen ini selaras dengan [01-PRD-analisis-kebutuhan.md](01-PRD-analisis-kebutuhan.md) dan [02-arsitektur-teknis.md](02-arsitektur-teknis.md).

---

## 1. Prinsip Desain

Dalam merancang antarmuka JoinLab, kami berpegang pada prinsip-prinsip berikut:
- **Sederhana dan Fokus**: UI tidak boleh membuat mahasiswa kewalahan. Fokus utama adalah pada editor SQL dan area feedback.
- **Bahasa Indonesia Natural**: Menggunakan instruksi dan pesan feedback dengan Bahasa Indonesia yang mudah dipahami, santai, namun tetap profesional.
- **Responsif**: Berjalan dengan baik di rentang resolusi 375px (mobile) hingga 1440px (desktop).
- **Aksesibel**: Mendukung navigasi *keyboard* (fokus yang jelas), rasio kontras warna yang memenuhi standar WCAG, dan dukungan pembaca layar menggunakan `aria-live` untuk area feedback.
- **Nada Ramah pada Feedback**: Pesan error dan hasil diagnosis disampaikan tanpa menyalahkan pengguna, memberikan petunjuk *actionable* ketimbang sekadar "salah".

---

## 2. Token Desain (Design Tokens)

Konfigurasi di bawah ini akan diimplementasikan pada `tailwind.config.ts`. Token *dark mode* disiapkan sebagai fondasi, meskipun implementasi fiturnya bukan bagian dari MVP.

### Palet Warna

| Peran | Hex (Light) | Hex (Dark) | Penggunaan Utama |
|---|---|---|---|
| **Primary** | `#2563EB` (Blue 600) | `#3B82F6` (Blue 500) | Tombol utama, link, indikator aktif, aksen edukatif. |
| **Secondary** | `#F3F4F6` (Gray 100) | `#1F2937` (Gray 800) | Tombol sekunder, background panel sekunder. |
| **Success** | `#16A34A` (Green 600) | `#22C55E` (Green 500) | Status benar, badge *correct*, tombol "Periksa Jawaban". |
| **Warning** | `#D97706` (Yellow 600) | `#EAB308` (Yellow 500) | Status *timeout*, peringatan, *hint* yang belum dibuka. |
| **Error** | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Status salah, badge *incorrect*, pesan error guard. |
| **Neutral / Gray** | `#6B7280` (Gray 500) | `#9CA3AF` (Gray 400) | Teks sekunder, border, placeholder. |
| **Background** | `#FFFFFF` (White) | `#030712` (Gray 950) | Warna latar belakang utama halaman. |
| **Foreground** | `#111827` (Gray 900) | `#F9FAFB` (Gray 50) | Warna teks utama. |

### Typography

- **Font Family**: `Inter` (utama) / *System Font* fallback. `JetBrains Mono` atau `Fira Code` untuk blok kode dan editor.
- **Skala Ukuran**:
  - `h1`: 2.25rem (36px), font-bold
  - `h2`: 1.875rem (30px), font-semibold
  - `h3`: 1.5rem (24px), font-medium
  - `h4`: 1.25rem (20px), font-medium
  - `body`: 1rem (16px), font-normal
  - `small`: 0.875rem (14px), font-normal
  - `code`: 0.875rem (14px), font-mono

### Spacing & Layout

Memanfaatkan skala spacing 4px standar Tailwind:
- `0` (0px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px).

### Bentuk dan Bayangan

- **Border Radius**:
  - `sm`: 0.25rem (4px) untuk badge, input.
  - `md`: 0.375rem (6px) untuk card, tombol.
  - `lg`: 0.5rem (8px) untuk kontainer besar, modal.
- **Shadow**:
  - `sm`: Bayangan halus untuk kartu biasa.
  - `md`: Elevasi untuk dropdown dan dialog.

---

## 3. Komponen Shadcn UI yang Dipakai

| Komponen | Varian / Penggunaan |
|---|---|
| **Button** | `default` (primary), `secondary`, `outline`, `ghost`, `destructive`. |
| **Card** | Membungkus soal, metrik progres, dan finding/feedback. |
| **Badge** | Indikator level soal, status (belum/dicoba/benar), kategori error. |
| **Dialog** | Konfirmasi reset, penjelasan ERD layar penuh. |
| **Tabs** | Navigasi mobile pada workspace (Soal \| Editor \| Hasil). |
| **Table** | Grid hasil query, daftar tabel skema, panel dosen. |
| **Input & Textarea** | Form tambah/edit soal, filter pencarian. |
| **Select** | Dropdown pemilihan skema/level. |
| **Tooltip** | Penjelasan tambahan pada ikon di tabel atau ERD. |
| **Alert** | Peringatan error fatal dari API atau guard sistem. |
| **Separator** | Pembatas visual antar section di sidebar atau card. |
| **ScrollArea** | Panel hasil dan teks deskripsi panjang pada soal. |
| **DropdownMenu** | Menu aksi pada tabel dosen (Edit, Hapus, Preview). |
| **Sheet** | Navigasi mobile (Sidebar slide-in dari kiri). |
| **Skeleton** | *Loading state* saat memuat data editor, soal, atau analitik. |

---

## 4. Ikon Lucide yang Dipakai

| Ikon | Konteks Penggunaan |
|---|---|
| `Play` | Tombol **Jalankan** query (preview). |
| `Check` / `CheckCircle` | Status benar (*correct*), badge success. |
| `X` / `XCircle` | Status salah (*incorrect*), tombol tutup dialog/alert. |
| `ChevronRight` / `ChevronDown` | Accordion/collapsible finding evidence, menu navigasi. |
| `Code` | Penanda blok syntax SQL. |
| `Database` | Kategori masalah tabel, ikon skema. |
| `Table2` | Tabel hasil query, representasi struktur data. |
| `BookOpen` | Navigasi halaman skema/soal. |
| `GraduationCap` | Icon dashboard mahasiswa. |
| `BarChart3` | Icon analitik dosen, halaman progres. |
| `Users` | Panel manajemen mahasiswa (dosen). |
| `Plus` / `Edit` / `Trash` | Aksi form (Tambah, Edit, Hapus) soal. |
| `Eye` / `EyeOff` | Toggle visibilitas kunci jawaban/soal (publish/unpublish). |
| `Search` / `Filter` | Cari soal, saring berdasarkan level. |
| `Download` | Ekspor rekap nilai CSV (dosen). |
| `Lightbulb` | Tombol "Butuh Petunjuk?" (Hints). |
| `HelpCircle` | Tooltip bantuan, status error tidak dikenali. |
| `ArrowRight` | Tombol "Coba soal setara" atau aksi navigasi maju. |
| `RefreshCw` | Tombol reset editor, coba lagi. |
| `History` | Halaman riwayat percobaan. |
| `Award` | Status komplesi skema/level. |
| `LogIn` / `LogOut` | Autentikasi. |
| `Menu` | Trigger sidebar di mobile (Sheet). |
| `Home` | Navigasi ke Dashboard. |

---

## 5. Tata Letak Halaman (Layout & Wireframe Deskriptif)

### Layout Utama
- **Desktop**: *Sidebar* statis di kiri (lebar ~240px) berisi navigasi dan profil. Area konten utama berada di kanan.
- **Mobile**: *Header* atas dengan ikon hamburger `Menu` yang membuka *Sidebar* menggunakan komponen Shadcn `Sheet` (slide-in).

### Landing Page
- **Hero Section**: Judul aplikasi, sub-judul penjelasan interaktif latihan JOIN, dan ilustrasi kode SQL/ERD.
- **CTA**: Tombol "Masuk sebagai Mahasiswa" (primary) dan "Login Dosen" (ghost/secondary).

### Dashboard Mahasiswa
- **Kartu Progres**: Grid kartu (Card) menampilkan skema (Akademik, Toko, Perpustakaan) dengan `progress bar` persentase penyelesaian.
- **Aktivitas Terakhir**: Tautan cepat untuk melanjutkan soal yang terakhir dicoba namun belum benar.

### Halaman Daftar Soal
- Ditampilkan dalam format **tabel** atau **list card**.
- Berisi judul soal, level, dan `Badge` status: `Belum` (abu-abu), `Dicoba` (kuning), `Benar` (hijau).

### Workspace Soal (Halaman Terpenting)
- **Desktop Layout (Split Pane)**:
  - **Panel Kiri**: Tab/Scroll Area untuk **Deskripsi Soal** dan **ERD Viewer**.
  - **Panel Kanan**: 
    - Atas: **SQL Editor**.
    - Bawah: **Hasil Query & Feedback Panel** (dapat di-*resize* vertikal).
  - **Action Bar**: Terletak di antara editor dan hasil. Tombol `Jalankan` (secondary) dan `Periksa Jawaban` (primary, success).
- **Mobile Layout**:
  - Menggunakan Shadcn `Tabs` dengan posisi vertikal/horizontal (Soal \| Editor \| Hasil) untuk menghemat ruang.
  - Action Bar mengambang (sticky bottom).

### Halaman Progres
- Menampilkan grafik atau sekumpulan *progress bar* per level/skema.
- Daftar riwayat percobaan terbaru lengkap dengan status sukses/gagal.

### Panel Dosen
- **Manajemen Soal**: `Table` daftar soal dengan kolom nama, skema, level, visibilitas. Aksi `DropdownMenu` untuk edit/hapus/preview.
- **Form Tambah/Edit**: Input standar, textarea untuk deskripsi, dan editor SQL kecil untuk memasukkan `kunci jawaban`.
- **Analitik**: Card statis dan bar chart sederhana (menggunakan Recharts atau representasi HTML) untuk melihat kode kesalahan terbanyak dan daftar mahasiswa yang stagnan.

---

## 6. ERD Viewer

Komponen visualisasi untuk membantu pemahaman relasi antartabel.
- **Render Engine**: Menggunakan rendering SVG atau Canvas ringan (misal via React Flow ringan atau kustom SVG) dari struktur `erd_json`.
- **Representasi Tabel**: Kotak persegi panjang dengan header nama tabel.
- **Kolom**: Daftar kolom dengan indikator ikon kunci (`Database`/`Key`) untuk *Primary Key* (PK) dan ikon tautan (`Link`) untuk *Foreign Key* (FK). Kolom *nullable* memiliki teks redup.
- **Relasi**: Garis solid untuk menghubungkan FK ke PK. Menggunakan notasi *crow's foot* untuk relasi 1-to-many.
- **Interaksi (Hover)**: Mengarahkan kursor ke tabel atau garis akan me-*highlight* (memberi warna accent) tabel dan relasi yang terhubung.
- **Responsif**: Mendukung pan dan zoom pada mobile.

---

## 7. SQL Editor

Komponen tempat pengguna menulis query.
- **Pustaka**: `Monaco Editor` (diutamakan) atau `CodeMirror 6`.
- **Tema**: Light (mengikuti *background* dan token *foreground*).
- **Fitur Wajib**: 
  - *Syntax highlighting* khusus SQL.
  - *Auto-indentation*.
  - *Line numbers* (nomor baris) aktif.
  - *Minimap* **dimatikan** (menyita ruang).
- **Keyboard Shortcut**: `Ctrl + Enter` (atau `Cmd + Enter`) difokuskan untuk men-trigger aksi "Jalankan".
- **Dimensi**: Memiliki tinggi minimum (sekitar 6 baris) dengan kemampuan *resize* vertikal oleh pengguna.

---

## 8. Feedback Panel

Area di bawah editor untuk menampilkan hasil evaluasi dan data tabular.
- **Status Badge**: 
  - `Correct` (Hijau, `CheckCircle`)
  - `Incorrect` (Merah, `XCircle`)
  - `Error` (Oranye, `AlertTriangle`)
  - `Timeout` (Kuning, `Clock`)
- **Finding Card**: Kartu per diagnosis kesalahan.
  - Judul tegas.
  - Ikon kategori (misal `Database` untuk salah tabel, `Code` untuk sintaks).
  - Teks penjelasan natural berbahasa Indonesia.
  - **Evidence Collapsible**: Bagian yang bisa diekspansi (`ChevronRight`) berisi *diff* sederhana atau informasi teknis (misal: "Baris Anda: 15, Seharusnya: 3").
- **Hints (Petunjuk)**:
  - Tombol dengan ikon `Lightbulb` bertuliskan "Butuh petunjuk?".
  - Diklik untuk membuka *hint* secara progresif (Tahap 1 → Tahap 2 → Tahap 3).
- **Result Data / Diff**:
  - Jika dieksekusi (Jalankan), menampilkan `Table` data maksimal 100 baris.
  - Jika (Periksa) salah, dapat menampilkan tabel perbandingan *side-by-side* atau baris yang di-highlight merah/hijau untuk menandai kolom atau baris yang hilang/berlebih.
