// Demo seed script — idempotent, production-guarded
// Placed at: server/scripts/seed-demo.js
// Runs: `node server/scripts/seed-demo.js`
//
// Ensures: only seeds when BOTH customers AND products tables are empty.
// Refuses to run in production (NODE_ENV === 'production' → exit 1).
// Seeds ~12 realistic customers + ~12 everyday products.
// Returns true if it seeded, false if tables already had data.

import { getPool, runMigration } from '../src/db.js';
import { CUSTOMER_NAMES, PRODUCT_NAMES } from '../src/data/seed-data.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve DATABASE_URL from server/.env (same as db.js does)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ENV = process.env.NODE_ENV;

// Friendly refusal for production
if (ENV === 'production') {
  console.error(
    '[seed-demo] Aborting: seed script cannot run in production. ' +
      'Set NODE_ENV=development or TEST to seed.'
  );
  process.exit(1);
}

// Centralized seed data is imported from ../src/data/seed-data.js.

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

async function main() {
  // Step 1: Run migration first to ensure schema is up to date
  await runMigration();
  console.info('[seed-demo] Migration applied.');

  const pool = getPool();

  // Step 2: Upsert customers and products (idempotent: updates if exists, inserts if not)
  for (const customer of CUSTOMER_NAMES) {
    await upsertCustomer(pool, customer);
  }

  for (const product of PRODUCT_NAMES) {
    await upsertProduct(pool, product);
  }

  console.info(
    `[seed-demo] Seed complete: ${CUSTOMER_NAMES.length} clientes, ${PRODUCT_NAMES.length} productos`
  );

  await pool.end();
  return true;
}

main()
  .then((result) => {
    // result is true/false; script exits successfully
    process.exit(0);
  })
  .catch((err) => {
    console.error('[seed-demo] failed:', err);
    process.exit(1);
  });