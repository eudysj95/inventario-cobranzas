import express from 'express';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';

/**
 * Build the Express app. The pool is injected so tests can supply their own
 * (e.g. one pointed at a test database) and /health can probe it.
 *
 * Business routes (/api/products, /api/apartados, ...) are mounted in later
 * slices; /health and /api/auth are the current surface.
 */
export function createApp({ pool } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // Keep-alive probe, no auth.
  app.use('/health', healthRouter(pool));

  // Session management: login/logout/me. Business routes mounted in later
  // slices will apply the requireAuth guard from src/auth.js.
  app.use('/api/auth', authRouter(pool));

  // JSON 404 for unknown API routes (keeps the SPA fallback for / untouched).
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
