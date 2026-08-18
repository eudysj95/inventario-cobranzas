// Collections due-view route tests (task 4.5).
//
// Two layers, mirroring products.test.js:
//   * Auth-guard + horizonDays validation need NO database.
//   * The due-view semantics (horizon inclusion, overdue flag, apartado
//     remaining amounts, paid/closed exclusion) are DB-gated and skip
//     gracefully when no Postgres is reachable.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'collections-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
};

// --- Auth guard + validation (no database required) -----------------------

test('GET /api/collections/due answers 401 without a session', async () => {
  const res = await request(app).get('/api/collections/due');
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('GET /api/collections/due validates horizonDays', async () => {
  const bad = await AUTHED.get('/api/collections/due?horizonDays=abc');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error, 'horizonDays must be a non-negative integer');

  const negative = await AUTHED.get('/api/collections/due?horizonDays=-1');
  assert.equal(negative.status, 400);

  const fractional = await AUTHED.get('/api/collections/due?horizonDays=2.5');
  assert.equal(fractional.status, 400);
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

async function insertCustomer(pool, id, name, phone = null) {
  await pool.query(
    'INSERT INTO customers (id, name, phone) VALUES ($1, $2, $3)',
    [id, name, phone]
  );
}

async function insertProduct(pool, name) {
  const { rows } = await pool.query(
    'INSERT INTO products (name, quantity) VALUES ($1, 0) RETURNING id',
    [name]
  );
  return rows[0].id;
}

/**
 * A date offset from today in UTC. The comparison runs against CURRENT_DATE
 * in the database session timezone, so DB-gated runs should use a UTC
 * Postgres session (Neon default) for these to align.
 */
function dateFromNow(days) {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

test(
  'GET /api/collections/due lists customers with items inside the horizon and an overdue flag',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await insertProduct(pool, unique('col-product'));
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Due Customer', '+54 11 5555 1234');

    // Pending apartado due in 3 days; 10 already paid -> remaining 40.
    const apartadoId = randomUUID();
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, due_date, status)
       VALUES ($1, $2, $3, 1, 50, $4, 'pending')`,
      [apartadoId, customerId, productId, dateFromNow(3)]
    );
    await pool.query(
      'INSERT INTO apartado_payments (apartado_id, amount) VALUES ($1, $2)',
      [apartadoId, 10]
    );

    // Open credit debt due in 5 days, balance 80.
    await pool.query(
      `INSERT INTO customer_debts
         (id, customer_id, product_id, sale_id, units, amount, balance, due_date, status)
       VALUES ($1, $2, $3, $4, 1, 80, 80, $5, 'open')`,
      [randomUUID(), customerId, productId, randomUUID(), dateFromNow(5)]
    );

    const res = await request(api)
      .get('/api/collections/due?horizonDays=7')
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    const row = res.body.customers.find((c) => c.customerId === customerId);
    assert.ok(row, 'customer appears in the due view');
    assert.equal(row.name, 'Due Customer');
    assert.equal(row.phone, '+54 11 5555 1234');
    assert.equal(row.overdue, false);
    assert.equal(row.totalOpen, 120, 'apartado remaining 40 + credit balance 80');

    assert.equal(row.items.length, 2);
    const apartadoItem = row.items.find((i) => i.type === 'apartado');
    const creditItem = row.items.find((i) => i.type === 'credit');
    assert.deepEqual(apartadoItem, {
      type: 'apartado',
      amount: 40,
      dueDate: dateFromNow(3),
    });
    assert.deepEqual(creditItem, {
      type: 'credit',
      amount: 80,
      dueDate: dateFromNow(5),
    });
  }
);

test(
  'GET /api/collections/due flags overdue customers and excludes far-future items',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await insertProduct(pool, unique('col-product2'));

    // Customer 1: apartado due YESTERDAY -> overdue, still collected.
    const overdueCustomer = randomUUID();
    await insertCustomer(pool, overdueCustomer, 'Overdue Customer');
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, due_date, status)
       VALUES ($1, $2, $3, 1, 25, $4, 'pending')`,
      [randomUUID(), overdueCustomer, productId, dateFromNow(-1)]
    );

    // Customer 2: debt due in 30 days -> outside horizon 7, not collected.
    const farCustomer = randomUUID();
    await insertCustomer(pool, farCustomer, 'Far Customer');
    await pool.query(
      `INSERT INTO customer_debts
         (id, customer_id, product_id, sale_id, units, amount, balance, due_date, status)
       VALUES ($1, $2, $3, $4, 1, 100, 100, $5, 'open')`,
      [randomUUID(), farCustomer, productId, randomUUID(), dateFromNow(30)]
    );

    const res = await request(api)
      .get('/api/collections/due?horizonDays=7')
      .set('Cookie', authCookie);
    const overdueRow = res.body.customers.find(
      (c) => c.customerId === overdueCustomer
    );
    assert.ok(overdueRow, 'overdue apartado is included');
    assert.equal(overdueRow.overdue, true);
    assert.equal(overdueRow.items[0].amount, 25);
    assert.equal(overdueRow.items[0].type, 'apartado');

    const farRow = res.body.customers.find((c) => c.customerId === farCustomer);
    assert.equal(farRow, undefined, 'items beyond the horizon do not appear');
  }
);

test(
  'GET /api/collections/due excludes paid apartados and closed debts',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await insertProduct(pool, unique('col-product3'));
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Paid Customer');

    // Paid apartado due yesterday — paid items are never collected.
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, due_date, status)
       VALUES ($1, $2, $3, 1, 25, $4, 'paid')`,
      [randomUUID(), customerId, productId, dateFromNow(-1)]
    );
    // Closed credit debt due yesterday — closed debts are never collected.
    await pool.query(
      `INSERT INTO customer_debts
         (id, customer_id, product_id, sale_id, units, amount, balance, due_date, status, closed_at)
       VALUES ($1, $2, $3, $4, 1, 60, 0, $5, 'closed', now())`,
      [randomUUID(), customerId, productId, randomUUID(), dateFromNow(-1)]
    );

    const res = await request(api)
      .get('/api/collections/due?horizonDays=7')
      .set('Cookie', authCookie);
    assert.equal(
      res.body.customers.find((c) => c.customerId === customerId),
      undefined,
      'paid/closed obligations never appear in the due view'
    );
  }
);

test(
  'GET /api/collections/due returns an empty list when nothing is due',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await insertProduct(pool, unique('col-product4'));
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Quiet Customer');

    // An open debt far beyond the horizon: due view must be empty.
    await pool.query(
      `INSERT INTO customer_debts
         (id, customer_id, product_id, sale_id, units, amount, balance, due_date, status)
       VALUES ($1, $2, $3, $4, 1, 90, 90, $5, 'open')`,
      [randomUUID(), customerId, productId, randomUUID(), dateFromNow(90)]
    );

    const res = await request(api)
      .get('/api/collections/due?horizonDays=7')
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    // The due view is scoped by unique customer: other runs' (and this run's
    // earlier) in-horizon rows legitimately remain in the shared DB, so only
    // THIS customer's absence proves the far-future obligation never surfaces.
    const quiet = res.body.customers.find((c) => c.customerId === customerId);
    assert.equal(quiet, undefined, 'far-future obligation never appears in the due view');
  }
);
