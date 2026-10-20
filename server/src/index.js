import { createApp } from './app.js';
import { getPool, runMigration } from './db.js';
import { ensureAdmin } from './seed.js';
import { getJwtSecret } from './auth.js';

// Centralized seed data (single source of truth).
import { CUSTOMER_NAMES, PRODUCT_NAMES } from './data/seed-data.js';

async function upsertCustomer(pool, { name, phone }) {
  const { rows } = await pool.query('SELECT id FROM customers WHERE name = $1', [name]);
  if (rows.length > 0) {
    if (phone) {
      await pool.query('UPDATE customers SET phone = $2 WHERE id = $1', [rows[0].id, phone]);
    }
    return rows[0].id;
  }
  const { rows: inserted } = phone
    ? await pool.query('INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING id', [name, phone])
    : await pool.query('INSERT INTO customers (name) VALUES ($1) RETURNING id', [name]);
  return inserted[0].id;
}

async function upsertProduct(pool, { name, price, quantity }) {
  const { rows } = await pool.query('SELECT id FROM products WHERE name = $1', [name]);
  if (rows.length > 0) {
    await pool.query(
      'UPDATE products SET price = $2, quantity = $3 WHERE id = $1',
      [rows[0].id, price, quantity]
    );
    return rows[0].id;
  }
  const { rows: inserted } = await pool.query(
    'INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3) RETURNING id',
    [name, price, quantity]
  );
  return inserted[0].id;
}

async function seedProductionData(pool) {
  console.log('[bootstrap] Seeding production data (clothing store)...');

  for (const customer of CUSTOMER_NAMES) {
    await upsertCustomer(pool, customer);
  }

  for (const product of PRODUCT_NAMES) {
    await upsertProduct(pool, product);
  }

  console.log(`[bootstrap] ✅ Seed completed: ${CUSTOMER_NAMES.length} clientes, ${PRODUCT_NAMES.length} productos`);
  return true;
}

const port = Number.parseInt(process.env.PORT ?? '3001', 10);

async function main() {
  // Auth secret policy: required in production (fail-fast), dev-only
  // fallback otherwise. Resolved before the server accepts any request.
  getJwtSecret();

  const pool = getPool();

  // Greenfield bootstrap: apply schema + seed admin + seed production data (all idempotent).
  // A database that is unreachable at boot does not take the service down:
  // /health then reports db:'down' so the keep-alive monitor can alert.
  try {
    await runMigration(pool);
    await ensureAdmin(pool);
    await seedProductionData(pool);
  } catch (err) {
    console.error('[api] bootstrap skipped (database unreachable?):', err.message);
  }

  const app = createApp({ pool });

  const server = app.listen(port, () => {
    console.log(`[api] listening on :${port}`);
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} — shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[api] failed to start:', err);
  process.exit(1);
});
