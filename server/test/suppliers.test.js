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

/**
 * A date offset from today in UTC. The comparison runs against CURRENT_DATE
 * (the Postgres server's date), so offsets must be large enough to be stable
 * across timezones and never flip a seeded "inside horizon" row into the past.
 */
function dateFromNow(days) {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
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

// --- Task 5.2: pay TXN + due view -----------------------------------------

test('pay and due routes answer 401 without a session', async () => {
  const cases = [
    () => request(app).post('/api/supplier-debts/00000000-0000-0000-0000-000000000000/pay').send({}),
    () => request(app).get('/api/supplier-debts/due'),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

test('POST /api/supplier-debts/:id/pay validates amount and id shape', async () => {
  const uuid = '00000000-0000-0000-0000-000000000000';

  const nonUuid = await AUTHED.post('/api/supplier-debts/not-a-uuid/pay').send({
    amount: 10,
  });
  assert.equal(nonUuid.status, 404);

  const missing = await AUTHED.post(`/api/supplier-debts/${uuid}/pay`).send({});
  assert.equal(missing.status, 400);
  assert.equal(missing.body.error, 'amount must be a positive number');

  const zero = await AUTHED.post(`/api/supplier-debts/${uuid}/pay`).send({
    amount: 0,
  });
  assert.equal(zero.status, 400);

  const negative = await AUTHED.post(`/api/supplier-debts/${uuid}/pay`).send({
    amount: -5,
  });
  assert.equal(negative.status, 400);

  const stringAmount = await AUTHED.post(`/api/supplier-debts/${uuid}/pay`).send({
    amount: '10',
  });
  assert.equal(stringAmount.status, 400);
});

test('GET /api/supplier-debts/due validates horizonDays', async () => {
  const cases = ['abc', '-1', '2.5'];
  for (const horizonDays of cases) {
    const res = await AUTHED.get(`/api/supplier-debts/due?horizonDays=${horizonDays}`);
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'horizonDays must be a non-negative integer');
  }
});

test(
  'POST /api/supplier-debts/:id/pay reduces balance, rejects overpayment, closes at 0',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const supplier = await insertSupplier(pool, unique('Pagar'));
    const debtId = await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 100,
      balance: 100,
      dueDate: '2026-08-10',
    });

    // Partial payment: balance drops, debt stays open.
    const partial = await request(api)
      .post(`/api/supplier-debts/${debtId}/pay`)
      .set('Cookie', authCookie)
      .send({ amount: 30 });
    assert.equal(partial.status, 200);
    assert.equal(partial.body.debt.balance, 70);
    assert.equal(partial.body.debt.status, 'open');

    const payments = await pool.query(
      'SELECT COUNT(*)::int AS n FROM supplier_payments WHERE debt_id = $1',
      [debtId]
    );
    assert.equal(payments.rows[0].n, 1, 'payment row recorded');

    // Overpayment (80 > 70): 400, balance and rows untouched.
    const over = await request(api)
      .post(`/api/supplier-debts/${debtId}/pay`)
      .set('Cookie', authCookie)
      .send({ amount: 80 });
    assert.equal(over.status, 400);
    assert.equal(over.body.error, 'Payment exceeds the remaining balance of the supplier debt');

    const afterOver = await pool.query(
      'SELECT status, balance FROM supplier_debts WHERE id = $1',
      [debtId]
    );
    assert.equal(Number(afterOver.rows[0].balance), 70, 'balance unchanged after rejection');
    assert.equal(afterOver.rows[0].status, 'open');
    const paymentsAfter = await pool.query(
      'SELECT COUNT(*)::int AS n FROM supplier_payments WHERE debt_id = $1',
      [debtId]
    );
    assert.equal(paymentsAfter.rows[0].n, 1, 'no payment row persisted after rejection');

    // Exact remainder closes the debt.
    const exact = await request(api)
      .post(`/api/supplier-debts/${debtId}/pay`)
      .set('Cookie', authCookie)
      .send({ amount: 70 });
    assert.equal(exact.status, 200);
    assert.equal(exact.body.debt.balance, 0);
    assert.equal(exact.body.debt.status, 'closed');

    // Payment on a closed debt is a conflict.
    const after = await request(api)
      .post(`/api/supplier-debts/${debtId}/pay`)
      .set('Cookie', authCookie)
      .send({ amount: 5 });
    assert.equal(after.status, 409);
    assert.equal(after.body.error, 'Only open supplier debts can receive payments');
  }
);

test(
  'GET /api/supplier-debts/due filters by horizon and flags overdue/soon-due',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const supplier = await insertSupplier(pool, unique('Vencimientos'));
    const overdueId = await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 40,
      balance: 40,
      dueDate: dateFromNow(-100), // clearly overdue for any real "today"
    });
    const soonId = await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 60,
      balance: 60,
      dueDate: dateFromNow(15), // inside a 30-day horizon
    });
    // Far beyond the horizon: excluded.
    await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 25,
      balance: 25,
      dueDate: dateFromNow(60),
    });
    // Closed debt: excluded even when due inside the horizon.
    await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 15,
      balance: 0,
      dueDate: dateFromNow(10),
      status: 'closed',
    });
    // Fully paid open debt (balance 0): excluded.
    await insertDebt(pool, {
      supplierId: supplier.id,
      amount: 10,
      balance: 0,
      dueDate: dateFromNow(12),
    });

    const res = await request(api)
      .get('/api/supplier-debts/due?horizonDays=30')
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.debts.length, 2, 'only open, unpaid, in-horizon debts');
    assert.deepEqual(
      res.body.debts.map((d) => d.id).sort(),
      [overdueId, soonId].sort()
    );

    const byId = Object.fromEntries(res.body.debts.map((d) => [d.id, d]));
    assert.equal(byId[overdueId].overdue, true, 'past-due debt flagged overdue');
    assert.equal(byId[overdueId].soon_due, false);
    assert.equal(byId[soonId].overdue, false);
    assert.equal(byId[soonId].soon_due, true, 'in-horizon future debt flagged soon-due');

    // Ordered by due date ascending: overdue (2020) first.
    assert.equal(res.body.debts[0].id, overdueId);
  }
);
