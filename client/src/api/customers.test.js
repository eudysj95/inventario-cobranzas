// Unit tests for the customers API client (task 6.4). Covers list/search
// query building and the detail shape (customer + open_debts + payments),
// which the payments panel and the forms consume. React Query hooks are not
// component-tested (repo precedent).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCustomer, getCustomers } from './customers';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('getCustomers', () => {
  it('builds the search query string when a term is given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ customers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getCustomers('ana');
    expect(fetchMock).toHaveBeenCalledWith('/api/customers?search=ana', expect.anything());
  });

  it('omits the query string when the search is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ customers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getCustomers('');
    expect(fetchMock).toHaveBeenCalledWith('/api/customers', expect.anything());
  });

  it('returns the customers array with open_balance', async () => {
    const customers = [{ id: 'c1', name: 'Ana', open_balance: 150 }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ customers })));
    await expect(getCustomers('')).resolves.toEqual(customers);
  });
});

describe('getCustomer (detail)', () => {
  it('returns customer, open_debts and payments in one payload', async () => {
    const detail = {
      customer: { id: 'c1', name: 'Ana', open_balance: 150 },
      open_debts: [
        { id: 'd1', product_name: 'Café', amount: 100, balance: 100, due_date: '2026-09-01' },
      ],
      payments: [{ id: 'p1', amount: 50, paid_at: '2026-08-12T10:00:00Z', note: null }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(detail)));
    await expect(getCustomer('c1')).resolves.toEqual(detail);
  });

  it('GETs /api/customers/:id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ customer: { id: 'c1' }, open_debts: [], payments: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getCustomer('c1');
    expect(fetchMock).toHaveBeenCalledWith('/api/customers/c1', expect.anything());
  });

  it('lets the 404 propagate to the caller', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fail(404, { error: 'Customer not found' }))
    );
    await expect(getCustomer('missing')).rejects.toThrow('Customer not found');
  });
});