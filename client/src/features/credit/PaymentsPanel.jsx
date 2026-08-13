// Payments panel (task 6.4), wired at /payments. Pick a customer → the panel
// loads the customer detail (open_debts with balances + payment history) and
// shows the open debts with a FIFO payment form (amount + optional note).
// FIFO allocation is SERVER-SIDE: the client sends {customerId, amount, note?}
// and receives { payment, allocations }. Client-side guards mirror the server's
// overpay and no-open-debts rejections; server messages still surface verbatim
// via ApiError (authoritative). UI copy in neutral Spanish.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCustomers, useCustomer } from '../../api/customers.js';
import { buildPaymentBody, usePaymentMutations } from '../../api/payments.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import './credit.css';

export default function PaymentsPanel() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { data: customers = [], isPending: customersPending } = useCustomers('');
  const { create } = usePaymentMutations();

  const [customerId, setCustomerId] = useState('');
  const {
    data: detail,
    isPending: detailPending,
    isError: detailError,
  } = useCustomer(customerId || null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const openDebts = detail?.open_debts ?? [];
  const totalOpen = openDebts.reduce((sum, debt) => sum + Number(debt.balance), 0);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }
    // Client-side guards mirroring the server's 400s (fail fast on obvious
    // cases; the server cents check remains authoritative).
    if (openDebts.length === 0) {
      setError('El cliente no tiene deudas abiertas.');
      return;
    }
    if (Math.round(value * 100) > Math.round(totalOpen * 100)) {
      setError('El pago supera el saldo total del cliente.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await create(buildPaymentBody(customerId, value, note));
      setResult(res);
      setAmount('');
      setNote('');
    } catch (err) {
      // Server "Payment exceeds the customer's remaining balance" / "Customer
      // has no open debts" surface verbatim.
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="credit-page payments-panel">
      <header className="inventory-header">
        <h2>Cobros</h2>
      </header>

      <form className="payments-pick" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="payments-customer">
          Cliente
          <select
            id="payments-customer"
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setError(null);
              setResult(null);
            }}
            disabled={customersPending}
          >
            <option value="">Seleccionar…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} — saldo {formatCurrency(customer.open_balance, config)}
              </option>
            ))}
          </select>
        </label>
      </form>

      {customerId && detailPending && <p>Cargando deudas del cliente…</p>}
      {customerId && detailError && (
        <p role="alert">No se pudieron cargar las deudas del cliente.</p>
      )}

      {customerId && !detailPending && !detailError && (
        <div className="payments-body">
          {openDebts.length === 0 ? (
            <p>El cliente no tiene deudas abiertas.</p>
          ) : (
            <table className="apartado-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Monto</th>
                  <th>Saldo</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {openDebts.map((debt) => (
                  <tr key={debt.id}>
                    <td>{debt.product_name}</td>
                    <td>{debt.units}</td>
                    <td>{formatCurrency(debt.amount, config)}</td>
                    <td>{formatCurrency(debt.balance, config)}</td>
                    <td>{debt.due_date ? formatDate(debt.due_date, config) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Saldo total pendiente</td>
                  <td>{formatCurrency(totalOpen, config)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}

          {openDebts.length > 0 && (
            <form className="payments-form" onSubmit={handleSubmit}>
              <h3>Registrar pago (abono)</h3>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <label htmlFor="payments-amount">
                Monto
                <input
                  id="payments-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <label htmlFor="payments-note">
                Nota (opcional)
                <input
                  id="payments-note"
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={submitting}
                />
              </label>
              <div className="form-actions">
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Guardando…' : 'Registrar pago'}
                </button>
              </div>
            </form>
          )}

          {result && <AllocationsResult result={result} debts={openDebts} config={config} />}
        </div>
      )}
    </section>
  );
}

/** FIFO allocations result: which debts the payment was applied to (oldest first). */
function AllocationsResult({ result, debts, config }) {
  const byId = new Map(debts.map((debt) => [debt.id, debt]));
  return (
    <div className="allocations-result" role="status">
      <h3>Pago registrado</h3>
      <p>
        {formatCurrency(result.payment.amount, config)} aplicado a{' '}
        {result.allocations.length}{' '}
        {result.allocations.length === 1 ? 'deuda' : 'deudas'} (FIFO).
      </p>
      <ul>
        {result.allocations.map((allocation) => {
          const debt = byId.get(allocation.debt_id);
          return (
            <li key={allocation.debt_id}>
              {debt ? debt.product_name : 'Deuda'} — {formatCurrency(allocation.amount, config)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}