// Instance config endpoint tests (task 6.0): GET /api/config is PUBLIC — no
// auth cookie, no database. It returns the instance branding values seeded
// from server env (INSTANCE_BUSINESS_NAME, INSTANCE_CURRENCY_SYMBOL,
// INSTANCE_CURRENCY_LOCALE, optional INSTANCE_WHATSAPP_NUMBER) and never
// leaks secrets or business data. Nothing here is DB-gated: the endpoint has
// no database dependency and MUST run without Postgres.
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp({ pool: null });

// Every env key a test touches (including secrets used as leak sentinels)
// is restored after each test so cases stay independent of each other and
// of the developer's shell environment.
const TRACKED_KEYS = [
  'INSTANCE_BUSINESS_NAME',
  'INSTANCE_CURRENCY_SYMBOL',
  'INSTANCE_CURRENCY_LOCALE',
  'INSTANCE_WHATSAPP_NUMBER',
  'JWT_SECRET',
  'DATABASE_URL',
];
const envBackup = new Map(TRACKED_KEYS.map((key) => [key, process.env[key]]));
afterEach(() => {
  for (const [key, value] of envBackup) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('GET /api/config answers 200 without an auth cookie and mirrors the env values', async () => {
  process.env.INSTANCE_BUSINESS_NAME = 'Mi Tienda de Prueba';
  process.env.INSTANCE_CURRENCY_SYMBOL = 'USD';
  process.env.INSTANCE_CURRENCY_LOCALE = 'en-US';
  process.env.INSTANCE_WHATSAPP_NUMBER = '+54 9 11 5555-1234';

  const res = await request(app).get('/api/config');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    businessName: 'Mi Tienda de Prueba',
    currencySymbol: 'USD',
    currencyLocale: 'en-US',
    whatsappNumber: '+54 9 11 5555-1234',
  });
});

test('GET /api/config omits whatsappNumber when the env var is unset', async () => {
  process.env.INSTANCE_BUSINESS_NAME = 'Sin WhatsApp';
  delete process.env.INSTANCE_WHATSAPP_NUMBER;

  const res = await request(app).get('/api/config');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    businessName: 'Sin WhatsApp',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
  });
  assert.ok(!('whatsappNumber' in res.body), 'optional key is omitted');
});

test('GET /api/config falls back to documented defaults when env vars are unset', async () => {
  for (const key of TRACKED_KEYS) delete process.env[key];

  const res = await request(app).get('/api/config');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    businessName: 'Mi Negocio',
    currencySymbol: '$',
    currencyLocale: 'es-AR',
  });
});

test('GET /api/config leaks no secrets or business data', async () => {
  process.env.JWT_SECRET = 'super-secret-token-signing-value';
  process.env.DATABASE_URL = 'postgresql://user:secretpass@db.example.com/inventario';
  process.env.INSTANCE_WHATSAPP_NUMBER = '+54 9 11 5555-1234';

  const res = await request(app).get('/api/config');

  assert.equal(res.status, 200);
  // Structurally: the payload is exactly the branding keys. The endpoint
  // reads server env only and never touches the database, so products,
  // customers, debts or any other business data cannot appear.
  assert.deepEqual(Object.keys(res.body).sort(), [
    'businessName',
    'currencyLocale',
    'currencySymbol',
    'whatsappNumber',
  ]);
  const raw = JSON.stringify(res.body);
  assert.ok(!raw.includes('super-secret-token-signing-value'), 'JWT_SECRET not leaked');
  assert.ok(!raw.includes('secretpass'), 'DATABASE_URL credentials not leaked');
});
