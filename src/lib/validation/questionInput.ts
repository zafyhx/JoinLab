import { z } from "zod";

export const questionInputSchema = z.object({
  code: z.string().min(1, "Kode soal wajib diisi").max(20),
  schemaDefinitionId: z.coerce.number().int().positive(),
  level: z.coerce.number().int().min(1).max(3),
  title: z.string().min(1, "Judul wajib diisi").max(150),
  prompt: z.string().min(1, "Deskripsi soal wajib diisi"),
  expectedSql: z.string().min(1, "Kunci jawaban (SQL) wajib diisi"),
  requiredTables: z.array(z.string().min(1)).min(1, "Minimal satu tabel acuan"),
  conceptTags: z.array(z.string().min(1)).default([]),
  hints: z.array(z.string()).length(3),
  orderMatters: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type QuestionInput = z.infer<typeof questionInputSchema>;
