// Payments route tests (task 4.4).
//
// Two layers, mirroring products.test.js:
//   * Auth-guard + input-validation tests need NO database.
//   * FIFO/TXN semantics (oldest-first allocation across debts, overpayment
//     rejection, closure at balance 0, payment on closed customer rejected,
//     history with allocations) are DB-gated and skip gracefully when no
//     Postgres is reachable.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'payments-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all payments routes answer 401 without a session', async () => {
  const cases = [
    () => request(app).post('/api/payments').send({}),
    () => request(app).get('/api/payments'),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/payments validates input before touching the database', async () => {
  const uuid = '00000000-0000-0000-0000-000000000000';

  const badCustomer = await AUTHED.post('/api/payments').send({
    customerId: 'not-a-uuid',
    amount: 10,
  });
  assert.equal(badCustomer.status, 400);
  assert.equal(badCustomer.body.error, 'customerId must be a valid UUID');

  const zeroAmount = await AUTHED.post('/api/payments').send({
    customerId: uuid,
    amount: 0,
  });
  assert.equal(zeroAmount.status, 400);
  assert.equal(zeroAmount.body.error, 'amount must be a positive number');

  const noAmount = await AUTHED.post('/api/payments').send({ customerId: uuid });
  assert.equal(noAmount.status, 400);

  const badNote = await AUTHED.post('/api/payments').send({
    customerId: uuid,
    amount: 10,
    note: 42,
  });
  assert.equal(badNote.status, 400);
  assert.equal(badNote.body.error, 'note must be a string or null');
});

test('GET /api/payments rejects a non-UUID customerId filter', async () => {
  const res = await AUTHED.get('/api/payments?customerId=not-a-uuid');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'customerId must be a valid UUID');
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

async function insertCustomer(pool, id, name) {
  await pool.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [id, name]);
}

async function insertProduct(pool, name) {
  const { rows } = await pool.query(
    'INSERT INTO products (name, quantity) VALUES ($1, 0) RETURNING id',
    [name]
  );
  return rows[0].id;
}

/** Seed an open debt directly with a chosen creation time (FIFO ordering). */
async function insertDebt(pool, { customerId, productId, amount, balance, createdAt }) {
  const { rows } = await pool.query(
    `INSERT INTO customer_debts
       (id, customer_id, product_id, sale_id, units, amount, balance, created_at)
     VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
     RETURNING id`,
    [randomUUID(), customerId, productId, randomUUID(), amount, balance, createdAt]
  );
  return rows[0].id;
}

test(
  'POST /api/payments applies FIFO across debts: closes oldest first, spans the rest',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'FIFO Customer');
    const productId = await insertProduct(pool, unique('fifo'));

    // Debt A is the OLDER one (created an hour before debt B).
    const debtA = await insertDebt(pool, {
      customerId,
      productId,
      amount: 50,
      balance: 50,
      createdAt: new Date(Date.now() - 3600_000),
    });
    const debtB = await insertDebt(pool, {
      customerId,
      productId,
      amount: 40,
      balance: 40,
      createdAt: new Date(),
    });

    const res = await request(api)
      .post('/api/payments')
      .set('Cookie', authCookie)
      .send({ customerId, amount: 60 });

    assert.equal(res.status, 201);
    assert.equal(res.body.payment.amount, 60);
    assert.equal(res.body.payment.customer_name, 'FIFO Customer');
    assert.equal(res.body.allocations.length, 2, 'payment spans both debts');
    const allocA = res.body.allocations.find((a) => a.debt_id === debtA);
    const allocB = res.body.allocations.find((a) => a.debt_id === debtB);
    assert.equal(allocA.amount, 50, 'oldest debt fully paid first');
    assert.equal(allocB.amount, 10, 'remainder goes to the newer debt');

    // Debt A closed at 0; debt B still open with balance 30.
    const a = await pool.query(
      'SELECT status, balance, closed_at FROM customer_debts WHERE id = $1',
      [debtA]
    );
    assert.equal(a.rows[0].status, 'closed');
    assert.equal(Number(a.rows[0].balance), 0);
    assert.ok(a.rows[0].closed_at, 'closed_at recorded on closure');
    const b = await pool.query(
      'SELECT status, balance FROM customer_debts WHERE id = $1',
      [debtB]
    );
    assert.equal(b.rows[0].status, 'open');
    assert.equal(Number(b.rows[0].balance), 30);
  }
);

test(
  'POST /api/payments rejects overpayment and payments on fully-closed customers',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Reject Customer');
    const productId = await insertProduct(pool, unique('reject'));
    const debtId = await insertDebt(pool, {
      customerId,
      productId,
      amount: 50,
      balance: 50,
      createdAt: new Date(),
    });

    // Overpayment (60 > 50) rejected: 400, nothing recorded.
    const over = await request(api)
      .post('/api/payments')
      .set('Cookie', authCookie)
      .send({ customerId, amount: 60 });
    assert.equal(over.status, 400);
    assert.equal(over.body.error, "Payment exceeds the customer's remaining balance");

    const debt = await pool.query(
      'SELECT status, balance FROM customer_debts WHERE id = $1',
      [debtId]
    );
    assert.equal(debt.rows[0].status, 'open');
    assert.equal(Number(debt.rows[0].balance), 50, 'balance unchanged after rejection');
    const count = await pool.query(
      'SELECT COUNT(*)::int AS n FROM payments WHERE customer_id = $1',
      [customerId]
    );
    assert.equal(count.rows[0].n, 0, 'no payment row persisted after rejection');

    // Exact payment closes the debt (spec: lifecycle ends at balance 0).
    const exact = await request(api)
      .post('/api/payments')
      .set('Cookie', authCookie)
      .send({ customerId, amount: 50 });
    assert.equal(exact.status, 201);

    // Any further payment on a fully-closed customer is rejected.
    const after = await request(api)
      .post('/api/payments')
      .set('Cookie', authCookie)
      .send({ customerId, amount: 5 });
    assert.equal(after.status, 400);
    assert.equal(after.body.error, 'Customer has no open debts');
  }
);

test(
  'GET /api/payments returns history with allocations, filterable by customer',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'History Customer');
    const productId = await insertProduct(pool, unique('history'));
    const debtA = await insertDebt(pool, {
      customerId,
      productId,
      amount: 30,
      balance: 30,
      createdAt: new Date(Date.now() - 3600_000),
    });
    const debtB = await insertDebt(pool, {
      customerId,
      productId,
      amount: 20,
      balance: 20,
      createdAt: new Date(),
    });

    const pay = await request(api)
      .post('/api/payments')
      .set('Cookie', authCookie)
      .send({ customerId, amount: 40 });
    assert.equal(pay.status, 201);

    const res = await request(api)
      .get(`/api/payments?customerId=${customerId}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.payments.length, 1);
    const payment = res.body.payments[0];
    assert.equal(payment.amount, 40);
    assert.equal(payment.customer_name, 'History Customer');
    assert.equal(payment.allocations.length, 2);
    const allocA = payment.allocations.find((a) => a.debt_id === debtA);
    const allocB = payment.allocations.find((a) => a.debt_id === debtB);
    assert.equal(allocA.amount, 30);
    assert.equal(allocB.amount, 10);

    // Unfiltered history also lists the payment (robust across shared DB runs).
    const all = await request(api)
      .get('/api/payments')
      .set('Cookie', authCookie);
    assert.equal(all.status, 200);
    assert.ok(
      all.body.payments.some((p) => p.id === payment.id),
      'payment appears in unfiltered history'
    );
  }
);
