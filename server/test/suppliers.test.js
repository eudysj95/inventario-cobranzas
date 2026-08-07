// Supplier routes tests (tasks 5.1 + 5.2).
//
// Two layers, mirroring products.test.js / payments.test.js:
//   * Auth-guard + input-validation tests need NO database.
//   * Upsert/TXN/due-view semantics are DB-gated and skip gracefully when no
//     Postgres is reachable.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'suppliers-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all supplier routes answer 401 without a session', async () => {
  const cases = [
    () => request(app).get('/api/suppliers'),
    () => request(app).post('/api/suppliers').send({}),
    () => request(app).get('/api/supplier-debts'),
    () => request(app).post('/api/supplier-debts').send({}),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/suppliers validates name', async () => {
  const missing = await AUTHED.post('/api/suppliers').send({});
  assert.equal(missing.status, 400);
  assert.equal(missing.body.error, 'name must be a non-empty string');

  const empty = await AUTHED.post('/api/suppliers').send({ name: '   ' });
  assert.equal(empty.status, 400);

  const notString = await AUTHED.post('/api/suppliers').send({ name: 42 });
  assert.equal(notString.status, 400);
});

test('POST /api/supplier-debts validates input before touching the database', async () => {
  const missingSupplier = await AUTHED.post('/api/supplier-debts').send({
    amount: 100,
    dueDate: '2026-08-10',
  });
  assert.equal(missingSupplier.status, 400);
  assert.equal(missingSupplier.body.error, 'supplierName must be a non-empty string');

  const blankSupplier = await AUTHED.post('/api/supplier-debts').send({
    supplierName: '  ',
    amount: 100,
    dueDate: '2026-08-10',
  });
  assert.equal(blankSupplier.status, 400);

  const badAmount = await AUTHED.post('/api/supplier-debts').send({
    supplierName: 'Acme',
    amount: 0,
    dueDate: '2026-08-10',
  });
  assert.equal(badAmount.status, 400);
  assert.equal(badAmount.body.error, 'amount must be a positive number');

  const stringAmount = await AUTHED.post('/api/supplier-debts').send({
    supplierName: 'Acme',
    amount: '50',
    dueDate: '2026-08-10',
  });
  assert.equal(stringAmount.status, 400);

  const missingDue = await AUTHED.post('/api/supplier-debts').send({
    supplierName: 'Acme',
    amount: 100,
  });
  assert.equal(missingDue.status, 400);
  assert.equal(missingDue.body.error, 'dueDate must be a valid date (YYYY-MM-DD)');

  const badDue = await AUTHED.post('/api/supplier-debts').send({
    supplierName: 'Acme',
    amount: 100,
    dueDate: '2026-02-30',
  });
  assert.equal(badDue.status, 400);
});

test('GET /api/supplier-debts rejects an invalid status filter', async () => {
  const res = await AUTHED.get('/api/supplier-debts?status=bogus');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid status: bogus');
});

// --- DB-gated: skipped gracefully when no Postgres is available ------------

const probePool = createTestPool();
const dbAvailable = await canReachDb(probePool);
if (probePool) await probePool.end();

const SKIP = !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL';

function dbContext() {
  const pool = createTestPool();
  after(() => pool.end());
  return pool;
}

const unique = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

/** Seed a supplier by name (returns the row). */
async function insertSupplier(pool, name) {
  const { rows } = await pool.query(
    `INSERT INTO suppliers (name) VALUES ($1)
     ON CONFLICT (name) DO NOTHING
     RETURNING id, name`,
    [name]
  );
  if (rows.length === 0) {
    const existing = await pool.query(
      'SELECT id, name FROM suppliers WHERE name = $1',
      [name]
    );
    return existing.rows[0];
  }
  return rows[0];
}

