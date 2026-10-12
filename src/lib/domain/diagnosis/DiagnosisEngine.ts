import { DiagnosisContext, Finding } from "./types";
import { ALL_DETECTORS, E20_ResultMismatchFallbackDetector } from "./detectors";

export interface DiagnosisResult {
  displayedFindings: Finding[]; // up to 3 highest priority findings
  allErrorCodes: string[]; // all triggered error codes (e.g. ["E01", "E02"])
  allCategories: string[]; // unique error categories
}

export class DiagnosisEngine {
  /**
   * Evaluates a diagnosis context against all 20 rule-based detectors,
   * applies suppression rules, and returns prioritized findings.
   */
  public static async diagnose(ctx: DiagnosisContext): Promise<DiagnosisResult> {
    const rawFindings: Finding[] = [];

    // Run all detectors safely
    for (const detector of ALL_DETECTORS) {
      try {
        const finding = detector.detect(ctx);
        if (finding) {
          rawFindings.push(finding);
        }
      } catch (err) {
        // Fail-safe: detector error must never crash the diagnosis engine
        console.error(`Detector ${detector.code} encountered an error:`, err);
      }
    }

    const detectedCodes = new Set(rawFindings.map((f) => f.code));

    // Suppression rules (doc 03, section E.2)
    const suppressedCodes = new Set<string>();

    // Rule 1: If a database error occurred, only error detectors (E09, E10, E11, E12, E17) are kept
    if (ctx.error) {
      for (const f of rawFindings) {
        if (!["E09", "E10", "E11", "E12", "E17"].includes(f.code)) {
          suppressedCodes.add(f.code);
        }
      }
    } else {
      // Rule 2: If E01 (Missing join condition), suppress E02, E06, E07, E16
      if (detectedCodes.has("E01")) {
        suppressedCodes.add("E02");
        suppressedCodes.add("E06");
        suppressedCodes.add("E07");
        suppressedCodes.add("E16");
      }

      // Rule 3: If E04 or E05, suppress E07 (missing rows is expected side-effect)
      if (detectedCodes.has("E04") || detectedCodes.has("E05")) {
        suppressedCodes.add("E07");
      }

      // Rule 4: If E14 (Missing required table), suppress E03 and E07
      if (detectedCodes.has("E14")) {
        suppressedCodes.add("E03");
        suppressedCodes.add("E07");
      }
    }

    // Filter out suppressed findings
    const activeFindings = rawFindings.filter((f) => !suppressedCodes.has(f.code));

    // Priority order for display:
    // E09, E10, E11, E12, E17, E01, E14, E03, E04, E05, E15, E06, E13, E18, E08, E19, E07, E20, E02, E16
    const priorityOrder = [
      "E09",
      "E10",
      "E11",
      "E12",
      "E17",
      "E01",
      "E14",
      "E03",
      "E04",
      "E05",
      "E15",
      "E06",
      "E13",
      "E18",
      "E08",
      "E19",
      "E07",
      "E20",
      "E02",
      "E16",
    ];

    activeFindings.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.code);
      const idxB = priorityOrder.indexOf(b.code);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    // If no detector matched but comparison is not equal and no error, fallback to E20
    if (activeFindings.length === 0 && ctx.comparison && !ctx.comparison.isEqual && !ctx.error) {
      const fallback = E20_ResultMismatchFallbackDetector.detect(ctx);
      if (fallback) {
        activeFindings.push(fallback);
      }
    }

    const allErrorCodes = Array.from(new Set(rawFindings.map((f) => f.code)));
    const allCategories = Array.from(new Set(rawFindings.map((f) => f.category)));

    // Max 3 findings displayed to student
    const displayedFindings = activeFindings.slice(0, 3);

    return {
      displayedFindings,
      allErrorCodes,
      allCategories,
    };
  }
}
