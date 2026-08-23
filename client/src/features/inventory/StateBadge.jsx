// Dominant-state badge — Nexo design system.
// Single chip for form summary (table shows full chip group via ProductRow).

import { dominantState, STATE_CHIPS } from './stateChips.js';

const STATE_CHIP_MAP = {
  apartado: 'danger',    // red
  credit: 'success',     // green
  available: 'info',     // blue
  sold: 'neutral',       // gray
};

export default function StateBadge({ product }) {
  const state = dominantState(product);
  const meta = STATE_CHIPS.find((chip) => chip.state === state) ?? STATE_CHIPS[3];
  const count = Number(product[`${state}_units`]) || 0;

  return (
    <span
      className={`chip chip-${STATE_CHIP_MAP[state] || 'neutral'}`}
      title={`${meta.label}: ${count} unidades`}
      style={{ fontSize: 'var(--text-xs)' }}
    >
      {meta.key} {count}
    </span>
  );
}