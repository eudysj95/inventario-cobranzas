// Auth route tests: session wiring via the real app, cookie attributes,
// logout clearing, and login behavior. The login happy path and credential
// checks need the admins table, so those are DB-gated and skip gracefully
// when no Postgres is reachable (TEST_DATABASE_URL / DATABASE_URL) — same
// convention as test/health.test.js.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigration } from '../src/db.js';
import { COOKIE_NAME, signToken } from '../src/auth.js';
import { canReachDb, createTestPool, testApp } from './helpers.js';

process.env.JWT_SECRET = 'auth-routes-test-secret';

// App with no pool at all: enough for the cookie-less /me, logout, and
// malformed-login contracts (none of them reach the database).
const app = createApp({ pool: null });

test('GET /api/auth/me answers 401 without a session (router is wired)', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('GET /api/auth/me returns the session user for a valid cookie', async () => {
  const token = signToken({ id: 'u1', username: 'admin' });
  const res = await request(app)
    .get('/api/auth/me')
    .set('Cookie', `token=${token}`);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.user, { id: 'u1', username: 'admin' });
});

test('POST /api/auth/logout clears the httpOnly session cookie', async () => {
  const res = await request(app).post('/api/auth/logout');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
  const cookie = res.headers['set-cookie'][0];
  assert.ok(cookie, 'logout emits a clearing Set-Cookie');
  assert.match(cookie, new RegExp(`^${COOKIE_NAME}=;`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Expires=Thu, 01 Jan 1970/);
});

test('POST /api/auth/login rejects malformed input with the generic error', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin' }); // missing password
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: 'Invalid username or password' });
  assert.equal(res.headers['set-cookie'], undefined, 'no session cookie');
});

test('POST /api/auth/login answers 503 when the database is unreachable', async () => {
  const pool = new pg.Pool({
    connectionString: 'postgresql://nobody:nothing@127.0.0.1:1/nope',
    max: 1,
    connectionTimeoutMillis: 500,
  });
  after(() => pool.end());

  const res = await request(testApp(pool))
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'password' });
  assert.equal(res.status, 503);
  assert.deepEqual(res.body, { error: 'Service temporarily unavailable' });
});

// --- DB-gated: skipped gracefully when no Postgres is available ------------

const probePool = createTestPool();
const dbAvailable = await canReachDb(probePool);
if (probePool) await probePool.end();

const LOGIN_USERNAME = 'login-test-admin';
const LOGIN_PASSWORD = 'correct-password';

/** Insert (or refresh) a known admin so credential tests are deterministic. */
async function seedAdmin(pool) {
  const passwordHash = await bcrypt.hash(LOGIN_PASSWORD, 4); // low rounds: test speed
  await pool.query(
    `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [LOGIN_USERNAME, passwordHash]
  );
}

test(
  'POST /api/auth/login succeeds with correct credentials and sets the session cookie',
  { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' },
  async () => {
    const pool = createTestPool();
    after(() => pool.end());
    await runMigration(pool);
    await seedAdmin(pool);

    const res = await request(testApp(pool))
      .post('/api/auth/login')
      .send({ username: LOGIN_USERNAME, password: LOGIN_PASSWORD });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.username, LOGIN_USERNAME);
    assert.ok(res.body.user.id, 'returns the admin id');

    const cookie = res.headers['set-cookie'][0];
    assert.ok(cookie, 'login sets a session cookie');
    assert.match(cookie, new RegExp(`^${COOKIE_NAME}=`));
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.match(cookie, /Max-Age=43200/); // 12h in seconds
  }
);

test(
  'POST /api/auth/login rejects a wrong password with a generic error and no session',
  { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' },
  async () => {
    const pool = createTestPool();
    after(() => pool.end());
    await runMigration(pool);
    await seedAdmin(pool);

    const res = await request(testApp(pool))
      .post('/api/auth/login')
      .send({ username: LOGIN_USERNAME, password: 'wrong-password' });
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Invalid username or password' });
    assert.equal(res.headers['set-cookie'], undefined, 'no session cookie');
  }
);

test(
  'POST /api/auth/login rejects an unknown username identically (no enumeration)',
  { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' },
  async () => {
    const pool = createTestPool();
    after(() => pool.end());
    await runMigration(pool);
    await seedAdmin(pool);

    const res = await request(testApp(pool))
      .post('/api/auth/login')
      .send({ username: 'no-such-user', password: LOGIN_PASSWORD });
    assert.equal(res.status, 401);
    assert.deepEqual(res.body, { error: 'Invalid username or password' });
    assert.equal(res.headers['set-cookie'], undefined, 'no session cookie');
  }
);

test(
  'login -> /me keeps the session across requests via the agent cookie jar',
  { skip: !dbAvailable && 'no local/test Postgres — set TEST_DATABASE_URL' },
  async () => {
    const pool = createTestPool();
    after(() => pool.end());
    await runMigration(pool);
    await seedAdmin(pool);

    const agent = request.agent(testApp(pool));
    const login = await agent
      .post('/api/auth/login')
      .send({ username: LOGIN_USERNAME, password: LOGIN_PASSWORD });
    assert.equal(login.status, 200);

    const me = await agent.get('/api/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.user.username, LOGIN_USERNAME);
  }
);
