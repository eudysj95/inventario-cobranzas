// Supplier-debts API client (tasks 5.1+5.2 server / 6.5 client). Consumes the
// server supplier-debts routes (server/src/routes/supplier-debts.js):
//   POST /api/supplier-debts            create { supplierName, amount, dueDate }
//                                       — AUTO-UPSERTS the supplier by name in
//                                       the same TXN; balance opens at full
//   GET  /api/supplier-debts?status     list ordered by due date, { debts:
//                                       [{ supplier_name, amount, balance,
//                                       due_date, status, overdue, ... }] }
//   POST /api/supplier-debts/:id/pay    { amount } — reduce balance TXN,
//                                       overpayment 400, closed debt 409
//   GET  /api/supplier-debts/due?horizonDays — due view with overdue + soon_due
//                                       flags
//
// All requests go through the shared wrapper. Creating a debt may auto-upsert
// a supplier, so the suppliers cache is invalidated too.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client.js';
import { SUPPLIERS_KEY } from './suppliers.js';

export const SUPPLIER_DEBTS_KEY = ['supplier-debts'];

/**
 * Form-to-body mapper for creating a supplier debt. supplierName is trimmed
 * (server stores the canonical trimmed name — exact string matching);
 * amount is number-converted; dueDate must be strict YYYY-MM-DD (server
 * validates the calendar date).
 */
export function buildSupplierDebtBody(values) {
  return {
    supplierName: (values.supplierName ?? '').trim(),
    amount: Number(values.amount),
    dueDate: values.dueDate,
  };
}

/** Pay body: { amount } as a number (server rejects overpayment with 400). */
export function buildSupplierPayBody(amount) {
  return { amount: Number(amount) };
}

/**
 * Client-side overpay guard for the supplier pay form: mirrors the server's
 * "Payment exceeds the remaining balance of the supplier debt". Compared in
 * cents so float math (0.1 + 0.2 !== 0.3) cannot falsely trip it.
 */
export function supplierPayExceedsBalance(amount, balance) {
  return Math.round(amount * 100) > Math.round(balance * 100);
}

/** POST /api/supplier-debts → { debt } (auto-upserts the supplier). */
export async function createSupplierDebt(input) {
  const data = await apiRequest('/api/supplier-debts', { method: 'POST', body: input });
  return data.debt;
}

/** GET /api/supplier-debts?status → array of debt rows (open|closed filter). */
export async function getSupplierDebts(status = '', { signal } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString();
  const data = await apiRequest(`/api/supplier-debts${qs ? `?${qs}` : ''}`, { signal });
  return data.debts ?? [];
}

/** GET /api/supplier-debts/due?horizonDays → array of due debts with flags. */
export async function getSupplierDebtsDue(horizonDays = 7, { signal } = {}) {
  const data = await apiRequest(
    `/api/supplier-debts/due?horizonDays=${horizonDays}`,
    { signal }
  );
  return data.debts ?? [];
}

/** POST /api/supplier-debts/:id/pay → { debt } (overpayment 400 surface). */
export async function paySupplierDebt(id, body) {
  const data = await apiRequest(`/api/supplier-debts/${id}/pay`, {
    method: 'POST',
    body,
  });
  return data.debt;
}

/** Debt list query keyed by the status filter. */
export function useSupplierDebts(status = '') {
  return useQuery({
    queryKey: [SUPPLIER_DEBTS_KEY[0], { status }],
    queryFn: ({ signal }) => getSupplierDebts(status, { signal }),
  });
}

/** Due-view query keyed by the horizon. */
export function useSupplierDebtsDue(horizonDays = 7) {
  return useQuery({
    queryKey: [SUPPLIER_DEBTS_KEY[0], 'due', { horizonDays }],
    queryFn: ({ signal }) => getSupplierDebtsDue(horizonDays, { signal }),
  });
}

/**
 * Mutations that invalidate the debt caches: creating a debt may auto-upsert
 * a supplier (suppliers cache) and paying changes balance/status in both the
 * list and the due view (shared prefix ['supplier-debts']).
 */
export function useSupplierDebtMutations() {
  const queryClient = useQueryClient();

  async function invalidateDebts() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SUPPLIER_DEBTS_KEY }),
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
    ]);
  }

  return {
    async create(input) {
      const debt = await createSupplierDebt(input);
      await invalidateDebts();
      return debt;
    },
    async pay(id, amount) {
      const debt = await paySupplierDebt(id, buildSupplierPayBody(amount));
      await invalidateDebts();
      return debt;
    },
  };
}