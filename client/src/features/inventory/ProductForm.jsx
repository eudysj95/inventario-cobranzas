// Product create/edit form (task 6.3). Modes:
//   create — `product` prop is null; quantity is the INITIAL stock (absolute).
//   edit   — `product` is set; the quantity input edits an absolute TARGET and
//            the form converts it into the SIGNED stock adjustment the PATCH
//            endpoint expects (quantityAdjustmentBody in api/products.js: the
//            server ADDS quantity to current stock, it never receives an
//            absolute value). Only fields that actually changed are sent, so an
//            untouched form never hits the server's "No fields to update" 400.
//
// Server guard messages (400/409, e.g. deleting with stock) surface verbatim
// via ApiError into the error banner. `onSubmit` returns a Promise and rethrows
// so the page decides where errors end up; this component renders them too
// (single source for the user).

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
  // Signed adjustment — the ONLY way quantity may be sent (slice-3 contract).
  Object.assign(patch, quantityAdjustmentBody(product.quantity, values.quantity));
  return patch;
}

function validate(values) {
  if (values.name.trim() === '') return 'Product name is required.';
  if (!Number.isFinite(values.price) || values.price < 0) {
    return 'Price must be a non-negative number.';
  }
  if (!Number.isInteger(values.quantity) || values.quantity < 0) {
    return 'Quantity must be a whole number of 0 or more.';
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
      // Create mode follows the server defaults (price 0 / quantity 0) when the
      // fields are left empty; edit mode requires explicit values so a blank
      // field can never silently zero out a product.
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
      // Includes server guard messages (ApiError) and validation failures.
      setError(err instanceof Error ? err.message : 'Unexpected error.');
      setSubmitting(false);
    }
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit product' : 'New product'}>
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>{isEdit ? `Edit product: ${product.name}` : 'New product'}</h2>

        {isEdit && (
          <p className="form-current-state">
            Current state: <StateBadge product={product} />
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="product-name">
          Name
          <input
            id="product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
            disabled={submitting}
          />
        </label>

        <label htmlFor="product-description">
          Description
          <textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            disabled={submitting}
          />
        </label>

        <label htmlFor="product-price">
          Price
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={submitting}
          />
        </label>

        <label htmlFor="product-quantity">
          {isEdit ? 'Stock (target quantity)' : 'Initial stock'}
          <input
            id="product-quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={submitting}
          />
        </label>

        {isEdit && (
          <p className="form-hint">
            Stock is an adjustment: enter a value above the current stock (
            {product.quantity}) to restock, or below to remove units. Stock can
            never go below 0.
          </p>
        )}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}