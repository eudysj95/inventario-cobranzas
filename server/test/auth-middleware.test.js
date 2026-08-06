// Auth middleware unit tests — no database required. They exercise the JWT
// session cookie mechanics (parseCookies, getJwtSecret policy, signToken)
// and the requireAuth guard (401 for missing/invalid/expired tokens,
// pass-through with req.user for a valid token).
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import {
  getJwtSecret,
  parseCookies,
  resetJwtSecret,
  requireAuth,
  signToken,
} from '../src/auth.js';

process.env.JWT_SECRET = 'auth-middleware-test-secret';

afterEach(() => {
  resetJwtSecret();
  process.env.JWT_SECRET = 'auth-middleware-test-secret';
  delete process.env.NODE_ENV;
});

/** Minimal app with one protected route to exercise requireAuth. */
function guardedApp() {
  const app = express();
  app.use(express.json());
  app.get('/secure', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
  return app;
}

test('parseCookies handles the session cookie header', () => {
  assert.deepEqual(parseCookies(''), {});
  assert.deepEqual(parseCookies('token=abc'), { token: 'abc' });
  assert.deepEqual(parseCookies('a=1; b=two'), { a: '1', b: 'two' });
  assert.deepEqual(parseCookies('name=hello%20world'), {
    name: 'hello world',
  });
  assert.deepEqual(parseCookies('q="quoted"'), { q: 'quoted' });
  assert.deepEqual(parseCookies('token=eyJhbGciOiJIUzI1NiJ9.abc-def_ghi'), {
    token: 'eyJhbGciOiJIUzI1NiJ9.abc-def_ghi',
  });
});

test('getJwtSecret returns JWT_SECRET when set', () => {
  process.env.JWT_SECRET = 'custom-secret';
  assert.equal(getJwtSecret(), 'custom-secret');
});

test('getJwtSecret falls back to a dev secret outside production', () => {
  delete process.env.JWT_SECRET;
  const secret = getJwtSecret();
  assert.equal(typeof secret, 'string');
  assert.ok(secret.length >= 16, 'dev secret is non-trivial');
});

test('getJwtSecret throws in production without JWT_SECRET', () => {
  delete process.env.JWT_SECRET;
  process.env.NODE_ENV = 'production';
  assert.throws(() => getJwtSecret(), /JWT_SECRET must be set/);
});

test('signToken produces a verifiable 12h HS256 token with the admin as subject', () => {
  const admin = { id: '123e4567-e89b-12d3-a456-426614174000', username: 'admin' };
  const token = signToken(admin);
  const payload = jwt.verify(token, getJwtSecret());
  assert.equal(payload.sub, admin.id);
  assert.equal(payload.username, 'admin');
  assert.equal(payload.exp - payload.iat, 12 * 60 * 60);
});

test('requireAuth answers 401 without a cookie', async () => {
  const res = await request(guardedApp()).get('/secure');
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('requireAuth answers 401 for a token with an invalid signature', async () => {
  const token = jwt.sign({ username: 'admin' }, 'a-different-secret', {
    algorithm: 'HS256',
  });
  const res = await request(guardedApp())
    .get('/secure')
    .set('Cookie', `token=${token}`);
  assert.equal(res.status, 401);
});

test('requireAuth answers 401 for an expired token', async () => {
  const token = jwt.sign({ username: 'admin' }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '-1s',
  });
  const res = await request(guardedApp())
    .get('/secure')
    .set('Cookie', `token=${token}`);
  assert.equal(res.status, 401);
});

test('requireAuth passes a valid token through and sets req.user', async () => {
  const token = signToken({ id: 'u1', username: 'admin' });
  const res = await request(guardedApp())
    .get('/secure')
    .set('Cookie', `token=${token}`);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.user, { id: 'u1', username: 'admin' });
});
