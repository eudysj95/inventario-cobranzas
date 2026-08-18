// Products route tests (task 3.1).
//
// Two layers, mirroring test/auth-routes.test.js:
//   * Auth-guard + input-validation tests need NO database (requireAuth and
//     validation run before any pool access) — they run against an app wired
//     to a null pool.
//   * Everything touching rows (create/list/detail/patch/delete semantics,
//     TXN guards) is DB-gated and skips gracefully when no Postgres is
//     reachable (TEST_DATABASE_URL / DATABASE_URL).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'products-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
  patch: (url) => request(app).patch(url).set('Cookie', authCookie),
  delete: (url) => request(app).delete(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all products routes answer 401 without a session', async () => {
  const id = '00000000-0000-0000-0000-000000000000';
  const cases = [
    () => request(app).get('/api/products'),
    () => request(app).post('/api/products').send({ name: 'x' }),
    () => request(app).get(`/api/products/${id}`),
    () => request(app).patch(`/api/products/${id}`).send({ name: 'x' }),
    () => request(app).delete(`/api/products/${id}`),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/products validates input before touching the database', async () => {
  const noName = await AUTHED.post('/api/products').send({ price: 5, quantity: 3 });
  assert.equal(noName.status, 400);
  assert.equal(noName.body.error, 'Product name is required');

  const badPrice = await AUTHED.post('/api/products').send({ name: 'X', price: -1 });
  assert.equal(badPrice.status, 400);
  assert.equal(badPrice.body.error, 'Price must be a non-negative number');

  const badQuantity = await AUTHED.post('/api/products').send({ name: 'X', quantity: 1.5 });
  assert.equal(badQuantity.status, 400);
  assert.equal(badQuantity.body.error, 'Quantity must be a non-negative integer');

  const badDescription = await AUTHED.post('/api/products').send({ name: 'X', description: 42 });
  assert.equal(badDescription.status, 400);
});

test('GET /api/products rejects an unknown state filter', async () => {
  const res = await AUTHED.get('/api/products?state=weird');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid state: weird');
});

test('PATCH /api/products validates fields and the quantity adjustment type', async () => {
  const id = '00000000-0000-0000-0000-000000000000';

  const badAdjustment = await AUTHED.patch(`/api/products/${id}`).send({ quantity: 1.5 });
  assert.equal(badAdjustment.status, 400);
  assert.equal(badAdjustment.body.error, 'Quantity adjustment must be an integer');

  const noFields = await AUTHED.patch(`/api/products/${id}`).send({});
  assert.equal(noFields.status, 400);
  assert.equal(noFields.body.error, 'No fields to update');

  const blankName = await AUTHED.patch(`/api/products/${id}`).send({ name: '  ' });
  assert.equal(blankName.status, 400);

  const negativePrice = await AUTHED.patch(`/api/products/${id}`).send({ price: -2 });
  assert.equal(negativePrice.status, 400);
});

test('non-UUID product :id is answered 404 without touching the database', async () => {
  const res = await AUTHED.get('/api/products/not-a-uuid');
  assert.equal(res.status, 404);
  const del = await AUTHED.delete('/api/products/not-a-uuid');
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

/** Create a product through the API and return its id. */
async function createProduct(api, name, quantity = 0) {
  const res = await request(api)
    .post('/api/products')
    .set('Cookie', authCookie)
    .send({ name, price: 10, quantity });
  assert.equal(res.status, 201);
  return res.body.product.id;
}

/** Insert a customer row directly so tests can reference it in records. */
async function insertCustomer(pool, id, name) {
  await pool.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [
    id,
    name,
  ]);
}

test(
  'POST /api/products creates a product with derived state available',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const res = await request(api)
      .post('/api/products')
      .set('Cookie', authCookie)
      .send({ name: unique('widget'), description: 'A widget', price: 10.5, quantity: 10 });

    assert.equal(res.status, 201);
    const p = res.body.product;
    assert.equal(p.state, 'available');
    assert.equal(p.quantity, 10);
    assert.equal(p.available_units, 10);
    assert.equal(p.apartado_units, 0);
    assert.equal(p.credit_units, 0);
    assert.equal(p.sold_units, 0);
    assert.equal(p.total_units, 10);
    assert.equal(p.open_apartado_count, 0);
    assert.equal(p.open_debt_count, 0);
    assert.equal(p.price, 10.5, 'money is exposed as a JSON number');
  }
);

