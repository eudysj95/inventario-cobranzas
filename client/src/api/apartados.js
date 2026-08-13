// Apartados API client (task 6.4). Consumes the server apartados routes
// (server/src/routes/apartados.js):
//   POST /api/apartados             create {customerId, productId, units,
//                                   agreedPrice, dueDate} — decrements stock in
//                                   the same TXN (guarded quantity >= units)
//   GET  /api/apartados?status&customerId — list with paid_total/remaining
//   POST /api/apartados/:id/cancel  restore reserved units (409 unless pending)
//   POST /api/apartados/:id/pay     {amount, note?} — cumulative integer-cents
//                                   guard server-side; client just sends the
//                                   amount and optional note (amendment B)
//
// All requests go through the shared wrapper (same-origin, session cookie sent
// automatically). Apartado mutations move stock, so they invalidate the
// products cache too: the inventory chips must reflect reserved/returned units.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';
import { COLLECTIONS_KEY } from './collections.js';

export const APARTADOS_KEY = ['apartados'];

/**
 * Form-to-body mapper for creating an apartado. Agreed price arrives as a
 * number (money is a JSON number at the edge); dueDate must be a strict
 * 'YYYY-MM-DD' string (server validates the shape).
 */
export function buildApartadoBody(values) {
  return {
    customerId: values.customerId,
    productId: values.productId,
    units: Number(values.units),
    agreedPrice: Number(values.agreedPrice),
    dueDate: values.dueDate,
  };
}

/**
 * Pay body: { amount, note? }. The note is optional — trim it and omit it
 * entirely when blank so the server never sees an empty string.
 */
export function buildApartadoPayBody(amount, note) {
  const body = { amount: Number(amount) };
  if (note !== undefined && note !== null && note.trim() !== '') {
    body.note = note.trim();
  }
  return body;
}

/**
 * Client-side overpay guard for the pay form: the server enforces the
 * cumulative integer-cents check, but the form can reject an amount that
 * exceeds the remaining balance before submitting. Comparisons run in cents
 * (0.1 + 0.2 !== 0.3 in float math).
 */
export function paymentExceedsRemaining(amount, remaining) {
  return Math.round(amount * 100) > Math.round(remaining * 100);
}

/** GET /api/apartados?status&customerId → array of apartado rows. */
export async function getApartados(filters = {}, { signal } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.customerId) params.set('customerId', filters.customerId);
  const qs = params.toString();
  const data = await apiRequest(`/api/apartados${qs ? `?${qs}` : ''}`, { signal });
  return data.apartados ?? [];
}

/** POST /api/apartados → { apartado } (server decrements stock in the TXN). */
export async function createApartado(input) {
  const data = await apiRequest('/api/apartados', { method: 'POST', body: input });
  return data.apartado;
}

/** POST /api/apartados/:id/cancel → { apartado } (409 unless pending). */
export async function cancelApartado(id) {
  const data = await apiRequest(`/api/apartados/${id}/cancel`, { method: 'POST' });
  return data.apartado;
}

/** POST /api/apartados/:id/pay → { apartado } (overpayment surfaces as ApiError). */
export async function payApartado(id, body) {
  const data = await apiRequest(`/api/apartados/${id}/pay`, { method: 'POST', body });
  return data.apartado;
}

/** List query: keyed by the filters object so status changes refetch. */
export function useApartados(filters) {
  return useQuery({
    queryKey: [APARTADOS_KEY[0], filters],
    queryFn: ({ signal }) => getApartados(filters, { signal }),
  });
}

/**
 * Mutation actions that invalidate the apartado list; create/cancel also
 * invalidate products (stock moved) and customers (open balance changed).
 */
export function useApartadoMutations() {
  const queryClient = useQueryClient();

  async function invalidate(keys) {
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  }

  return {
    async create(input) {
      const apartado = await createApartado(input);
      await invalidate([APARTADOS_KEY, ['products'], ['customers'], COLLECTIONS_KEY]);
      return apartado;
    },
    async cancel(id) {
      const apartado = await cancelApartado(id);
      await invalidate([APARTADOS_KEY, ['products'], ['customers'], COLLECTIONS_KEY]);
      return apartado;
    },
    async pay(id, body) {
      const apartado = await payApartado(id, body);
      await invalidate([APARTADOS_KEY, ['customers'], COLLECTIONS_KEY]);
      return apartado;
    },
  };
}