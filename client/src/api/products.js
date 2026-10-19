// Products API client (task 6.3). Consumes the server products routes
// (server/src/routes/products.js):
//   GET    /api/products?search&state   list with derived per-unit state (view)
//   POST   /api/products                create {name, description?, price?, quantity?}
//   GET    /api/products/:id            detail + open apartados/debts
//   PATCH  /api/products/:id            edit; quantity is a SIGNED stock adjustment
//   DELETE /api/products/:id            409-guarded delete
//
// Variant routes (Fase 1 — variantes de producto):
//   POST   /api/products/:id/variants           create {name, sku?, stock?,
//                                                 min_stock?, critical_stock?,
//                                                 position?, attributes: []} -> 201
//   GET    /api/products/:id/variants           list sorted by position with attributes
//   PATCH  /api/products/:id/variants/:vid/stock  { delta } signed, stock >= 0
//   PATCH  /api/products/:id/variants/:vid/active { active }
// Every variant mutation invalidates the ['products'] query cache so the
// product list and detail views (including derived parent stock) refetch
// (R10: parent cache invalidation).
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

/** GET /api/products/:id/variants → array of variants with their attributes. */
export async function getVariants(productId, { signal } = {}) {
  const data = await apiRequest(`/api/products/${productId}/variants`, { signal });
  return data.variants ?? [];
}

/** POST /api/products/:id/variants → { variant }. */
export async function createVariant(productId, input) {
  const data = await apiRequest(`/api/products/${productId}/variants`, {
    method: 'POST',
    body: input,
  });
  return data.variant;
}

/** PATCH /api/products/:id/variants/:variantId/stock → { variant }. */
export async function updateVariantStock(productId, variantId, delta) {
  const data = await apiRequest(
    `/api/products/${productId}/variants/${variantId}/stock`,
    { method: 'PATCH', body: { delta } }
  );
  return data.variant;
}

/** PATCH /api/products/:id/variants/:variantId/active → { ok: true }. */
export async function setVariantActive(productId, variantId, active) {
  return apiRequest(
    `/api/products/${productId}/variants/${variantId}/active`,
    { method: 'PATCH', body: { active } }
  );
}

/** Signed delta the variant stock endpoint expects: target − current. */
export function variantStockDelta(currentStock, targetStock) {
  return targetStock - currentStock;
}

/**
 * Alert badge for a variant, evaluated on the fly (spec R9 — no stored state):
 * stock <= critical_stock → 'critical'; stock <= min_stock → 'min'; else null.
 */
export function variantAlert(variant) {
  if (variant.stock <= variant.critical_stock) return 'critical';
  if (variant.stock <= variant.min_stock) return 'min';
  return null;
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

/** Variants of one product. Keyed by product id; disabled until an id exists. */
export function useVariants(productId) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, 'variants', productId],
    queryFn: ({ signal }) => getVariants(productId, { signal }),
    enabled: Boolean(productId),
  });
}

/**
 * Variant mutations. Every success invalidates every ['products']-prefixed
 * query (list, detail and the variants of the affected product) so the
 * parent's derived stock and UI stay consistent (R10).
 */
export function useVariantMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });

  return {
    async create(productId, input) {
      const variant = await createVariant(productId, input);
      await invalidate();
      return variant;
    },
    async updateStock(productId, variantId, delta) {
      const variant = await updateVariantStock(productId, variantId, delta);
      await invalidate();
      return variant;
    },
    async setActive(productId, variantId, active) {
      await setVariantActive(productId, variantId, active);
      await invalidate();
    },
  };
}
