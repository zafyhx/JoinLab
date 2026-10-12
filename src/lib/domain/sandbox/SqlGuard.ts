/**
 * SqlGuard — Application-level SQL validation layer.
 *
 * NOTE: This is NOT the primary security defense. The `joinlab_ro` PostgreSQL
 * role with SELECT-only grants is the real security barrier. SqlGuard provides
 * a friendlier UX by rejecting obviously bad queries before they hit the DB.
 *
 * Rules (from doc 03, section C.1):
 * 1. Not empty, max 2000 chars after trim
 * 2. Strip comments, but reject hint comments (/*+) and conditional comments (/*!)
 * 3. Only one statement (semicolons only at the end)
 * 4. First keyword must be SELECT or WITH
 * 5. Reject forbidden tokens (outside string literals)
 * 6. Reject cross-schema references
 */

export type RejectionReason =
  | "empty"
  | "too_long"
  | "multi_statement"
  | "not_select"
  | "forbidden_token"
  | "cross_database"
  | "malicious_comment";

export class QueryRejectedError extends Error {
  constructor(
    public readonly reason: RejectionReason,
    message: string
  ) {
    super(message);
    this.name = "QueryRejectedError";
  }
}

const MAX_SQL_LENGTH = parseInt(
  process.env.SANDBOX_MAX_SQL_LENGTH ?? "2000",
  10
);

const FORBIDDEN_TOKENS = [
  "PG_SLEEP",
  "PG_READ_FILE",
  "PG_READ_BINARY_FILE",
  "PG_LS_DIR",
  "PG_LS_LOGDIR",
  "LO_IMPORT",
  "LO_EXPORT",
  "DBLINK",
  "FOR UPDATE",
  "FOR SHARE",
  "FOR NO KEY UPDATE",
  "FOR KEY SHARE",
  "INTO OUTFILE",
  "INTO DUMPFILE",
  "LOAD_FILE",
  "SLEEP",
  "BENCHMARK",
  "GET_LOCK",
  "RELEASE_LOCK",
  "INFORMATION_SCHEMA",
  "PG_CATALOG.",
  "MYSQL.",
  "SYS.",
];

const SYSTEM_SCHEMAS = [
  "information_schema",
  "pg_catalog",
  "pg_toast",
  "pg_temp",
  "performance_schema",
  "mysql",
  "sys",
];

const SANDBOX_SCHEMAS = ["sb_akademik", "sb_toko", "sb_perpustakaan"];

/**
 * Remove SQL comments from the query for analysis.
 * Rejects MySQL-specific hint and conditional comments.
 */
function stripComments(sql: string): string {
  // Reject hint comments /*+ ... */ and conditional comments /*! ... */
  if (/\/\*[+!]/.test(sql)) {
    throw new QueryRejectedError(
      "malicious_comment",
      "Query mengandung komentar khusus yang tidak diizinkan."
    );
  }

  let result = "";
  let i = 0;
  while (i < sql.length) {
    // String literals — skip through them
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      result += sql[i];
      i++;
      while (i < sql.length) {
        if (sql[i] === "\\" && i + 1 < sql.length) {
          result += sql[i] + sql[i + 1];
          i += 2;
          continue;
        }
        if (sql[i] === quote) {
          result += sql[i];
          i++;
          // Doubled quote escape
          if (i < sql.length && sql[i] === quote) {
            result += sql[i];
            i++;
            continue;
          }
          break;
        }
        result += sql[i];
        i++;
      }
      continue;
    }

    // Block comment /* ... */
    if (sql[i] === "/" && i + 1 < sql.length && sql[i + 1] === "*") {
      i += 2;
      while (i < sql.length) {
        if (sql[i] === "*" && i + 1 < sql.length && sql[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }
      result += " ";
      continue;
    }

    // Line comment -- or #
    if (
      (sql[i] === "-" && i + 1 < sql.length && sql[i + 1] === "-") ||
      sql[i] === "#"
    ) {
      while (i < sql.length && sql[i] !== "\n") {
        i++;
      }
      result += " ";
      continue;
    }

    result += sql[i];
    i++;
  }

  return result;
}

/**
 * Extract text outside of string literals for token analysis.
 * Double-quoted identifiers are skipped as well.
 */
function getTextOutsideStrings(sql: string): string {
  let result = "";
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      i++;
      while (i < sql.length) {
        if (sql[i] === "\\" && i + 1 < sql.length) {
          i += 2;
          continue;
        }
        if (sql[i] === quote) {
          i++;
          if (i < sql.length && sql[i] === quote) {
            i++;
            continue;
          }
          break;
        }
        i++;
      }
      result += " ";
      continue;
    }
    // Also skip backtick-quoted identifiers (MySQL style, tolerated)
    if (sql[i] === "`") {
      i++;
      while (i < sql.length && sql[i] !== "`") {
        i++;
      }
      if (i < sql.length) i++;
      result += " ";
      continue;
    }
    result += sql[i];
    i++;
  }
  return result;
}

