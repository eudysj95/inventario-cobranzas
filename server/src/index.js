import { createApp } from './app.js';
import { getPool, runMigration } from './db.js';
import { ensureAdmin } from './seed.js';
import { getJwtSecret } from './auth.js';

// Production seed data (same as scripts/seed-production.js)
const CUSTOMER_NAMES = [
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

const PRODUCT_NAMES = [
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

async function seedProductionData(pool) {
  const { rows: customerCount } = await pool.query('SELECT COUNT(*) AS cnt FROM customers');
  const { rows: productCount } = await pool.query('SELECT COUNT(*) AS cnt FROM products');

  const customersEmpty = customerCount[0].cnt === '0';
  const productsEmpty = productCount[0].cnt === '0';

  if (!customersEmpty || !productsEmpty) {
    console.info(`[bootstrap] Tables already have data — customers: ${customerCount[0].cnt}, products: ${productCount[0].cnt}. Skipping seed.`);
    return false;
  }

  console.log('[bootstrap] Seeding production data (clothing store)...');

  for (const { name, phone } of CUSTOMER_NAMES) {
    if (phone) {
      await pool.query('INSERT INTO customers (name, phone) VALUES ($1, $2)', [name, phone]);
    } else {
      await pool.query('INSERT INTO customers (name) VALUES ($1)', [name]);
    }
  }

  for (const { name, price, quantity } of PRODUCT_NAMES) {
    await pool.query('INSERT INTO products (name, price, quantity) VALUES ($1, $2, $3)', [name, price, quantity]);
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
