// CustomerForm shared overlay (task 6.4 S3).
// Fields: name (required), phone (optional, clearable)
// validate() returns string error or null
// On submit: POST /api/customers (create) or PATCH /api/customers/:id (update)
// refetches useCustomers('') and closes overlay
// mode "isEditing" for edit mode
// Nexo design system: modal, form, inputs, buttons via utilities.

import { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../../api/customers.js';

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
  useEffect(() => {
    if (isEditing && initialCustomer) {
      setName(initialCustomer.name || '');
      setPhone(initialCustomer.phone || '');
      setCustomerId(initialCustomer.id || '');
    } else {
      setName('');
      setPhone('');
      setCustomerId('');
    }
  }, [isEditing, initialCustomer]);

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
      onSubmit(values);
    } catch (err) {
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
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={isEditing ? 'Editar cliente' : 'Nuevo cliente'}>
      <form id="customer-form" className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
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

          <label htmlFor="customer-name" className="label">
            Nombre
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={submitting}
              className="input"
              autoFocus
            />
          </label>

          <label htmlFor="customer-phone" className="label">
            Teléfono (opcional)
            <div className="input-group">
              <input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={submitting}
                className="input"
                placeholder="Ej: +54 9 11 1234-5678"
              />
              {phone && (
                <button
                  type="button"
                  onClick={handleClearPhone}
                  className="btn btn-secondary btn-sm"
                  disabled={submitting}
                  style={{ minHeight: 'var(--touch-target)' }}
                >
                  Limpiar
                </button>
              )}
            </div>
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
            ) : isEditing ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}