// Apartado list (task 6.4). Table of apartados with paid_total/remaining per
// amendment B, due date, and pending-only actions: cancel (returns units to
// stock server-side) and pay (amount + optional note, cumulative cent guard
// server-side). The pay form is an inline row expansion guarded client-side by
// paymentExceedsRemaining; server messages (409 double-cancel, overpayment)
// surface verbatim. UI copy in neutral Spanish.
// Nexo design system: table, chips, inline form via utilities.

import { useState } from 'react';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { paymentExceedsRemaining } from '../../api/apartados.js';

const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

const STATUS_CHIP_MAP = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'neutral',
};

// Client-side overpay guard mirroring the server's cumulative cents check
// ("Payment exceeds the remaining balance of the apartado").
export const OVERPAY_MESSAGE = 'El pago supera el saldo restante del apartado.';

/** Inline pay form for ONE apartado row: amount + optional note. */
export function ApartadoPayForm({ apartado, onSubmit, onCancel }) {
  const remaining = apartado.remaining ?? 0;
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }
    if (paymentExceedsRemaining(value, remaining)) {
      setError(OVERPAY_MESSAGE);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(apartado, value, note);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-wrap gap-3 p-3" style={{ alignItems: 'flex-end', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }} onSubmit={handleSubmit}>
      <div className="form-row" style={{ flex: 1, minWidth: '140px', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label htmlFor={`pay-amount-${apartado.id}`} className="label">Monto</label>
        <input
          id={`pay-amount-${apartado.id}`}
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          disabled={submitting}
          className="input"
        />
      </div>
      <div className="form-row" style={{ flex: 1, minWidth: '160px', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label htmlFor={`pay-note-${apartado.id}`} className="label">Nota (opcional)</label>
        <input
          id={`pay-note-${apartado.id}`}
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={submitting}
          className="input"
        />
      </div>
      {error && (
        <p className="form-error" role="alert" style={{ flexBasis: '100%' }}>
          {error}
        </p>
      )}
      <div className="form-actions" style={{ marginLeft: 'auto' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Registrar pago'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function ApartadoList({
  apartados,
  config,
  payingId,
  onPay,
  onCancelPay,
  submitPay,
  onCancel,
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Cliente</th>
              <th scope="col">Producto</th>
              <th scope="col">Unidades</th>
              <th scope="col">Acordado</th>
              <th scope="col">Pagado</th>
              <th scope="col">Restante</th>
              <th scope="col">Vencimiento</th>
              <th scope="col">Estado</th>
              <th scope="col" style={{ width: '160px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {apartados.map((apartado) => (
              <ApartadoRow
                key={apartado.id}
                apartado={apartado}
                config={config}
                isPaying={payingId === apartado.id}
                onPay={onPay}
                onCancelPay={onCancelPay}
                submitPay={submitPay}
                onCancel={onCancel}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApartadoRow({
  apartado,
  config,
  isPaying,
  onPay,
  onCancelPay,
  submitPay,
  onCancel,
}) {
  const { id, units, agreed_price, paid_total, remaining, due_date, status } = apartado;
  const isPending = status === 'pending';

  return (
    <>
      <tr className={isPaying ? 'bg-surface-hover' : undefined}>
        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{apartado.customer_name}</td>
        <td>{apartado.product_name}</td>
        <td>{units}</td>
        <td>{formatCurrency(agreed_price, config)}</td>
        <td>{formatCurrency(paid_total, config)}</td>
        <td>{formatCurrency(remaining, config)}</td>
        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(due_date, config)}</td>
        <td>
          <span className={`chip chip-${STATUS_CHIP_MAP[status] || 'neutral'}`}>
            {STATUS_LABELS[status]}
          </span>
        </td>
        <td>
          {isPending && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onPay(apartado)}
                className="btn btn-secondary btn-sm"
                aria-label={`Pagar apartado de ${apartado.customer_name}`}
              >
                Pagar
              </button>
              <button
                type="button"
                onClick={() => onCancel(apartado)}
                className="btn btn-danger btn-sm"
                aria-label={`Cancelar apartado de ${apartado.customer_name}`}
              >
                Cancelar
              </button>
            </div>
          )}
        </td>
      </tr>
      {isPaying && (
        <tr>
          <td colSpan={9} style={{ padding: 0 }}>
            <ApartadoPayForm
              apartado={apartado}
              onSubmit={submitPay}
              onCancel={onCancelPay}
            />
          </td>
        </tr>
      )}
    </>
  );
}