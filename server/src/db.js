import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env (server package workspaces run with cwd = server, but we
// resolve explicitly so imports from tests/migrations work from any cwd).
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const SCHEMA_PATH = path.join(__dirname, '..', '..', 'db', 'schema.sql');

/**
 * Build a pg Pool honoring the design constraint of at most 3 connections.
 * Fail-fast connection timeouts keep /health and tests responsive when the
 * database is unreachable.
 */
export function createPool(options = {}) {
  const config = {
    connectionString: process.env.DATABASE_URL,
    max: 3,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000,
    ...options,
  };

  if (!config.connectionString) {
    throw new Error('DATABASE_URL is not set (see server/.env.example)');
  }

  return new pg.Pool(config);
}

let pool = null;

/** Lazily-created singleton pool. */
export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

/** Replace the singleton (used by tests to inject a test pool). */
export function setPool(p) {
  pool = p;
  return pool;
}

/**
 * Apply db/schema.sql. Idempotent by construction (CREATE TABLE IF NOT
 * EXISTS, CREATE OR REPLACE VIEW, CREATE INDEX IF NOT EXISTS), so it is safe
 * to run on every boot and on every `npm run db:migrate`.
 */
export async function runMigration(clientOrPool = getPool()) {
  const schema = await readFile(SCHEMA_PATH, 'utf8');
  await clientOrPool.query(schema);
}

/**
 * Cheap connectivity probe used by /health. Returns true when the database
 * answers, false otherwise. Never throws; bounded by query_timeout.
 */
export async function isDbUp(clientOrPool = getPool()) {
  try {
    await clientOrPool.query({ text: 'SELECT 1', query_timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
