// Per-unit state breakdown chips (task 6.3, approved design amendment A).
//
// The server's product_states view (db/schema.sql) derives per-unit columns for
// every product — apartado_units, credit_units, available_units, sold_units —
// plus a dominant `state`. Instead of showing ONE dominant badge, the inventory
// table shows a CHIP PER NON-ZERO STATE WITH ITS COUNT, in precedence order
// (apartado > credit > available > sold). Pure module: no React imports, so
// vitest covers it without component tooling (precedent: auth/guard.js).

export const STATE_CHIPS = [
  { key: 'A', label: 'Apartado', state: 'apartado', color: 'red' },
  { key: 'C', label: 'Credit', state: 'credit', color: 'green' },
  { key: 'Disp', label: 'Available', state: 'available', color: 'blue' },
  { key: 'S', label: 'Sold', state: 'sold', color: 'gray' },
];

// View column that holds the count for each chip state.
const COUNT_COLUMN = {
  apartado: 'apartado_units',
  credit: 'credit_units',
  available: 'available_units',
  sold: 'sold_units',
};

/**
 * Chips with counts for a product view row, in precedence order, including only
 * states that currently hold units. A chip is the statement "N units are in
 * this state"; a zero count renders nothing.
 */
export function buildStateChips(product) {
  return STATE_CHIPS.map((meta) => ({
    ...meta,
    count: Number(product[COUNT_COLUMN[meta.state]]) || 0,
  })).filter((chip) => chip.count > 0);
}

/**
 * Dominant display state for a row, mirroring the view's precedence rule
 * apartado > credit > available > sold. A product with no units anywhere is
 * 'sold' (matches the view's ELSE branch).
 */
export function dominantState(product) {
  const [first] = buildStateChips(product);
  return first ? first.state : 'sold';
}