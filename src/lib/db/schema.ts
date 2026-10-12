import {
  pgTable,
  bigint,
  bigserial,
  varchar,
  text,
  boolean,
  smallint,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================
export const userRoleEnum = pgEnum("user_role", ["student", "instructor"]);
export const attemptStatusEnum = pgEnum("attempt_status", [
  "correct",
  "incorrect",
  "error",
  "rejected",
  "timeout",
]);
export const errorCategoryEnum = pgEnum("error_category", [
  "konsep_relasi",
  "sintaks_join",
  "logika_hasil",
  "sintaks_umum",
  "batas_sistem",
]);
export const progressStatusEnum = pgEnum("progress_status", [
  "not_started",
  "attempted",
  "solved",
]);

// ============================================================
// A.1 users
// ============================================================
export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  studentNumber: varchar("student_number", { length: 20 }),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// A.2 schema_definitions
// ============================================================
export const schemaDefinitions = pgTable("schema_definitions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  dbName: varchar("db_name", { length: 64 }).notNull(),
  erdJson: jsonb("erd_json"),
  tableStats: jsonb("table_stats"),
  sortOrder: smallint("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// A.3 variant_groups
// ============================================================
export const variantGroups = pgTable("variant_groups", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  schemaDefinitionId: bigint("schema_definition_id", { mode: "number" }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  level: smallint("level").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  conceptTags: jsonb("concept_tags").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// A.4 questions
// ============================================================
export const questions = pgTable(
  "questions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    code: varchar("code", { length: 20 }).notNull().unique(),
    schemaDefinitionId: bigint("schema_definition_id", { mode: "number" }).notNull(),
    variantGroupId: bigint("variant_group_id", { mode: "number" }),
    level: smallint("level").notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    prompt: text("prompt").notNull(),
    expectedSql: text("expected_sql").notNull(),
    expectedResult: jsonb("expected_result"),
    expectedRowCount: integer("expected_row_count"),
    requiredTables: jsonb("required_tables").$type<string[]>().notNull(),
    conceptTags: jsonb("concept_tags").$type<string[]>().notNull(),
    orderMatters: boolean("order_matters").notNull().default(false),
    hints: jsonb("hints").$type<string[]>().notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    createdBy: bigint("created_by", { mode: "number" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_questions_schema_level").on(
      table.schemaDefinitionId,
      table.level,
      table.isPublished
    ),
    index("idx_questions_variant_group").on(table.variantGroupId),
  ]
);

// ============================================================
// A.5 attempts
// ============================================================
export const attempts = pgTable(
  "attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    attemptNumber: smallint("attempt_number").notNull(),
    submittedSql: text("submitted_sql").notNull(),
    status: attemptStatusEnum("status").notNull(),
    executionMs: integer("execution_ms"),
    actualRowCount: integer("actual_row_count"),
    expectedRowCount: integer("expected_row_count"),
    errorCodes: jsonb("error_codes").$type<string[]>(),
    errorCategories: jsonb("error_categories").$type<string[]>(),
    feedback: jsonb("feedback"),
    hintsUsed: smallint("hints_used").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_attempts_user_question").on(table.userId, table.questionId),
    index("idx_attempts_question_status").on(table.questionId, table.status),
    index("idx_attempts_created_at").on(table.createdAt),
  ]
);

// ============================================================
// A.6 attempt_errors (normalized for analytics)
// ============================================================
export const attemptErrors = pgTable(
  "attempt_errors",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    attemptId: bigint("attempt_id", { mode: "number" }).notNull(),
    errorCode: varchar("error_code", { length: 20 }).notNull(),
    category: varchar("category", { length: 30 }).notNull(),
  },
  (table) => [
    index("idx_attempt_errors_code").on(table.errorCode),
    index("idx_attempt_errors_category").on(table.category),
  ]
);

// ============================================================
// A.7 error_patterns
// ============================================================
export const errorPatterns = pgTable("error_patterns", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length:20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  category: errorCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// A.8 user_progress
// ============================================================
export const userProgress = pgTable(
  "user_progress",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    questionId: bigint("question_id", { mode: "number" }).notNull(),
    status: progressStatusEnum("status").notNull().default("not_started"),
    attemptsCount: smallint("attempts_count").notNull().default(0),
    firstAttemptCorrect: boolean("first_attempt_correct"),
    hintsUsedTotal: smallint("hints_used_total").notNull().default(0),
    solvedAt: timestamp("solved_at"),
    lastAttemptAt: timestamp("last_attempt_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_user_progress_unique").on(table.userId, table.questionId),
  ]
);

// ============================================================
// A.9 activity_events
// ============================================================
export const activityEvents = pgTable(
  "activity_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("user_id", { mode: "number" }),
    questionId: bigint("question_id", { mode: "number" }),
    type: varchar("type", { length: 40 }).notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_activity_events_type_created").on(table.type, table.createdAt),
    index("idx_activity_events_user_type").on(table.userId, table.type),
  ]
);

// ============================================================
// Type exports
// ============================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SchemaDefinition = typeof schemaDefinitions.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;

export type ErrorPattern = typeof errorPatterns.$inferSelect;
export type UserProgressRow = typeof userProgress.$inferSelect;
export type ActivityEvent = typeof activityEvents.$inferSelect;
