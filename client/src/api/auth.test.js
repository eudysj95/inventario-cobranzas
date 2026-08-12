// Unit tests for the session API client (task 6.2). Proves the
// "Single shared admin login" spec scenarios: credentials are sent correctly and
// EVERY failed login surfaces the SAME generic message — the server's detail
// (wrong password vs unknown user vs service unavailable) never reaches the UI
// (no detail leakage). Fetch stubbed via vi.stubGlobal; no component tooling.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GENERIC_LOGIN_ERROR, getMe, login } from './auth';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('login', () => {
  it('sends credentials as JSON to /api/auth/login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(ok({ user: { id: 'u1', username: 'admin' } }));
    vi.stubGlobal('fetch', fetchMock);
    await login({ username: 'admin', password: 'secreto' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'secreto' }),
      })
    );
  });
  it('returns the server user on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ user: { id: 'u1', username: 'admin' } })));
    await expect(login({ username: 'admin', password: 'x' })).resolves.toEqual({
      user: { id: 'u1', username: 'admin' },
    });
  });
  it('throws the generic message on 401 — server body never reaches the UI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401, { error: 'Invalid username or password' })));
    await expect(login({ username: 'admin', password: 'wrong' })).rejects.toThrow(GENERIC_LOGIN_ERROR);
  });
  it('throws the SAME generic message on service failure (503)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(503, { error: 'Service temporarily unavailable' })));
    await expect(login({ username: 'admin', password: 'x' })).rejects.toThrow(GENERIC_LOGIN_ERROR);
  });
});

describe('getMe (session validity)', () => {
  it('maps 401 to null — "not signed in" is expected, not an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401, { error: 'Unauthorized' })));
    await expect(getMe()).resolves.toBeNull();
  });
  it('returns the user when the session is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ user: { id: 'u1', username: 'admin' } })));
    await expect(getMe()).resolves.toEqual({ id: 'u1', username: 'admin' });
  });
  it('throws on unexpected server failures so the guard can fail closed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(500, {})));
    await expect(getMe()).rejects.toThrow();
  });
});