/**
 * Validate a student SQL query. Throws QueryRejectedError if invalid.
 * @param sql - The raw SQL query from the student
 * @param allowedSchema - The sandbox schema name for this question's dataset
 */
export function assertAllowed(sql: string, allowedSchema: string): void {
  // Rule 1: Not empty, max length
  const trimmed = sql.trim();
  if (!trimmed) {
    throw new QueryRejectedError("empty", "Query tidak boleh kosong.");
  }
  if (trimmed.length > MAX_SQL_LENGTH) {
    throw new QueryRejectedError(
      "too_long",
      `Query terlalu panjang (maksimal ${MAX_SQL_LENGTH} karakter).`
    );
  }

  // Rule 2: Strip comments (also checks for malicious comments)
  const cleaned = stripComments(trimmed);

  // Rule 3: Only one statement
  // Remove trailing semicolons, then check for remaining semicolons
  const withoutTrailingSemicolon = cleaned.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    throw new QueryRejectedError(
      "multi_statement",
      "Hanya boleh satu statement SQL. Hapus titik koma di tengah query."
    );
  }

  // Rule 4: First keyword must be SELECT or WITH
  const firstWord = withoutTrailingSemicolon
    .trim()
    .split(/\s+/)[0]
    ?.toUpperCase();
  if (firstWord !== "SELECT" && firstWord !== "WITH") {
    throw new QueryRejectedError(
      "not_select",
      "Hanya query SELECT yang diizinkan."
    );
  }

  // Rule 5: Forbidden tokens (outside string literals)
  const outsideStrings = getTextOutsideStrings(cleaned).toUpperCase();
  for (const token of FORBIDDEN_TOKENS) {
    if (outsideStrings.includes(token.toUpperCase())) {
      throw new QueryRejectedError(
        "forbidden_token",
        `Query mengandung perintah yang tidak diizinkan: ${token}.`
      );
    }
  }

  // Rule 6: Cross-schema references
  // 6a. Three-part identifiers: schema.table.column where schema is not allowed
  const allowedSchemaLower = allowedSchema.toLowerCase();
  const crossSchemaPattern =
    /(?:^|[\s,(\[])([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)/gi;
  let match;
  while ((match = crossSchemaPattern.exec(outsideStrings)) !== null) {
    const schemaRef = match[1]!.toLowerCase();
    if (schemaRef !== allowedSchemaLower) {
      throw new QueryRejectedError(
        "cross_database",
        "Tidak boleh mengakses skema lain."
      );
    }
  }

  // 6b. Reject explicit references to other sandbox schemas
  for (const schema of SANDBOX_SCHEMAS) {
    if (schema.toLowerCase() === allowedSchemaLower) continue;
    const pattern = new RegExp(`\\b${schema}\\b`, "i");
    if (pattern.test(outsideStrings)) {
      throw new QueryRejectedError(
        "cross_database",
        `Tidak boleh mengakses skema lain: ${schema}.`
      );
    }
  }

  // 6c. Reject system schema references
  for (const sysSchema of SYSTEM_SCHEMAS) {
    const pattern = new RegExp(`\\b${sysSchema}\\b`, "i");
    if (pattern.test(outsideStrings)) {
      throw new QueryRejectedError(
        "forbidden_token",
        `Tidak boleh mengakses ${sysSchema}.`
      );
    }
  }
}
