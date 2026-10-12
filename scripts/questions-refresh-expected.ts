import "dotenv/config";
import { db } from "../src/lib/db";
import { questions, schemaDefinitions } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { SandboxExecutor } from "../src/lib/domain/sandbox/SandboxExecutor";

async function main() {
  console.log("=== JoinLab Refresh Expected Results ===");

  const allQuestions = await db
    .select({
      id: questions.id,
      code: questions.code,
      expectedSql: questions.expectedSql,
      schemaDbName: schemaDefinitions.dbName,
    })
    .from(questions)
    .innerJoin(
      schemaDefinitions,
      eq(questions.schemaDefinitionId, schemaDefinitions.id)
    );

  console.log(`Found ${allQuestions.length} questions to evaluate.`);

  for (const q of allQuestions) {
    try {
      console.log(`Executing expected SQL for ${q.code} on ${q.schemaDbName}...`);
      const result = await SandboxExecutor.run(q.schemaDbName, q.expectedSql, {
        rowLimit: 5000,
      });

      await db
        .update(questions)
        .set({
          expectedResult: {
            columns: result.columns,
            rows: result.rows,
          },
          expectedRowCount: result.rowCount,
        })
        .where(eq(questions.id, q.id));

      console.log(`✓ ${q.code} updated (${result.rowCount} rows, ${result.columns.length} cols).`);
    } catch (err: any) {
      console.error(`✗ Error on question ${q.code}:`, err.message);
    }
  }

  console.log("=== Refresh expected results completed! ===");
  process.exit(0);
}

main();
