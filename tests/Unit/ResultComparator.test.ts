import { describe, it, expect } from "vitest";
import { ResultComparator } from "@/lib/domain/grading/ResultComparator";

describe("ResultComparator Unit Tests", () => {
  it("should match identical results regardless of row order when orderMatters is false", () => {
    const actual = {
      columns: ["nim", "nama"],
      rows: [
        ["2410000002", "Budi"],
        ["2410000001", "Rani"],
      ],
      truncated: false,
    };

    const expected = {
      columns: ["nim", "nama"],
      rows: [
        ["2410000001", "Rani"],
        ["2410000002", "Budi"],
      ],
    };

    const report = ResultComparator.compare(actual, expected, false);
    expect(report.isEqual).toBe(true);
    expect(report.missingCount).toBe(0);
    expect(report.extraCount).toBe(0);
  });

  it("should fail identical multiset if orderMatters is true and row order differs", () => {
    const actual = {
      columns: ["nim", "nama"],
      rows: [
        ["2410000002", "Budi"],
        ["2410000001", "Rani"],
      ],
      truncated: false,
    };

    const expected = {
      columns: ["nim", "nama"],
      rows: [
        ["2410000001", "Rani"],
        ["2410000002", "Budi"],
      ],
    };

    const report = ResultComparator.compare(actual, expected, true);
    expect(report.isEqual).toBe(false);
    expect(report.rowOrderOnly).toBe(true);
  });

  it("should detect duplicate rows", () => {
    const actual = {
      columns: ["nama"],
      rows: [["Rani"], ["Rani"], ["Budi"]],
      truncated: false,
    };

    const expected = {
      columns: ["nama"],
      rows: [["Rani"], ["Budi"]],
    };

    const report = ResultComparator.compare(actual, expected, false);
    expect(report.isEqual).toBe(false);
    expect(report.extraCount).toBe(1);
    expect(report.distinctActualEqualsExpected).toBe(true);
  });

  it("should detect column order only differences", () => {
    const actual = {
      columns: ["nama", "nim"],
      rows: [["Rani", "2410000001"]],
      truncated: false,
    };

    const expected = {
      columns: ["nim", "nama"],
      rows: [["2410000001", "Rani"]],
    };

    const report = ResultComparator.compare(actual, expected, false);
    expect(report.isEqual).toBe(false);
    expect(report.columnOrderOnly).toBe(true);
  });

  it("should normalize numeric decimals correctly", () => {
    const actual = {
      columns: ["nilai"],
      rows: [[85.5], [90.0]],
      truncated: false,
    };

    const expected = {
      columns: ["nilai"],
      rows: [["85.5000"], ["90.0000"]],
    };

    const report = ResultComparator.compare(actual, expected, false);
    expect(report.isEqual).toBe(true);
  });
});
