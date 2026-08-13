// Collections due-view API client (tasks 4.5 server / 6.5 client). Consumes
// GET /api/collections/due?horizonDays=N (server/src/routes/collections.js):
//   { customers: [{ customerId, name, phone, totalOpen,
//                   items: [{ type: 'apartado'|'credit', amount, dueDate }],
//                   overdue }] }
// Items are already grouped per customer server-side (JSON_AGG) and ordered
// by name; overdue is true when any collected item is past due. The client
// adds PURE grouping helpers used by CollectionsPage (split by overdue flag,
// type badge labels).

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client.js';

export const COLLECTIONS_KEY = ['collections'];

/** GET /api/collections/due?horizonDays=N → array of due customers. */
export async function getCollectionsDue(horizonDays = 7, { signal } = {}) {
  const data = await apiRequest(
    `/api/collections/due?horizonDays=${horizonDays}`,
    { signal }
  );
  return data.customers ?? [];
}

/** Due-view query keyed by the horizon so changing it refetches. */
export function useCollectionsDue(horizonDays = 7) {
  return useQuery({
    queryKey: [COLLECTIONS_KEY[0], { horizonDays }],
    queryFn: ({ signal }) => getCollectionsDue(horizonDays, { signal }),
  });
}

// --- pure helpers (unit-tested; no hooks) ---

// Spanish badge labels for the item type (neutral, professional).
export const COLLECTION_TYPE_LABELS = {
  apartado: 'Apartado',
  credit: 'Crédito',
};

/** Badge label for an item type; unknown types fall back to the raw value. */
export function collectionTypeLabel(type) {
  return COLLECTION_TYPE_LABELS[type] ?? type;
}

/**
 * Split due customers by their overdue flag: overdue customers (at least one
 * item past due) first, then upcoming ones. Pure — used by CollectionsPage to
 * render "Vencidos" and "Próximos" sections.
 */
export function groupDueCustomers(customers) {
  const overdue = [];
  const upcoming = [];
  for (const customer of customers ?? []) {
    (customer.overdue ? overdue : upcoming).push(customer);
  }
  return { overdue, upcoming };
}