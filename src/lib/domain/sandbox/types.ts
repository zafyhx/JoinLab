/**
 * Domain types for sandbox query execution.
 */

export interface ExecutionResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  truncated: boolean;
  executionMs: number;
}

export class QueryTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Query melebihi batas waktu ${timeoutMs / 1000} detik.`);
    this.name = "QueryTimeoutError";
  }
}

export class QueryExecutionError extends Error {
  constructor(
    public readonly code: string, // PostgreSQL SQLSTATE (e.g. "42601")
    message: string
  ) {
    super(message);
    this.name = "QueryExecutionError";
  }
}
