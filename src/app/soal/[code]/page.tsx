import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { questions, schemaDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { ErdBuilder } from "@/lib/domain/erd/ErdBuilder";
import { EquivalentQuestionPicker } from "@/lib/domain/learning/EquivalentQuestionPicker";
import { getEffectiveStudent } from "@/lib/auth/session";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function QuestionPage({ params }: PageProps) {
  const { code } = await params;

  // 1. Fetch question & schema
  const [data] = await db
    .select({
      question: questions,
      schema: schemaDefinitions,
    })
    .from(questions)
    .innerJoin(
      schemaDefinitions,
      eq(questions.schemaDefinitionId, schemaDefinitions.id)
    )
    .where(eq(questions.code, code))
    .limit(1);

  if (!data) {
    notFound();
  }

  // 2. Build ERD layout
  const erdData = ErdBuilder.buildLayout(data.schema.erdJson);

  // 3. Find equivalent question
  const student = await getEffectiveStudent();
  const equivalent = await EquivalentQuestionPicker.pickEquivalent(
    data.question,
    student.id
  );

  return (
    <WorkspaceLayout
      question={data.question}
      schema={data.schema}
      erdData={erdData}
      equivalentQuestionCode={equivalent?.code ?? null}
    />
  );
}
