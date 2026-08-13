// Credit sale form (task 6.4). Fields: customer (select) + dynamic line items
// (product select, units, OPTIONAL per-line price that overrides the catalog
// price when provided) + optional due date. Stock is decremented PER LINE in
// ONE server TXN — any failing line rolls back the whole sale (atomic per-line
// stock behavior); the client just sends the body. Blank price means "use the
// catalog price" (server: "explicit value wins, otherwise the catalog price").
// UI copy in neutral Spanish.

import { useState } from 'react';
import { useCustomers } from '../../api/customers.js';
import { useProducts } from '../../api/products.js';
import { buildCreditSaleBody } from '../../api/credit-sales.js';

const EMPTY_LINE = { productId: '', units: '', price: '' };

function validate(values) {
  if (!values.customerId) return 'Debe seleccionar un cliente.';
  if (values.lines.length === 0) return 'Debe agregar al menos una línea.';
  for (const [i, line] of values.lines.entries()) {
    if (!line.productId) return `La línea ${i + 1} debe tener un producto.`;
    if (!Number.isInteger(Number(line.units)) || Number(line.units) <= 0) {
      return `La línea ${i + 1} debe tener unidades enteras mayores a cero.`;
    }
    if (line.price !== '' && (!Number.isFinite(Number(line.price)) || Number(line.price) <= 0)) {
      // Explicit price 0 must be rejected client-side: the server accepts
      // price >= 0 but the DB CHECK (amount > 0) then 500s on a zero line.
      return `La línea ${i + 1} debe tener un precio mayor a cero (o vacío para usar el precio de catálogo).`;
    }
  }
  return null;
}

export default function CreditSaleForm({ onSubmit, onCancel }) {
  const { data: customers = [] } = useCustomers('');
  const { data: products = [] } = useProducts({});

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
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

    const values = { customerId, lines, dueDate };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(buildCreditSaleBody(values));
    } catch (err) {
      // Server "Insufficient stock for one or more lines — nothing was recorded"
      // surfaces verbatim: the whole sale rolled back, nothing was recorded.
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label="Venta a crédito">
      <form className="product-form credit-form" onSubmit={handleSubmit}>
        <h2>Venta a crédito</h2>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="credit-customer">
          Cliente
          <select
            id="credit-customer"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            autoFocus
            required
            disabled={submitting}
          >
            <option value="">Seleccionar…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <div className="credit-lines">
          <h3>Líneas</h3>
          {lines.map((line, index) => (
            <div className="credit-line" key={index}>
              <label htmlFor={`credit-line-${index}-product`}>
                Producto
                <select
                  id={`credit-line-${index}-product`}
                  value={line.productId}
                  onChange={(event) => updateLine(index, 'productId', event.target.value)}
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
              <label htmlFor={`credit-line-${index}-units`}>
                Unidades
                <input
                  id={`credit-line-${index}-units`}
                  type="number"
                  min="1"
                  step="1"
                  value={line.units}
                  onChange={(event) => updateLine(index, 'units', event.target.value)}
                  disabled={submitting}
                />
              </label>
              <label htmlFor={`credit-line-${index}-price`}>
                Precio (opcional)
                <input
                  id={`credit-line-${index}-price`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Catálogo"
                  value={line.price}
                  onChange={(event) => updateLine(index, 'price', event.target.value)}
                  disabled={submitting}
                />
              </label>
              <button
                type="button"
                className="credit-line-remove"
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

        <label htmlFor="credit-due">
          Fecha de vencimiento (opcional)
          <input
            id="credit-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={submitting}
          />
        </label>

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