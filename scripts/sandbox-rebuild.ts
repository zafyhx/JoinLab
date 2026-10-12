import "dotenv/config";
import { Client } from "pg";
import fs from "fs/promises";
import path from "path";

const SCHEMA_FILES = [
  { file: "akademik.sql", schema: "sb_akademik" },
  { file: "toko.sql", schema: "sb_toko" },
  { file: "perpustakaan.sql", schema: "sb_perpustakaan" },
];

/**
 * Splits a SQL script into individual statements, respecting single-quoted
 * string literals and line/block comments.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    // Single-quoted string literal
    if (ch === "'") {
      current += ch;
      i++;
      while (i < sql.length) {
        if (sql[i] === "'") {
          current += sql[i];
          i++;
          if (i < sql.length && sql[i] === "'") {
            current += sql[i];
            i++;
            continue;
          }
          break;
        }
        current += sql[i];
        i++;
      }
      continue;
    }

    // Line comment
    if (ch === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") {
        current += sql[i];
        i++;
      }
      continue;
    }

    // Block comment
    if (ch === "/" && sql[i + 1] === "*") {
      current += "/*";
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) {
        current += sql[i];
        i++;
      }
      if (i < sql.length) {
        current += "*/";
        i += 2;
      }
      continue;
    }

    if (ch === ";") {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = "";
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  const last = current.trim();
  if (last) statements.push(last);

  return statements;
}

async function main() {
  const args = process.argv.slice(2);
  const hasForce = args.includes("--force");

  if (process.env.NODE_ENV === "production" && !hasForce) {
    console.error(
      "Error: --force flag is required when running in production environment."
    );
    process.exit(1);
  }

  console.log("=== JoinLab Sandbox Rebuild (PostgreSQL) ===");

  const host = process.env.SANDBOX_DB_HOST || "127.0.0.1";
  const port = parseInt(process.env.SANDBOX_DB_PORT || "5432", 10);
  const adminUser = process.env.SANDBOX_ADMIN_USER || "postgres";
  const adminPassword = process.env.SANDBOX_ADMIN_PASSWORD || "";
  const adminDb = process.env.SANDBOX_ADMIN_DB || "postgres";
  const sandboxDb = process.env.SANDBOX_DB_NAME || "joinlab_sandbox";
  const roUser = process.env.SANDBOX_DB_USER || "joinlab_ro";
  const roPassword = process.env.SANDBOX_DB_PASSWORD || "";

  // 1. Connect as admin to the admin database
  console.log(`Connecting as admin (${adminUser}@${host}:${port}/${adminDb})...`);
  const admin = new Client({
    host,
    port,
    user: adminUser,
    password: adminPassword,
    database: adminDb,
  });
  await admin.connect();

  try {
    // 2. Ensure read-only role exists
    const roleRes = await admin.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [roUser]
    );
    if (roleRes.rowCount === 0) {
      await admin.query(
        `CREATE ROLE "${roUser}" LOGIN PASSWORD '${roPassword}'`
      );
      console.log(`✓ Role ${roUser} created.`);
    } else {
      console.log(`Role ${roUser} already exists.`);
    }

    // 3. Ensure sandbox database exists
    const dbRes = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [sandboxDb]
    );
    if (dbRes.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${sandboxDb}"`);
      console.log(`✓ Database ${sandboxDb} created.`);
    } else {
      console.log(`Database ${sandboxDb} already exists.`);
    }
  } finally {
    await admin.end();
  }

  // 4. Connect to sandbox database and rebuild schemas
  const sandbox = new Client({
    host,
    port,
    user: adminUser,
    password: adminPassword,
    database: sandboxDb,
  });
  await sandbox.connect();

  try {
    const sandboxDir = path.join(process.cwd(), "database", "sandbox");

    for (const def of SCHEMA_FILES) {
      const filePath = path.join(sandboxDir, def.file);
      console.log(`Rebuilding schema ${def.schema} from ${def.file}...`);
      const sqlContent = await fs.readFile(filePath, "utf-8");

      await sandbox.query(`DROP SCHEMA IF EXISTS "${def.schema}" CASCADE`);
      await sandbox.query(`CREATE SCHEMA "${def.schema}"`);
      await sandbox.query(`SET search_path TO "${def.schema}"`);

      const statements = splitStatements(sqlContent);
      for (const stmt of statements) {
        await sandbox.query(stmt);
      }
      console.log(`✓ ${def.file} executed (${statements.length} statements).`);
    }

    // 5. Apply grants
    const grantsPath = path.join(sandboxDir, "grants.sql");
    const grantsSql = await fs.readFile(grantsPath, "utf-8");
    for (const stmt of splitStatements(grantsSql)) {
      await sandbox.query(stmt);
    }
    console.log("✓ grants.sql executed.");

    console.log("=== Sandbox schemas rebuilt and permissions granted! ===");
  } catch (err) {
    console.error("Rebuild failed:", err);
    process.exit(1);
  } finally {
    await sandbox.end();
  }
}

main();
