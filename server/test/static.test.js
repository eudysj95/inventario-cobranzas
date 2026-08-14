// Static SPA serving contract: in production the Express server serves the
// built client (client/dist) and falls back to index.html for client-side
// routes, while /api/* keeps JSON behavior.
//
//   * These tests need no database: createApp runs with a stubbed pool.
//   * They skip cleanly when client/dist/index.html is absent (client not
//     built yet), so the suite stays green on machines without a build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { testApp } from './helpers.js';

// Stub pool: never queried by these tests; the /health contract still holds
// because healthRouter degrades to db:'down' when the pool cannot answer.
const stubPool = {};
const distRoot = fileURLToPath(new URL('../../client/dist', import.meta.url));
const hasBuild = existsSync(new URL('index.html', new URL(`file://${distRoot}`)));
const skipNoBuild = !hasBuild && 'client/dist not built — run npm run build --workspace client';

test('GET / serves the built SPA index.html', { skip: skipNoBuild }, async () => {
  const res = await request(testApp(stubPool)).get('/');

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.text, /<div id="root"><\/div>/);
});

test('GET /inventory falls back to index.html (SPA client-side route)', { skip: skipNoBuild }, async () => {
  const res = await request(testApp(stubPool)).get('/inventory');

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.text, /<div id="root"><\/div>/);
});

test('GET /api/nope still returns JSON 404 (static must not shadow the API)', async () => {
  const res = await request(testApp(stubPool)).get('/api/nope');

  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Not found' });
});

test('GET /health still works', async () => {
  const res = await request(testApp(stubPool)).get('/health');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: false, db: 'down' });
});