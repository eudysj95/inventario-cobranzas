// Unit tests for the payments API client (task 6.4). Covers the payment body
// mapper (buildPaymentBody), the FIFO response passthrough ({ payment,
// allocations }) and the history query. FIFO allocation itself is
// server-side — the client test proves the client sends only what the design
// requires and receives allocations unchanged. React Query hooks are not
// component-tested (repo precedent).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPaymentBody, createPayment, getPayments } from './payments';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('buildPaymentBody', () => {
  it('sends customerId, amount as number and the trimmed note', () => {
    expect(buildPaymentBody('c1', '120.50', '  abono  ')).toEqual({
      customerId: 'c1',
      amount: 120.5,
      note: 'abono',
    });
  });

  it('omits the note when blank, null or undefined', () => {
    expect(buildPaymentBody('c1', 30, '')).toEqual({ customerId: 'c1', amount: 30 });
    expect(buildPaymentBody('c1', 30, null)).toEqual({ customerId: 'c1', amount: 30 });
    expect(buildPaymentBody('c1', 30, undefined)).toEqual({ customerId: 'c1', amount: 30 });
  });
});

describe('createPayment (FIFO result passthrough)', () => {
  it('POSTs the body and returns payment with its allocations unchanged', async () => {
    const result = {
      payment: { id: 'pay1', customer_id: 'c1', amount: 60, paid_at: '2026-08-12T10:00:00Z' },
      allocations: [
        { debt_id: 'd1', amount: 50 },
        { debt_id: 'd2', amount: 10 },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(ok(result));
    vi.stubGlobal('fetch', fetchMock);
    await expect(createPayment({ customerId: 'c1', amount: 60 })).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/payments',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ customerId: 'c1', amount: 60 }) })
    );
  });

  it('surfaces the overpayment and no-open-debts guard messages verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(400, { error: "Payment exceeds the customer's remaining balance" })
      )
    );
    await expect(createPayment({ customerId: 'c1', amount: 9999 })).rejects.toThrow(
      "Payment exceeds the customer's remaining balance"
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fail(400, { error: 'Customer has no open debts' }))
    );
    await expect(createPayment({ customerId: 'c1', amount: 10 })).rejects.toThrow(
      'Customer has no open debts'
    );
  });
});

describe('getPayments', () => {
  it('builds the query string from the customerId filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ payments: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getPayments('c1');
    expect(fetchMock).toHaveBeenCalledWith('/api/payments?customerId=c1', expect.anything());
  });

  it('omits the filter when no customer is given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ payments: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getPayments('');
    expect(fetchMock).toHaveBeenCalledWith('/api/payments', expect.anything());
  });
});