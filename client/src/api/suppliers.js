// Suppliers API client (tasks 5.1 server / 6.5 client). Consumes the server
// suppliers routes (server/src/routes/suppliers.js):
//   GET /api/suppliers?search — list { suppliers: [{ id, name }] } ordered by
//   name; optional ILIKE name search.
//
// Suppliers are auto-upserted BY NAME server-side: POST /api/supplier-debts
// creates the supplier row when the name is new (the page never calls POST
// /api/suppliers directly — the debt form is the entry point).

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client.js';

export const SUPPLIERS_KEY = ['suppliers'];

/** GET /api/suppliers?search → array of supplier rows { id, name }. */
export async function getSuppliers(search = '', { signal } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const qs = params.toString();
  const data = await apiRequest(`/api/suppliers${qs ? `?${qs}` : ''}`, { signal });
  return data.suppliers ?? [];
}

/** Supplier list query keyed by the search string. */
export function useSuppliers(search = '') {
  return useQuery({
    queryKey: [SUPPLIERS_KEY[0], search],
    queryFn: ({ signal }) => getSuppliers(search, { signal }),
  });
}