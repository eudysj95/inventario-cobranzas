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

// Realistic clothing store customer names (some with phone, some without)
const customerNames = [
  { name: 'María Fernanda González', phone: '+54 9 11 1234 5678' },
  { name: 'Carlos Andrés Martínez', phone: '+54 9 11 8765 4321' },
  { name: 'Laura Beatriz Silva', phone: null },
  { name: 'Roberto Carlos Fernández', phone: '+54 9 11 5555 7777' },
  { name: 'Sofía Valentina Rodríguez', phone: null },
  { name: 'Diego Armando Torres', phone: '+54 9 11 3333 4444' },
  { name: 'Camila Andrea Herrera', phone: null },
  { name: 'Julián Esteban Gómez', phone: '+54 9 11 2222 1111' },
  { name: 'Valentina Lucía Díaz', phone: null },
  { name: 'Facundo Nicolás Pérez', phone: '+54 9 11 6666 8888' },
  { name: 'Lucía Celeste Martínez', phone: null },
  { name: 'Nicolás Andrés Sánchez', phone: '+54 9 11 9999 0000' },
];

// Clothing store products (name, price in cents, quantity)
const productNames = [
  { name: 'Remera Básica Algodón Blanca', price: 8900, quantity: 50 },
  { name: 'Remera Básica Algodón Negra', price: 8900, quantity: 45 },
  { name: 'Jean Slim Fit Hombre Azul', price: 24900, quantity: 30 },
  { name: 'Jean Skinny Mujer Negro', price: 22900, quantity: 35 },
  { name: 'Buzo Canguro Algodón Gris', price: 18900, quantity: 25 },
  { name: 'Buzo Canguro Algodón Negro', price: 18900, quantity: 20 },
  { name: 'Camisa Oxford Manga Larga Blanca', price: 15900, quantity: 20 },
  { name: 'Camisa Oxford Manga Larga Celeste', price: 15900, quantity: 15 },
  { name: 'Vestido Midi Floral Verano', price: 19900, quantity: 18 },
  { name: 'Vestido Largo Negro Elegante', price: 22900, quantity: 12 },
  { name: 'Zapatillas Urbanas Blancas', price: 34900, quantity: 22 },
  { name: 'Zapatillas Urbanas Negras', price: 34900, quantity: 20 },
  { name: 'Campera Rompevientos Negra', price: 28900, quantity: 15 },
  { name: 'Campera Denim Clásica', price: 32900, quantity: 10 },
  { name: 'Short Deportivo Gris', price: 9900, quantity: 30 },
  { name: 'Short Denim Azul Claro', price: 11900, quantity: 25 },
  { name: 'Medias Deportivas Pack x3', price: 2900, quantity: 100 },
  { name: 'Gorra Trucker Negra', price: 6900, quantity: 40 },
  { name: 'Cinturón Cuero Marrón', price: 9900, quantity: 25 },
  { name: 'Bufanda Lana Beige', price: 7900, quantity: 18 },
];

async function seedCustomers(pool) {
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