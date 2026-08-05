import bcrypt from 'bcryptjs';

/**
 * Seed the single shared admin from environment variables (ADMIN_USERNAME /
 * ADMIN_PASSWORD) when the admins table is empty. Idempotent by design:
 * existing admins are never touched or duplicated. No credentials are
 * hardcoded — they come from the environment (Render env vars or .env).
 */
export async function ensureAdmin(pool) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      '[seed] ADMIN_USERNAME / ADMIN_PASSWORD not set — skipping admin seed'
    );
    return { seeded: false, reason: 'env-missing' };
  }

  const { rows } = await pool.query('SELECT 1 FROM admins LIMIT 1');
  if (rows.length > 0) {
    return { seeded: false, reason: 'already-seeded' };
  }

  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10);
  const passwordHash = await bcrypt.hash(password, rounds);
  await pool.query(
    'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
    [username, passwordHash]
  );

  console.info(`[seed] admin "${username}" seeded from env`);
  return { seeded: true, reason: 'seeded' };
}
