import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import {
  users,
  schemaDefinitions,
  variantGroups,
  questions,
  errorPatterns,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { QUESTIONS_DATA } from "./data/questionsData";

// ============================================================
// 1. Error Patterns (20 Detectors E01 - E20)
// ============================================================
const ERROR_PATTERNS_SEED = [
  {
    code: "E01",
    name: "Syarat JOIN belum ada",
    category: "sintaks_join" as const,
    description: "JOIN tanpa klausa ON atau perkalian koma tanpa syarat penghubung di WHERE",
    explanation: "Ketika dua tabel dihubungkan tanpa syarat ON, sistem memasangkan setiap baris tabel pertama dengan setiap baris tabel kedua (cartesian product).",
  },
  {
    code: "E02",
    name: "Cartesian product",
    category: "logika_hasil" as const,
    description: "Jumlah baris hasil berlipat ganda karena tabel tidak terhubung dengan benar",
    explanation: "Jumlah baris query membengkak melebihi yang seharusnya karena data tabel saling berpasangan tanpa filter relasi.",
  },
  {
    code: "E03",
    name: "Kunci JOIN salah",
    category: "konsep_relasi" as const,
    description: "Klausa ON membandingkan dua kolom yang bukan pasangan PK-FK",
    explanation: "Kolom yang disamakan pada klausul ON bukan merupakan relasi kunci yang tepat antar kedua tabel.",
  },
  {
    code: "E04",
    name: "Tipe JOIN keliru",
    category: "logika_hasil" as const,
    description: "Penggunaan INNER JOIN padahal butuh LEFT JOIN, atau sebaliknya",
    explanation: "INNER JOIN hanya menampilkan baris yang memiliki pasangan, sedangkan LEFT JOIN mempertahankan baris dari tabel utama meskipun pasangannya kosong.",
  },
  {
    code: "E05",
    name: "Filter di WHERE merusak LEFT JOIN",
    category: "logika_hasil" as const,
    description: "Filter pada tabel sisi kanan ditaruh di WHERE sehingga mengeliminasi baris NULL",
    explanation: "Kondisi filter pada klausul WHERE mengevaluasi NULL sebagai false, sehingga baris tanpa pasangan ikut terbuang. Pindahkan filter tersebut ke klausul ON.",
  },
  {
    code: "E06",
    name: "Baris duplikat",
    category: "logika_hasil" as const,
    description: "Baris hasil identik berulang karena relasi 1-to-many atau filter kurang spesifik",
    explanation: "Data yang sama muncul berulang kali. Ini sering terjadi saat menghubungkan tabel dengan banyak data anak tanpa agregasi atau DISTINCT.",
  },
  {
    code: "E07",
    name: "Baris hilang",
    category: "logika_hasil" as const,
    description: "Sebagian baris data yang seharusnya muncul tidak ada pada hasil query",
    explanation: "Terdapat data yang tereliminasi, biasanya akibat filter WHERE yang terlalu ketat atau pemilihan tipe JOIN yang kurang tepat.",
  },
  {
    code: "E08",
    name: "Kolom tidak sesuai",
    category: "logika_hasil" as const,
    description: "Jumlah atau urutan kolom yang diminta tidak sesuai dengan soal",
    explanation: "Kolom pada SELECT harus dipilih dan diurutkan persis seperti yang diminta pada deskripsi soal.",
  },
  {
    code: "E09",
    name: "Kolom ambigu",
    category: "sintaks_join" as const,
    description: "Error PostgreSQL 42702: Nama kolom ada di lebih dari satu tabel tanpa prefix",
    explanation: "Beri awalan nama tabel atau alias di depan nama kolom (contoh: tabel.kolom) karena kolom tersebut ada di lebih dari satu tabel.",
  },
  {
    code: "E10",
    name: "Nama tabel atau kolom tidak dikenal",
    category: "sintaks_umum" as const,
    description: "Error PostgreSQL 42703 atau 42P01: Salah ketik nama tabel atau kolom",
    explanation: "Nama tabel atau kolom yang kamu tuliskan tidak ditemukan di database. Periksa ejaan di diagram ERD.",
  },
  {
    code: "E11",
    name: "Kesalahan sintaks",
    category: "sintaks_umum" as const,
    description: "Error PostgreSQL 42601: Sintaks SQL tidak valid",
    explanation: "Periksa kembali susunan perintah SQL kamu, tanda koma, kata kunci, dan tanda petik.",
  },
  {
    code: "E12",
    name: "Kesalahan GROUP BY",
    category: "sintaks_umum" as const,
    description: "Error PostgreSQL 42803: Kolom non-agregat tidak ada di GROUP BY",
    explanation: "Dalam mode standar PostgreSQL, semua kolom di SELECT yang tidak dibungkus fungsi agregat wajib dicantumkan dalam klausul GROUP BY.",
  },
  {
    code: "E13",
    name: "Penanganan NULL pada agregat",
    category: "logika_hasil" as const,
    description: "Menggunakan COUNT(*) pada LEFT JOIN atau agregat menghasilkan NULL bukannya 0",
    explanation: "COUNT(*) akan menghitung baris NULL sebagai 1. Gunakan COUNT(tabel.kolom) atau COALESCE.",
  },
  {
    code: "E14",
    name: "Tabel yang dibutuhkan belum dipakai",
    category: "konsep_relasi" as const,
    description: "Tabel penting dari required_tables belum disertakan pada query",
    explanation: "Soal memerlukan informasi dari tabel relasi tertentu yang belum kamu sertakan dalam query.",
  },
  {
    code: "E15",
    name: "Agregat membengkak (Fan-out)",
    category: "logika_hasil" as const,
    description: "Nilai SUM atau COUNT membesar karena JOIN ke relasi one-to-many bertingkat",
    explanation: "Menghubungkan beberapa tabel berelasi one-to-many secara bersamaan melipatgandakan baris sebelum fungsi agregat dieksekusi.",
  },
  {
    code: "E16",
    name: "Hasil terlalu besar",
    category: "batas_sistem" as const,
    description: "Query menyentuh batas pemotongan 5000 baris",
    explanation: "Hasil query melampaui batas maksimal sistem karena penggabungan tabel tanpa syarat yang memadai.",
  },
  {
    code: "E17",
    name: "Waktu eksekusi habis",
    category: "batas_sistem" as const,
    description: "Query melebihi batas waktu eksekusi (timeout 3 detik)",
    explanation: "Query dihentikan karena memakan waktu lebih dari 3 detik, biasanya diakibatkan cartesian join berulang.",
  },
  {
    code: "E18",
    name: "Tabel berlebih",
    category: "konsep_relasi" as const,
    description: "Menyertakan tabel yang tidak dibutuhkan dan berpotensi memengaruhi hasil",
    explanation: "Query menyertakan tabel tambahan yang tidak diperlukan untuk menjawab soal tersebut.",
  },
  {
    code: "E19",
    name: "Urutan baris tidak sesuai",
    category: "logika_hasil" as const,
    description: "Soal mensyaratkan urutan baris tertentu (ORDER BY) namun belum diterapkan",
    explanation: "Data yang dihasilkan sudah lengkap, namun belum diurutkan sesuai dengan perintah ORDER BY yang diminta soal.",
  },
  {
    code: "E20",
    name: "Isi hasil berbeda",
    category: "logika_hasil" as const,
    description: "Hasil query tidak sesuai dengan kunci jawaban (fallback detector)",
    explanation: "Keluaran query kamu tidak cocok dengan hasil yang diharapkan. Periksa kembali logika filter dan relasi JOIN.",
  },
];

// ============================================================
// 2. Schema Definitions
// ============================================================
const SCHEMAS_SEED = [
  {
    slug: "akademik",
    name: "Sistem Informasi Akademik",
    description: "Data perkuliahan mahasiswa, dosen pengampu, mata kuliah, jurusan, dan kartu rencana studi (KRS).",
    dbName: "sb_akademik",
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "toko",
    name: "Toko Online Retail",
    description: "Data transaksi penjualan e-commerce meliputi pelanggan, kategori barang, produk, pesanan, dan rincian belanja.",
    dbName: "sb_toko",
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: "perpustakaan",
    name: "Sirkulasi Perpustakaan Kampus",
    description: "Data katalog perpustakaan mencakup anggota peminjam, buku, penulis, penerbit, dan riwayat peminjaman beserta denda.",
    dbName: "sb_perpustakaan",
    sortOrder: 3,
    isActive: true,
  },
];

async function main() {
  console.log("=== JoinLab Application Database Seeder ===");

  // 1. Seed Error Patterns
  console.log("Seeding error patterns (E01 - E20)...");
  for (const ep of ERROR_PATTERNS_SEED) {
    const [existing] = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.code, ep.code))
      .limit(1);

    if (!existing) {
      await db.insert(errorPatterns).values(ep);
    }
  }
  console.log("✓ Error patterns seeded.");

  // 2. Seed Schema Definitions
  console.log("Seeding schema definitions...");
  const schemaIdMap = new Map<string, number>();
  for (const s of SCHEMAS_SEED) {
    const [existing] = await db
      .select()
      .from(schemaDefinitions)
      .where(eq(schemaDefinitions.slug, s.slug))
      .limit(1);

    if (existing) {
      schemaIdMap.set(s.slug, existing.id);
    } else {
      const [inserted] = await db
        .insert(schemaDefinitions)
        .values(s)
        .returning({ id: schemaDefinitions.id });
      schemaIdMap.set(s.slug, inserted.id);
    }
  }
  console.log("✓ Schema definitions seeded.");

  // 3. Seed Variant Groups & Questions
  console.log("Seeding variant groups and questions (30 questions)...");
  const variantGroupIdMap = new Map<string, number>();

  for (const qData of QUESTIONS_DATA) {
    const schemaId = schemaIdMap.get(qData.schemaSlug);
    if (!schemaId) continue;

    // Check or insert variant group
    if (!variantGroupIdMap.has(qData.variantGroupCode)) {
      const [existingGroup] = await db
        .select()
        .from(variantGroups)
        .where(eq(variantGroups.code, qData.variantGroupCode))
        .limit(1);

      if (existingGroup) {
        variantGroupIdMap.set(qData.variantGroupCode, existingGroup.id);
      } else {
        const [inserted] = await db
          .insert(variantGroups)
          .values({
            code: qData.variantGroupCode,
            schemaDefinitionId: schemaId,
            level: qData.level,
            title: qData.variantGroupTitle,
            conceptTags: qData.conceptTags,
          })
          .returning({ id: variantGroups.id });
        variantGroupIdMap.set(qData.variantGroupCode, inserted.id);
      }
    }

    const variantGroupId = variantGroupIdMap.get(qData.variantGroupCode);

    // Insert or update question
    const [existingQ] = await db
      .select()
      .from(questions)
      .where(eq(questions.code, qData.code))
      .limit(1);

    if (!existingQ) {
      await db.insert(questions).values({
        code: qData.code,
        schemaDefinitionId: schemaId,
        variantGroupId: variantGroupId ?? null,
        level: qData.level,
        title: qData.title,
        prompt: qData.prompt,
        expectedSql: qData.expectedSql,
        requiredTables: qData.requiredTables,
        conceptTags: qData.conceptTags,
        orderMatters: qData.orderMatters,
        hints: qData.hints,
        isPublished: true,
      });
    } else if (
      JSON.stringify(existingQ.hints) !== JSON.stringify(qData.hints)
    ) {
      // Keep hint content in sync with the canonical seed (doc 06),
      // without overwriting instructor edits to other fields.
      await db
        .update(questions)
        .set({ hints: qData.hints })
        .where(eq(questions.id, existingQ.id));
    }
  }
  console.log("✓ Questions and variant groups seeded.");

  // 4. Seed Demo Users
  console.log("Seeding demo users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoUsers = [
    {
      name: "Bapak Dosen Pembimbing",
      email: "dosen@joinlab.test",
      password: hashedPassword,
      role: "instructor" as const,
      studentNumber: null,
    },
    {
      name: "Rani Permata Mahasiswi",
      email: "mahasiswa@joinlab.test",
      password: hashedPassword,
      role: "student" as const,
      studentNumber: "K3523022",
    },
  ];

  for (const u of demoUsers) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);

    if (!existing) {
      await db.insert(users).values(u);
      console.log(`✓ User ${u.email} created.`);
    }
  }

  console.log("=== Database seeding completed successfully! ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeder error:", err);
  process.exit(1);
});
