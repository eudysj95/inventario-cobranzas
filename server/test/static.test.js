// Static SPA serving contract: in production the Express server serves the
// built client (client/dist) and falls back to index.html for client-side
// routes, while /api/* keeps JSON behavior.
//
//   * These tests need no database: createApp runs with a stubbed pool.
//   * They skip cleanly when client/dist/index.html is absent (client not
//     built yet), so the suite stays green on machines without a build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { testApp } from './helpers.js';

// Stub pool: never queried by these tests; the /health contract still holds
// because healthRouter degrades to db:'down' when the pool cannot answer.
const stubPool = {};
const distRoot = fileURLToPath(new URL('../../client/dist', import.meta.url));
const assetsRoot = fileURLToPath(new URL('../../client/dist/assets', import.meta.url));
const hasBuild = existsSync(new URL('index.html', new URL(`file://${distRoot}`)));
const skipNoBuild = !hasBuild && 'client/dist not built — run npm run build --workspace client';

// Real hashed asset entry point from the current build, e.g. index-<hash>.js,
// so the "real asset still served" test targets a file that exists.
const jsEntry = hasBuild && existsSync(assetsRoot)
  ? readdirSync(assetsRoot).find((f) => /^index-.*\.js$/.test(f))
  : undefined;

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

test('GET /assets/missing-typo.js returns 404, not the SPA shell (stale/missing asset)', { skip: skipNoBuild }, async () => {
  const res = await request(testApp(stubPool)).get('/assets/missing-typo.js');

  assert.equal(res.status, 404);
  assert.doesNotMatch(res.headers['content-type'], /text\/html/);
});

test('GET /favicon.ico returns 404, not the SPA shell (missing static asset)', { skip: skipNoBuild }, async () => {
  const res = await request(testApp(stubPool)).get('/favicon.ico');

  assert.equal(res.status, 404);
  assert.doesNotMatch(res.headers['content-type'], /text\/html/);
});

test('GET /assets/index-<hash>.js still serves the real built asset', { skip: !hasBuild && 'client/dist not built — run npm run build --workspace client' }, async () => {
  assert.ok(jsEntry, 'expected an index-<hash>.js file in client/dist/assets');
  const res = await request(testApp(stubPool)).get(`/assets/${jsEntry}`);

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /javascript/);
});

test('GET /health still works', async () => {
  const res = await request(testApp(stubPool)).get('/health');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: false, db: 'down' });
});