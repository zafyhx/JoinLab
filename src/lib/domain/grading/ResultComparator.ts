import { ComparisonReport } from "./types";
import { ResultNormalizer } from "./ResultNormalizer";

export interface ExpectedResultPayload {
  columns: string[];
  rows: unknown[][];
}

export interface ActualResultPayload {
  columns: string[];
  rows: unknown[][];
  truncated: boolean;
}

export class ResultComparator {
  public static compare(
    actual: ActualResultPayload,
    expected: ExpectedResultPayload,
    orderMatters = false
  ): ComparisonReport {
    const normActualRows = ResultNormalizer.normalizeRows(actual.rows);
    const normExpectedRows = ResultNormalizer.normalizeRows(expected.rows);

    const actualRowCount = normActualRows.length;
    const expectedRowCount = normExpectedRows.length;

    const columnCountMatches = actual.columns.length === expected.columns.length;

    // Check column names match (case-insensitive)
    const normActualCols = actual.columns.map((c) => c.toLowerCase());
    const normExpectedCols = expected.columns.map((c) => c.toLowerCase());

    const columnNamesMatch =
      columnCountMatches &&
      normActualCols.every((c, i) => c === normExpectedCols[i]);

    // Check column order only (same column names set, but different order)
    const sortedActualCols = [...normActualCols].sort().join(",");
    const sortedExpectedCols = [...normExpectedCols].sort().join(",");
    const columnOrderOnly =
      columnCountMatches &&
      !columnNamesMatch &&
      sortedActualCols === sortedExpectedCols;

    // Frequency counts for multiset comparison
    const expectedFreq = new Map<string, { count: number; row: unknown[] }>();
    for (const r of normExpectedRows) {
      const key = ResultNormalizer.rowToCanonicalKey(r);
      const entry = expectedFreq.get(key);
      if (entry) {
        entry.count++;
      } else {
        expectedFreq.set(key, { count: 1, row: r });
      }
    }

    const actualFreq = new Map<string, { count: number; row: unknown[] }>();
    for (const r of normActualRows) {
      const key = ResultNormalizer.rowToCanonicalKey(r);
      const entry = actualFreq.get(key);
      if (entry) {
        entry.count++;
      } else {
        actualFreq.set(key, { count: 1, row: r });
      }
    }

    // Missing rows (in expected but not in actual or underrepresented in actual)
    const missingRowsSample: unknown[][] = [];
    let missingCount = 0;
    for (const [key, { count: expCount, row }] of expectedFreq.entries()) {
      const actCount = actualFreq.get(key)?.count ?? 0;
      if (actCount < expCount) {
        const diff = expCount - actCount;
        missingCount += diff;
        for (let i = 0; i < diff && missingRowsSample.length < 5; i++) {
          missingRowsSample.push(row);
        }
      }
    }

    // Extra rows (in actual but not in expected or overrepresented in actual)
    const extraRowsSample: unknown[][] = [];
    let extraCount = 0;
    for (const [key, { count: actCount, row }] of actualFreq.entries()) {
      const expCount = expectedFreq.get(key)?.count ?? 0;
      if (actCount > expCount) {
        const diff = actCount - expCount;
        extraCount += diff;
        for (let i = 0; i < diff && extraRowsSample.length < 5; i++) {
          extraRowsSample.push(row);
        }
      }
    }

    // Check multiset equivalence
    const multisetMatches =
      columnCountMatches &&
      actualRowCount === expectedRowCount &&
      missingCount === 0 &&
      extraCount === 0;

    // Check row order only
    let rowOrderOnly = false;
    let sequenceMatches = false;
    if (multisetMatches) {
      sequenceMatches = normActualRows.every(
        (r, idx) =>
          ResultNormalizer.rowToCanonicalKey(r) ===
          ResultNormalizer.rowToCanonicalKey(normExpectedRows[idx])
      );
      if (!sequenceMatches && !orderMatters) {
        // If order doesn't matter, it's considered equal despite different row order
        rowOrderOnly = true;
      } else if (!sequenceMatches && orderMatters) {
        rowOrderOnly = true;
      }
    }

    // Deduplicated comparison (distinct actual vs expected)
    const distinctActualKeys = new Set(actualFreq.keys());
    const distinctExpectedKeys = new Set(expectedFreq.keys());
    let distinctActualEqualsExpected =
      distinctActualKeys.size === distinctExpectedKeys.size &&
      [...distinctActualKeys].every((k) => distinctExpectedKeys.has(k));

    // Final equality determination:
    // Rule: if orderMatters is false, multiset match is sufficient.
    // If orderMatters is true, exact sequence match is required.
    const isEqual = columnCountMatches && (orderMatters ? sequenceMatches : multisetMatches);

    return {
      isEqual,
      expectedRowCount,
      actualRowCount,
      actualTruncated: actual.truncated,
      columnCountMatches,
      columnNamesMatch,
      columnOrderOnly,
      rowOrderOnly,
      distinctActualEqualsExpected,
      missingRowsSample,
      extraRowsSample,
      missingCount,
      extraCount,
    };
  }
}
