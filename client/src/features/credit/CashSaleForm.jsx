// Cash-sale form (task S4.1). Fields: customerId (select con CustomerSelect +
// toggle "Nuevo cliente"), productId (select con productos del inventario),
// units > 0, price (explicito o catálogo - omitted → price de catálogo),
// total (computed: units * price).
// validate() devuelve string error si falta customerId o units <= 0.
// On submit: POST /api/cash-sales; the page handles navigation to
// `/venta/:saleId` on success.

import { useState } from 'react';
import { useCustomers } from '../../api/customers.js';
import { useProducts } from '../../api/products.js';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
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
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label="Venta de contado">
      <form className="product-form cash-form" onSubmit={handleSubmit}>
        <h2>Venta de contado</h2>

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

        <div className="cash-lines">
          <h3>Líneas</h3>
          {lines.map((line, index) => (
            <div className="cash-line" key={index}>
              <label htmlFor={`cash-line-${index}-product`}>
                Producto
                <select
                  id={`cash-line-${index}-product`}
                  value={line.productId}
                  onChange={(event) =>
                    updateLine(index, 'productId', event.target.value)
                  }
                  disabled={submitting}
                >
                  <option value="">Seleccionar…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.available_units} disponibles)
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor={`cash-line-${index}-units`}>
                Unidades
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
                />
              </label>
              <label htmlFor={`cash-line-${index}-price`}>
                Precio (opcional, catálogo si está vacío)
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
                />
              </label>
              <button
                type="button"
                className="cash-line-remove"
                onClick={() => removeLine(index)}
                disabled={submitting || lines.length === 1}
              >
                Quitar
              </button>
            </div>
          ))}
          <button type="button" onClick={addLine} disabled={submitting}>
            Agregar línea
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Registrar venta'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}