// Customers route tests (task 3.2).
//
// Same two-layer structure as test/products.test.js: auth-guard and
// validation tests need no database; row-level semantics (open balance SUM,
// patch, detail, delete guards) are DB-gated and skip gracefully when no
// Postgres is reachable (TEST_DATABASE_URL / DATABASE_URL).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'customers-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
  patch: (url) => request(app).patch(url).set('Cookie', authCookie),
  delete: (url) => request(app).delete(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all customers routes answer 401 without a session', async () => {
  const id = '00000000-0000-0000-0000-000000000000';
  const cases = [
    () => request(app).get('/api/customers'),
    () => request(app).post('/api/customers').send({ name: 'x' }),
    () => request(app).get(`/api/customers/${id}`),
    () => request(app).patch(`/api/customers/${id}`).send({ name: 'x' }),
    () => request(app).delete(`/api/customers/${id}`),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/customers validates input before touching the database', async () => {
  const noName = await AUTHED.post('/api/customers').send({});
  assert.equal(noName.status, 400);
  assert.equal(noName.body.error, 'Customer name is required');

  const badPhone = await AUTHED.post('/api/customers').send({ name: 'X', phone: 42 });
  assert.equal(badPhone.status, 400);
  assert.equal(badPhone.body.error, 'Phone must be a string or null');
});

test('PATCH /api/customers validates fields', async () => {
  const id = '00000000-0000-0000-0000-000000000000';

  const noFields = await AUTHED.patch(`/api/customers/${id}`).send({});
  assert.equal(noFields.status, 400);
  assert.equal(noFields.body.error, 'No fields to update');

  const blankName = await AUTHED.patch(`/api/customers/${id}`).send({ name: '  ' });
  assert.equal(blankName.status, 400);

  const badPhone = await AUTHED.patch(`/api/customers/${id}`).send({ phone: 42 });
  assert.equal(badPhone.status, 400);
});

test('non-UUID customer :id is answered 404 without touching the database', async () => {
  const res = await AUTHED.get('/api/customers/not-a-uuid');
  assert.equal(res.status, 404);
  const del = await AUTHED.delete('/api/customers/not-a-uuid');
  assert.equal(del.status, 404);
});

// --- DB-gated: skipped gracefully when no Postgres is available ------------

const probePool = createTestPool();
const dbAvailable = await canReachDb(probePool);
if (probePool) await probePool.end();

const SKIP = !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL';

/** Fresh migrated pool for one DB-gated test (released at test teardown). */
function dbContext() {
  const pool = createTestPool();
  after(() => pool.end());
  return pool;
}

const unique = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

/** Create a customer through the API and return its id. */
async function createCustomer(api, name, phone) {
  const body = { name };
  if (phone !== undefined) body.phone = phone;
  const res = await request(api)
    .post('/api/customers')
    .set('Cookie', authCookie)
    .send(body);
  assert.equal(res.status, 201);
  return res.body.customer.id;
}

/** Insert a product row directly so seeded debts/apartados can reference it. */
async function insertProduct(pool, id, name) {
  await pool.query(
    'INSERT INTO products (id, name, quantity) VALUES ($1, $2, 10)',
    [id, name]
  );
}

test(
  'POST /api/customers creates a customer and normalizes the phone',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const withPhone = await request(api)
      .post('/api/customers')
      .set('Cookie', authCookie)
      .send({ name: unique('Ana'), phone: '  +54 11 5555 ' });
    assert.equal(withPhone.status, 201);
    assert.equal(withPhone.body.customer.phone, '+54 11 5555', 'phone is trimmed');
    assert.equal(withPhone.body.customer.open_balance, 0);

    const emptyPhone = await request(api)
      .post('/api/customers')
      .set('Cookie', authCookie)
      .send({ name: unique('Bob'), phone: '   ' });
    assert.equal(emptyPhone.status, 201);
    assert.equal(emptyPhone.body.customer.phone, null, 'blank phone is stored as null');

    const noPhone = await request(api)
      .post('/api/customers')
      .set('Cookie', authCookie)
      .send({ name: unique('Caro') });
    assert.equal(noPhone.status, 201);
    assert.equal(noPhone.body.customer.phone, null);
  }
);

