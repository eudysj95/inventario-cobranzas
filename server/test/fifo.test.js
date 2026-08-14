// Unit tests for the pure FIFO allocation used by POST /api/payments (task 4.4
// algorithm, extracted for RED unit coverage in task 7.1).
//
// No database, no pg, no supertest: this proves the money math — oldest-first
// allocation across open debts, partial payments spanning debts, exact-full
// closure, and the defensive overpay clamp — with deterministic fixtures.
//
// Convention (matches the REAL route, server/src/routes/payments.js):
//   - balances are DOLLARS (NUMERIC like the DB reads them; toCents * 100)
//   - amounts are INTEGER CENTS (what the route passes after toCents(amount))
// So `balance: 0.50` is fifty cents and `amountCents: 100` is one dollar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allocateFifo } from '../src/lib/fifo.js';

test('allocates oldest-first across three debts (exact FIFO order)', () => {
  const result = allocateFifo(
    [
      { id: 'd1', balance: 0.5 },
      { id: 'd2', balance: 0.4 },
      { id: 'd3', balance: 0.3 },
    ],
    100
  );
  assert.deepEqual(
    result.allocations.map((a) => [a.debt_id, a.amountCents]),
    [
      ['d1', 50],
      ['d2', 40],
      ['d3', 10],
    ]
  );
  assert.deepEqual(
    result.updates.map((u) => [u.debt_id, u.newBalanceCents]),
    [
      ['d1', 0],
      ['d2', 0],
      ['d3', 20],
    ]
  );
  assert.equal(result.remaining, 0, 'exact payment consumes every cent');
});

test('partial payment spans the oldest debt and a slice of the next', () => {
  const result = allocateFifo(
    [
      { id: 'd1', balance: 0.5 },
      { id: 'd2', balance: 0.4 },
    ],
    60
  );
  assert.deepEqual(
    result.allocations.map((a) => [a.debt_id, a.amountCents]),
    [
      ['d1', 50],
      ['d2', 10],
    ]
  );
  // d1 closed at 0; d2 keeps the remainder open.
  assert.deepEqual(
    result.updates.map((u) => [u.debt_id, u.newBalanceCents]),
    [
      ['d1', 0],
      ['d2', 30],
    ]
  );
  assert.equal(result.remaining, 0);
});

test('payment that fits the oldest debt leaves newer debts untouched', () => {
  const result = allocateFifo(
    [
      { id: 'd1', balance: 0.5 },
      { id: 'd2', balance: 0.4 },
    ],
    30
  );
  assert.deepEqual(result.allocations, [{ debt_id: 'd1', amountCents: 30 }]);
  // Only the touched debt is written back; d2's balance is unchanged.
  assert.deepEqual(result.updates, [{ debt_id: 'd1', newBalanceCents: 20 }]);
  assert.equal(result.remaining, 0);
});

test('exact full payment closes every debt at balance 0', () => {
  const result = allocateFifo(
    [
      { id: 'd1', balance: 0.5 },
      { id: 'd2', balance: 0.4 },
    ],
    90
  );
  assert.deepEqual(result.allocations, [
    { debt_id: 'd1', amountCents: 50 },
    { debt_id: 'd2', amountCents: 40 },
  ]);
  assert.deepEqual(result.updates, [
    { debt_id: 'd1', newBalanceCents: 0 },
    { debt_id: 'd2', newBalanceCents: 0 },
  ]);
  assert.equal(result.remaining, 0);
});

test('defensively clamps an overpayment instead of over-allocating', () => {
  // The route rejects overpayments before allocating (amount > total balance),
  // so this is defensive: never allocate more than a debt's balance.
  const result = allocateFifo(
    [
      { id: 'd1', balance: 0.5 },
      { id: 'd2', balance: 0.4 },
    ],
    200
  );
  assert.deepEqual(result.allocations, [
    { debt_id: 'd1', amountCents: 50 },
    { debt_id: 'd2', amountCents: 40 },
  ]);
  assert.equal(result.remaining, 110, 'leftover reported for the caller to reject');
});

test('no open debts yields no allocations and the full amount left over', () => {
  const result = allocateFifo([], 25);
  assert.deepEqual(result.allocations, []);
  assert.deepEqual(result.updates, []);
  assert.equal(result.remaining, 25);
});

test('a zero amount allocates nothing', () => {
  const result = allocateFifo([{ id: 'd1', balance: 0.5 }], 0);
  assert.deepEqual(result.allocations, []);
  assert.deepEqual(result.updates, []);
  assert.equal(result.remaining, 0);
});

test('dollar balance converts to the exact cent boundary (0.10 -> 10c)', () => {
  // Regression: proves the module treats balances as dollars (toCents * 100)
  // so a 0.10 debt exactly matches a 10-cent payment with no rounding residue.
  const result = allocateFifo([{ id: 'd1', balance: 0.1 }], 10);
  assert.deepEqual(result.allocations, [{ debt_id: 'd1', amountCents: 10 }]);
  assert.deepEqual(result.updates, [{ debt_id: 'd1', newBalanceCents: 0 }]);
  assert.equal(result.remaining, 0);
});
