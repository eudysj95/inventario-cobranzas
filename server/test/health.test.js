// Health endpoint contract + DB test harness.
//
//   * The "db down" test needs no database: it points the pool at an
//     unreachable address and asserts /health degrades gracefully.
//   * The "db up" tests are skipped when no local/test Postgres is reachable
//     (TEST_DATABASE_URL or DATABASE_URL). Set one to enable them, e.g.:
//       TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/inventario_test
//     DB-dependent tests skip gracefully by design; strict TDD for later
//     slices runs with a real database.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import pg from 'pg';
import { runMigration } from '../src/db.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

test('GET /health reports db down when the database is unreachable', async () => {
  const pool = createUnreachablePool();
  after(() => pool.end());

  const res = await request(testApp(pool)).get('/health');

  assert.equal(res.status, 200, 'health always answers 200 for keep-alive');
  assert.deepEqual(res.body, { ok: false, db: 'down' });
});

// --- DB-gated: skipped gracefully when no Postgres is available ------------

const probePool = createTestPool();
const dbAvailable = await canReachDb(probePool);
if (probePool) await probePool.end();

test('GET /health reports db up against a reachable database', { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' }, async () => {
  const pool = createTestPool();
  after(() => pool.end());

  await runMigration(pool); // ensure schema exists (idempotent)
  const res = await request(testApp(pool)).get('/health');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, db: 'up' });
});

test('db:migrate is idempotent (applying schema twice succeeds)', { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' }, async () => {
  const pool = createTestPool();
  after(() => pool.end());

  // Both applications must succeed; the second is a no-op.
  await runMigration(pool);
  await runMigration(pool);

  const { rows } = await pool.query(
    "SELECT to_regclass('public.products') AS products, to_regclass('public.product_states') AS view"
  );
  assert.ok(rows[0].products, 'products table exists');
  assert.ok(rows[0].view, 'product_states view exists');
});

/** Pool aimed at a port that is never listening (fail fast). */
function createUnreachablePool() {
  return new pg.Pool({
    connectionString: 'postgresql://nobody:nothing@127.0.0.1:1/nope',
    max: 1,
    connectionTimeoutMillis: 500,
  });
}
