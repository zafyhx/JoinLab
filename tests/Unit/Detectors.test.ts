import { describe, it, expect } from "vitest";
import {
  E01_MissingJoinConditionDetector,
  E02_CartesianProductDetector,
  E04_WrongJoinTypeDetector,
  E06_DuplicateRowsDetector,
  E14_MissingRequiredTableDetector,
} from "@/lib/domain/diagnosis/detectors";
import { QueryAnatomyParser } from "@/lib/domain/diagnosis/QueryAnatomyParser";
import { DiagnosisEngine } from "@/lib/domain/diagnosis/DiagnosisEngine";

describe("Diagnosis Detectors Unit Tests", () => {
  const dummyQuestion: any = {
    id: 1,
    code: "AK-1A",
    title: "Test",
    requiredTables: ["mahasiswa", "jurusan"],
    conceptTags: ["inner_join"],
    orderMatters: false,
    expectedResult: { columns: ["nim"], rows: [["1"]] },
  };

  it("should trigger E01 when JOIN has no ON condition", () => {
    const sql = "SELECT * FROM mahasiswa JOIN jurusan";
    const anatomy = QueryAnatomyParser.parse(sql);

    const finding = E01_MissingJoinConditionDetector.detect({
      question: dummyQuestion,
      submittedSql: sql,
      anatomy,
      comparison: null,
      execution: null,
      schema: null,
      error: null,
    });

    expect(finding).not.toBeNull();
    expect(finding?.code).toBe("E01");
  });

  it("should trigger E02 on Cartesian Product (huge actual rows)", () => {
    const finding = E02_CartesianProductDetector.detect({
      question: dummyQuestion,
      submittedSql: "SELECT * FROM mahasiswa, jurusan",
      anatomy: null,
      comparison: {
        isEqual: false,
        actualRowCount: 120,
        expectedRowCount: 24,
      } as any,
      execution: { rowCount: 120 } as any,
      schema: null,
      error: null,
    });

    expect(finding).not.toBeNull();
    expect(finding?.code).toBe("E02");
  });

  it("should trigger E14 when required table is missing from query", () => {
    const sql = "SELECT * FROM mahasiswa";
    const anatomy = QueryAnatomyParser.parse(sql);

    const finding = E14_MissingRequiredTableDetector.detect({
      question: dummyQuestion, // requires ['mahasiswa', 'jurusan']
      submittedSql: sql,
      anatomy,
      comparison: null,
      execution: null,
      schema: null,
      error: null,
    });

    expect(finding).not.toBeNull();
    expect(finding?.code).toBe("E14");
    expect(finding?.evidence?.missingTables).toContain("jurusan");
  });

  it("should suppress E02 when E01 is detected in DiagnosisEngine", async () => {
    const sql = "SELECT * FROM mahasiswa, jurusan";
    const anatomy = QueryAnatomyParser.parse(sql);

    const diagnosis = await DiagnosisEngine.diagnose({
      question: dummyQuestion,
      submittedSql: sql,
      anatomy,
      comparison: {
        isEqual: false,
        actualRowCount: 120,
        expectedRowCount: 24,
      } as any,
      execution: { rowCount: 120 } as any,
      schema: null,
      error: null,
    });

    // E01 should be present, and E02 suppressed from displayed findings
    const displayedCodes = diagnosis.displayedFindings.map((f) => f.code);
    expect(displayedCodes).toContain("E01");
    expect(displayedCodes).not.toContain("E02");
  });
});