test(
  'POST /api/products with quantity 0 derives state sold',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const res = await request(api)
      .post('/api/products')
      .set('Cookie', authCookie)
      .send({ name: unique('zero-stock'), quantity: 0 });

    assert.equal(res.status, 201);
    assert.equal(res.body.product.state, 'sold');
    assert.equal(res.body.product.quantity, 0);
  }
);

test(
  'GET /api/products filters by search and derived state',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    // Unique token scopes every assertion to this run's rows: the shared
    // test database accumulates leftovers across runs, so absolute counts
    // over the whole table would be flaky.
    const token = randomUUID().slice(0, 8);
    const alpha = `Alpha Widget ${token}`;
    const beta = `Beta Gadget ${token}`;
    await createProduct(api, alpha, 5);
    await createProduct(api, beta, 0);

    const both = await request(api)
      .get(`/api/products?search=${token}`)
      .set('Cookie', authCookie);
    assert.equal(both.status, 200);
    assert.equal(both.body.products.length, 2);
    const alphaRow = both.body.products.find((p) => p.name === alpha);
    const betaRow = both.body.products.find((p) => p.name === beta);
    assert.equal(alphaRow.state, 'available');
    assert.equal(betaRow.state, 'sold');

    const sold = await request(api)
      .get(`/api/products?search=${token}&state=sold`)
      .set('Cookie', authCookie);
    assert.equal(sold.status, 200);
    assert.equal(sold.body.products.length, 1);
    assert.equal(sold.body.products[0].name, beta);

    const none = await request(api)
      .get(`/api/products?search=${token}zzz`)
      .set('Cookie', authCookie);
    assert.equal(none.status, 200);
    assert.equal(none.body.products.length, 0);
  }
);

test(
  'PATCH /api/products restocks with a positive adjustment and never goes negative',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const id = await createProduct(api, unique('patchable'), 3);

    // Restock: signed positive adjustment adds units.
    const restock = await request(api)
      .patch(`/api/products/${id}`)
      .set('Cookie', authCookie)
      .send({ quantity: 5 });
    assert.equal(restock.status, 200);
    assert.equal(restock.body.product.quantity, 8);
    assert.equal(restock.body.product.state, 'available');

    // Removal beyond available stock is rejected and stock is unchanged.
    const tooMuch = await request(api)
      .patch(`/api/products/${id}`)
      .set('Cookie', authCookie)
      .send({ quantity: -9 });
    assert.equal(tooMuch.status, 400);
    assert.equal(tooMuch.body.error, 'Insufficient stock — quantity cannot go below 0');

    const after = await request(api)
      .get(`/api/products/${id}`)
      .set('Cookie', authCookie);
    assert.equal(after.body.product.quantity, 8, 'quantity unchanged after rejection');

    // Field-only patch leaves quantity untouched.
    const rename = await request(api)
      .patch(`/api/products/${id}`)
      .set('Cookie', authCookie)
      .send({ name: unique('renamed') });
    assert.equal(rename.status, 200);
    assert.equal(rename.body.product.quantity, 8);
    assert.match(rename.body.product.name, /renamed/);

    // Exact removal is allowed and flips the derived state to sold.
    const zero = await request(api)
      .patch(`/api/products/${id}`)
      .set('Cookie', authCookie)
      .send({ quantity: -8 });
    assert.equal(zero.status, 200);
    assert.equal(zero.body.product.quantity, 0);
    assert.equal(zero.body.product.state, 'sold');
  }
);

