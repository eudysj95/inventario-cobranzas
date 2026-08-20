// Cash-sales route tests (task 4.4).
//
// Two layers, mirroring credit-sales.test.js:
//   * Auth-guard + input-validation tests need NO database.
//   * TXN semantics (per-line stock decrement, shared sale_id, atomic
//     rollback when any line is short) are DB-gated and skip gracefully
//     when no Postgres is reachable.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'cash-sales-test-secret';

const app = createApp({ pool: null });
const authCookie = `token=${signToken({ id: 'u1', username: 'admin' })}`;

const AUTHED = {
  get: (url) => request(app).get(url).set('Cookie', authCookie),
  post: (url) => request(app).post(url).set('Cookie', authCookie),
};

// --- Auth guard (no database required) ------------------------------------

test('all cash-sales routes answer 401 without a session', async () => {
  const id = '00000000-0000-0000-0000-000000000000';
  const cases = [
    () => request(app).post('/api/cash-sales').send({}),
    () => request(app).get(`/api/cash-sales/${id}`),
  ];
  for (const make of cases) {
    const res = await make();
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
  }
});

// --- Input validation (no database required) ------------------------------

test('POST /api/cash-sales validates input before touching the database', async () => {
  const uuid = '00000000-0000-0000-0000-000000000000';
  const valid = { customerId: uuid, lines: [{ productId: uuid, units: 1 }] };

  const badCustomer = await AUTHED.post('/api/cash-sales').send({
    ...valid,
    customerId: 'not-a-uuid',
  });
  assert.equal(badCustomer.status, 400);
  assert.equal(badCustomer.body.error, 'customerId must be a valid UUID');

  const noLines = await AUTHED.post('/api/cash-sales').send({ customerId: uuid });
  assert.equal(noLines.status, 400);
  assert.equal(noLines.body.error, 'lines must be a non-empty array');

  const emptyLines = await AUTHED.post('/api/cash-sales').send({
    customerId: uuid,
    lines: [],
  });
  assert.equal(emptyLines.status, 400);

  const badUnits = await AUTHED.post('/api/cash-sales').send({
    customerId: uuid,
    lines: [{ productId: uuid, units: 0 }],
  });
  assert.equal(badUnits.status, 400);
  assert.equal(badUnits.body.error, 'lines[0].units must be a positive integer');

  const badPrice = await AUTHED.post('/api/cash-sales').send({
    customerId: uuid,
    lines: [{ productId: uuid, units: 1, price: -1 }],
  });
  assert.equal(badPrice.status, 400);
  assert.equal(badPrice.body.error, 'lines[0].price must be a non-negative number');
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

async function createProduct(api, name, price, quantity = 0) {
  const res = await request(api)
    .post('/api/products')
    .set('Cookie', authCookie)
    .send({ name, price, quantity });
  assert.equal(res.status, 201);
  return res.body.product.id;
}

async function insertCustomer(pool, id, name) {
  await pool.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [id, name]);
}

test(
  'POST /api/cash-sales decrements stock per line and groups lines by sale_id',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Cash Customer');
    const p1 = await createProduct(api, unique('cs-product-a'), 10, 5);
    const p2 = await createProduct(api, unique('cs-product-b'), 20, 4);

    const res = await request(api)
      .post('/api/cash-sales')
      .set('Cookie', authCookie)
      .send({
        customerId,
        lines: [
          { productId: p1, units: 2 },
          { productId: p2, units: 1, price: 25 },
        ],
      });

    assert.equal(res.status, 201);
    const sale = res.body.sale;
    assert.equal(sale.customer_id, customerId);
    assert.equal(sale.customer_name, 'Cash Customer');
    assert.equal(sale.lines.length, 2);
    assert.equal(sale.total, 45, 'catalog price 10*2 + explicit line price 25*1');

    // Find each line by product instead of relying on array position.
    const lineByProduct = Object.fromEntries(
      sale.lines.map((l) => [l.product_id, l])
    );
    const line1 = lineByProduct[p1];
    const line2 = lineByProduct[p2];
    assert.equal(line1.amount, 20, 'catalog price applied when price omitted');
    assert.equal(line2.amount, 25, 'explicit line price used');

    const d1 = await request(api)
      .get(`/api/products/${p1}`)
      .set('Cookie', authCookie);
    assert.equal(d1.body.product.quantity, 3, 'line 1 units decremented');
    assert.equal(d1.body.product.sold_units, 2, 'sold_units includes cash units');

    const d2 = await request(api)
      .get(`/api/products/${p2}`)
      .set('Cookie', authCookie);
    assert.equal(d2.body.product.quantity, 3, 'line 2 units decremented');
    assert.equal(d2.body.product.sold_units, 1, 'sold_units includes cash units');
  }
);

