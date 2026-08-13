// One inventory table row (task 6.3). Shows name, the per-unit state chip group
// with counts (amendment A: A red, C green, Disp blue, S gray — not a single
// dominant badge), price, last update, and edit/delete actions. Pure
// presentation: data and callbacks come from InventoryTable/InventoryPage.
//
// NOTE: updated_at is a full TIMESTAMPTZ string ('2026-08-11T21:18:35.000Z'),
// NOT a date-only value — formatDate needs a Date instance for those
// (format.ts parseDate only splits 'YYYY-MM-DD').

import { formatCurrency, formatDate } from '../../lib/format.js';
import { buildStateChips } from './stateChips.js';

export default function ProductRow({ product, config, onEdit, onDelete }) {
  const chips = buildStateChips(product);

  return (
    <tr>
      <td>{product.name}</td>
      <td>
        <span className="chips">
          {chips.map((chip) => (
            <span
              key={chip.state}
              className={`chip chip--${chip.color}`}
              title={`${chip.label}: ${chip.count} units`}
            >
              {chip.key} {chip.count}
            </span>
          ))}
          <span className="chips-total" title={`${product.total_units} units in total`}>
            Total {product.total_units}
          </span>
        </span>
      </td>
      <td>{formatCurrency(product.price, config)}</td>
      <td>{formatDate(new Date(product.updated_at), config)}</td>
      <td>
        <button type="button" onClick={() => onEdit(product)}>
          Edit
        </button>{' '}
        <button type="button" onClick={() => onDelete(product)}>
          Delete
        </button>
      </td>
    </tr>
  );
}