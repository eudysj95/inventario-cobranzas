// Customers API client (task 6.4). Consumes the server customers routes
// (server/src/routes/customers.js):
//   GET /api/customers?search  list with open balance SUM (open debts +
//                              pending apartado remaining)
//   GET /api/customers/:id     detail: { customer, open_debts (with balances
//                              and product names), payments (history) }
//
// The payments panel and the apartado/credit-sale forms need the list (for
// selects) and the detail (open debts with balances + payment history).

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client.js';

export const CUSTOMERS_KEY = ['customers'];

/** GET /api/customers?search → array of customer rows with open_balance. */
export async function getCustomers(search = '', { signal } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const qs = params.toString();
  const data = await apiRequest(`/api/customers${qs ? `?${qs}` : ''}`, { signal });
  return data.customers ?? [];
}

/** GET /api/customers/:id → { customer, open_debts, payments }. */
export async function getCustomer(id, { signal } = {}) {
  return apiRequest(`/api/customers/${id}`, { signal });
}

/** List query: keyed by the search string so searches refetch. */
export function useCustomers(search) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY[0], search],
    queryFn: ({ signal }) => getCustomers(search, { signal }),
  });
}

/** Detail query for a customer; disabled until an id exists. */
export function useCustomer(id) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY[0], 'detail', id],
    queryFn: ({ signal }) => getCustomer(id, { signal }),
    enabled: Boolean(id),
  });
}