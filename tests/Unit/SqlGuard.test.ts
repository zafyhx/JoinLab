import { describe, it, expect } from "vitest";
import { assertAllowed, QueryRejectedError } from "@/lib/domain/sandbox/SqlGuard";

describe("SqlGuard Unit Tests", () => {
  const allowedDb = "sb_akademik";

  it("should allow valid SELECT queries", () => {
    expect(() =>
      assertAllowed("SELECT * FROM mahasiswa", allowedDb)
    ).not.toThrow();

    expect(() =>
      assertAllowed(
        "select m.nim, j.nama_jurusan from mahasiswa m join jurusan j on m.id_jurusan = j.id_jurusan;",
        allowedDb
      )
    ).not.toThrow();
  });

  it("should allow WITH CTE query", () => {
    expect(() =>
      assertAllowed(
        "WITH cte AS (SELECT * FROM mahasiswa) SELECT * FROM cte",
        allowedDb
      )
    ).not.toThrow();
  });

  it("should reject empty or whitespace queries", () => {
    expect(() => assertAllowed("", allowedDb)).toThrowError(
      QueryRejectedError
    );
    expect(() => assertAllowed("   ", allowedDb)).toThrowError(
      QueryRejectedError
    );
  });

  it("should reject non-SELECT statements", () => {
    expect(() =>
      assertAllowed("INSERT INTO mahasiswa VALUES ('1','A',2024,1)", allowedDb)
    ).toThrowError(/Hanya query SELECT/);

    expect(() =>
      assertAllowed("UPDATE mahasiswa SET nama_mhs = 'Budi'", allowedDb)
    ).toThrowError(/Hanya query SELECT/);

    expect(() =>
      assertAllowed("DELETE FROM mahasiswa", allowedDb)
    ).toThrowError(/Hanya query SELECT/);

    expect(() =>
      assertAllowed("DROP TABLE mahasiswa", allowedDb)
    ).toThrowError(/Hanya query SELECT/);

    expect(() =>
      assertAllowed("ALTER TABLE mahasiswa ADD col INT", allowedDb)
    ).toThrowError(/Hanya query SELECT/);
  });

  it("should reject multi-statements", () => {
    expect(() =>
      assertAllowed("SELECT 1; SELECT 2", allowedDb)
    ).toThrowError(/Hanya boleh satu statement/);

    expect(() =>
      assertAllowed("SELECT * FROM mahasiswa; DROP TABLE jurusan", allowedDb)
    ).toThrowError(/Hanya boleh satu statement/);
  });

  it("should reject forbidden file and locking tokens", () => {
    expect(() =>
      assertAllowed(
        "SELECT * FROM mahasiswa INTO OUTFILE '/tmp/test'",
        allowedDb
      )
    ).toThrowError(/tidak diizinkan/);

    expect(() =>
      assertAllowed(
        "SELECT * FROM mahasiswa WHERE nama_mhs = LOAD_FILE('/etc/passwd')",
        allowedDb
      )
    ).toThrowError(/tidak diizinkan/);

    expect(() =>
      assertAllowed("SELECT SLEEP(5) FROM mahasiswa", allowedDb)
    ).toThrowError(/tidak diizinkan/);

    expect(() =>
      assertAllowed("SELECT pg_sleep(5)", allowedDb)
    ).toThrowError(/tidak diizinkan/);

    expect(() =>
      assertAllowed("SELECT BENCHMARK(1000000, MD5(1))", allowedDb)
    ).toThrowError(/tidak diizinkan/);

    expect(() =>
      assertAllowed("SELECT * FROM mahasiswa FOR UPDATE", allowedDb)
    ).toThrowError(/tidak diizinkan/);
  });

  it("should reject access to system schemas", () => {
    expect(() =>
      assertAllowed(
        "SELECT * FROM information_schema.tables",
        allowedDb
      )
    ).toThrowError(/tidak diizinkan|tidak boleh mengakses/i);

    expect(() =>
      assertAllowed("SELECT * FROM pg_catalog.pg_class", allowedDb)
    ).toThrowError(/tidak diizinkan/i);
  });

  it("should reject malicious MySQL execution hint comments", () => {
    expect(() =>
      assertAllowed("SELECT /*+ MAX_EXECUTION_TIME(1000) */ * FROM mahasiswa", allowedDb)
    ).toThrowError(/komentar khusus/);

    expect(() =>
      assertAllowed("SELECT /*!50000 1 */", allowedDb)
    ).toThrowError(/komentar khusus/);
  });

  it("should allow safe standard comments", () => {
    expect(() =>
      assertAllowed(
        "-- Ambil data mahasiswa\nSELECT * FROM mahasiswa /* komentar blok */",
        allowedDb
      )
    ).not.toThrow();
  });
});