/** Seed a supplier debt directly with a chosen due date / status. */
async function insertDebt(pool, { supplierId, amount, balance, dueDate, status = 'open' }) {
  const { rows } = await pool.query(
    `INSERT INTO supplier_debts (supplier_id, amount, balance, due_date, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [supplierId, amount, balance, dueDate, status]
  );
  return rows[0].id;
}

test(
  'POST /api/suppliers auto-upserts by name (idempotent, no duplicates)',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);
    const name = unique('Acme');

    const first = await request(api)
      .post('/api/suppliers')
      .set('Cookie', authCookie)
      .send({ name });
    assert.equal(first.status, 201);
    assert.equal(first.body.supplier.name, name);
    const id = first.body.supplier.id;

    // Same name again: existing row returned, nothing duplicated.
    const second = await request(api)
      .post('/api/suppliers')
      .set('Cookie', authCookie)
      .send({ name });
    assert.equal(second.status, 200);
    assert.equal(second.body.supplier.id, id);

    const count = await pool.query(
      'SELECT COUNT(*)::int AS n FROM suppliers WHERE name = $1',
      [name]
    );
    assert.equal(count.rows[0].n, 1, 'upsert never duplicates the row');
  }
);

test(
  'POST /api/supplier-debts auto-upserts the supplier and opens the balance at the full amount',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);
    const name = unique('Distribuidora');

    const res = await request(api)
      .post('/api/supplier-debts')
      .set('Cookie', authCookie)
      .send({ supplierName: name, amount: 150, dueDate: '2026-08-10' });
    assert.equal(res.status, 201);
    assert.equal(res.body.debt.supplier_name, name);
    assert.equal(res.body.debt.amount, 150);
    assert.equal(res.body.debt.balance, 150, 'balance opens at the full amount');
    assert.equal(res.body.debt.status, 'open');
    assert.equal(res.body.debt.due_date, '2026-08-10');

    // The supplier row was created by the debt (auto-upsert inside the TXN).
    const supplier = await pool.query(
      'SELECT id FROM suppliers WHERE name = $1',
      [name]
    );
    assert.equal(supplier.rows.length, 1, 'debt auto-upserted the supplier');

    // Listing suppliers shows the auto-upserted name.
    const list = await request(api)
      .get('/api/suppliers')
      .set('Cookie', authCookie);
    assert.equal(list.status, 200);
    assert.ok(
      list.body.suppliers.some((s) => s.name === name),
      'auto-upserted supplier appears in the list'
    );
  }
);

test(
  'GET /api/supplier-debts lists ordered by due date with status filter and overdue flag',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const alpha = await insertSupplier(pool, unique('Alpha'));
    const beta = await insertSupplier(pool, unique('Beta'));
    const oldDue = '2020-01-01'; // overdue for any real "today"
    const soonDue = '2099-01-01'; // far future, never overdue
    await insertDebt(pool, {
      supplierId: alpha.id,
      amount: 50,
      balance: 50,
      dueDate: soonDue,
    });
    await insertDebt(pool, {
      supplierId: beta.id,
      amount: 80,
      balance: 80,
      dueDate: oldDue,
    });
    // A closed debt must only appear under ?status=closed.
    const closedId = await insertDebt(pool, {
      supplierId: alpha.id,
      amount: 30,
      balance: 0,
      dueDate: soonDue,
      status: 'closed',
    });

    const open = await request(api)
      .get('/api/supplier-debts?status=open')
      .set('Cookie', authCookie);
    assert.equal(open.status, 200);
    assert.equal(open.body.debts.length, 2);
    // Ordered by due date ascending: the overdue (2020) debt first.
    assert.equal(open.body.debts[0].due_date, oldDue);
    assert.equal(open.body.debts[0].overdue, true, 'past due date flagged overdue');
    assert.equal(open.body.debts[1].overdue, false, 'future due date not overdue');

    const closed = await request(api)
      .get('/api/supplier-debts?status=closed')
      .set('Cookie', authCookie);
    assert.equal(closed.status, 200);
    assert.deepEqual(
      closed.body.debts.map((d) => d.id),
      [closedId],
      'closed filter returns only closed debts'
    );
  }
);
