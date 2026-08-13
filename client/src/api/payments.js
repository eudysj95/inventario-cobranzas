// Payments (abonos) API client (task 6.4). Consumes the server payments routes
// (server/src/routes/payments.js):
//   POST /api/payments    {customerId, amount, note?} — FIFO allocation is
//                         SERVER-SIDE: the client sends only customer + amount
//                         (+ optional note) and receives { payment,
//                         allocations:[{debt_id, amount}] }; overpayment and
//                         no-open-debts are rejected with 400
//   GET  /api/payments?customerId — payment history with allocations
//
// All requests go through the shared wrapper. A payment reduces the customer's
// open balances, so the customers cache is invalidated after a success.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';

export const PAYMENTS_KEY = ['payments'];

/**
 * Payment body: { customerId, amount, note? }. The note is optional — trim it
 * and omit it when blank, matching the apartado pay convention.
 */
export function buildPaymentBody(customerId, amount, note) {
  const body = { customerId, amount: Number(amount) };
  if (note !== undefined && note !== null && note.trim() !== '') {
    body.note = note.trim();
  }
  return body;
}

/** POST /api/payments → { payment, allocations } (FIFO result). */
export async function createPayment(input) {
  return apiRequest('/api/payments', { method: 'POST', body: input });
}

/** GET /api/payments?customerId → array of payment rows with allocations. */
export async function getPayments(customerId, { signal } = {}) {
  const params = new URLSearchParams();
  if (customerId) params.set('customerId', customerId);
  const qs = params.toString();
  const data = await apiRequest(`/api/payments${qs ? `?${qs}` : ''}`, { signal });
  return data.payments ?? [];
}

/** History query for a customer; disabled until a customerId exists. */
export function usePayments(customerId) {
  return useQuery({
    queryKey: [PAYMENTS_KEY[0], customerId],
    queryFn: ({ signal }) => getPayments(customerId, { signal }),
    enabled: Boolean(customerId),
  });
}

/** Payment mutation that invalidates payments history and customer balances. */
export function usePaymentMutations() {
  const queryClient = useQueryClient();

  return {
    async create(input) {
      const result = await createPayment(input);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
      ]);
      return result;
    },
  };
}