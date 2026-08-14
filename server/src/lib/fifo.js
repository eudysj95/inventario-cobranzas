// Pure FIFO allocation for abonos (task 4.4, extracted for task 7.1 RED unit
// coverage). No database, no pg: the payments route supplies the customer's
// open debts already locked and ordered (created_at, id); this module computes
// the exact cents-safe allocation the route then persists.

// Money stays exact through the FIFO math: convert to integer cents for
// allocation (the route writes back NUMERIC as fixed 2-decimal strings).
const toCents = (n) => Math.round(n * 100);

/**
 * Allocate amountCents across open debts oldest-first. Each debt is consumed
 * until the payment is exhausted; a debt closes when its balance reaches 0.
 * A payment may span several debts. The caller rejects overpayments before
 * calling (amount > total balance); allocation clamps defensively and reports
 * the leftover in `remaining`.
 *
 * @param {Array<{id: string, balance: number}>} debts open debts in FIFO order
 * @param {number} amountCents payment in integer cents
 * @returns {{allocations: Array<{debt_id: string, amountCents: number}>,
 *            updates: Array<{debt_id: string, newBalanceCents: number}>,
 *            remaining: number}}
 */
export function allocateFifo(debts, amountCents) {
  const allocations = [];
  const updates = [];
  let remaining = amountCents;

  for (const debt of debts) {
    if (remaining <= 0) break;
    const balanceCents = toCents(debt.balance);
    const allocCents = Math.min(balanceCents, remaining);
    if (allocCents <= 0) continue;

    allocations.push({ debt_id: debt.id, amountCents: allocCents });
    updates.push({ debt_id: debt.id, newBalanceCents: balanceCents - allocCents });
    remaining -= allocCents;
  }

  return { allocations, updates, remaining };
}