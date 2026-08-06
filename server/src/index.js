import { createApp } from './app.js';
import { getPool, runMigration } from './db.js';
import { ensureAdmin } from './seed.js';
import { getJwtSecret } from './auth.js';

const port = Number.parseInt(process.env.PORT ?? '3001', 10);

async function main() {
  // Auth secret policy: required in production (fail-fast), dev-only
  // fallback otherwise. Resolved before the server accepts any request.
  getJwtSecret();

  const pool = getPool();

  // Greenfield bootstrap: apply schema + seed admin (both idempotent). A
  // database that is unreachable at boot does not take the service down:
  // /health then reports db:'down' so the keep-alive monitor can alert.
  try {
    await runMigration(pool);
    await ensureAdmin(pool);
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
