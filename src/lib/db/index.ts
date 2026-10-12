import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function getPool(): Pool {
  const url =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/joinlab_app";
  return new Pool({ connectionString: url });
}

const pool = getPool();
export const db = drizzle(pool, { schema });

export { pool, schema };
