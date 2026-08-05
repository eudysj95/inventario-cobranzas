// Standalone migration runner: `npm run db:migrate`.
// Applies db/schema.sql (idempotent) and seeds the admin from env when the
// admins table is empty.
import { getPool, runMigration } from '../src/db.js';
import { ensureAdmin } from '../src/seed.js';

async function main() {
  const pool = getPool();
  await runMigration(pool);
  const result = await ensureAdmin(pool);
  await pool.end();
  console.log(`[migrate] schema applied; admin: ${result.reason}`);
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
