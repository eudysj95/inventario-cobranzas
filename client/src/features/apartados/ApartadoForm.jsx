// Apartado create form (task 6.4). Fields: customer (select), product
// (select), units, agreed price, due date (REQUIRED — the server rejects a
// missing dueDate with 400). Building the apartado reserves stock server-side
// in the same TXN as the insert. Uses the shared customers/products list
// queries; server guard messages (e.g. insufficient stock) surface verbatim
// via ApiError into the form error line. UI copy in neutral Spanish.

import { useState } from 'react';
import { useCustomers } from '../../api/customers.js';
import { useProducts } from '../../api/products.js';
import { buildApartadoBody } from '../../api/apartados.js';

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
  const { data: customers = [] } = useCustomers('');
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
      // Includes server guard messages (insufficient stock, 400s) verbatim.
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label="Nuevo apartado">
      <form className="product-form apartado-form" onSubmit={handleSubmit}>
        <h2>Nuevo apartado</h2>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="apartado-customer">
          Cliente
          <select
            id="apartado-customer"
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

        <label htmlFor="apartado-product">
          Producto
          <select
            id="apartado-product"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            required
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

        <label htmlFor="apartado-units">
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
          />
        </label>

        <label htmlFor="apartado-price">
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
          />
        </label>

        <label htmlFor="apartado-due">
          Fecha de vencimiento
          <input
            id="apartado-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}