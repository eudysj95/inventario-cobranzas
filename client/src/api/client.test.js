// Unit tests for the shared fetch wrapper (task 6.1 "api/ wrapper"). Proves the
// error-normalization contract: the server's { error } body message surfaces
// verbatim with its HTTP status attached, non-JSON failures degrade to a
// generic message, and JSON requests carry the right headers/body. Fetch is
// stubbed via vi.stubGlobal; no component tooling (repo precedent).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './client';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const ok204 = () => ({
  ok: true,
  status: 204,
  json: async () => {
    throw new Error('no body on 204');
  },
});
const fail = (status, body) => ({ ok: false, status, json: async () => body });
const failNonJson = (status) => ({
  ok: false,
  status,
  json: async () => {
    throw new SyntaxError('not json');
  },
});

afterEach(() => vi.unstubAllGlobals());

describe('apiRequest', () => {
  it('GETs and parses the JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ products: [] })));
    await expect(apiRequest('/api/products')).resolves.toEqual({ products: [] });
  });

  it('sends JSON bodies with the right content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ product: { id: 'p1' } }));
    vi.stubGlobal('fetch', fetchMock);
    await apiRequest('/api/products', {
      method: 'POST',
      body: { name: 'Coffee', quantity: 3 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Coffee', quantity: 3 }),
      })
    );
  });

  it('throws ApiError with the server error message and status on non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(409, { error: 'Cannot delete a product with stock remaining' })
      )
    );
    const err = await apiRequest('/api/products/p1', { method: 'DELETE' }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Cannot delete a product with stock remaining');
    expect(err.status).toBe(409);
  });

  it('degrades to a generic message when the error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failNonJson(500)));
    const err = await apiRequest('/api/products').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Request failed (500)');
    expect(err.status).toBe(500);
  });

  it('returns null on 204 No Content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok204()));
    await expect(apiRequest('/api/products/p1', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('forwards the abort signal to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await apiRequest('/api/products', { signal });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({ signal })
    );
  });
});
