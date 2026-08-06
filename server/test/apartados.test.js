// Apartados route tests (tasks 4.1 + 4.2).
//
// Same two-layer structure as products.test.js:
//   * Auth-guard + input-validation tests need NO database (requireAuth and
//     validation run before any pool access).
//   * TXN semantics (stock decrement/restore, double-cancel 409, pay abonos,
//     overpayment rejection, paid flip) are DB-gated and skip gracefully when
//     no Postgres is reachable (TEST_DATABASE_URL / DATABASE_URL).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'apartados-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all apartados routes answer 401 without a session', async () => {
  const id = '00000000-0000-0000-0000-000000000000';
  const cases = [
    () => request(app).get('/api/apartados'),
    () => request(app).post('/api/apartados').send({}),
    () => request(app).post(`/api/apartados/${id}/cancel`),
    () => request(app).post(`/api/apartados/${id}/pay`).send({ amount: 10 }),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/apartados validates input before touching the database', async () => {
  const uuid = '00000000-0000-0000-0000-000000000000';
  const valid = {
    customerId: uuid,
    productId: uuid,
    units: 2,
    agreedPrice: 100,
    dueDate: '2026-12-31',
  };

  const missingCustomer = await AUTHED.post('/api/apartados').send({
    ...valid,
    customerId: 'nope',
  });
  assert.equal(missingCustomer.status, 400);
  assert.equal(missingCustomer.body.error, 'customerId must be a valid UUID');

  const badUnits = await AUTHED.post('/api/apartados').send({ ...valid, units: 0 });
  assert.equal(badUnits.status, 400);
  assert.equal(badUnits.body.error, 'units must be a positive integer');

  const badPrice = await AUTHED.post('/api/apartados').send({
    ...valid,
    agreedPrice: -5,
  });
  assert.equal(badPrice.status, 400);
  assert.equal(badPrice.body.error, 'agreedPrice must be a positive number');

  const badDueDate = await AUTHED.post('/api/apartados').send({
    ...valid,
    dueDate: '2026-13-40',
  });
  assert.equal(badDueDate.status, 400);
  assert.equal(badDueDate.body.error, 'dueDate must be a valid date (YYYY-MM-DD)');

  const missingDueDate = await AUTHED.post('/api/apartados').send({
    ...valid,
    dueDate: undefined,
  });
  assert.equal(missingDueDate.status, 400);
  assert.equal(missingDueDate.body.error, 'dueDate must be a valid date (YYYY-MM-DD)');
});

test('GET /api/apartados rejects an invalid status filter and non-UUID customerId', async () => {
  const badStatus = await AUTHED.get('/api/apartados?status=weird');
  assert.equal(badStatus.status, 400);
  assert.equal(badStatus.body.error, 'Invalid status: weird');

  const badCustomer = await AUTHED.get('/api/apartados?customerId=not-a-uuid');
  assert.equal(badCustomer.status, 400);
  assert.equal(badCustomer.body.error, 'customerId must be a valid UUID');
});

test('POST /api/apartados/:id/pay validates amount; non-UUID ids are 404', async () => {
  const id = '00000000-0000-0000-0000-000000000000';

  const zeroAmount = await AUTHED.post(`/api/apartados/${id}/pay`).send({ amount: 0 });
  assert.equal(zeroAmount.status, 400);
  assert.equal(zeroAmount.body.error, 'amount must be a positive number');

  const noAmount = await AUTHED.post(`/api/apartados/${id}/pay`).send({});
  assert.equal(noAmount.status, 400);

  const nonUuidPay = await AUTHED.post('/api/apartados/not-a-uuid/pay').send({ amount: 10 });
  assert.equal(nonUuidPay.status, 404);

  const nonUuidCancel = await AUTHED.post('/api/apartados/not-a-uuid/cancel');
  assert.equal(nonUuidCancel.status, 404);
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

async function createProduct(api, name, quantity = 0) {
  const res = await request(api)
    .post('/api/products')
    .set('Cookie', authCookie)
    .send({ name, price: 10, quantity });
  assert.equal(res.status, 201);
  return res.body.product.id;
}

async function insertCustomer(pool, id, name) {
  await pool.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [id, name]);
}

async function createApartado(api, { customerId, productId, units, agreedPrice, dueDate }) {
  const res = await request(api)
    .post('/api/apartados')
    .set('Cookie', authCookie)
    .send({ customerId, productId, units, agreedPrice, dueDate });
  assert.equal(res.status, 201);
  return res.body.apartado;
}

test(
  'POST /api/apartados decrements stock atomically and records a pending apartado',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('apartado-stock'), 5);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Apartado Customer');

    const apartado = await createApartado(api, {
      customerId,
      productId,
      units: 2,
      agreedPrice: 100,
      dueDate: '2026-12-31',
    });

    assert.equal(apartado.status, 'pending');
    assert.equal(apartado.units, 2);
    assert.equal(apartado.agreed_price, 100);
    assert.equal(apartado.paid_total, 0);
    assert.equal(apartado.remaining, 100);
    assert.equal(apartado.customer_name, 'Apartado Customer');

    const detail = await AUTHED.get(`/api/products/${productId}`);
    assert.equal(detail.body.product.quantity, 3, 'stock decremented by reserved units');
    assert.equal(detail.body.product.apartado_units, 2);
    assert.equal(detail.body.product.state, 'apartado');
  }
);

