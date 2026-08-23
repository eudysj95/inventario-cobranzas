// One inventory table row — Nexo design system.
// Shows name, per-unit state chip group with counts, price, last update, edit/delete actions.

import { formatCurrency, formatDate } from '../../lib/format.js';
import { buildStateChips } from './stateChips.js';

const STATE_CHIP_MAP = {
  apartado: 'danger',    // red
  credit: 'success',     // green
  available: 'info',     // blue
  sold: 'neutral',       // gray
};

export default function ProductRow({ product, config, onEdit, onDelete }) {
  const chips = buildStateChips(product);

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{product.name}</div>
      </td>
      <td>
        <div className="chips" style={{ gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <span
              key={chip.state}
              className={`chip chip-${STATE_CHIP_MAP[chip.state] || 'neutral'}`}
              title={`${chip.label}: ${chip.count} unidades`}
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}
            >
              {chip.key} {chip.count}
            </span>
          ))}
          <span className="chips-total" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }} title={`${product.total_units} unidades en total`}>
            Total {product.total_units}
          </span>
        </div>
      </td>
      <td>{formatCurrency(product.price, config)}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(new Date(product.updated_at), config)}</td>
      <td>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="btn btn-secondary btn-sm"
            aria-label={`Editar ${product.name}`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="btn btn-danger btn-sm"
            aria-label={`Eliminar ${product.name}`}
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}