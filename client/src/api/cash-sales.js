// Cash-sales API client (task 6.4). Consumes the server cash-sales routes
// (server/src/routes/cash-sales.js):
//   POST /api/cash-sales    create {customerId, lines:[{productId, units,
//                             price?}]} — atomic TXN, decrements stock per line,
//                             no due_date
//   GET  /api/cash-sales/:saleId — sale header + its lines
//
// Cash-sale mutations invalidate PRODUCTS_KEY (stock changes), and also
// CUSTOMERS_KEY and COLLECTIONS_KEY for consistency, though cash sales
// do NOT open debts or affect collection balances directly.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';
import { PRODUCTS_KEY } from './products.js';
import { CUSTOMERS_KEY } from './customers.js';
import { COLLECTIONS_KEY } from './collections.js';

export const CASH_SALES_KEY = ['cash-sales'];

/** POST /api/cash-sales {customerId, lines[{productId, units}, price?]} → { sale }. */
export async function createCashSale(customerId, lines) {
  const body = { customerId, lines };
  const data = await apiRequest('/api/cash-sales', { method: 'POST', body });
  return data.sale;
}

/** GET /api/cash-sales/:saleId → sale detail (404 surfaces as ApiError). */
export async function getCashSale(saleId, { signal } = {}) {
  const data = await apiRequest(`/api/cash-sales/${saleId}`, { signal });
  return data.sale;
}

/** Detail query for a cash sale; disabled until a saleId exists. */
export function useCashSaleDetail(saleId) {
  return useQuery({
    queryKey: [CASH_SALES_KEY[0], 'detail', saleId],
    queryFn: ({ signal }) => getCashSale(saleId, { signal }),
    enabled: Boolean(saleId),
  });
}

/** Mutation actions for cash-sale creation with cache invalidation.

 * On success: invalidates PRODUCTS_KEY (stock was decremented).
 * CUSTOMERS_KEY and COLLECTIONS_KEY are also touched for consistency,
 * but cash sales do NOT open debts so collections balances are not directly
 * affected.
 */
export function useCashSaleMutations() {
  const queryClient = useQueryClient();

  return {
    async create(customerId, lines) {
      const sale = await createCashSale(customerId, lines);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
        queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
        queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY }),
      ]);
      return sale;
    },
  };
}