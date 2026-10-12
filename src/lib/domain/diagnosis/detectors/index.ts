import { Detector, DiagnosisContext, Finding } from "../types";

// ============================================================
// E01: MissingJoinConditionDetector
// ============================================================
export const E01_MissingJoinConditionDetector: Detector = {
  code: "E01",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.anatomy) return null;
    const { joins, tables } = ctx.anatomy;

    // Check if there are multiple tables in FROM (comma style) without ON
    if (tables.length > 1 && joins.length === 0) {
      return {
        code: "E01",
        category: "sintaks_join",
        title: "Syarat JOIN belum ada",
        explanation:
          "Query menggabungkan beberapa tabel tanpa klausul ON atau syarat relasi, sehingga menghasilkan cartesian product.",
        evidence: { tables: tables.map((t) => t.name) },
        hints: [
          "Kolom mana yang menghubungkan tabel-tabel tersebut?",
          "Periksa kolom Foreign Key yang menghubungkan tabel di ERD.",
          "Gunakan klausul JOIN ... ON dengan menyamakan Primary Key dan Foreign Key.",
        ],
      };
    }

    // Check if any explicit JOIN lacks an ON condition or USING
    for (const j of joins) {
      if (j.type !== "CROSS JOIN" && !j.on && (!j.using || j.using.length === 0)) {
        return {
          code: "E01",
          category: "sintaks_join",
          title: "Syarat JOIN belum ada",
          explanation: `JOIN ke tabel '${j.table}' tidak memiliki kondisi ON atau USING.`,
          evidence: { table: j.table },
          hints: [
            `Tabel '${j.table}' perlu dihubungkan dengan tabel sebelumnya melalui kolom kunci.`,
            "Periksa skema ERD untuk menemukan relasi Primary Key dan Foreign Key.",
            `Tambahkan ON [tabel1.kolom] = [${j.table}.kolom].`,
          ],
        };
      }
    }

    return null;
  },
};

