import { sandboxPool } from "@/lib/db/sandbox";
import { assertAllowed, QueryRejectedError } from "./SqlGuard";
import {
  ExecutionResult,
  QueryExecutionError,
  QueryTimeoutError,
} from "./types";

interface RunOptions {
  rowLimit?: number;
  timeoutMs?: number;
}

/**
 * Maps PostgreSQL SQLSTATE error codes to user-friendly messages and domain exceptions.
 */
function mapPostgresError(err: any): Error {
  const code = err.code || "";
  const message = err.message || "";

  // 57014: query canceled (statement timeout)
  if (code === "57014" || message.includes("statement timeout")) {
    return new QueryTimeoutError(
      parseInt(process.env.SANDBOX_TIMEOUT_MS ?? "3000", 10)
    );
  }

  let friendlyMessage = message;

  // 42601: syntax error
  if (code === "42601") {
    friendlyMessage =
      "Kesalahan sintaks SQL. Periksa penulisan perintah, koma, tanda petik, atau kata kunci SQL.";
  }
  // 42702: ambiguous column
  else if (code === "42702") {
    const match =
      message.match(/column reference "([^"]+)"/i) ||
      message.match(/column "([^"]+)" is ambiguous/i);
    const col = match ? match[1] : "kolom";
    friendlyMessage = `Kolom '${col}' ambigu karena ada di lebih dari satu tabel. Berikan awalan nama tabel (contoh: 'tabel.${col}').`;
  }
  // 42703: undefined column
  else if (code === "42703") {
    const match = message.match(/column "([^"]+)"/i);
    const col = match ? match[1] : "kolom";
    friendlyMessage = `Kolom '${col}' tidak ditemukan di tabel terkait. Periksa ejaan nama kolom.`;
  }
  // 42P01: undefined table
  else if (code === "42P01") {
    const match = message.match(/relation "([^"]+)"/i);
    const tbl = match ? match[1] : "tabel";
    friendlyMessage = `Tabel '${tbl}' tidak ditemukan di skema ini. Periksa ejaan nama tabel.`;
  }
  // 42803: grouping error (non-aggregate column not in GROUP BY)
  else if (code === "42803") {
    friendlyMessage =
      "Kesalahan GROUP BY. Kolom non-agregat pada SELECT harus disertakan dalam GROUP BY.";
  }

  return new QueryExecutionError(code, friendlyMessage);
}

export class SandboxExecutor {
  /**
   * Executes a student SQL query against the specified sandbox schema.
   * Enforces:
   * - SqlGuard security inspection
   * - search_path switching per query
   * - read-only transaction
   * - statement_timeout
   * - Row limits via array-mode fetch
   */
  public static async run(
    schemaName: string,
    sql: string,
    options: RunOptions = {}
  ): Promise<ExecutionResult> {
    const rowLimit =
      options.rowLimit ??
      parseInt(process.env.SANDBOX_DISPLAY_ROWS ?? "100", 10);
    const timeoutMs =
      options.timeoutMs ??
      parseInt(process.env.SANDBOX_TIMEOUT_MS ?? "3000", 10);

    // 1. Guard check
    assertAllowed(sql, schemaName);

    // 2. Obtain client from sandboxPool
    const client = await sandboxPool.connect();

    try {
      // 3. Switch search_path and set session safety variables
      const safeSchema = schemaName.replace(/"/g, "");
      await client.query(`SET search_path TO "${safeSchema}"`);
      await client.query("SET default_transaction_read_only = on");
      await client.query(`SET statement_timeout = ${Math.max(100, timeoutMs)}`);

      const start = hrtimeMs();

      // 4. Execute query with rows as arrays (rowMode: array for positional mapping)
      const result = await client.query({
        text: sql,
        rowMode: "array",
      });

      const executionMs = Math.round(hrtimeMs() - start);

      const columns: string[] = (result.fields ?? []).map((f) => f.name);
      const allRows = (result.rows ?? []) as unknown[][];

      const truncated = allRows.length > rowLimit;
      const returnedRows = truncated ? allRows.slice(0, rowLimit) : allRows;

      return {
        columns,
        rows: returnedRows,
        rowCount: allRows.length,
        truncated,
        executionMs,
      };
    } catch (err: any) {
      if (err instanceof QueryRejectedError) {
        throw err;
      }
      throw mapPostgresError(err);
    } finally {
      client.release();
    }
  }
}

function hrtimeMs(): number {
  if (typeof process !== "undefined" && process.hrtime) {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1e6;
  }
  return performance.now();
}
