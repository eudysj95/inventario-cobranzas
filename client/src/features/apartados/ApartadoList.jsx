// Apartado list (task 6.4). Table of apartados with paid_total/remaining per
// amendment B, due date, and pending-only actions: cancel (returns units to
// stock server-side) and pay (amount + optional note, cumulative cent guard
// server-side). The pay form is an inline row expansion guarded client-side by
// paymentExceedsRemaining; server messages (409 double-cancel, overpayment)
// surface verbatim. UI copy in neutral Spanish.

import { useState } from 'react';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { paymentExceedsRemaining } from '../../api/apartados.js';

const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
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
      // Server overpay check is authoritative (cents); surfaces verbatim.
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      setSubmitting(false);
    }
  }

  return (
    <form className="apartado-pay-form" onSubmit={handleSubmit}>
      <label htmlFor={`pay-amount-${apartado.id}`}>
        Monto
        <input
          id={`pay-amount-${apartado.id}`}
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          disabled={submitting}
        />
      </label>
      <label htmlFor={`pay-note-${apartado.id}`}>
        Nota (opcional)
        <input
          id={`pay-note-${apartado.id}`}
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={submitting}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Registrar pago'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
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
    <table className="apartado-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Producto</th>
          <th>Unidades</th>
          <th>Acordado</th>
          <th>Pagado</th>
          <th>Restante</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th>Acciones</th>
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
      <tr className={isPaying ? 'apartado-row--paying' : undefined}>
        <td>{apartado.customer_name}</td>
        <td>{apartado.product_name}</td>
        <td>{units}</td>
        <td>{formatCurrency(agreed_price, config)}</td>
        <td>{formatCurrency(paid_total, config)}</td>
        <td>{formatCurrency(remaining, config)}</td>
        <td>{formatDate(due_date, config)}</td>
        <td>
          <span className={`apartado-status apartado-status--${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </td>
        <td>
          {isPending && (
            <>
              <button type="button" onClick={() => onPay(apartado)}>
                Pagar
              </button>{' '}
              <button type="button" onClick={() => onCancel(apartado)}>
                Cancelar
              </button>
            </>
          )}
        </td>
      </tr>
      {isPaying && (
        <tr>
          <td colSpan={9}>
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