test(
  'POST /api/cash-sales rolls back everything when any line has insufficient stock',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Atomic Customer');
    const okProduct = await createProduct(api, unique('atomic-ok'), 10, 5);
    const shortProduct = await createProduct(api, unique('atomic-short'), 10, 1);

    const res = await request(api)
      .post('/api/cash-sales')
      .set('Cookie', authCookie)
      .send({
        customerId,
        lines: [
          { productId: okProduct, units: 2 },
          { productId: shortProduct, units: 3 },
        ],
      });

    assert.equal(res.status, 400);
    assert.equal(
      res.body.error,
      'Insufficient stock for one or more lines — nothing was recorded'
    );

    // Atomicity: the OK line's stock decrement was rolled back too.
    const d1 = await request(api)
      .get(`/api/products/${okProduct}`)
      .set('Cookie', authCookie);
    assert.equal(d1.body.product.quantity, 5, 'first line decrement rolled back');

    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM cash_sales WHERE customer_id = $1',
      [customerId]
    );
    assert.equal(rows[0].n, 0, 'no cash_sales rows persisted');
  }
);

test(
  'POST /api/cash-sales with unknown customerId returns 404',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const p1 = await createProduct(api, unique('unknown-cust-prod'), 10, 5);

    const res = await request(api)
      .post('/api/cash-sales')
      .set('Cookie', authCookie)
      .send({
        customerId: '00000000-0000-0000-0000-000000000000',
        lines: [{ productId: p1, units: 1 }],
      });

    assert.equal(res.status, 404);
  }
);

test(
  'GET /api/cash-sales/:saleId returns the sale with its lines; unknown id is 404',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Detail Cash');
    const p1 = await createProduct(api, unique('detail-cs'), 15, 3);

    const created = await request(api)
      .post('/api/cash-sales')
      .set('Cookie', authCookie)
      .send({ customerId, lines: [{ productId: p1, units: 1 }] });
    assert.equal(created.status, 201);

    const res = await request(api)
      .get(`/api/cash-sales/${created.body.sale.id}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.sale.lines.length, 1);
    assert.equal(res.body.sale.lines[0].amount, 15);
    assert.equal(res.body.sale.total, 15);
    assert.equal(res.body.sale.customer_name, 'Detail Cash');

    const missing = await request(api)
      .get(`/api/cash-sales/${randomUUID()}`)
      .set('Cookie', authCookie);
    assert.equal(missing.status, 404);
  }
);

test(
  'DELETE /api/customers/:id with cash history returns 409 has-history',
  { skip: SKIP },
  async () => {
    const pool = dbContext();
    await runMigration(pool);
    const api = testApp(pool);

    const customerId = randomUUID();
    await insertCustomer(pool, customerId, 'Customer with cash history');
    const p1 = await createProduct(api, unique('del-cust-prod'), 10, 5);

    const created = await request(api)
      .post('/api/cash-sales')
      .set('Cookie', authCookie)
      .send({ customerId, lines: [{ productId: p1, units: 2 }] });
    assert.equal(created.status, 201);

    const res = await request(api)
      .delete(`/api/customers/${customerId}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Cannot delete customer with cash-sales history');
  }
);