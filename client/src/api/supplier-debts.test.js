// Unit tests for the supplier-debts API client (task 6.5). Covers the
// form-to-body mappers, the cents-safe overpay guard, and the request
// contracts (create/list/pay/due) with fetch stubbed.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSupplierDebtBody,
  buildSupplierPayBody,
  createSupplierDebt,
  getSupplierDebts,
  getSupplierDebtsDue,
  paySupplierDebt,
  supplierPayExceedsBalance,
} from './supplier-debts';

const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('buildSupplierDebtBody (form-to-body mapper)', () => {
  it('trims the supplier name and number-converts the amount', () => {
    expect(
      buildSupplierDebtBody({ supplierName: '  Acme SA  ', amount: '1500.50', dueDate: '2026-09-10' })
    ).toEqual({ supplierName: 'Acme SA', amount: 1500.5, dueDate: '2026-09-10' });
  });

  it('keeps the strict YYYY-MM-DD dueDate untouched (server validates the calendar date)', () => {
    const body = buildSupplierDebtBody({
      supplierName: 'Acme',
      amount: 100,
      dueDate: '2026-08-30',
    });
    expect(body.dueDate).toBe('2026-08-30');
  });
});

describe('buildSupplierPayBody', () => {
  it('number-converts the amount for the pay endpoint', () => {
    expect(buildSupplierPayBody('200')).toEqual({ amount: 200 });
    expect(buildSupplierPayBody(150.75)).toEqual({ amount: 150.75 });
  });
});

describe('supplierPayExceedsBalance (cents-safe overpay guard)', () => {
  it('allows a payment equal to the remaining balance', () => {
    expect(supplierPayExceedsBalance(50, 50)).toBe(false);
  });

  it('rejects a payment above the remaining balance', () => {
    expect(supplierPayExceedsBalance(50.01, 50)).toBe(true);
  });

  it('compares in cents so float math cannot falsely trip the guard', () => {
    // 0.1 + 0.2 !== 0.3 in binary floats; cent rounding keeps this exact.
    expect(supplierPayExceedsBalance(0.3, 0.1 + 0.2)).toBe(false);
  });
});

describe('createSupplierDebt', () => {
  it('POSTs the body to /api/supplier-debts and returns the debt', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debt: { id: 'd1' } }));
    vi.stubGlobal('fetch', fetchMock);
    const debt = await createSupplierDebt({ supplierName: 'Acme', amount: 1500.5, dueDate: '2026-09-10' });
    expect(debt).toEqual({ id: 'd1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/supplier-debts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ supplierName: 'Acme', amount: 1500.5, dueDate: '2026-09-10' }),
      })
    );
  });
});

describe('getSupplierDebts', () => {
  it('requests the list with the status filter when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSupplierDebts('open');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/supplier-debts?status=open',
      expect.anything()
    );
  });

  it('requests the plain list without a filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSupplierDebts();
    expect(fetchMock).toHaveBeenCalledWith('/api/supplier-debts', expect.anything());
  });

  it('returns the debts array', async () => {
    const debts = [{ id: 'd1', supplier_name: 'Acme' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ debts })));
    await expect(getSupplierDebts()).resolves.toEqual(debts);
  });

  it('surfaces the invalid-status 400 verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fail(400, { error: 'Invalid status: bogus' }))
    );
    await expect(getSupplierDebts('bogus')).rejects.toThrow('Invalid status: bogus');
  });
});

describe('getSupplierDebtsDue (due view with flags)', () => {
  it('requests /api/supplier-debts/due with the horizon', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSupplierDebtsDue(14);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/supplier-debts/due?horizonDays=14',
      expect.anything()
    );
  });

  it('defaults to a horizon of 7 days', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debts: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getSupplierDebtsDue();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/supplier-debts/due?horizonDays=7',
      expect.anything()
    );
  });

  it('returns debts with their overdue/soon_due flags', async () => {
    const debts = [{ id: 'd1', supplier_name: 'Acme', balance: 500, overdue: true, soon_due: false }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ debts })));
    await expect(getSupplierDebtsDue(7)).resolves.toEqual(debts);
  });
});

describe('paySupplierDebt', () => {
  it('POSTs the amount to /api/supplier-debts/:id/pay and returns the debt', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ debt: { id: 'd1', balance: 0, status: 'closed' } }));
    vi.stubGlobal('fetch', fetchMock);
    const debt = await paySupplierDebt('d1', { amount: 200 });
    expect(debt).toEqual({ id: 'd1', balance: 0, status: 'closed' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/supplier-debts/d1/pay',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ amount: 200 }) })
    );
  });

  it('surfaces the overpayment 400 and the closed-debt 409 verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(400, { error: 'Payment exceeds the remaining balance of the supplier debt' })
      )
    );
    await expect(paySupplierDebt('d1', { amount: 999 })).rejects.toThrow(
      'Payment exceeds the remaining balance of the supplier debt'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(409, { error: 'Only open supplier debts can receive payments' })
      )
    );
    await expect(paySupplierDebt('d1', { amount: 10 })).rejects.toThrow(
      'Only open supplier debts can receive payments'
    );
  });
});