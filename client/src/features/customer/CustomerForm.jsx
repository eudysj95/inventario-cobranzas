// CustomerForm shared overlay (task 6.4 S3).
// Fields: name (required), phone (optional, clearable)
// validate() returns string error or null
// On submit: POST /api/customers (create) or PATCH /api/customers/:id (update)
// refetches useCustomers('') and closes overlay
// mode "isEditing" for edit mode

import { useState } from 'react';
import { useCustomers, createCustomer, updateCustomer } from '../../api/customers.js';

const EMPTY_CUSTOMER = { id: '', name: '', phone: '' };

function validate(values) {
  if (!values.name || !values.name.trim()) return 'El nombre del cliente es obligatorio.';
  return null;
}

export default function CustomerForm({ onSubmit, onCancel, isEditing, initialCustomer }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState('');

  // If we're editing, pre-fill with existing customer data
  if (isEditing && initialCustomer) {
    setName(initialCustomer.name || '');
    setPhone(initialCustomer.phone || '');
    setCustomerId(initialCustomer.id || '');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const values = { name, phone };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && customerId) {
        await updateCustomer(customerId, { name, phone });
      } else {
        await createCustomer(name, phone);
      }
      // Refetch customers list and close overlay
      onSubmit(values);
    } catch (err) {
      // Server FK RESTRICT (409) — show verbatim; otherwise generic error
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClearPhone() {
    setPhone('');
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label={isEditing ? 'Editar cliente' : 'Nuevo cliente'}>
      <form className="product-form customer-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="customer-name">
          Nombre
          <input
            id="customer-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label htmlFor="customer-phone">
          Teléfono
          <input
            id="customer-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={submitting}
          />
          {phone && (
            <button
              type="button"
              onClick={handleClearPhone}
              className="phone-clear-btn"
              disabled={submitting}
            >
              Limpiar
            </button>
          )}
        </label>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}