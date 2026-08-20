// Demo seed script — idempotent, production-guarded
// Placed at: server/scripts/seed-demo.js
// Runs: `node server/scripts/seed-demo.js`
//
// Ensures: only seeds when BOTH customers AND products tables are empty.
// Refuses to run in production (NODE_ENV === 'production' → exit 1).
// Seeds ~12 realistic customers + ~12 everyday products.
// Returns true if it seeded, false if tables already had data.

import { getPool, runMigration } from '../src/db.js';
import dotenv from 'dotenv';
import path from 'node:path';

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

// Realistic customer names (some with phone, some without)
const customerNames = [
  { name: 'Ana María', phone: '+54 9 11 1234 5678' },
  { name: 'Carlos Rodríguez', phone: '+54 9 11 8765 4321' },
  { name: 'María González', phone: null },
  { name: 'José Pérez', phone: '+54 9 11 5555 7777' },
  { name: 'Laura Sánchez', phone: null },
  { name: 'Roberto Fernández', phone: '+54 9 11 3333 4444' },
  { name: 'Sofía Díaz', phone: null },
  { name: 'Miguel Torres', phone: '+54 9 11 2222 1111' },
  { name: 'Valentina Martínez', phone: null },
  { name: 'Facu Gómez', phone: '+54 9 11 6666 8888' },
  { name: 'Camila Herrera', phone: null },
  { name: 'Luísa Almeida', phone: '+54 9 11 9999 0000' },
];

// Everyday products
const productNames = [
  { name: 'arroz', price: 120, quantity: 50 },
  { name: 'aceite', price: 250, quantity: 30 },
  { name: 'leche', price: 85, quantity: 100 },
  { name: 'huevos', price: 70, quantity: 80 },
  { name: 'yerba', price: 150, quantity: 40 },
  { name: 'jabón', price: 65, quantity: 60 },
  { name: 'detergente', price: 95, quantity: 45 },
  { name: 'azúcar', price: 45, quantity: 100 },
  { name: 'fideos', price: 90, quantity: 70 },
  { name: 'sal', price: 20, quantity: 120 },
  { name: 'tomate', price: 110, quantity: 35 },
  { name: 'azúcar', price: 48, quantity: 95 }, // second entry for 'azúcar' (different brand/variant)
];

async function seedCustomers(pool) {
  const rows = [];
  for (const { name, phone } of customerNames) {
    if (phone) {
      await pool.query(
        'INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING id, name, phone',
        [name, phone]
      );
    } else {
      await pool.query(
        'INSERT INTO customers (name) VALUES ($1) RETURNING id, name, phone',
        [name]
      );
    }
  }
  return true;
}

async function seedProducts(pool) {
  for (const { name, price, quantity } of productNames) {
    await pool.query(
      'INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3) RETURNING id, name, price, quantity',
      [name, price, quantity]
    );
  }
  return true;
}

async function main() {
  // Step 1: Run migration first to ensure schema is up to date
  await runMigration();
  console.info('[seed-demo] Migration applied.');

  const pool = getPool();

  // Step 2: Check if both tables are empty
  const { rows: customerCount } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM customers'
  );
  const { rows: productCount } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM products'
  );

  const customersEmpty = customerCount[0].cnt === 0;
  const productsEmpty = productCount[0].cnt === 0;

  if (!customersEmpty || !productsEmpty) {
    console.info(
      `[seed-demo] Tables already have data — customers: ${customerCount[0].cnt}, products: ${productCount[0].cnt}. ` +
        'No seed needed. Returning false.'
    );
    await pool.end();
    return false; // No need to seed
  }

  // Step 3: Seed customers and products
  await seedCustomers(pool);
  await seedProducts(pool);

  console.info(
    `[seed-demo] Seed realistic seeded: ${customerNames.length} clientes, ` +
      `${productNames.length} productos`
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