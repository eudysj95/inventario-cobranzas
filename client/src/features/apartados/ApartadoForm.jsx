// Apartado create form (task 6.4). Fields: customer (shared select),
// product (select), units, agreed price, due date (REQUIRED — the server
// rejects a missing dueDate with 400). Building the apartado reserves
// stock server-side in the same TXN as the insert. Uses the shared
// customers/products list queries; server guard messages (e.g. insufficient
// stock) surface verbatim via ApiError into the form error line. UI copy
// in neutral Spanish.
// Nexo design system: modal, form, inputs, buttons via utilities.

import { useState } from 'react';
import { useProducts } from '../../api/products.js';
import { buildApartadoBody } from '../../api/apartados.js';
import CustomerSelect from '../../features/customer/CustomerSelect.jsx';

function validate(values) {
  if (!values.customerId) return 'Debe seleccionar un cliente.';
  if (!values.productId) return 'Debe seleccionar un producto.';
  if (!Number.isInteger(Number(values.units)) || Number(values.units) <= 0) {
    return 'Las unidades deben ser un número entero mayor a cero.';
  }
  if (!Number.isFinite(Number(values.agreedPrice)) || Number(values.agreedPrice) <= 0) {
    return 'El precio acordado debe ser un número mayor a cero.';
  }
  if (!values.dueDate) return 'La fecha de vencimiento es obligatoria.';
  return null;
}

export default function ApartadoForm({ onSubmit, onCancel }) {
  const { data: products = [] } = useProducts({});

  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [units, setUnits] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const values = { customerId, productId, units, agreedPrice, dueDate };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(buildApartadoBody(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Nuevo apartado">
      <form id="apartado-form" className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo apartado</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
          />

          <label htmlFor="apartado-product" className="label">
            Producto
            <select
              id="apartado-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              required
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
          </label>

          <div className="form-row" style={{ gap: 'var(--space-3)' }}>
            <label htmlFor="apartado-units" className="label" style={{ flex: 1 }}>
              Unidades
              <input
                id="apartado-units"
                type="number"
                min="1"
                step="1"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                required
                disabled={submitting}
                className="input"
                placeholder="1"
              />
            </label>
            <label htmlFor="apartado-price" className="label" style={{ flex: 1 }}>
              Precio acordado (total)
              <input
                id="apartado-price"
                type="number"
                min="0.01"
                step="0.01"
                value={agreedPrice}
                onChange={(event) => setAgreedPrice(event.target.value)}
                required
                disabled={submitting}
                className="input"
                placeholder="0.00"
              />
            </label>
          </div>

          <label htmlFor="apartado-due" className="label">
            Fecha de vencimiento
            <input
              id="apartado-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
              disabled={submitting}
              className="input"
            />
          </label>
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
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}