test(
  'POST /api/apartados rejects insufficient stock and leaves quantity untouched',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('short-stock'), 1);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Short Customer');

    const res = await request(api)
      .post('/api/apartados')
      .set('Cookie', authCookie)
      .send({ customerId, productId, units: 3, agreedPrice: 100, dueDate: '2026-12-31' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Insufficient stock for the requested units');

    const detail = await AUTHED.get(`/api/products/${productId}`);
    assert.equal(detail.body.product.quantity, 1, 'quantity unchanged after rejection');
    assert.equal(detail.body.product.apartado_units, 0);

    const list = await AUTHED.get(`/api/apartados?customerId=${customerId}`);
    assert.equal(list.body.apartados.length, 0, 'no apartado row persisted');
  }
);

test(
  'POST /api/apartados/:id/cancel restores stock; double cancel and paid cancel are 409',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('cancel-stock'), 5);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Cancel Customer');

    const apartado = await createApartado(api, {
      customerId,
      productId,
      units: 2,
      agreedPrice: 100,
      dueDate: '2026-12-31',
    });

    const cancel = await AUTHED.post(`/api/apartados/${apartado.id}/cancel`);
    assert.equal(cancel.status, 200);
    assert.equal(cancel.body.apartado.status, 'cancelled');

    const detail = await AUTHED.get(`/api/products/${productId}`);
    assert.equal(detail.body.product.quantity, 5, 'reserved units returned to stock');

    const again = await AUTHED.post(`/api/apartados/${apartado.id}/cancel`);
    assert.equal(again.status, 409);
    assert.equal(again.body.error, 'Only pending apartados can be cancelled');

    // Cancelling a PAID apartado is also a conflict (never restores sold units).
    const product2 = await createProduct(api, unique('paid-cancel'), 3);
    const apartado2 = await createApartado(api, {
      customerId,
      productId: product2,
      units: 1,
      agreedPrice: 50,
      dueDate: '2026-12-31',
    });
    const paidRes = await AUTHED.post(`/api/apartados/${apartado2.id}/pay`).send({ amount: 50 });
    assert.equal(paidRes.status, 200);
    assert.equal(paidRes.body.apartado.status, 'paid');

    const paidCancel = await AUTHED.post(`/api/apartados/${apartado2.id}/cancel`);
    assert.equal(paidCancel.status, 409);

    const stock2 = await AUTHED.get(`/api/products/${product2}`);
    assert.equal(stock2.body.product.quantity, 3, 'paid units never restored');
  }
);

test(
  'POST /api/apartados/:id/pay records abonos, rejects overpayment, flips at full price',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('pay-stock'), 5);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Pay Customer');
    const apartado = await createApartado(api, {
      customerId,
      productId,
      units: 2,
      agreedPrice: 100,
      dueDate: '2026-12-31',
    });

    // Partial abono: stays pending, cumulative tracked, NO stock change.
    const partial = await AUTHED.post(`/api/apartados/${apartado.id}/pay`).send({ amount: 40 });
    assert.equal(partial.status, 200);
    assert.equal(partial.body.apartado.status, 'pending');
    assert.equal(partial.body.apartado.paid_total, 40);
    assert.equal(partial.body.apartado.remaining, 60);

    const stockAfterPartial = await AUTHED.get(`/api/products/${productId}`);
    assert.equal(stockAfterPartial.body.product.quantity, 3, 'paying does not restore stock');

    // Overpayment rejected (40 + 70 > 100): 400, nothing recorded.
    const over = await AUTHED.post(`/api/apartados/${apartado.id}/pay`).send({ amount: 70 });
    assert.equal(over.status, 400);
    assert.equal(over.body.error, 'Payment exceeds the remaining balance of the apartado');

    // Second abono to exactly the agreed price flips to paid.
    const full = await AUTHED.post(`/api/apartados/${apartado.id}/pay`).send({ amount: 60 });
    assert.equal(full.status, 200);
    assert.equal(full.body.apartado.status, 'paid');
    assert.equal(full.body.apartado.paid_total, 100);
    assert.equal(full.body.apartado.remaining, 0);

    // Paying a paid apartado is a conflict.
    const paidPay = await AUTHED.post(`/api/apartados/${apartado.id}/pay`).send({ amount: 5 });
    assert.equal(paidPay.status, 409);
    assert.equal(paidPay.body.error, 'Only pending apartados can receive payments');

    // Stock still unchanged after full payment (units are sold).
    const stockAfterFull = await AUTHED.get(`/api/products/${productId}`);
    assert.equal(stockAfterFull.body.product.quantity, 3);
  }
);

test(
  'GET /api/apartados filters by status and customerId and exposes paid totals',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const productId = await createProduct(api, unique('list-stock'), 10);
    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'List Customer');

    const a1 = await createApartado(api, {
      customerId,
      productId,
      units: 1,
      agreedPrice: 100,
      dueDate: '2026-12-31',
    });
    await createApartado(api, {
      customerId,
      productId,
      units: 1,
      agreedPrice: 50,
      dueDate: '2026-12-31',
    });

    // Pay a1 fully so the two apartados end up in different statuses.
    await AUTHED.post(`/api/apartados/${a1.id}/pay`).send({ amount: 100 });

    const byCustomer = await AUTHED.get(`/api/apartados?customerId=${customerId}`);
    assert.equal(byCustomer.status, 200);
    assert.equal(byCustomer.body.apartados.length, 2);

    const paidOnly = await AUTHED.get(`/api/apartados?status=paid&customerId=${customerId}`);
    assert.equal(paidOnly.status, 200);
    assert.equal(paidOnly.body.apartados.length, 1);
    assert.equal(paidOnly.body.apartados[0].id, a1.id);
    assert.equal(paidOnly.body.apartados[0].paid_total, 100);
    assert.equal(paidOnly.body.apartados[0].remaining, 0);

    const pendingOnly = await AUTHED.get(`/api/apartados?status=pending&customerId=${customerId}`);
    assert.equal(pendingOnly.body.apartados.length, 1);
    assert.equal(pendingOnly.body.apartados[0].remaining, 50);
  }
);
