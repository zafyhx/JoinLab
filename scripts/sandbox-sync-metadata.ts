import "dotenv/config";
import { Client } from "pg";
import { db } from "../src/lib/db";
import { schemaDefinitions } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const SCHEMAS = [
  { slug: "akademik", dbName: "sb_akademik" },
  { slug: "toko", dbName: "sb_toko" },
  { slug: "perpustakaan", dbName: "sb_perpustakaan" },
];

async function main() {
  console.log("=== JoinLab Sandbox Sync Metadata (PostgreSQL) ===");

  const host = process.env.SANDBOX_DB_HOST || "127.0.0.1";
  const port = parseInt(process.env.SANDBOX_DB_PORT || "5432", 10);
  const adminUser = process.env.SANDBOX_ADMIN_USER || "postgres";
  const adminPassword = process.env.SANDBOX_ADMIN_PASSWORD || "";
  const sandboxDb = process.env.SANDBOX_DB_NAME || "joinlab_sandbox";

  const client = new Client({
    host,
    port,
    user: adminUser,
    password: adminPassword,
    database: sandboxDb,
  });
  await client.connect();

  try {
    for (const s of SCHEMAS) {
      console.log(`Syncing metadata for ${s.dbName}...`);

      // 1. Get columns
      const colsResult = await client.query(
        `SELECT table_name, column_name, data_type, udt_name, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1
         ORDER BY table_name, ordinal_position`,
        [s.dbName]
      );

      // 2. Get primary keys
      const pkResult = await client.query(
        `SELECT tc.table_name, kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
         WHERE tc.constraint_type = 'PRIMARY KEY'
           AND tc.table_schema = $1`,
        [s.dbName]
      );
      const pkSet = new Set<string>();
      for (const pk of pkResult.rows) {
        pkSet.add(`${pk.table_name}.${pk.column_name}`);
      }

      // 3. Get foreign keys
      const fkResult = await client.query(
        `SELECT
           kcu.table_name AS table_name,
           kcu.column_name AS column_name,
           ccu.table_name AS referenced_table_name,
           ccu.column_name AS referenced_column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
         JOIN information_schema.constraint_column_usage ccu
           ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema = $1`,
        [s.dbName]
      );

      const fkMap = new Map<string, boolean>();
      const relations: any[] = [];
      for (const fk of fkResult.rows) {
        fkMap.set(`${fk.table_name}.${fk.column_name}`, true);
        relations.push({
          from_table: fk.table_name,
          from_column: fk.column_name,
          to_table: fk.referenced_table_name,
          to_column: fk.referenced_column_name,
        });
      }

      // 4. Assemble table definitions
      const tableMap = new Map<string, any[]>();
      for (const c of colsResult.rows) {
        if (!tableMap.has(c.table_name)) {
          tableMap.set(c.table_name, []);
        }
        const isPk = pkSet.has(`${c.table_name}.${c.column_name}`);
        const isFk = fkMap.has(`${c.table_name}.${c.column_name}`);
        const type =
          c.data_type === "USER-DEFINED" ? c.udt_name : c.data_type;
        tableMap.get(c.table_name)!.push({
          name: c.column_name,
          type,
          pk: isPk,
          fk: isFk,
          nullable: c.is_nullable === "YES",
        });
      }

      const tables = Array.from(tableMap.entries()).map(
        ([name, columns], idx) => ({
          name,
          x: 40 + (idx % 3) * 280,
          y: 40 + Math.floor(idx / 3) * 260,
          columns,
        })
      );

      // 5. Calculate table stats (row counts)
      const tableStats: Record<string, number> = {};
      for (const tbl of tableMap.keys()) {
        const cntResult = await client.query(
          `SELECT COUNT(*) AS cnt FROM "${s.dbName}"."${tbl}"`
        );
        tableStats[tbl] = Number(cntResult.rows[0]?.cnt ?? 0);
      }

      const erdJson = { tables, relations };

      // 6. Update schema_definitions record
      await db
        .update(schemaDefinitions)
        .set({ erdJson, tableStats })
        .where(eq(schemaDefinitions.slug, s.slug));

      console.log(
        `✓ ${s.slug} synced (${tables.length} tables, ${relations.length} relations).`
      );
    }

    console.log("=== Metadata sync complete! ===");
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
