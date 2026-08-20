// Customers API client (task 6.4). Consumes the server customers routes
// (server/src/routes/customers.js):
//   GET /api/customers?search  list with open balance SUM (open debts +
//                              pending apartado remaining)
// // The payments panel and the apartado/credit-sale forms need the list (for
// // selects) and the detail (open debts with balances + payment history).

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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

// --- Mutations ---

/** POST /api/customers {name, phone?} → { customer }. */
export async function createCustomer(name, phone) {
  const body = { name };
  if (phone !== undefined && phone !== null) body.phone = phone;
  const data = await apiRequest('/api/customers', { method: 'POST', body });
  return data.customer;
}

/** PATCH /api/customers/:id {name?, phone?} → { customer }. */
export async function updateCustomer(id, { name, phone } = {}) {
  const body = {};
  if (name !== undefined && name !== null) body.name = name;
  if (phone !== undefined && phone !== null) body.phone = phone;
  const data = await apiRequest(`/api/customers/${id}`, {
    method: 'PATCH',
    body,
  });
  return data.customer;
}

/** DELETE /api/customers/:id → { ok: true } (409 if has history/FK RESTRICT). */
export async function deleteCustomer(id) {
  return apiRequest(`/api/customers/${id}`, { method: 'DELETE' });
}

/** Mutation actions for customer CRUD with cache invalidation.

 * On success: invalidates CUSTOMERS_KEY, APARTADOS_KEY, COLLECTIONS_KEY
 * (creating/editing/borrar cliente afecta el balance open y la lista de selects).
 *
 * Returns an object with isCreating, isUpdating, isDeleting flags
 * plus the mutate functions. Callers can track loading state.
 */
export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return {
    /** POST /api/customers {name, phone?} → { customer }.
     * Sets isCreating true while the mutation is pending. */
    async create(name, phone) {
      setIsCreating(true);
      try {
        const customer = await createCustomer(name, phone);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
          queryClient.invalidateQueries({ queryKey: APARTADOS_KEY }),
          queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
        ]);
        return customer;
      } finally {
        setIsCreating(false);
      }
    },
    /** PATCH /api/customers/:id {name?, phone?} → { customer }.
     * Sets isUpdating true while the mutation is pending. */
    async update(id, { name, phone } = {}) {
      setIsUpdating(true);
      try {
        const customer = await updateCustomer(id, { name, phone });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
          queryClient.invalidateQueries({ queryKey: APARTADOS_KEY }),
          queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
        ]);
        return customer;
      } finally {
        setIsUpdating(false);
      }
    },
    /** DELETE /api/customers/:id → { ok: true } (409 if has history/FK RESTRICT).
     * Sets isDeleting true while the mutation is pending. */
    async remove(id) {
      setIsDeleting(true);
      try {
        await deleteCustomer(id);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
          queryClient.invalidateQueries({ queryKey: APARTADOS_KEY }),
          queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
        ]);
      } finally {
        setIsDeleting(false);
      }
    },
    // Expose the loading state flags
    isCreating,
    isUpdating,
    isDeleting,
  };
}