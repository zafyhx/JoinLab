import { Question, SchemaDefinition } from "@/lib/db/schema";
import { ComparisonReport } from "@/lib/domain/grading/types";
import { ExecutionResult } from "@/lib/domain/sandbox/types";

export interface Finding {
  code: string; // e.g. "E01"
  category: "konsep_relasi" | "sintaks_join" | "logika_hasil" | "sintaks_umum" | "batas_sistem";
  title: string;
  explanation: string;
  evidence?: Record<string, unknown>;
  hints: string[]; // 3-level progressive hints
}

export interface TableRef {
  name: string;
  alias?: string;
}

export interface JoinRef {
  type: string; // "INNER JOIN", "LEFT JOIN", etc.
  table: string;
  alias?: string;
  on?: any;
  using?: string[];
}

export interface QueryAnatomy {
  tables: TableRef[];
  joins: JoinRef[];
  columns: string[];
  where: any;
  hasGroupBy: boolean;
  hasDistinct: boolean;
  hasAggregate: boolean;
  rawAst?: any;
}

export interface DiagnosisContext {
  question: Question;
  submittedSql: string;
  anatomy: QueryAnatomy | null;
  comparison: ComparisonReport | null;
  execution: ExecutionResult | null;
  schema: SchemaDefinition | null;
  error: any | null;
}

export interface Detector {
  code: string;
  detect(ctx: DiagnosisContext): Finding | null;
}