// ============================================================
// E02: CartesianProductDetector
// ============================================================
export const E02_CartesianProductDetector: Detector = {
  code: "E02",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.execution || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    const actualCount = ctx.comparison.actualRowCount;
    const expectedCount = ctx.comparison.expectedRowCount;

    // If actual rows are drastically larger than expected rows (e.g. > 2.5x)
    if (actualCount > expectedCount * 2 && actualCount > 20) {
      return {
        code: "E02",
        category: "logika_hasil",
        title: "Hasil berlipat ganda (Cartesian Product)",
        explanation: `Jumlah baris hasil (${actualCount}) jauh lebih banyak dari yang diharapkan (${expectedCount}). Hal ini umumnya terjadi karena tabel digabungkan tanpa syarat penghubung yang tepat.`,
        evidence: { actualRows: actualCount, expectedRows: expectedCount },
        hints: [
          "Apakah setiap tabel yang di-JOIN sudah memiliki syarat ON yang spesifik?",
          "Periksa apakah ada penggabungan tabel yang menghasilkan pasangan baris berulang.",
          "Pastikan semua tabel terhubung lewat relasi Primary Key dan Foreign Key yang valid.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E03: WrongJoinKeyDetector
// ============================================================
export const E03_WrongJoinKeyDetector: Detector = {
  code: "E03",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.anatomy || !ctx.schema?.erdJson) return null;
    if (ctx.comparison?.isEqual) return null;

    const erd = ctx.schema.erdJson as any;
    const relations: any[] = erd?.relations || [];
    if (relations.length === 0) return null;

    // Check simple ON conditions in syntax
    const sqlUpper = ctx.submittedSql.toUpperCase();
    for (const j of ctx.anatomy.joins) {
      if (j.on) {
        // Simple heuristic: check if ON joins completely unrelated columns
        // e.g. mahasiswa.nim = dosen.id_dosen
        const onStr = JSON.stringify(j.on).toLowerCase();
        if (onStr.includes("nim") && onStr.includes("id_dosen")) {
          return {
            code: "E03",
            category: "konsep_relasi",
            title: "Kunci penghubung JOIN keliru",
            explanation:
              "Kolom yang disamakan pada klausul ON bukan relasi Foreign Key yang valid antar tabel tersebut.",
            evidence: { joinTable: j.table },
            hints: [
              "Periksa diagram ERD untuk melihat relasi resmi antar kedua tabel.",
              "Kolom Primary Key dari satu tabel harus dicocokkan dengan Foreign Key pasangannya.",
              "Jangan menyamakan kolom yang tipe atau entitasnya tidak berhubungan langsung.",
            ],
          };
        }
      }
    }

    return null;
  },
};

// ============================================================
// E04: WrongJoinTypeDetector
// ============================================================
export const E04_WrongJoinTypeDetector: Detector = {
  code: "E04",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    const conceptTags = ctx.question.conceptTags || [];
    const sqlUpper = ctx.submittedSql.toUpperCase();

    // Question requires outer join (LEFT JOIN), but user used INNER JOIN
    if (
      conceptTags.includes("outer_join") ||
      conceptTags.includes("left_join")
    ) {
      if (!sqlUpper.includes("LEFT JOIN") && ctx.comparison.missingCount > 0) {
        return {
          code: "E04",
          category: "logika_hasil",
          title: "Tipe JOIN keliru (Perlu LEFT JOIN)",
          explanation:
            "Soal ini membutuhkan data yang tetap tampil meskipun tidak memiliki pasangan di tabel relasi. Penggunaan INNER JOIN menghilangkan baris-baris tersebut.",
          evidence: {
            missingRowsSample: ctx.comparison.missingRowsSample.slice(0, 2),
          },
          hints: [
            "Apakah ada data di tabel kiri yang belum memiliki pasangan di tabel kanan?",
            "Gunakan LEFT JOIN agar data dari tabel utama tetap tampil meskipun data relasinya kosong (NULL).",
            "Ganti INNER JOIN menjadi LEFT JOIN pada tabel yang sesuai.",
          ],
        };
      }
    }

    // Question requires INNER JOIN, but user used LEFT JOIN causing extra NULL rows
    if (
      conceptTags.includes("inner_join") &&
      !conceptTags.includes("outer_join") &&
      !conceptTags.includes("left_join")
    ) {
      if (sqlUpper.includes("LEFT JOIN") && ctx.comparison.extraCount > 0) {
        return {
          code: "E04",
          category: "logika_hasil",
          title: "Tipe JOIN keliru (Gunakan INNER JOIN)",
          explanation:
            "Soal hanya meminta data yang memiliki pasangan relasi. Penggunaan LEFT JOIN memunculkan baris tanpa pasangan (berisi NULL).",
          evidence: {
            extraRowsSample: ctx.comparison.extraRowsSample.slice(0, 2),
          },
          hints: [
            "Periksa apakah data tanpa pasangan seharusnya tidak ditampilkan.",
            "INNER JOIN hanya menampilkan baris yang memiliki pasangan di kedua tabel.",
            "Ganti LEFT JOIN menjadi INNER JOIN.",
          ],
        };
      }
    }

    return null;
  },
};

// ============================================================
// E05: FilterInWhereBreaksOuterJoinDetector
// ============================================================
export const E05_FilterInWhereBreaksOuterJoinDetector: Detector = {
  code: "E05",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison || !ctx.anatomy) return null;
    if (ctx.comparison.isEqual) return null;

    const sqlUpper = ctx.submittedSql.toUpperCase();
    if (sqlUpper.includes("LEFT JOIN") && ctx.anatomy.where && ctx.comparison.missingCount > 0) {
      // Check if WHERE filters a column from the right joined table
      // e.g. WHERE pesanan.status = 'selesai' instead of putting it on ON clause
      return {
        code: "E05",
        category: "logika_hasil",
        title: "Filter di WHERE merusak LEFT JOIN",
        explanation:
          "Memberikan filter pada kolom tabel kanan di klausul WHERE mengubah perilaku LEFT JOIN menjadi seperti INNER JOIN, sehingga baris tanpa pasangan ikut tereliminasi.",
        hints: [
          "Perhatikan filter pada klausul WHERE kamu.",
          "Jika kamu ingin mempertahankan baris tabel kiri yang tidak punya pasangan, letakkan filter tabel kanan di dalam klausul ON.",
          "Pindahkan syarat filter dari WHERE ke ON pada LEFT JOIN.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E06: DuplicateRowsDetector
// ============================================================
export const E06_DuplicateRowsDetector: Detector = {
  code: "E06",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    if (
      ctx.comparison.actualRowCount > ctx.comparison.expectedRowCount &&
      ctx.comparison.distinctActualEqualsExpected
    ) {
      return {
        code: "E06",
        category: "logika_hasil",
        title: "Terdapat baris duplikat",
        explanation: `Hasil query memuat ${ctx.comparison.actualRowCount} baris, namun setelah baris duplikat dibuang hasilnya tepat sama dengan kunci (${ctx.comparison.expectedRowCount} baris).`,
        evidence: {
          actualRows: ctx.comparison.actualRowCount,
          expectedRows: ctx.comparison.expectedRowCount,
        },
        hints: [
          "Mengapa data yang sama muncul berulang kali?",
          "Periksa apakah JOIN ke tabel dengan relasi one-to-many melipatgandakan baris.",
          "Pertimbangkan penggunaan DISTINCT atau penyesuaian relasi JOIN.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E07: MissingRowsDetector
// ============================================================
export const E07_MissingRowsDetector: Detector = {
  code: "E07",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    if (ctx.comparison.missingCount > 0) {
      return {
        code: "E07",
        category: "logika_hasil",
        title: "Ada baris data yang hilang",
        explanation: `Terdapat ${ctx.comparison.missingCount} baris yang seharusnya muncul tetapi tidak ditemukan pada hasil query kamu.`,
        evidence: {
          missingSamples: ctx.comparison.missingRowsSample.slice(0, 3),
        },
        hints: [
          "Periksa kondisi filter (WHERE / ON) apakah terlalu ketat.",
          "Periksa apakah ada data valid yang tereliminasi karena tipe JOIN yang digunakan.",
          "Bandingkan contoh baris yang hilang dengan data di database.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E08: ColumnMismatchDetector
// ============================================================
export const E08_ColumnMismatchDetector: Detector = {
  code: "E08",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    if (!ctx.comparison.columnCountMatches) {
      const expCols = (ctx.question.expectedResult as any)?.columns || [];
      const actCols = ctx.execution?.columns || [];
      return {
        code: "E08",
        category: "logika_hasil",
        title: "Jumlah atau urutan kolom tidak sesuai",
        explanation: `Query menghasilkan ${actCols.length} kolom, sedangkan soal meminta ${expCols.length} kolom.`,
        evidence: { actualColumns: actCols, expectedColumns: expCols },
        hints: [
          "Baca kembali deskripsi soal mengenai kolom apa saja yang diminta.",
          "Pastikan kamu tidak menggunakan 'SELECT *' jika soal meminta kolom tertentu.",
          "Urutkan kolom pada SELECT persis seperti yang diminta soal.",
        ],
      };
    }

    if (ctx.comparison.columnOrderOnly) {
      return {
        code: "E08",
        category: "logika_hasil",
        title: "Urutan kolom belum sesuai",
        explanation:
          "Nama-nama kolom sudah tepat, namun urutan kolom pada SELECT belum sesuai dengan permintaan soal.",
        hints: [
          "Periksa urutan kolom pada klausul SELECT.",
          "Pindahkan posisi kolom agar sesuai urutan di deskripsi soal.",
          "Penilaian mencocokkan kolom berdasarkan posisinya.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E09: AmbiguousColumnDetector
// ============================================================
export const E09_AmbiguousColumnDetector: Detector = {
  code: "E09",
  detect(ctx: DiagnosisContext): Finding | null {
    if (!ctx.error) return null;
    const msg = ctx.error.message || "";
    if (ctx.error.code === "42702" || msg.includes("ambiguous")) {
      const match = msg.match(/'([^']+)'/i);
      const col = match ? match[1] : "kolom";
      return {
        code: "E09",
        category: "sintaks_join",
        title: "Nama kolom ambigu",
        explanation: `Kolom '${col}' terdapat pada lebih dari satu tabel yang di-JOIN, sehingga sistem tidak tahu kolom mana yang dimaksud.`,
        evidence: { ambiguousColumn: col },
        hints: [
          `Tabel mana saja yang memiliki kolom '${col}'?`,
          `Beri awalan nama tabel atau alias di depan nama kolom, misalnya 'nama_tabel.${col}'.`,
          `Gunakan alias tabel untuk mempersingkat penulisan, contoh: 'm.${col}'.`,
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E10: UnknownIdentifierDetector
// ============================================================
export const E10_UnknownIdentifierDetector: Detector = {
  code: "E10",
  detect(ctx: DiagnosisContext): Finding | null {
    if (!ctx.error) return null;
    const msg = ctx.error.message || "";
    if (ctx.error.code === "42703" || ctx.error.code === "42P01" || msg.includes("tidak ditemukan")) {
      return {
        code: "E10",
        category: "sintaks_umum",
        title: "Tabel atau kolom tidak ditemukan",
        explanation: msg || "Nama tabel atau kolom yang kamu tulis tidak ada di database.",
        hints: [
          "Periksa ejaan nama tabel dan kolom di diagram ERD.",
          "Perhatikan huruf besar dan huruf kecil (case sensitivity) serta tanda garis bawah (underscore).",
          "Pastikan kamu tidak salah merujuk nama tabel.",
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E11: SyntaxErrorDetector
// ============================================================
export const E11_SyntaxErrorDetector: Detector = {
  code: "E11",
  detect(ctx: DiagnosisContext): Finding | null {
    if (!ctx.error) return null;
    if (ctx.error.code === "42601" || ctx.error.message?.includes("sintaks SQL")) {
      return {
        code: "E11",
        category: "sintaks_umum",
        title: "Kesalahan sintaks SQL",
        explanation:
          "Terdapat kesalahan penulisan sintaks SQL (kata kunci salah ketik, koma berlebih, atau tanda petik tidak tertutup).",
        hints: [
          "Periksa kata kunci di dekat pesan kesalahan.",
          "Pastikan tidak ada tanda koma sebelum FROM atau tanda petik yang belum ditutup.",
          "Pastikan struktur query mengikuti: SELECT ... FROM ... JOIN ... ON ... WHERE ...",
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E12: GroupByErrorDetector
// ============================================================
export const E12_GroupByErrorDetector: Detector = {
  code: "E12",
  detect(ctx: DiagnosisContext): Finding | null {
    if (!ctx.error) return null;
    if (ctx.error.code === "42803" || ctx.error.message?.includes("GROUP BY")) {
      return {
        code: "E12",
        category: "sintaks_umum",
        title: "Kesalahan GROUP BY",
        explanation:
          "Dalam mode ONLY_FULL_GROUP_BY, setiap kolom non-agregat pada klausul SELECT wajib dicantumkan dalam GROUP BY.",
        hints: [
          "Kolom apa saja yang kamu pilih di SELECT di luar fungsi agregat (COUNT, SUM, dll)?",
          "Tambahkan semua kolom non-agregat tersebut ke dalam klausul GROUP BY.",
          "Atau bungkus kolom tersebut ke dalam fungsi agregat jika sesuai kebutuhan.",
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E13: NullHandlingDetector
// ============================================================
export const E13_NullHandlingDetector: Detector = {
  code: "E13",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    const sqlUpper = ctx.submittedSql.toUpperCase();
    if (sqlUpper.includes("COUNT(*)") && sqlUpper.includes("LEFT JOIN")) {
      return {
        code: "E13",
        category: "logika_hasil",
        title: "Penanganan NULL pada agregat keliru",
        explanation:
          "Menggunakan COUNT(*) pada hasil LEFT JOIN akan menghitung baris yang bernilai NULL sebagai 1, bukan 0.",
        hints: [
          "COUNT(*) menghitung seluruh baris termasuk baris kosong dari sisi kanan LEFT JOIN.",
          "Gunakan COUNT(tabel_kanan.kolom_id) agar baris bernilai NULL tidak ikut terhitung.",
          "Ganti COUNT(*) menjadi COUNT(kolom_spesifik) atau gunakan COALESCE jika diperlukan.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E14: MissingRequiredTableDetector
// ============================================================
export const E14_MissingRequiredTableDetector: Detector = {
  code: "E14",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.anatomy) return null;
    const required = ctx.question.requiredTables || [];
    const usedTables = ctx.anatomy.tables.map((t) => t.name.toLowerCase());

    const missingTables = required.filter(
      (req) => !usedTables.includes(req.toLowerCase())
    );

    if (missingTables.length > 0) {
      return {
        code: "E14",
        category: "konsep_relasi",
        title: "Tabel yang dibutuhkan belum disertakan",
        explanation: `Soal ini memerlukan data dari tabel: [${missingTables.join(", ")}], namun tabel tersebut belum ada di query kamu.`,
        evidence: { missingTables },
        hints: [
          `Tabel apa yang memuat data '${missingTables[0]}'?`,
          "Periksa skema ERD untuk melihat bagaimana tabel tersebut terhubung.",
          `Tambahkan JOIN ke tabel '${missingTables[0]}' dengan relasi yang tepat.`,
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E15: AggregateFanOutDetector
// ============================================================
export const E15_AggregateFanOutDetector: Detector = {
  code: "E15",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison || !ctx.anatomy) return null;
    if (ctx.comparison.isEqual) return null;

    if (
      ctx.anatomy.hasAggregate &&
      ctx.comparison.actualRowCount === ctx.comparison.expectedRowCount &&
      ctx.comparison.extraCount > 0
    ) {
      return {
        code: "E15",
        category: "logika_hasil",
        title: "Nilai agregat membengkak (Fan-out)",
        explanation:
          "Jumlah baris hasil sudah sama, namun nilai agregat (SUM/COUNT) lebih besar dari kunci. Hal ini terjadi karena JOIN ke tabel one-to-many melipatgandakan nilai sebelum diagregasi.",
        hints: [
          "Apakah ada tabel perantara yang memiliki relasi 1-ke-banyak ganda?",
          "Periksa apakah kamu perlu melakukan agregasi pada subquery terlebih dahulu sebelum di-JOIN.",
          "Gunakan DISTINCT di dalam fungsi agregat, misalnya SUM(DISTINCT ...) atau subquery terpisah.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E16: ResultTooLargeDetector
// ============================================================
export const E16_ResultTooLargeDetector: Detector = {
  code: "E16",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.actualTruncated || ctx.comparison.actualRowCount >= 5000) {
      return {
        code: "E16",
        category: "batas_sistem",
        title: "Hasil query melampaui batas sistem (5000 baris)",
        explanation:
          "Query menghasilkan data yang sangat besar dan dipotong pada 5000 baris. Ini merupakan indikasi kuat terjadinya cartesian product.",
        evidence: { actualRows: ctx.comparison.actualRowCount },
        hints: [
          "Periksa kembali klausul ON pada setiap JOIN.",
          "Pastikan tidak ada tabel yang tergabung tanpa kondisi relasi.",
          "Periksa apakah ada kondisi filter yang terlupakan.",
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E17: ExecutionTimeoutDetector
// ============================================================
export const E17_ExecutionTimeoutDetector: Detector = {
  code: "E17",
  detect(ctx: DiagnosisContext): Finding | null {
    if (!ctx.error) return null;
    if (ctx.error.name === "QueryTimeoutError") {
      return {
        code: "E17",
        category: "batas_sistem",
        title: "Waktu eksekusi query habis (Timeout)",
        explanation:
          "Query memerlukan waktu lebih dari 3 detik untuk dijalankan dan dihentikan otomatis oleh sistem.",
        hints: [
          "Query yang memakan waktu lama pada dataset kecil biasanya disebabkan oleh cartesian product tanpa filter.",
          "Pastikan setiap JOIN memiliki klausul ON yang sesuai.",
          "Hindari penggabungan tabel tanpa indeks atau relasi yang jelas.",
        ],
      };
    }
    return null;
  },
};

// ============================================================
// E18: ExtraTableDetector
// ============================================================
export const E18_ExtraTableDetector: Detector = {
  code: "E18",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.anatomy) return null;
    if (ctx.comparison?.isEqual) return null;

    const required = (ctx.question.requiredTables || []).map((t) => t.toLowerCase());
    const used = ctx.anatomy.tables.map((t) => t.name.toLowerCase());
    const extra = used.filter((u) => !required.includes(u));

    if (extra.length > 0) {
      return {
        code: "E18",
        category: "konsep_relasi",
        title: "Tabel berlebih digunakan",
        explanation: `Query menyertakan tabel [${extra.join(", ")}] yang tidak diperlukan untuk menjawab soal ini.`,
        evidence: { extraTables: extra },
        hints: [
          "Apakah tabel tersebut benar-benar diperlukan untuk mengambil kolom yang diminta?",
          "Menyertakan tabel yang tidak perlu dapat mengubah jumlah baris hasil.",
          "Hapus tabel berlebih dari klausul FROM atau JOIN.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E19: RowOrderMismatchDetector
// ============================================================
export const E19_RowOrderMismatchDetector: Detector = {
  code: "E19",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    if (ctx.question.orderMatters && ctx.comparison.rowOrderOnly) {
      return {
        code: "E19",
        category: "logika_hasil",
        title: "Urutan baris tidak sesuai",
        explanation:
          "Seluruh baris data yang diminta sudah lengkap dan tepat, namun urutan baris belum sesuai dengan yang diminta soal.",
        hints: [
          "Soal ini mensyaratkan data diurutkan secara spesifik.",
          "Periksa kolom apa dan urutan mana (ASC atau DESC) yang diminta.",
          "Tambahkan klausul ORDER BY pada query kamu.",
        ],
      };
    }

    return null;
  },
};

// ============================================================
// E20: ResultMismatchFallbackDetector
// ============================================================
export const E20_ResultMismatchFallbackDetector: Detector = {
  code: "E20",
  detect(ctx: DiagnosisContext): Finding | null {
    if (ctx.error || !ctx.comparison) return null;
    if (ctx.comparison.isEqual) return null;

    return {
      code: "E20",
      category: "logika_hasil",
      title: "Isi data hasil belum sesuai",
      explanation: `Hasil query kamu (${ctx.comparison.actualRowCount} baris) belum sesuai dengan hasil kunci jawaban (${ctx.comparison.expectedRowCount} baris).`,
      evidence: {
        missingCount: ctx.comparison.missingCount,
        extraCount: ctx.comparison.extraCount,
      },
      hints: [
        "Bandingkan sampel baris yang berbeda antara hasil query kamu dengan yang diharapkan.",
        "Periksa kembali relasi JOIN dan kondisi WHERE yang kamu gunakan.",
        "Pastikan nilai filter dan kriteria soal sudah terpenuhi dengan tepat.",
      ],
    };
  },
};

// Master list of all detectors in prioritization order.
// NOTE: E20 is NOT in this list — per doc 03 §E.2.7 it only appears as a
// fallback when no other detector matched (see DiagnosisEngine).
export const ALL_DETECTORS: Detector[] = [
  E09_AmbiguousColumnDetector,
  E10_UnknownIdentifierDetector,
  E11_SyntaxErrorDetector,
  E12_GroupByErrorDetector,
  E17_ExecutionTimeoutDetector,
  E01_MissingJoinConditionDetector,
  E14_MissingRequiredTableDetector,
  E03_WrongJoinKeyDetector,
  E04_WrongJoinTypeDetector,
  E05_FilterInWhereBreaksOuterJoinDetector,
  E15_AggregateFanOutDetector,
  E06_DuplicateRowsDetector,
  E13_NullHandlingDetector,
  E18_ExtraTableDetector,
  E08_ColumnMismatchDetector,
  E19_RowOrderMismatchDetector,
  E07_MissingRowsDetector,
  E02_CartesianProductDetector,
  E16_ResultTooLargeDetector,
];
