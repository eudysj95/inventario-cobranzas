// Dominant-state badge (task 6.3, design "StateBadge"). The inventory table
// shows the full per-unit chip group (amendment A); this component renders the
// SINGLE dominant-state chip computed by dominantState() — used by the product
// form to summarize the current state while the row shows the whole breakdown.

import { dominantState, STATE_CHIPS } from './stateChips.js';

export default function StateBadge({ product }) {
  const state = dominantState(product);
  const meta = STATE_CHIPS.find((chip) => chip.state === state) ?? STATE_CHIPS[3];
  const count = Number(product[`${state}_units`]) || 0;

  return (
    <span className={`chip chip--${meta.color}`} title={`${meta.label}: ${count} units`}>
      {meta.key} {count}
    </span>
  );
}