// Shared test helpers. Tests run against the Postgres pointed to by
// TEST_DATABASE_URL (fallback: DATABASE_URL). When no database is reachable,
// DB-dependent tests skip gracefully — the /health contract is still
// verified without a database.
import pg from 'pg';
import { createApp } from '../src/app.js';

/** URL used for DB-dependent tests, or null when not configured. */
export function testDbUrl() {
  return process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? null;
}

/** Pool pointed at the test database (null URL -> null pool). */
export function createTestPool() {
  const url = testDbUrl();
  if (!url) return null;
  return new pg.Pool({
    connectionString: url,
    max: 3,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 5000,
  });
}

/** True when the given pool can answer a trivial query. */
export async function canReachDb(pool) {
  if (!pool) return false;
  try {
    await pool.query({ text: 'SELECT 1', query_timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/** Express app wired to the given pool (health probes that pool). */
export function testApp(pool) {
  return createApp({ pool });
}
