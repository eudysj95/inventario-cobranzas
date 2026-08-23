// Product create/edit form — Nexo design system.
// Modal form using design system utilities.
// Create: quantity = INITIAL stock (absolute).
// Edit: quantity = TARGET stock (converts to signed adjustment for PATCH).

import { useState } from 'react';
import { quantityAdjustmentBody } from '../../api/products.js';
import StateBadge from './StateBadge.jsx';

function buildCreateBody(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    price: values.price,
    quantity: values.quantity,
  };
}

function buildEditPatch(product, values) {
  const patch = {};
  if (values.name.trim() !== product.name) patch.name = values.name.trim();
  if (values.description.trim() !== (product.description ?? '')) {
    patch.description = values.description.trim() || null;
  }
  if (values.price !== product.price) patch.price = values.price;
  Object.assign(patch, quantityAdjustmentBody(product.quantity, values.quantity));
  return patch;
}

function validate(values) {
  if (values.name.trim() === '') return 'El nombre del producto es obligatorio.';
  if (!Number.isFinite(values.price) || values.price < 0) {
    return 'El precio debe ser un número mayor o igual a cero.';
  }
  if (!Number.isInteger(values.quantity) || values.quantity < 0) {
    return 'La cantidad debe ser un número entero mayor o igual a cero.';
  }
  return null;
}

export default function ProductForm({ product, onSubmit, onCancel }) {
  const isEdit = product !== null;
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const values = {
      name,
      description,
      price: price === '' ? (isEdit ? null : 0) : Number(price),
      quantity: quantity === '' ? (isEdit ? null : 0) : Number(quantity),
    };

    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = isEdit
      ? { mode: 'edit', id: product.id, patch: buildEditPatch(product, values) }
      : { mode: 'create', body: buildCreateBody(values) };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={isEdit ? 'Editar producto' : 'Nuevo producto'}>
      <div className="modal" style={{ maxWidth: '32rem' }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? `Editar producto: ${product.name}` : 'Nuevo producto'}</h2>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Cerrar" disabled={submitting}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" noValidate>
          {isEdit && (
            <div className="form-row" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: 'var(--text-sm)' }}>Estado actual: </strong>
              <StateBadge product={product} />
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label htmlFor="product-name" className="label">
              Nombre
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                disabled={submitting}
                className="input"
                placeholder="Ej: Remera negra talle M"
              />
            </label>

            <label htmlFor="product-description" className="label">
              Descripción (opcional)
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={submitting}
                className="input textarea"
                placeholder="Detalles, talles, colores, etc."
              />
            </label>

            <div className="form-row" style={{ gap: 'var(--space-3)' }}>
              <label htmlFor="product-price" className="label" style={{ flex: 1 }}>
                Precio
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </label>
              <label htmlFor="product-quantity" className="label" style={{ flex: 1 }}>
                {isEdit ? 'Stock (cantidad objetivo)' : 'Stock inicial'}
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={submitting}
                  className="input"
                  placeholder="0"
                  required
                />
              </label>
            </div>

            {isEdit && (
              <p className="form-hint" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                El stock es un ajuste: ingrese un valor mayor al stock actual ({product.quantity}) para
                reponer unidades, o menor para quitarlas. El stock nunca puede ser menor a cero.
              </p>
            )}
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={submitting}>
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
      </div>
    </div>
  );
}