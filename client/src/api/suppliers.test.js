// Unit tests for the suppliers API client (task 6.5). The supplier list is a
// simple GET with an optional ILIKE search — suppliers themselves are
// created implicitly via POST /api/supplier-debts (auto-upsert), which lives
// in supplier-debts.test.js.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSuppliers } from './suppliers';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('getSuppliers', () => {
  it('requests /api/suppliers without a query when no search is given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ suppliers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSuppliers();
    expect(fetchMock).toHaveBeenCalledWith('/api/suppliers', expect.anything());
  });

  it('adds the search parameter when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ suppliers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSuppliers('acme');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/suppliers?search=acme',
      expect.anything()
    );
  });

  it('returns the suppliers array', async () => {
    const suppliers = [{ id: 's1', name: 'Acme' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ suppliers })));
    await expect(getSuppliers()).resolves.toEqual(suppliers);
  });

  it('surfaces the 401 guard message verbatim without a session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fail(401, { error: 'Unauthorized' }))
    );
    await expect(getSuppliers()).rejects.toThrow('Unauthorized');
  });
});