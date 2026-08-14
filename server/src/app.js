import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import configRouter from './routes/config.js';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import apartadosRouter from './routes/apartados.js';
import creditSalesRouter from './routes/credit-sales.js';
import paymentsRouter from './routes/payments.js';
import collectionsRouter from './routes/collections.js';
import suppliersRouter from './routes/suppliers.js';
import supplierDebtsRouter from './routes/supplier-debts.js';

/**
 * Build the Express app. The pool is injected so tests can supply their own
 * (e.g. one pointed at a test database) and /health can probe it.
 *
 * Business routes apply the requireAuth guard from src/auth.js inside each
 * router, so every /api business endpoint answers 401 without a session
 * (spec: all business operations require an authenticated session).
 */
export function createApp({ pool } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // Keep-alive probe, no auth.
  app.use('/health', healthRouter(pool));

  // Session management: login/logout/me.
  app.use('/api/auth', authRouter(pool));

  // Public instance branding (no auth, no DB): business name, currency and
  // optional WhatsApp contact — the SPA renders these instead of hardcoding
  // them (design: GET /api/config, Option B multi-instance).
  app.use('/api/config', configRouter());

  // Core catalog routes (auth-guarded inside the routers).
  app.use('/api/products', productsRouter(pool));
  app.use('/api/customers', customersRouter(pool));

  // Sales & payments routes (auth-guarded inside the routers).
  app.use('/api/apartados', apartadosRouter(pool));
  app.use('/api/credit-sales', creditSalesRouter(pool));
  app.use('/api/payments', paymentsRouter(pool));
  app.use('/api/collections', collectionsRouter(pool));

  // Supplier debt registry routes (auth-guarded inside the routers).
  app.use('/api/suppliers', suppliersRouter(pool));
  app.use('/api/supplier-debts', supplierDebtsRouter(pool));

  // JSON 404 for unknown API routes (keeps the SPA fallback for / untouched).
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Production single-service model: one Render service runs the API and
  // serves the built SPA from the same origin, so no CORS is needed. The API
  // routers and the /api 404 above stay mounted first so /api/* always gets
  // JSON; everything else falls through to the static build below.
  const clientDistPath = fileURLToPath(new URL('../../client/dist', import.meta.url));
  if (existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // SPA fallback: any remaining GET outside /api serves index.html so
    // client-side routes (/inventory, ...) work on reload. Always after
    // express.static so real assets are never shadowed.
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    console.warn('[api] client/dist not found — SPA not served (run npm run build --workspace client)');
  }

  return app;
}
