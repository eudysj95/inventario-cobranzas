// Unit tests for the per-unit state chip derivation (task 6.3, amendment A).
// Proves chips are computed from the view's per-unit counts, only non-zero
// states render, and the dominant state follows the view precedence
// apartado > credit > available > sold.
import { describe, expect, it } from 'vitest';
import { buildStateChips, dominantState } from './stateChips';

describe('buildStateChips', () => {
  it('returns chips in precedence order with counts', () => {
    const chips = buildStateChips({
      apartado_units: 2,
      credit_units: 1,
      available_units: 5,
      sold_units: 3,
    });
    expect(chips.map((c) => c.key)).toEqual(['A', 'C', 'Disp', 'S']);
    expect(chips.map((c) => c.count)).toEqual([2, 1, 5, 3]);
  });

  it('includes only states that currently hold units', () => {
    const chips = buildStateChips({
      apartado_units: 0,
      credit_units: 0,
      available_units: 4,
      sold_units: 0,
    });
    expect(chips).toEqual([
      expect.objectContaining({ key: 'Disp', state: 'available', count: 4 }),
    ]);
  });

  it('returns an empty chip list when every count is zero', () => {
    expect(
      buildStateChips({
        apartado_units: 0,
        credit_units: 0,
        available_units: 0,
        sold_units: 0,
      })
    ).toEqual([]);
  });

  it('tolerates missing count columns (defensive; the view always sends them)', () => {
    expect(buildStateChips({})).toEqual([]);
  });
});

describe('dominantState', () => {
  it('follows the view precedence apartado > credit > available > sold', () => {
    expect(
      dominantState({ apartado_units: 1, credit_units: 5, available_units: 9, sold_units: 2 })
    ).toBe('apartado');
    expect(dominantState({ apartado_units: 0, credit_units: 1, available_units: 9 })).toBe(
      'credit'
    );
    expect(dominantState({ apartado_units: 0, credit_units: 0, available_units: 3 })).toBe(
      'available'
    );
  });

  it('reports sold when no units remain anywhere', () => {
    expect(
      dominantState({
        apartado_units: 0,
        credit_units: 0,
        available_units: 0,
        sold_units: 0,
      })
    ).toBe('sold');
  });
});