test(
  'GET /api/products/:id returns open apartados and open debts',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('detailed'), 5);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Detail Customer');

    // Directly seed one pending apartado and one open credit debt.
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, status)
       VALUES ($1, $2, $3, 2, 100, 'pending')`,
      [randomUUID(), customerId, productId]
    );
    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 1, 50, 50, 'open')`,
      [randomUUID(), customerId, productId, randomUUID()]
    );

    const res = await request(api)
      .get(`/api/products/${productId}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    const { product, open_apartados, open_debts } = res.body;

    assert.equal(product.apartado_units, 2);
    assert.equal(product.credit_units, 1);
    assert.equal(product.available_units, 5, 'stock already excludes reserved units');
    assert.equal(product.state, 'apartado', 'apartado takes precedence over credit');
    assert.equal(product.open_apartado_count, 1);
    assert.equal(product.open_debt_count, 1);

    assert.equal(open_apartados.length, 1);
    assert.equal(open_apartados[0].units, 2);
    assert.equal(open_apartados[0].agreed_price, 100);
    assert.equal(open_apartados[0].customer_name, 'Detail Customer');

    assert.equal(open_debts.length, 1);
    assert.equal(open_debts[0].units, 1);
    assert.equal(open_debts[0].balance, 50);
    assert.equal(open_debts[0].customer_name, 'Detail Customer');
  }
);

test(
  'DELETE /api/products enforces quantity and open-record guards',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Delete Customer');

    // qty > 0 -> rejected.
    const withStock = await createProduct(api, unique('with-stock'), 3);
    const stockRes = await request(api)
      .delete(`/api/products/${withStock}`)
      .set('Cookie', authCookie);
    assert.equal(stockRes.status, 409);
    assert.equal(stockRes.body.error, 'Cannot delete a product with stock remaining');

    // qty = 0, no records -> deleted.
    const clean = await createProduct(api, unique('clean-delete'), 0);
    const cleanRes = await request(api)
      .delete(`/api/products/${clean}`)
      .set('Cookie', authCookie);
    assert.equal(cleanRes.status, 200);
    assert.deepEqual(cleanRes.body, { ok: true });
    const gone = await request(api)
      .get(`/api/products/${clean}`)
      .set('Cookie', authCookie);
    assert.equal(gone.status, 404);

    // qty = 0 with a pending apartado -> rejected (open records).
    const openApartado = await createProduct(api, unique('open-apartado'), 0);
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, status)
       VALUES ($1, $2, $3, 1, 25, 'pending')`,
      [randomUUID(), customerId, openApartado]
    );
    const apartadoRes = await request(api)
      .delete(`/api/products/${openApartado}`)
      .set('Cookie', authCookie);
    assert.equal(apartadoRes.status, 409);
    assert.equal(apartadoRes.body.error, 'Cannot delete a product with open apartados or debts');

    // qty = 0 with an open credit debt -> rejected (open records).
    const openDebt = await createProduct(api, unique('open-debt'), 0);
    await pool.query(
      `INSERT INTO customer_debts (id, customer_id, product_id, sale_id, units, amount, balance, status)
       VALUES ($1, $2, $3, $4, 1, 30, 30, 'open')`,
      [randomUUID(), customerId, openDebt, randomUUID()]
    );
    const debtRes = await request(api)
      .delete(`/api/products/${openDebt}`)
      .set('Cookie', authCookie);
    assert.equal(debtRes.status, 409);

    // qty = 0 with only PAID apartados -> FK RESTRICT translates to 409.
    const sold = await createProduct(api, unique('sold-history'), 0);
    await pool.query(
      `INSERT INTO apartados (id, customer_id, product_id, units, agreed_price, status)
       VALUES ($1, $2, $3, 1, 20, 'paid')`,
      [randomUUID(), customerId, sold]
    );
    const soldRes = await request(api)
      .delete(`/api/products/${sold}`)
      .set('Cookie', authCookie);
    assert.equal(soldRes.status, 409);
    assert.equal(soldRes.body.error, 'Cannot delete a product with sales history');

    // Unknown id -> 404.
    const missing = await request(api)
      .delete(`/api/products/${randomUUID()}`)
      .set('Cookie', authCookie);
    assert.equal(missing.status, 404);
  }
);
