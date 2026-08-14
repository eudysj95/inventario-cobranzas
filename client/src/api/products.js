// Products API client (task 6.3). Consumes the server products routes
// (server/src/routes/products.js):
//   GET    /api/products?search&state   list with derived per-unit state (view)
//   POST   /api/products                create {name, description?, price?, quantity?}
//   GET    /api/products/:id            detail + open apartados/debts
//   PATCH  /api/products/:id            edit; quantity is a SIGNED stock adjustment
//   DELETE /api/products/:id            409-guarded delete
//
// All requests go through the shared wrapper (same-origin, session cookie sent
// automatically) and every mutation invalidates the ['products'] query cache so
// the list and any open detail views refetch.
//
// PATCH DELTA CONTRACT (slice-3 deviation, honored here): the server ADDS the
// `quantity` value to current stock (positive restocks, negative removes units,
// never below 0). Forms must convert the entered ABSOLUTE target into that
// signed delta — quantityAdjustmentBody does exactly that, and the inventory
// form is the only caller that touches quantity.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';

export const PRODUCTS_KEY = ['products'];

/** Signed adjustment the PATCH endpoint expects: target − current. */
export function quantityDelta(currentQuantity, targetQuantity) {
  return targetQuantity - currentQuantity;
}

/**
 * PATCH body for a quantity change. Returns { quantity: delta } when the target
 * differs from current, {} otherwise — the server rejects an empty update
 * ("No fields to update"), so an unchanged quantity must be omitted entirely.
 */
export function quantityAdjustmentBody(currentQuantity, targetQuantity) {
  const delta = quantityDelta(currentQuantity, targetQuantity);
  return delta === 0 ? {} : { quantity: delta };
}

/** GET /api/products?search&state → array of view rows. */
export async function getProducts(filters = {}, { signal } = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.state) params.set('state', filters.state);
  const qs = params.toString();
  const data = await apiRequest(`/api/products${qs ? `?${qs}` : ''}`, { signal });
  return data.products ?? [];
}

/** POST /api/products → { product }. */
export async function createProduct(input) {
  const data = await apiRequest('/api/products', { method: 'POST', body: input });
  return data.product;
}

/** GET /api/products/:id → { product, open_apartados, open_debts }. */
export async function getProduct(id, { signal } = {}) {
  return apiRequest(`/api/products/${id}`, { signal });
}

/** PATCH /api/products/:id → { product }. */
export async function updateProduct(id, patch) {
  const data = await apiRequest(`/api/products/${id}`, { method: 'PATCH', body: patch });
  return data.product;
}

/** DELETE /api/products/:id → { ok: true } (409 guards surface as ApiError). */
export async function deleteProduct(id) {
  return apiRequest(`/api/products/${id}`, { method: 'DELETE' });
}

/** List query: keyed by the filters object so search/state changes refetch. */
export function useProducts(filters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY[0], filters],
    queryFn: ({ signal }) => getProducts(filters, { signal }),
  });
}

/** Detail query: disabled until an id exists. */
export function useProduct(id) {
  return useQuery({
    queryKey: [PRODUCTS_KEY[0], 'detail', id],
    queryFn: ({ signal }) => getProduct(id, { signal }),
    enabled: Boolean(id),
  });
}

/** Mutation actions that invalidate every ['products']-prefixed query on success. */
export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });

  return {
    async create(input) {
      const product = await createProduct(input);
      await invalidate();
      return product;
    },
    async update(id, patch) {
      const product = await updateProduct(id, patch);
      await invalidate();
      return product;
    },
    async remove(id) {
      await deleteProduct(id);
      await invalidate();
    },
  };
}
