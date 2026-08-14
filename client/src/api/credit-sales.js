// Credit-sales API client (task 6.4). Consumes the server credit-sales routes
// (server/src/routes/credit-sales.js):
//   POST /api/credit-sales    create {customerId, lines:[{productId, units,
//                             price?}], dueDate?} — decrements stock PER LINE in
//                             ONE TXN (any failing line rolls back the whole
//                             sale — atomic per-line stock behavior)
//   GET  /api/credit-sales/:saleId — sale header + its debt lines
//
// All requests go through the shared wrapper. Creating a sale moves stock and
// opens customer debts, so the products and customers caches are invalidated
// after a successful mutation.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';
import { COLLECTIONS_KEY } from './collections.js';
import { CUSTOMERS_KEY } from './customers.js';
import { PRODUCTS_KEY } from './products.js';

export const CREDIT_SALES_KEY = ['credit-sales'];

/**
 * Form-to-body mapper for a credit sale. A line's `price` overrides the
 * catalog price when provided; a blank price is OMITTED so the server falls
 * back to the catalog price (server: "explicit value wins, otherwise the
 * catalog price"). `dueDate` is optional; a blank date is omitted entirely.
 * Lines without a product are dropped (the form validates before building).
 */
export function buildCreditSaleBody(values) {
  const lines = values.lines
    .filter((line) => line.productId)
    .map((line) => {
      const mapped = { productId: line.productId, units: Number(line.units) };
      const price = Number(line.price);
      if (line.price !== '' && line.price !== null && line.price !== undefined && Number.isFinite(price)) {
        mapped.price = price;
      }
      return mapped;
    });

  const body = { customerId: values.customerId, lines };
  if (values.dueDate) body.dueDate = values.dueDate;
  return body;
}

/** POST /api/credit-sales → created sale { id, customer_name, total, lines }. */
export async function createCreditSale(input) {
  const data = await apiRequest('/api/credit-sales', { method: 'POST', body: input });
  return data.sale;
}

/** GET /api/credit-sales/:saleId → sale detail (404 surfaces as ApiError). */
export async function getCreditSale(saleId, { signal } = {}) {
  const data = await apiRequest(`/api/credit-sales/${saleId}`, { signal });
  return data.sale;
}

/** Detail query for a sale; disabled until a saleId exists. */
export function useSaleDetail(saleId) {
  return useQuery({
    queryKey: [CREDIT_SALES_KEY[0], 'detail', saleId],
    queryFn: ({ signal }) => getCreditSale(saleId, { signal }),
    enabled: Boolean(saleId),
  });
}

/** Create mutation that invalidates products (stock) and customers (debts). */
export function useCreditSaleMutations() {
  const queryClient = useQueryClient();

  return {
    async create(input) {
      const sale = await createCreditSale(input);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
        queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
        // New open debts may enter the collections due view.
        queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
      ]);
      return sale;
    },
  };
}