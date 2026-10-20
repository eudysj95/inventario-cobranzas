// cleanup-and-reseed.js
// Borra productos viejos (no en la lista de ropa) y resiembra los 22 productos de ropa.
// Lee DATABASE_URL de server/.env (dotenv).
// Uso: node server/scripts/cleanup-and-reseed.js

import { getPool } from '../src/db.js';
import { CUSTOMER_NAMES, PRODUCT_NAMES } from '../src/data/seed-data.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

dotenv.config({ path: path.join(__dirname, '.env') });

const KEEP_NAMES = PRODUCT_NAMES.map((p) => p.name);

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
  const pool = getPool();

  // 1. Listar productos que se van a borrar (los que NO están en la lista de ropa)
  const { rows: toDelete } = await pool.query(
    `SELECT id, name, price, quantity FROM products WHERE name <> ALL($1::text[])`,
    [KEEP_NAMES]
  );

  if (toDelete.length === 0) {
    console.info('[cleanup] No hay productos viejos que borrar. Nada que hacer.');
    await pool.end();
    return;
  }

  console.info(`[cleanup] Se borrarán ${toDelete} producto(s) viejo(s):`);
  toDelete.forEach((r) => console.info(`  - ${r.name} (id: ${r.id}, precio: ${r.price}, stock: ${r.quantity})`));

  const deleteIds = toDelete.map((r) => r.id);

  // 2. Borrar dependencias en orden (FK RESTRICT)
  await pool.query('DELETE FROM product_variants WHERE product_id = ANY($1::uuid[])', [deleteIds]);
  await pool.query('DELETE FROM apartados WHERE product_id = ANY($1::uuid[])', [deleteIds]);
  await pool.query('DELETE FROM customer_debts WHERE product_id = ANY($1::uuid[])', [deleteIds]);
  await pool.query('DELETE FROM cash_sales WHERE product_id = ANY($1::uuid[])', [deleteIds]);

  // 3. Borrar los productos viejos
  await pool.query('DELETE FROM products WHERE id = ANY($1::uuid[])', [deleteIds]);
  console.info(`[cleanup] Borrados ${deleteIds.length} producto(s) viejo(s) y sus dependencias.`);

  // 4. Reseed: upsert de los 22 productos de ropa + 12 clientes
  console.info('[cleanup] Reseeding productos de ropa y clientes...');
  for (const customer of CUSTOMER_NAMES) {
    await upsertCustomer(pool, customer);
  }
  for (const product of PRODUCT_NAMES) {
    await upsertProduct(pool, product);
  }

  console.info(
    `[cleanup] ✅ Listo: ${CUSTOMER_NAMES.length} clientes, ${PRODUCT_NAMES.length} productos de ropa.`
  );

  await pool.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[cleanup] Error:', err.message);
    process.exit(1);
  });
