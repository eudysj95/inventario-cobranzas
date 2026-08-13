// Unit tests for the apartados API client (task 6.4). Covers the form-to-body
// mapper (buildApartadoBody), the pay body (buildApartadoPayBody), the
// cents-safe overpay guard (paymentExceedsRemaining) and the request contracts
// with fetch stubbed. React Query hooks are not component-tested (repo
// precedent: unit-test the pure/API parts).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildApartadoBody,
  buildApartadoPayBody,
  cancelApartado,
  createApartado,
  getApartados,
  payApartado,
  paymentExceedsRemaining,
} from './apartados';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('buildApartadoBody (form-to-body mapper)', () => {
  it('maps form values to the create body, converting units and price to numbers', () => {
    expect(
      buildApartadoBody({
        customerId: 'c1',
        productId: 'p1',
        units: '2',
        agreedPrice: '150.50',
        dueDate: '2026-09-01',
      })
    ).toEqual({
      customerId: 'c1',
      productId: 'p1',
      units: 2,
      agreedPrice: 150.5,
      dueDate: '2026-09-01',
    });
  });

  it('keeps the strict YYYY-MM-DD dueDate string untouched (server validates shape)', () => {
    const body = buildApartadoBody({
      customerId: 'c',
      productId: 'p',
      units: 1,
      agreedPrice: 10,
      dueDate: '2026-08-30',
    });
    expect(body.dueDate).toBe('2026-08-30');
  });
});

describe('buildApartadoPayBody', () => {
  it('sends amount as a number plus the trimmed note', () => {
    expect(buildApartadoPayBody('50', '  primer pago ')).toEqual({
      amount: 50,
      note: 'primer pago',
    });
  });

  it('omits the note entirely when blank, null or undefined', () => {
    expect(buildApartadoPayBody(50, '')).toEqual({ amount: 50 });
    expect(buildApartadoPayBody(50, null)).toEqual({ amount: 50 });
    expect(buildApartadoPayBody(50, '   ')).toEqual({ amount: 50 });
    expect(buildApartadoPayBody(50, undefined)).toEqual({ amount: 50 });
  });
});

describe('paymentExceedsRemaining (cents-safe overpay guard)', () => {
  it('allows a payment equal to the remaining balance', () => {
    expect(paymentExceedsRemaining(50, 50)).toBe(false);
  });

  it('rejects a payment above the remaining balance', () => {
    expect(paymentExceedsRemaining(50.01, 50)).toBe(true);
  });

  it('compares in cents so float math cannot falsely trip the guard', () => {
    // 0.1 + 0.2 !== 0.3 in binary floats; cent rounding keeps this exact.
    expect(paymentExceedsRemaining(0.3, 0.1 + 0.2)).toBe(false);
  });
});

describe('getApartados', () => {
  it('builds the query string from status and customerId filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ apartados: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getApartados({ status: 'pending', customerId: 'c1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/apartados?status=pending&customerId=c1',
      expect.anything()
    );
  });

  it('omits empty filters from the query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ apartados: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getApartados({});
    expect(fetchMock).toHaveBeenCalledWith('/api/apartados', expect.anything());
  });

  it('returns the apartados array', async () => {
    const apartado = { id: 'a1', status: 'pending' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ apartados: [apartado] })));
    await expect(getApartados({})).resolves.toEqual([apartado]);
  });
});

describe('createApartado / cancelApartado / payApartado', () => {
  it('POSTs the create body and returns the apartado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ apartado: { id: 'a1' } }));
    vi.stubGlobal('fetch', fetchMock);
    const apartado = await createApartado({ customerId: 'c1' });
    expect(apartado).toEqual({ id: 'a1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/apartados',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ customerId: 'c1' }) })
    );
  });

  it('POSTs to /api/apartados/:id/cancel and returns the apartado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ apartado: { id: 'a1', status: 'cancelled' } }));
    vi.stubGlobal('fetch', fetchMock);
    await cancelApartado('a1');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/apartados/a1/cancel',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('POSTs the pay body to /api/apartados/:id/pay', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ apartado: { id: 'a1', status: 'paid' } }));
    vi.stubGlobal('fetch', fetchMock);
    await payApartado('a1', { amount: 50 });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/apartados/a1/pay',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ amount: 50 }) })
    );
  });

  it('surfaces server guard messages (overpayment / double-cancel) verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(400, { error: 'Payment exceeds the remaining balance of the apartado' })
      )
    );
    await expect(payApartado('a1', { amount: 999 })).rejects.toThrow(
      'Payment exceeds the remaining balance of the apartado'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(409, { error: 'Only pending apartados can be cancelled' })
      )
    );
    await expect(cancelApartado('a1')).rejects.toThrow(
      'Only pending apartados can be cancelled'
    );
  });
});