export interface ComparisonReport {
  isEqual: boolean;
  expectedRowCount: number;
  actualRowCount: number;
  actualTruncated: boolean;
  columnCountMatches: boolean;
  columnNamesMatch: boolean;
  columnOrderOnly: boolean; // columns identical in set but different order
  rowOrderOnly: boolean; // content identical multiset, but row order differs (only matters if order_matters = true)
  distinctActualEqualsExpected: boolean; // matches after deduplication
  missingRowsSample: unknown[][]; // up to 5 rows in expected but missing in actual
  extraRowsSample: unknown[][]; // up to 5 rows in actual but missing in expected
  missingCount: number;
  extraCount: number;
}
