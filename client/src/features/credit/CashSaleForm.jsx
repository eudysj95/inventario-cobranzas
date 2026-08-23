// Cash-sale form (task S4.1). Fields: customerId (select con CustomerSelect +
// toggle "Nuevo cliente"), productId (select con productos del inventario),
// units > 0, price (explicito o catálogo - omitted → price de catálogo),
// total (computed: units * price).
// validate() devuelve string error si falta customerId o units <= 0.
// On submit: POST /api/cash-sales; the page handles navigation to
// `/venta/:saleId` on success.
// Nexo design system: modal, form, inputs, buttons via utilities.

import { useState } from 'react';
import { useCustomers } from '../../api/customers.js';
import { useProducts } from '../../api/products.js';
import CustomerSelect from '../../features/customer/CustomerSelect.jsx';
import { formatCurrency } from '../../lib/format.js';

const EMPTY_LINE = { productId: '', units: '', price: '' };

function validate(values) {
  if (!values.customerId) return 'Debe seleccionar un cliente.';
  for (const [i, line] of values.lines.entries()) {
    if (!line.productId) return `La línea ${i + 1} debe tener un producto.`;
    if (!Number.isInteger(Number(line.units)) || Number(line.units) <= 0) {
      return `La línea ${i + 1} debe tener unidades enteras mayores a cero.`;
    }
  }
  return null;
}

export default function CashSaleForm({ onSubmit, onCancel }) {
  const { data: customers = [], isPending: customersPending } = useCustomers('');
  const { data: products = [], isPending: productsPending } = useProducts({});
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateLine(index, field, value) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const values = { customerId, lines };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ customerId, lines });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Venta de contado">
      <form id="cash-form" className="modal" onSubmit={handleSubmit} style={{ maxWidth: '48rem' }}>
        <div className="modal-header">
          <h2 className="modal-title">Venta de contado</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <CustomerSelect
            onSelect={(customerId) => setCustomerId(customerId)}
            initialCustomerId={customerId}
            allowCreate
          />

          <div style={{ marginTop: 'var(--space-4)' }}>
            <h3 className="mb-3" style={{ fontSize: 'var(--text-lg)' }}>Líneas</h3>
            {lines.map((line, index) => (
              <div key={index} className="card p-3 mb-3" style={{ border: '1px solid var(--color-border)' }}>
                <div className="form-row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="form-row" style={{ flex: '1 1 200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label htmlFor={`cash-line-${index}-product`} className="label">Producto</label>
                    <select
                      id={`cash-line-${index}-product`}
                      value={line.productId}
                      onChange={(event) =>
                        updateLine(index, 'productId', event.target.value)
                      }
                      disabled={submitting}
                      className="input select"
                    >
                      <option value="">Seleccionar…</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.available_units} disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row" style={{ flex: '0 1 100px', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label htmlFor={`cash-line-${index}-units`} className="label">Unidades</label>
                    <input
                      id={`cash-line-${index}-units`}
                      type="number"
                      min="1"
                      step="1"
                      value={line.units}
                      onChange={(event) =>
                        updateLine(index, 'units', event.target.value)
                      }
                      disabled={submitting}
                      className="input"
                    />
                  </div>
                  <div className="form-row" style={{ flex: '1 1 140px', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label htmlFor={`cash-line-${index}-price`} className="label">Precio (opcional, catálogo si está vacío)</label>
                    <input
                      id={`cash-line-${index}-price`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Catálogo"
                      value={line.price}
                      onChange={(event) =>
                        updateLine(index, 'price', event.target.value)
                      }
                      disabled={submitting}
                      className="input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={submitting || lines.length === 1}
                    className="btn btn-danger btn-sm"
                    style={{ minHeight: 'var(--touch-target)' }}
                    aria-label={`Quitar línea ${index + 1}`}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addLine} disabled={submitting} className="btn btn-secondary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Agregar línea
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true"></span>
                Guardando…
              </>
            ) : (
              'Registrar venta'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}