import { Pool } from "pg";

/**
 * Creates a sandbox PostgreSQL connection pool for executing student queries.
 * This pool uses the read-only role `joinlab_ro` which only has SELECT
 * permission on the sandbox schemas.
 *
 * IMPORTANT: This connection must NEVER be used for application queries.
 * Only SandboxExecutor should use this pool.
 */

const globalForSandbox = globalThis as unknown as {
  sandboxPool: Pool | undefined;
};

function createSandboxPool(): Pool {
  const host = process.env.SANDBOX_DB_HOST ?? "127.0.0.1";
  const port = parseInt(process.env.SANDBOX_DB_PORT ?? "5432", 10);
  const user = process.env.SANDBOX_DB_USER ?? "joinlab_ro";
  const password = process.env.SANDBOX_DB_PASSWORD ?? "";
  const database = process.env.SANDBOX_DB_NAME ?? "joinlab_sandbox";

  return new Pool({
    host,
    port,
    user,
    password,
    database,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export const sandboxPool =
  globalForSandbox.sandboxPool ?? createSandboxPool();

if (process.env.NODE_ENV !== "production") {
  globalForSandbox.sandboxPool = sandboxPool;
}
