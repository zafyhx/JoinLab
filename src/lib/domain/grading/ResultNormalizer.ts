/**
 * ResultNormalizer
 * Normalizes query result rows for consistent comparison:
 * - Integers to standard numbers
 * - Decimals rounded to 4 decimal places as canonical strings
 * - Dates to ISO date strings (YYYY-MM-DD or full ISO)
 * - NULL stays null
 * - Strings trimmed and normalized
 */

export class ResultNormalizer {
  public static normalizeCell(val: unknown): unknown {
    if (val === null || val === undefined) {
      return null;
    }

    if (val instanceof Date) {
      return val.toISOString().split("T")[0]; // compare as date
    }

    if (typeof val === "number") {
      if (Number.isInteger(val)) {
        return val;
      }
      return Number(val.toFixed(4));
    }

    if (typeof val === "string") {
      const trimmed = val.trim();
      // ISO datetime string (from JSON-serialized Date) → normalize to YYYY-MM-DD
      const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
      if (isoDateMatch) {
        return isoDateMatch[1];
      }
      // If it contains a decimal dot and is a valid number, normalize to canonical float
      if (trimmed !== "" && trimmed.includes(".") && !isNaN(Number(trimmed))) {
        const num = Number(trimmed);
        return Number(num.toFixed(4));
      }
      return trimmed;
    }

    if (typeof val === "bigint") {
      return Number(val);
    }

    if (Buffer.isBuffer(val)) {
      return val.toString("utf8");
    }

    return String(val);
  }

  public static normalizeRows(rows: unknown[][]): unknown[][] {
    return rows.map((row) => row.map((cell) => this.normalizeCell(cell)));
  }

  public static rowToCanonicalKey(row: unknown[]): string {
    return JSON.stringify(row);
  }
}
