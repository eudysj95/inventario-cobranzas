// Unit tests for the products API client (task 6.3). Covers the request
// contracts with fetch stubbed: query-string building, create/update/delete
// shapes, the PATCH delta semantics (the server ADDS quantity — the client must
// send a signed adjustment, never an absolute target), and 409 error
// propagation. React Query hooks are not component-tested (repo precedent:
// unit-test the pure/API parts).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createProduct,
  deleteProduct,
  getProducts,
  quantityAdjustmentBody,
  quantityDelta,
  updateProduct,
} from './products';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('quantityDelta / quantityAdjustmentBody (PATCH signed-adjustment contract)', () => {
  it('computes the signed delta from current to target', () => {
    expect(quantityDelta(5, 8)).toBe(3); // restock
    expect(quantityDelta(5, 2)).toBe(-3); // remove units
    expect(quantityDelta(5, 5)).toBe(0); // unchanged
  });

  it('omits quantity entirely when the stock is unchanged', () => {
    expect(quantityAdjustmentBody(5, 5)).toEqual({});
  });

  it('sends the signed delta when stock changes — never the absolute target', () => {
    expect(quantityAdjustmentBody(5, 8)).toEqual({ quantity: 3 });
    expect(quantityAdjustmentBody(5, 2)).toEqual({ quantity: -3 });
  });
});

describe('getProducts', () => {
  it('builds the query string from search and state filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ products: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getProducts({ search: 'cafe', state: 'available' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products?search=cafe&state=available',
      expect.anything()
    );
  });

  it('omits empty filters from the query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ products: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getProducts({ search: '', state: '' });
    expect(fetchMock).toHaveBeenCalledWith('/api/products', expect.anything());
  });

  it('returns the products array', async () => {
    const product = { id: 'p1', name: 'Coffee' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ products: [product] })));
    await expect(getProducts({})).resolves.toEqual([product]);
  });
});

describe('createProduct / updateProduct / deleteProduct', () => {
  it('POSTs the create body and returns the product', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ product: { id: 'p1' } }));
    vi.stubGlobal('fetch', fetchMock);
    await createProduct({ name: 'Coffee', price: 10, quantity: 3 });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Coffee', price: 10, quantity: 3 }),
      })
    );
  });

  it('PATCHes the signed quantity body to /api/products/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ product: { id: 'p1' } }));
    vi.stubGlobal('fetch', fetchMock);
    await updateProduct('p1', { name: 'Coffee', quantity: 3 });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products/p1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Coffee', quantity: 3 }),
      })
    );
  });

  it('lets the 409 delete-guard message propagate to the caller', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(409, { error: 'Cannot delete a product with stock remaining' })
      )
    );
    await expect(deleteProduct('p1')).rejects.toThrow(
      'Cannot delete a product with stock remaining'
    );
  });
});
