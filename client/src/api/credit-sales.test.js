// Unit tests for the credit-sales API client (task 6.4). Covers the
// form-to-body mapper (buildCreditSaleBody: per-line optional price + optional
// dueDate + empty-line filtering), the create request shape and the detail
// read. React Query hooks are not component-tested (repo precedent).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCreditSaleBody, createCreditSale, getCreditSale } from './credit-sales';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('buildCreditSaleBody (form-to-body mapper)', () => {
  it('maps lines with product, units and an explicit per-line price', () => {
    expect(
      buildCreditSaleBody({
        customerId: 'c1',
        lines: [{ productId: 'p1', units: '2', price: '99.50' }],
      })
    ).toEqual({
      customerId: 'c1',
      lines: [{ productId: 'p1', units: 2, price: 99.5 }],
    });
  });

  it('omits the per-line price when blank so the server uses the catalog price', () => {
    const body = buildCreditSaleBody({
      customerId: 'c1',
      lines: [{ productId: 'p1', units: '3', price: '' }],
    });
    expect(body.lines[0]).toEqual({ productId: 'p1', units: 3 });
    expect(body.lines[0].price).toBeUndefined();
  });

  it('includes the optional dueDate only when provided', () => {
    expect(
      buildCreditSaleBody({
        customerId: 'c1',
        lines: [{ productId: 'p1', units: 1 }],
        dueDate: '2026-10-01',
      }).dueDate
    ).toBe('2026-10-01');
    expect(
      buildCreditSaleBody({
        customerId: 'c1',
        lines: [{ productId: 'p1', units: 1 }],
        dueDate: '',
      }).dueDate
    ).toBeUndefined();
  });

  it('drops lines without a productId (the form validates before building)', () => {
    const body = buildCreditSaleBody({
      customerId: 'c1',
      lines: [
        { productId: '', units: '1' },
        { productId: 'p2', units: '2' },
      ],
    });
    expect(body.lines).toEqual([{ productId: 'p2', units: 2 }]);
  });
});

describe('createCreditSale / getCreditSale', () => {
  it('POSTs the sale body and returns the created sale', async () => {
    const sale = { id: 's1', customer_name: 'Ana', total: 199, lines: [] };
    const fetchMock = vi.fn().mockResolvedValue(ok({ sale }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      createCreditSale({ customerId: 'c1', lines: [{ productId: 'p1', units: 2 }] })
    ).resolves.toEqual(sale);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/credit-sales',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('GETs /api/credit-sales/:saleId for the detail read', async () => {
    const sale = { id: 's1', lines: [{ productId: 'p1', units: 2 }] };
    const fetchMock = vi.fn().mockResolvedValue(ok({ sale }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getCreditSale('s1')).resolves.toEqual(sale);
    expect(fetchMock).toHaveBeenCalledWith('/api/credit-sales/s1', expect.anything());
  });

  it('surfaces the insufficient-stock guard message verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(400, {
          error: 'Insufficient stock for one or more lines — nothing was recorded',
        })
      )
    );
    await expect(
      createCreditSale({ customerId: 'c1', lines: [{ productId: 'p1', units: 99 }] })
    ).rejects.toThrow('Insufficient stock for one or more lines — nothing was recorded');
  });
});