test(
  'GET /api/customers lists open balance as debt balances plus pending apartado remaining',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    // A owes: open debt balance 40 + pending apartado remaining 30 = 70.
    const idA = await createCustomer(api, unique('Debtor A'));
    const productId = randomUUID();
    await insertProduct(pool, productId, 'Balance product');

    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 1, 100, 40, 'open')`,
      [randomUUID(), idA, productId, randomUUID()]
    );
    const apartadoId = randomUUID();
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, status)
       VALUES ($1, $2, $3, 2, 50, 'pending')`,
      [apartadoId, idA, productId]
    );
    await pool.query(
      'INSERT INTO apartado_payments (apartado_id, amount) VALUES ($1, 20)',
      [apartadoId]
    );

    // B has only closed records -> open balance 0.
    const idB = await createCustomer(api, unique('Settled B'));
    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 1, 60, 0, 'closed')`,
      [randomUUID(), idB, productId, randomUUID()]
    );

    const list = await request(api).get('/api/customers').set('Cookie', authCookie);
    assert.equal(list.status, 200);
    const byId = Object.fromEntries(
      list.body.customers.map((c) => [c.id, c])
    );
    assert.equal(byId[idA].open_balance, 70, 'balance includes debt + apartado remaining');
    assert.equal(byId[idB].open_balance, 0);
  }
);

test(
  'GET /api/customers filters by name search',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const token = randomUUID().slice(0, 8);
    const luna = `Luna ${token}`;
    const other = `Other ${token}`;
    await createCustomer(api, luna);
    await createCustomer(api, other);

    // Search is scoped to a unique token so leftover rows from earlier runs
    // (shared test database) can never affect the counts.
    const both = await request(api)
      .get(`/api/customers?search=${token}`)
      .set('Cookie', authCookie);
    assert.equal(both.status, 200);
    assert.equal(both.body.customers.length, 2);

    const onlyLuna = await request(api)
      .get(`/api/customers?search=${encodeURIComponent(luna)}`)
      .set('Cookie', authCookie);
    assert.equal(onlyLuna.status, 200);
    assert.equal(onlyLuna.body.customers.length, 1);
    assert.equal(onlyLuna.body.customers[0].name, luna);
  }
);

test(
  'PATCH /api/customers updates fields, clears phone, and 404s unknown ids',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const id = await createCustomer(api, unique('Patch Me'), '555-1234');

    const renamed = await request(api)
      .patch(`/api/customers/${id}`)
      .set('Cookie', authCookie)
      .send({ name: unique('Patched Name') });
    assert.equal(renamed.status, 200);
    assert.match(renamed.body.customer.name, /Patched Name/);
    assert.equal(renamed.body.customer.phone, '555-1234', 'phone untouched');

    const newPhone = await request(api)
      .patch(`/api/customers/${id}`)
      .set('Cookie', authCookie)
      .send({ phone: '555-9999' });
    assert.equal(newPhone.status, 200);
    assert.equal(newPhone.body.customer.phone, '555-9999');

    const cleared = await request(api)
      .patch(`/api/customers/${id}`)
      .set('Cookie', authCookie)
      .send({ phone: null });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.customer.phone, null, 'null clears the phone');

    const missing = await request(api)
      .patch(`/api/customers/${randomUUID()}`)
      .set('Cookie', authCookie)
      .send({ name: 'X' });
    assert.equal(missing.status, 404);
  }
);

test(
  'GET /api/customers/:id returns open debts and payment history',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const id = await createCustomer(api, unique('Detail Customer'));
    const productId = randomUUID();
    await insertProduct(pool, productId, 'Detail product');

    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 2, 80, 80, 'open')`,
      [randomUUID(), id, productId, randomUUID()]
    );
    await pool.query(
      "INSERT INTO payments (customer_id, amount, note) VALUES ($1, 30, 'abono')",
      [id]
    );

    const res = await request(api)
      .get(`/api/customers/${id}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.customer.open_balance, 80);

    assert.equal(res.body.open_debts.length, 1);
    assert.equal(res.body.open_debts[0].balance, 80);
    assert.equal(res.body.open_debts[0].product_name, 'Detail product');

    assert.equal(res.body.payments.length, 1);
    assert.equal(res.body.payments[0].amount, 30);
  }
);

test(
  'DELETE /api/customers enforces open-record and history guards',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);
    const productId = randomUUID();
    await insertProduct(pool, productId, 'Delete product');

    // Clean customer -> deleted.
    const clean = await createCustomer(api, unique('Clean Customer'));
    const cleanRes = await request(api)
      .delete(`/api/customers/${clean}`)
      .set('Cookie', authCookie);
    assert.equal(cleanRes.status, 200);
    assert.deepEqual(cleanRes.body, { ok: true });
    const gone = await request(api)
      .get(`/api/customers/${clean}`)
      .set('Cookie', authCookie);
    assert.equal(gone.status, 404);

    // Open debt -> rejected.
    const withDebt = await createCustomer(api, unique('Debt Customer'));
    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 1, 40, 40, 'open')`,
      [randomUUID(), withDebt, productId, randomUUID()]
    );
    const debtRes = await request(api)
      .delete(`/api/customers/${withDebt}`)
      .set('Cookie', authCookie);
    assert.equal(debtRes.status, 409);
    assert.equal(debtRes.body.error, 'Cannot delete a customer with open apartados or debts');

    // Pending apartado -> rejected.
    const withApartado = await createCustomer(api, unique('Apartado Customer'));
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, status)
       VALUES ($1, $2, $3, 1, 20, 'pending')`,
      [randomUUID(), withApartado, productId]
    );
    const apartadoRes = await request(api)
      .delete(`/api/customers/${withApartado}`)
      .set('Cookie', authCookie);
    assert.equal(apartadoRes.status, 409);

    // Only payment history -> FK RESTRICT translates to 409.
    const withPayments = await createCustomer(api, unique('Payment Customer'));
    await pool.query(
      "INSERT INTO payments (customer_id, amount) VALUES ($1, 10)",
      [withPayments]
    );
    const paymentsRes = await request(api)
      .delete(`/api/customers/${withPayments}`)
      .set('Cookie', authCookie);
    assert.equal(paymentsRes.status, 409);
    assert.equal(
      paymentsRes.body.error,
      'Cannot delete customer with cash-sales history'
    );

    // Unknown id -> 404.
    const missing = await request(api)
      .delete(`/api/customers/${randomUUID()}`)
      .set('Cookie', authCookie);
    assert.equal(missing.status, 404);
  }
);
